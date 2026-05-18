import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSalesOrderCode } from "@/lib/order-code";
import {
  createCounterSaleSchema,
  createDeliveryOrderSchema,
} from "@/lib/validations/sales-order.schema";
import { OrderType, SalesOrderStatus } from "@/constants/enums";
import { invalidateOnOrderChange, invalidateProducts } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  // Intelligent Search Routing to leverage high-performance B-tree indexes
  let searchCond = {};
  if (q) {
    const cleanQ = q.trim();
    const isPhone = /^[0-9]{3,15}$/.test(cleanQ);
    const isOrderCode = cleanQ.toUpperCase().startsWith("HD") || cleanQ.includes("-");

    if (isPhone) {
      searchCond = { customerPhone: { startsWith: cleanQ } };
    } else if (isOrderCode) {
      searchCond = { orderCode: { startsWith: cleanQ, mode: "insensitive" as const } };
    } else {
      searchCond = {
        OR: [
          { customerName: { contains: cleanQ, mode: "insensitive" as const } },
          { customerPhone: { contains: cleanQ } },
        ],
      };
    }
  }

  const where = {
    ...(status ? { status: status as any } : {}),
    ...searchCond,
  };

  const [items, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      include: {
        items: {
          select: {
            id: true, productId: true, productName: true,
            quantity: true, unitPrice: true,
            product: { select: { id: true, name: true, sellingPrice: true, stockQuantity: true } },
          },
        },
        customer: { select: { id: true, name: true, phone: true } },
        employee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return NextResponse.json({ success: true, data: { items, total, page, pageSize } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orderType: OrderType = body.orderType;

  if (orderType === OrderType.COUNTER) {
    const parsed = createCounterSaleSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

    return prisma.$transaction(async (tx) => {
      const orderCode = await generateSalesOrderCode();

      const productIds = parsed.data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sellingPrice: true, stockQuantity: true },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalAmount = 0;
      const itemsData = [];

      for (const item of parsed.data.items) {
        const product = productMap.get(item.productId);
        if (!product) throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);
        if (product.stockQuantity < item.quantity)
          throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
        totalAmount += item.quantity * product.sellingPrice;
        itemsData.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
        });
      }

      await Promise.all(
        parsed.data.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          })
        )
      );

      const order = await tx.salesOrder.create({
        data: {
          orderCode,
          orderType: OrderType.COUNTER,
          status: SalesOrderStatus.COUNTER_SALE,
          paymentMethod: parsed.data.paymentMethod ?? null,
          notes: parsed.data.notes ?? null,
          totalAmount,
          completedAt: new Date(),
          items: { create: itemsData },
        },
        include: { items: true },
      });

      await Promise.all([invalidateOnOrderChange(), invalidateProducts()]);
      return NextResponse.json({ success: true, data: order }, { status: 201 });
    }).catch((err) =>
      NextResponse.json({ success: false, error: err.message }, { status: 400 })
    );
  }

  // Delivery order
  const parsed = createDeliveryOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  return prisma.$transaction(async (tx) => {
    const orderCode = await generateSalesOrderCode();

    const productIds = parsed.data.items.map((i) => i.productId);
    const [products, employee] = await Promise.all([
      tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sellingPrice: true, stockQuantity: true },
      }),
      tx.employee.findUnique({
        where: { id: parsed.data.employeeId },
        select: { id: true, name: true },
      }),
    ]);

    if (!employee) throw new Error("Nhân viên không tồn tại");
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const itemsData = [];

    for (const item of parsed.data.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Sản phẩm không tồn tại`);
      if (product.stockQuantity < item.quantity)
        throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);
      totalAmount += item.quantity * product.sellingPrice;
      itemsData.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
      });
    }

    const { items: _, customerId: _cid, ...deliveryFields } = parsed.data;

    // Auto-create or link customer
    let resolvedCustomerId: string | null = parsed.data.customerId ?? null;
    if (!resolvedCustomerId) {
      const existingCustomer = await tx.customer.findUnique({
        where: { phone: parsed.data.customerPhone },
      });
      if (existingCustomer) {
        resolvedCustomerId = existingCustomer.id;
      } else {
        const newCustomer = await tx.customer.create({
          data: {
            name: parsed.data.customerName,
            phone: parsed.data.customerPhone,
            address: parsed.data.deliveryAddress,
          },
        });
        resolvedCustomerId = newCustomer.id;
      }
    }

    const { employeeId, ...restFields } = deliveryFields;

    const order = await tx.salesOrder.create({
      data: {
        ...restFields,
        orderCode,
        orderType: OrderType.DELIVERY,
        status: SalesOrderStatus.PROCESSING,
        deliveryPerson: employee.name,
        employeeId,
        customerId: resolvedCustomerId,
        totalAmount,
        items: { create: itemsData },
      },
      include: { items: true, customer: true, employee: true },
    });

    await invalidateOnOrderChange();
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  }).catch((err) =>
    NextResponse.json({ success: false, error: err.message }, { status: 400 })
  );
}

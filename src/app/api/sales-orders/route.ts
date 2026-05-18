import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSalesOrderCode } from "@/lib/order-code";
import {
  createCounterSaleSchema,
  createDeliveryOrderSchema,
} from "@/lib/validations/sales-order.schema";
import { OrderType, SalesOrderStatus } from "@/constants/enums";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(q
      ? {
          OR: [
            { orderCode: { contains: q } },
            { customerName: { contains: q } },
            { customerPhone: { contains: q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      include: {
        items: { include: { product: true } },
        customer: true,
        employee: true,
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
      let totalAmount = 0;
      const itemsData = [];

      for (const item of parsed.data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Sản phẩm không tồn tại: ${item.productId}`);
        if (product.stockQuantity < item.quantity)
          throw new Error(`Sản phẩm "${product.name}" không đủ tồn kho`);

        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        totalAmount += item.quantity * product.sellingPrice;
        itemsData.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
        });
      }

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
    let totalAmount = 0;
    const itemsData = [];

    for (const item of parsed.data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
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

    // Resolve employee name for snapshot
    const employee = await tx.employee.findUnique({ where: { id: parsed.data.employeeId } });
    if (!employee) throw new Error("Nhân viên không tồn tại");

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

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  }).catch((err) =>
    NextResponse.json({ success: false, error: err.message }, { status: 400 })
  );
}

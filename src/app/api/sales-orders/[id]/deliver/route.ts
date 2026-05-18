import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completeDeliverySchema } from "@/lib/validations/sales-order.schema";
import { SalesOrderStatus } from "@/constants/enums";
import { invalidateOnOrderChange, invalidateProducts } from "@/lib/cache";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const [{ id }, body] = await Promise.all([params, req.json()]);

  const order = await prisma.salesOrder.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn" }, { status: 404 });
  if (order.status !== SalesOrderStatus.PROCESSING)
    return NextResponse.json({ success: false, error: "Đơn không ở trạng thái đang giao" }, { status: 400 });

  const parsed = completeDeliverySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const items = await prisma.salesOrderItem.findMany({
    where: { salesOrderId: id },
    select: { productId: true, quantity: true },
  });

  const updated = await prisma.$transaction(async (tx) => {
    await Promise.all(
      items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        })
      )
    );
    return tx.salesOrder.update({
      where: { id },
      data: {
        status: SalesOrderStatus.DELIVERED,
        paymentMethod: parsed.data.paymentMethod,
        completedAt: new Date(),
      },
      include: { items: true },
    });
  });

  await Promise.all([invalidateOnOrderChange(new Date().getFullYear()), invalidateProducts()]);
  return NextResponse.json({ success: true, data: updated });
}

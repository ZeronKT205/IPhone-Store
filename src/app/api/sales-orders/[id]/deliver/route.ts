import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completeDeliverySchema } from "@/lib/validations/sales-order.schema";
import { SalesOrderStatus } from "@/constants/enums";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const order = await prisma.salesOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn" }, { status: 404 });
  if (order.status !== SalesOrderStatus.PROCESSING)
    return NextResponse.json({ success: false, error: "Đơn không ở trạng thái đang giao" }, { status: 400 });

  const body = await req.json();
  const parsed = completeDeliverySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  // Trừ kho khi giao thành công
  const items = await prisma.salesOrderItem.findMany({ where: { salesOrderId: id } });
  await prisma.$transaction([
    ...items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      })
    ),
    prisma.salesOrder.update({
      where: { id },
      data: {
        status: SalesOrderStatus.DELIVERED,
        paymentMethod: parsed.data.paymentMethod,
        completedAt: new Date(),
      },
    }),
  ]);

  const updated = await prisma.salesOrder.findUnique({ where: { id }, include: { items: true } });
  return NextResponse.json({ success: true, data: updated });
}

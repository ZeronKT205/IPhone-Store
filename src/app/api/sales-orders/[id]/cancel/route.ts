import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SalesOrderStatus } from "@/constants/enums";
import { invalidateOnOrderChange } from "@/lib/cache";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const order = await prisma.salesOrder.findUnique({ where: { id }, select: { status: true } });
  if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn" }, { status: 404 });
  if (order.status !== SalesOrderStatus.PROCESSING)
    return NextResponse.json({ success: false, error: "Chỉ có thể hủy đơn đang giao" }, { status: 400 });

  const updated = await prisma.salesOrder.update({
    where: { id },
    data: { status: SalesOrderStatus.CANCELLED },
  });
  await invalidateOnOrderChange();
  return NextResponse.json({ success: true, data: updated });
}

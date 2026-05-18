import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateRepairOrderSchema, updateRepairFeeSchema } from "@/lib/validations/repair-order.schema";
import { RepairStatus } from "@/constants/enums";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const order = await prisma.repairOrder.findUnique({
    where: { id },
    include: { warranty: true, originalOrder: true },
  });
  if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn" }, { status: 404 });
  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const order = await prisma.repairOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn" }, { status: 404 });

  if (order.status === RepairStatus.COMPLETED) {
    return NextResponse.json(
      { success: false, error: "Đơn đã hoàn thành, không thể chỉnh sửa" },
      { status: 403 }
    );
  }

  const body = await req.json();

  // Nếu body chỉ có repairFee → dùng schema phí
  if ("repairFee" in body && Object.keys(body).length === 1) {
    const parsed = updateRepairFeeSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    const updated = await prisma.repairOrder.update({ where: { id }, data: parsed.data, include: { warranty: true } });
    return NextResponse.json({ success: true, data: updated });
  }

  const parsed = updateRepairOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const { warrantyMonths, ...prismaData } = parsed.data;
  const updated = await prisma.repairOrder.update({ where: { id }, data: prismaData, include: { warranty: true } });
  if (warrantyMonths !== undefined) {
    await prisma.$executeRaw`UPDATE RepairOrder SET warrantyMonths = ${warrantyMonths} WHERE id = ${id}`;
  }
  return NextResponse.json({ success: true, data: { ...updated, warrantyMonths: warrantyMonths ?? 0 } });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const order = await prisma.repairOrder.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn" }, { status: 404 });
  if (order.status === RepairStatus.COMPLETED) {
    return NextResponse.json({ success: false, error: "Không thể xóa đơn đã hoàn thành" }, { status: 403 });
  }
  await prisma.repairOrder.delete({ where: { id } });
  return NextResponse.json({ success: true, data: null });
}

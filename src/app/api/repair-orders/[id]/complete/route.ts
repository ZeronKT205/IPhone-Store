import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completeRepairOrderSchema } from "@/lib/validations/repair-order.schema";
import { RepairStatus } from "@/constants/enums";
import { invalidateOnOrderChange } from "@/lib/cache";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const [{ id }, body] = await Promise.all([params, req.json()]);

  const order = await prisma.repairOrder.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn" }, { status: 404 });
  if (order.status === RepairStatus.COMPLETED) {
    return NextResponse.json({ success: false, error: "Đơn đã hoàn thành rồi" }, { status: 400 });
  }
  const parsed = completeRepairOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const { repairFee, hasWarranty, warrantyDurationDays, warrantyNotes } = parsed.data;
  const completedAt = new Date();

  const updated = await prisma.repairOrder.update({
    where: { id },
    data: {
      status: RepairStatus.COMPLETED,
      repairFee,
      completedAt,
      ...(hasWarranty && warrantyDurationDays
        ? {
            warranty: {
              create: {
                startDate: completedAt,
                expiryDate: new Date(completedAt.getTime() + warrantyDurationDays * 86400000),
                notes: warrantyNotes ?? null,
              },
            },
          }
        : {}),
    },
    include: { warranty: true },
  });

  await invalidateOnOrderChange(new Date().getFullYear());
  return NextResponse.json({ success: true, data: updated });
}

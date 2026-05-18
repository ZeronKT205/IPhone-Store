import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RepairStatus } from "@/constants/enums";

export async function GET() {
  const now = new Date();

  const [active, expired, total] = await Promise.all([
    prisma.warranty.count({ where: { expiryDate: { gt: now } } }),
    prisma.warranty.count({ where: { expiryDate: { lte: now } } }),
    prisma.warranty.count(),
  ]);

  const list = await prisma.repairOrder.findMany({
    where: {
      status: RepairStatus.COMPLETED,
      warranty: { isNot: null },
    },
    select: {
      id: true, orderCode: true, customerName: true,
      phoneNumber: true, description: true, completedAt: true,
      warranty: { select: { expiryDate: true, notes: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: {
      stats: { active, expired, total },
      items: list.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        customerName: o.customerName,
        phoneNumber: o.phoneNumber,
        description: o.description,
        completedAt: o.completedAt,
        expiryDate: o.warranty!.expiryDate,
        warrantyNotes: o.warranty!.notes,
        isActive: o.warranty!.expiryDate > now,
      })),
    },
  });
}

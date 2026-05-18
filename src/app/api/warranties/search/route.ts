import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RepairStatus } from "@/constants/enums";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ success: false, error: "Vui lòng nhập từ khóa tìm kiếm" }, { status: 400 });

  const orders = await prisma.repairOrder.findMany({
    where: {
      status: RepairStatus.COMPLETED,
      warranty: { isNot: null },
      OR: [
        { phoneNumber: { contains: q } },
        { orderCode: { contains: q } },
        { customerName: { contains: q } },
      ],
    },
    select: {
      id: true, orderCode: true, customerName: true,
      phoneNumber: true, description: true, completedAt: true,
      warranty: { select: { expiryDate: true, notes: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 20,
  });

  const now = new Date();
  const results = orders.map((o) => ({
    id: o.id,
    orderCode: o.orderCode,
    customerName: o.customerName,
    phoneNumber: o.phoneNumber,
    description: o.description,
    completedAt: o.completedAt,
    expiryDate: o.warranty!.expiryDate,
    warrantyNotes: o.warranty!.notes,
    isActive: o.warranty!.expiryDate > now,
  }));

  return NextResponse.json({ success: true, data: results });
}

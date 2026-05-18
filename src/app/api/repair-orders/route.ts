import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRepairOrderCode } from "@/lib/order-code";
import { createRepairOrderSchema } from "@/lib/validations/repair-order.schema";

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
            { customerName: { contains: q } },
            { phoneNumber: { contains: q } },
            { orderCode: { contains: q } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.repairOrder.findMany({
      where,
      include: { warranty: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.repairOrder.count({ where }),
  ]);

  // Attach warrantyMonths via raw SQL (Prisma binary may not know the field yet)
  let monthsMap: Record<string, number> = {};
  try {
    const rows = await prisma.$queryRawUnsafe<{ id: string; warrantyMonths: number }[]>(
      `SELECT id, warrantyMonths FROM RepairOrder WHERE id IN (${items.map(() => "?").join(",")})`,
      ...items.map((o) => o.id)
    );
    rows.forEach((r) => { monthsMap[r.id] = r.warrantyMonths ?? 0; });
  } catch { /* field not available in old binary */ }

  const enriched = items.map((o) => ({ ...o, warrantyMonths: monthsMap[o.id] ?? 0 }));
  return NextResponse.json({ success: true, data: { items: enriched, total, page, pageSize } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createRepairOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const orderCode = await generateRepairOrderCode();
    // Strip warrantyMonths — Prisma binary may not know it yet; write via raw SQL after
    const { warrantyMonths, ...prismaData } = parsed.data;
    const order = await prisma.repairOrder.create({
      data: { ...prismaData, orderCode },
      include: { warranty: true },
    });
    if (warrantyMonths && warrantyMonths > 0) {
      await prisma.$executeRaw`UPDATE RepairOrder SET warrantyMonths = ${warrantyMonths} WHERE id = ${order.id}`;
    }
    return NextResponse.json({ success: true, data: { ...order, warrantyMonths: warrantyMonths ?? 0 } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

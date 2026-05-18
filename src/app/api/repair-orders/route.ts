import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRepairOrderCode } from "@/lib/order-code";
import { createRepairOrderSchema } from "@/lib/validations/repair-order.schema";
import { invalidateOnOrderChange } from "@/lib/cache";

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

  return NextResponse.json({ success: true, data: { items, total, page, pageSize } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createRepairOrderSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  try {
    const orderCode = await generateRepairOrderCode();
    const order = await prisma.repairOrder.create({
      data: { ...parsed.data, orderCode },
      include: { warranty: true },
    });
    await invalidateOnOrderChange();
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

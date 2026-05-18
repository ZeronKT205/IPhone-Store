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

  // Intelligent Search Routing to leverage high-performance B-tree indexes
  let searchCond = {};
  if (q) {
    const cleanQ = q.trim();
    const isPhone = /^[0-9]{3,15}$/.test(cleanQ);
    const isOrderCode = cleanQ.toUpperCase().startsWith("SC") || cleanQ.includes("-");

    if (isPhone) {
      searchCond = { phoneNumber: { startsWith: cleanQ } };
    } else if (isOrderCode) {
      searchCond = { orderCode: { startsWith: cleanQ, mode: "insensitive" as const } };
    } else {
      searchCond = {
        OR: [
          { customerName: { contains: cleanQ, mode: "insensitive" as const } },
          { phoneNumber: { contains: cleanQ } },
        ],
      };
    }
  }

  const where = {
    ...(status ? { status: status as any } : {}),
    ...searchCond,
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

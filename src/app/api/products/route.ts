import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations/product.schema";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const showAll = searchParams.get("showAll") === "true";

  const items = await prisma.product.findMany({
    where: {
      ...(showAll ? {} : { isActive: true }),
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const withAlert = items.map((p) => ({
    ...p,
    isLowStock: p.stockQuantity <= p.lowStockThreshold,
  }));

  return NextResponse.json({ success: true, data: withAlert });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const product = await prisma.product.create({ data: parsed.data, include: { category: true } });
  return NextResponse.json({ success: true, data: product }, { status: 201 });
}

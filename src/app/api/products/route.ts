import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations/product.schema";
import { withCache, invalidateProducts, PRODUCTS_KEY, TTL } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q       = searchParams.get("q") ?? undefined;
  const showAll = searchParams.get("showAll") === "true";

  // Only cache the full unfiltered list; search queries bypass cache
  if (!q) {
    const cacheKey = `${PRODUCTS_KEY}:${showAll ? "all" : "active"}`;
    const { data, hit } = await withCache(cacheKey, TTL.PRODUCTS, () =>
      prisma.product.findMany({
        where: showAll ? {} : { isActive: true },
        include: { category: { select: { id: true, name: true } } },
        orderBy: { name: "asc" },
      }).then(items => items.map(p => ({ ...p, isLowStock: p.stockQuantity <= p.lowStockThreshold })))
    );
    return NextResponse.json(
      { success: true, data },
      { headers: { "X-Cache": hit ? "HIT" : "MISS" } }
    );
  }

  // Search — always fresh
  const items = await prisma.product.findMany({
    where: { ...(showAll ? {} : { isActive: true }), name: { contains: q } },
    include: { category: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({
    success: true,
    data: items.map(p => ({ ...p, isLowStock: p.stockQuantity <= p.lowStockThreshold })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const product = await prisma.product.create({ data: parsed.data, include: { category: true } });
  await invalidateProducts();
  return NextResponse.json({ success: true, data: product }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCache, invalidateCategories, invalidateProducts, CATEGORIES_KEY, TTL } from "@/lib/cache";
import { z } from "zod";

const schema = z.object({ name: z.string().min(1, "Vui lòng nhập tên danh mục") });

export async function GET() {
  const { data, hit } = await withCache(CATEGORIES_KEY, TTL.CATEGORIES, () =>
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    })
  );
  return NextResponse.json(
    { success: true, data },
    { headers: { "X-Cache": hit ? "HIT" : "MISS" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

    const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
    if (existing)
      return NextResponse.json({ success: false, error: "Danh mục đã tồn tại" }, { status: 400 });

    const category = await prisma.category.create({ data: parsed.data });
    await Promise.all([invalidateCategories(), invalidateProducts()]);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

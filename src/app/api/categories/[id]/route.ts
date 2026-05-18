import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({ name: z.string().min(1, "Vui lòng nhập tên danh mục") });

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (existing && existing.id !== id)
    return NextResponse.json({ success: false, error: "Tên danh mục đã tồn tại" }, { status: 400 });

  const category = await prisma.category.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ success: true, data: category });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0)
    return NextResponse.json(
      { success: false, error: `Không thể xóa – có ${count} sản phẩm đang dùng danh mục này` },
      { status: 400 }
    );
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true, data: null });
}

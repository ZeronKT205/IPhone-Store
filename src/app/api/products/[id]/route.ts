import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validations/product.schema";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ success: false, error: "Không tìm thấy sản phẩm" }, { status: 404 });
  return NextResponse.json({ success: true, data: product });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ success: true, data: product });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const product = await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true, data: product });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addStockSchema } from "@/lib/validations/product.schema";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ success: false, error: "Không tìm thấy sản phẩm" }, { status: 404 });

  const body = await req.json();
  const parsed = addStockSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const updated = await prisma.product.update({
    where: { id },
    data: { stockQuantity: { increment: parsed.data.quantity } },
  });

  return NextResponse.json({ success: true, data: updated });
}

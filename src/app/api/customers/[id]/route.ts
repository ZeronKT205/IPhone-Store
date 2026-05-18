import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCustomerSchema } from "@/lib/validations/customer.schema";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return NextResponse.json({ success: false, error: "Không tìm thấy khách hàng" }, { status: 404 });
  return NextResponse.json({ success: true, data: customer });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateCustomerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  if (parsed.data.phone) {
    const conflict = await prisma.customer.findUnique({ where: { phone: parsed.data.phone } });
    if (conflict && conflict.id !== id)
      return NextResponse.json({ success: false, error: "Số điện thoại đã thuộc khách hàng khác" }, { status: 400 });
  }

  const customer = await prisma.customer.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ success: true, data: customer });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true, data: null });
}

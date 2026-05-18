import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCustomerSchema } from "@/lib/validations/customer.schema";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? undefined;
  const phone = searchParams.get("phone") ?? undefined;

  if (phone) {
    const customer = await prisma.customer.findUnique({ where: { phone } });
    return NextResponse.json({ success: true, data: customer });
  }

  let searchCond = {};
  if (q) {
    const cleanQ = q.trim();
    const isPhone = /^[0-9]{3,15}$/.test(cleanQ);
    if (isPhone) {
      searchCond = { phone: { startsWith: cleanQ } };
    } else {
      searchCond = { name: { contains: cleanQ, mode: "insensitive" as const } };
    }
  }

  const customers = await prisma.customer.findMany({
    where: q ? searchCond : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: customers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const existing = await prisma.customer.findUnique({ where: { phone: parsed.data.phone } });
  if (existing)
    return NextResponse.json({ success: false, error: "Số điện thoại đã tồn tại trong danh sách khách hàng" }, { status: 400 });

  const customer = await prisma.customer.create({ data: parsed.data });
  return NextResponse.json({ success: true, data: customer }, { status: 201 });
}

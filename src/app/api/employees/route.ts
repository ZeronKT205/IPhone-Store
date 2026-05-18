import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createEmployeeSchema } from "@/lib/validations/employee.schema";
import { SalesOrderStatus } from "@/constants/enums";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const available = searchParams.get("available") === "true";
  const q = searchParams.get("q") ?? undefined;

  const where: any = {};
  if (q) where.name = { contains: q };
  if (available) {
    where.isActive = true;
    where.NOT = { salesOrders: { some: { status: SalesOrderStatus.PROCESSING } } };
  }

  const employees = await prisma.employee.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { salesOrders: { where: { status: SalesOrderStatus.PROCESSING } } } },
    },
  });

  return NextResponse.json({ success: true, data: employees });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createEmployeeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const { dateOfBirth, ...rest } = parsed.data;
  const employee = await prisma.employee.create({
    data: {
      ...rest,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
    },
  });
  return NextResponse.json({ success: true, data: employee }, { status: 201 });
}

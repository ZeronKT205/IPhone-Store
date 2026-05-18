import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateEmployeeSchema } from "@/lib/validations/employee.schema";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateEmployeeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });

  const { dateOfBirth, ...rest } = parsed.data;
  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...rest,
      ...(dateOfBirth !== undefined ? { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null } : {}),
    },
  });
  return NextResponse.json({ success: true, data: employee });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await prisma.employee.delete({ where: { id } });
  return NextResponse.json({ success: true, data: null });
}

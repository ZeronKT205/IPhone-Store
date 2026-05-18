import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      items: {
        select: {
          id: true, productId: true, productName: true, quantity: true, unitPrice: true,
          product: { select: { id: true, name: true, sellingPrice: true, stockQuantity: true } },
        },
      },
      customer: { select: { id: true, name: true, phone: true } },
      employee: { select: { id: true, name: true } },
    },
  });
  if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn" }, { status: 404 });
  return NextResponse.json({ success: true, data: order });
}

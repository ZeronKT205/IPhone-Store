import { prisma } from "./prisma";
import { ORDER_CODE_PREFIX } from "@/constants/config";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function generateRepairOrderCode(): Promise<string> {
  const today = todayStr();
  const prefix = `${ORDER_CODE_PREFIX.REPAIR}-${today}-`;

  const last = await prisma.repairOrder.findFirst({
    where: { orderCode: { startsWith: prefix } },
    orderBy: { orderCode: "desc" },
    select: { orderCode: true },
  });

  const seq = last
    ? parseInt(last.orderCode.split("-").pop() ?? "0") + 1
    : 1;

  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export async function generateSalesOrderCode(): Promise<string> {
  const today = todayStr();
  const prefix = `${ORDER_CODE_PREFIX.SALES}-${today}-`;

  const last = await prisma.salesOrder.findFirst({
    where: { orderCode: { startsWith: prefix } },
    orderBy: { orderCode: "desc" },
    select: { orderCode: true },
  });

  const seq = last
    ? parseInt(last.orderCode.split("-").pop() ?? "0") + 1
    : 1;

  return `${prefix}${String(seq).padStart(3, "0")}`;
}

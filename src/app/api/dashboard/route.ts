import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCache, DASHBOARD_KEY, TTL } from "@/lib/cache";
import { RepairStatus, SalesOrderStatus } from "@/constants/enums";

async function fetchDashboard() {
  const now = new Date();
  const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth  = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    repairInProgress,
    repairCompletedThisMonth,
    repairCompletedLastMonth,
    salesThisMonth,
    salesLastMonth,
    lowStockCount,
    warrantyActive,
    recentRepairs,
    recentSales,
  ] = await Promise.all([
    prisma.repairOrder.count({ where: { status: RepairStatus.IN_PROGRESS } }),
    prisma.repairOrder.count({
      where: { status: RepairStatus.COMPLETED, completedAt: { gte: startOfMonth } },
    }),
    prisma.repairOrder.count({
      where: { status: RepairStatus.COMPLETED, completedAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.salesOrder.aggregate({
      where: { status: { in: [SalesOrderStatus.COUNTER_SALE, SalesOrderStatus.DELIVERED] }, completedAt: { gte: startOfMonth } },
      _sum: { totalAmount: true },
    }),
    prisma.salesOrder.aggregate({
      where: { status: { in: [SalesOrderStatus.COUNTER_SALE, SalesOrderStatus.DELIVERED] }, completedAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { totalAmount: true },
    }),
    prisma.product.count({ where: { isActive: true, stockQuantity: { lte: 5 } } }),
    prisma.warranty.count({ where: { expiryDate: { gt: now } } }),
    prisma.repairOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, orderCode: true, customerName: true, phoneNumber: true,
        description: true, status: true, repairFee: true, createdAt: true, completedAt: true,
        warranty: { select: { expiryDate: true } },
      },
    }),
    prisma.salesOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, orderCode: true, orderType: true, customerName: true,
        totalAmount: true, status: true, createdAt: true,
        items: { select: { id: true, productName: true, quantity: true, unitPrice: true } },
      },
    }),
  ]);

  const salesThisMonthVal  = salesThisMonth._sum.totalAmount  ?? 0;
  const salesLastMonthVal  = salesLastMonth._sum.totalAmount  ?? 0;
  const saleTrend    = salesLastMonthVal    ? Math.round(((salesThisMonthVal - salesLastMonthVal) / salesLastMonthVal) * 100) : 0;
  const repairTrend  = repairCompletedLastMonth ? Math.round(((repairCompletedThisMonth - repairCompletedLastMonth) / repairCompletedLastMonth) * 100) : 0;

  return {
    stats: {
      repairInProgress, repairCompletedThisMonth, repairTrend,
      revenueThisMonth: salesThisMonthVal, saleTrend,
      lowStockCount, warrantyActive,
    },
    recentRepairs,
    recentSales,
  };
}

export async function GET() {
  const t0 = performance.now();
  const { data, hit } = await withCache(DASHBOARD_KEY, TTL.DASHBOARD, fetchDashboard);
  const ms = Math.round(performance.now() - t0);
  console.log(`[dashboard] → ${hit ? "HIT" : "MISS"} ${ms}ms`);

  return NextResponse.json(
    { success: true, data },
    { headers: {
        "X-Cache":         hit ? "HIT" : "MISS",
        "X-Response-Time": `${ms}ms`,
        "Cache-Control":   "private, max-age=30, stale-while-revalidate=90",
      },
    }
  );
}

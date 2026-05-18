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
    repairStats,
    salesStats,
    lowStockCount,
    warrantyActive,
    recentRepairs,
    recentSales,
  ] = await Promise.all([
    // Group 3 RepairOrder counts into 1 raw query
    prisma.$queryRaw<[{ in_progress: bigint; completed_this_month: bigint; completed_last_month: bigint }]>`
      SELECT 
        COUNT(*) FILTER (WHERE "status" = 'IN_PROGRESS')::BIGINT as in_progress,
        COUNT(*) FILTER (WHERE "status" = 'COMPLETED' AND "completedAt" >= ${startOfMonth})::BIGINT as completed_this_month,
        COUNT(*) FILTER (WHERE "status" = 'COMPLETED' AND "completedAt" >= ${startOfLastMonth} AND "completedAt" <= ${endOfLastMonth})::BIGINT as completed_last_month
      FROM "RepairOrder"
    `,
    // Group 2 SalesOrder aggregates into 1 raw query
    prisma.$queryRaw<[{ this_month: bigint | null; last_month: bigint | null }]>`
      SELECT 
        SUM("totalAmount") FILTER (WHERE "completedAt" >= ${startOfMonth})::BIGINT as this_month,
        SUM("totalAmount") FILTER (WHERE "completedAt" >= ${startOfLastMonth} AND "completedAt" <= ${endOfLastMonth})::BIGINT as last_month
      FROM "SalesOrder"
      WHERE "status" IN ('COUNTER_SALE', 'DELIVERED') AND "completedAt" >= ${startOfLastMonth}
    `,
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

  const rep = repairStats[0];
  const sal = salesStats[0];

  const repairInProgress         = Number(rep?.in_progress ?? 0);
  const repairCompletedThisMonth = Number(rep?.completed_this_month ?? 0);
  const repairCompletedLastMonth = Number(rep?.completed_last_month ?? 0);

  const salesThisMonthVal  = Number(sal?.this_month ?? 0);
  const salesLastMonthVal  = Number(sal?.last_month ?? 0);

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

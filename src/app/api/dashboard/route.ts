import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RepairStatus, SalesOrderStatus } from "@/constants/enums";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

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
      where: {
        status: RepairStatus.COMPLETED,
        completedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    prisma.salesOrder.aggregate({
      where: {
        status: { in: [SalesOrderStatus.COUNTER_SALE, SalesOrderStatus.DELIVERED] },
        completedAt: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),
    prisma.salesOrder.aggregate({
      where: {
        status: { in: [SalesOrderStatus.COUNTER_SALE, SalesOrderStatus.DELIVERED] },
        completedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { totalAmount: true },
    }),
    prisma.product.count({
      where: { isActive: true, stockQuantity: { lte: 5 } },
    }),
    prisma.warranty.count({ where: { expiryDate: { gt: now } } }),
    prisma.repairOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { warranty: true },
    }),
    prisma.salesOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true },
    }),
  ]);

  const salesThisMonthVal = salesThisMonth._sum.totalAmount ?? 0;
  const salesLastMonthVal = salesLastMonth._sum.totalAmount ?? 0;
  const saleTrend = salesLastMonthVal
    ? Math.round(((salesThisMonthVal - salesLastMonthVal) / salesLastMonthVal) * 100)
    : 0;
  const repairTrend = repairCompletedLastMonth
    ? Math.round(((repairCompletedThisMonth - repairCompletedLastMonth) / repairCompletedLastMonth) * 100)
    : 0;

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        repairInProgress,
        repairCompletedThisMonth,
        repairTrend,
        revenueThisMonth: salesThisMonthVal,
        saleTrend,
        lowStockCount,
        warrantyActive,
      },
      recentRepairs,
      recentSales,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Row = { period: string; rev: bigint | number | null; cnt: bigint | number | null };

function n(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "bigint" ? Number(v) : v;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") ?? "month";
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  // ── Period config ──────────────────────────────────────────
  let labels: string[] = [];
  let keys: string[] = [];

  if (period === "month") {
    labels = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
    keys   = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  } else if (period === "quarter") {
    labels = ["Quý 1","Quý 2","Quý 3","Quý 4"];
    keys   = ["1","2","3","4"];
  } else {
    const rows = await prisma.$queryRawUnsafe<{ y: string }[]>(`
      SELECT strftime('%Y', completedAt) as y FROM RepairOrder WHERE completedAt IS NOT NULL
      UNION
      SELECT strftime('%Y', completedAt) as y FROM SalesOrder  WHERE completedAt IS NOT NULL
      ORDER BY y
    `);
    const allYears = [...new Set(rows.map(r => r.y).filter(Boolean))];
    if (allYears.length === 0) {
      const cy = new Date().getFullYear();
      allYears.push(String(cy - 1), String(cy));
    }
    labels = allYears;
    keys   = allYears;
  }

  // Clause helpers
  const cYear   = period !== "year" ? `AND strftime('%Y', completedAt) = '${year}'` : "";
  const cYearCr = period !== "year" ? `AND strftime('%Y', createdAt)   = '${year}'` : "";

  const periodExprC =  // by completedAt
    period === "month"   ? `strftime('%m', completedAt)` :
    period === "quarter" ? `CAST((CAST(strftime('%m', completedAt) AS INTEGER) + 2) / 3 AS TEXT)` :
                           `strftime('%Y', completedAt)`;
  const periodExprCr = // by createdAt
    period === "month"   ? `strftime('%m', createdAt)` :
    period === "quarter" ? `CAST((CAST(strftime('%m', createdAt) AS INTEGER) + 2) / 3 AS TEXT)` :
                           `strftime('%Y', createdAt)`;

  // ── Revenue + per-period cancelled/warranty ────────────────
  const [salesRows, repairRows, cancelledByPeriod, warrantyByPeriod] = await Promise.all([
    prisma.$queryRawUnsafe<Row[]>(`
      SELECT ${periodExprC} as period, SUM(totalAmount) as rev, COUNT(*) as cnt
      FROM SalesOrder
      WHERE status IN ('COUNTER_SALE','DELIVERED') AND completedAt IS NOT NULL ${cYear}
      GROUP BY period
    `),
    prisma.$queryRawUnsafe<Row[]>(`
      SELECT ${periodExprC} as period, SUM(repairFee) as rev, COUNT(*) as cnt
      FROM RepairOrder
      WHERE status = 'COMPLETED' AND completedAt IS NOT NULL ${cYear}
      GROUP BY period
    `),
    prisma.$queryRawUnsafe<{ period: string; cnt: bigint }[]>(`
      SELECT ${periodExprCr} as period, COUNT(*) as cnt
      FROM SalesOrder WHERE status = 'CANCELLED' ${cYearCr}
      GROUP BY period
    `),
    prisma.$queryRawUnsafe<{ period: string; cnt: bigint }[]>(`
      SELECT ${periodExprCr} as period, COUNT(*) as cnt
      FROM RepairOrder WHERE isWarrantyOrder = 1 ${cYearCr}
      GROUP BY period
    `),
  ]);

  const salesMap:     Record<string, { rev: number; cnt: number }> = {};
  const repairMap:    Record<string, { rev: number; cnt: number }> = {};
  const cancelledMap: Record<string, number> = {};
  const warrantyMap:  Record<string, number> = {};

  salesRows.forEach(r  => { salesMap[r.period]     = { rev: n(r.rev), cnt: n(r.cnt) }; });
  repairRows.forEach(r => { repairMap[r.period]     = { rev: n(r.rev), cnt: n(r.cnt) }; });
  cancelledByPeriod.forEach(r => { cancelledMap[r.period] = n(r.cnt); });
  warrantyByPeriod.forEach(r  => { warrantyMap[r.period]  = n(r.cnt); });

  const chartData = labels.map((label, i) => {
    const key = keys[i];
    const s = salesMap[key]  ?? { rev: 0, cnt: 0 };
    const r = repairMap[key] ?? { rev: 0, cnt: 0 };
    return {
      label,
      salesRevenue:   s.rev,
      repairRevenue:  r.rev,
      totalRevenue:   s.rev + r.rev,
      salesCount:     s.cnt,
      repairCount:    r.cnt,
      totalCount:     s.cnt + r.cnt,
      cancelledCount: cancelledMap[key] ?? 0,
      warrantyCount:  warrantyMap[key]  ?? 0,
    };
  });

  // ── Totals ─────────────────────────────────────────────────
  const totSales     = chartData.reduce((a, d) => a + d.salesRevenue,  0);
  const totRepair    = chartData.reduce((a, d) => a + d.repairRevenue, 0);
  const totRevenue   = totSales + totRepair;
  const totSalesCnt  = chartData.reduce((a, d) => a + d.salesCount,    0);
  const totRepairCnt = chartData.reduce((a, d) => a + d.repairCount,   0);
  const totOrders    = totSalesCnt + totRepairCnt;
  const totCancelled = chartData.reduce((a, d) => a + d.cancelledCount, 0);
  const totWarranty  = chartData.reduce((a, d) => a + d.warrantyCount,  0);

  // ── Top products ───────────────────────────────────────────
  const topRows = await prisma.$queryRawUnsafe<{ productName: string; qty: bigint; rev: bigint }[]>(`
    SELECT soi.productName,
           SUM(soi.quantity) as qty,
           SUM(soi.quantity * soi.unitPrice) as rev
    FROM SalesOrderItem soi
    JOIN SalesOrder so ON so.id = soi.salesOrderId
    WHERE so.status IN ('COUNTER_SALE','DELIVERED') AND so.completedAt IS NOT NULL
      ${period !== "year" ? `AND strftime('%Y', so.completedAt) = '${year}'` : ""}
    GROUP BY soi.productName
    ORDER BY qty DESC
    LIMIT 8
  `);
  const topProducts = topRows.map(r => ({
    name: r.productName,
    quantity: n(r.qty),
    revenue: n(r.rev),
  }));

  // ── Detailed metrics ───────────────────────────────────────
  const yearRange = period !== "year"
    ? { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) }
    : undefined;

  const [
    inProgressRepairs,
    processingOrders,
    lowStockCnt,
    avgRepairDaysRes,
    newCustomerCnt,
    counterStats,
    deliveredStats,
    deliveryCancelledStats,
    cancelledRevRes,
  ] = await Promise.all([
    // Current in-progress repairs (no period filter — real-time)
    prisma.repairOrder.count({ where: { status: "IN_PROGRESS" } }),
    // Current delivery-in-transit orders (no period filter — real-time)
    prisma.salesOrder.count({ where: { status: "PROCESSING" } }),
    // Low-stock products (real-time)
    prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
      `SELECT COUNT(*) as cnt FROM Product WHERE isActive = 1 AND stockQuantity <= lowStockThreshold`
    ).then(r => n(r[0]?.cnt)),
    // Average repair duration (completed in period)
    prisma.$queryRawUnsafe<{ avg: number | null }[]>(`
      SELECT AVG(julianday(completedAt) - julianday(createdAt)) as avg
      FROM RepairOrder WHERE status = 'COMPLETED' AND completedAt IS NOT NULL ${cYear}
    `).then(r => r[0]?.avg ?? null),
    // New customers registered in period
    prisma.customer.count({ where: yearRange ? { createdAt: yearRange } : {} }),
    // Counter-sale (COUNTER → COUNTER_SALE) in period
    prisma.$queryRawUnsafe<{ cnt: bigint; rev: bigint | null }[]>(`
      SELECT COUNT(*) as cnt, SUM(totalAmount) as rev FROM SalesOrder
      WHERE orderType = 'COUNTER' AND status = 'COUNTER_SALE' AND completedAt IS NOT NULL ${cYear}
    `).then(r => ({ cnt: n(r[0]?.cnt), rev: n(r[0]?.rev) })),
    // Delivery completed (DELIVERY → DELIVERED) in period
    prisma.$queryRawUnsafe<{ cnt: bigint; rev: bigint | null }[]>(`
      SELECT COUNT(*) as cnt, SUM(totalAmount) as rev FROM SalesOrder
      WHERE orderType = 'DELIVERY' AND status = 'DELIVERED' AND completedAt IS NOT NULL ${cYear}
    `).then(r => ({ cnt: n(r[0]?.cnt), rev: n(r[0]?.rev) })),
    // Delivery cancelled (stock returned) in period
    prisma.$queryRawUnsafe<{ cnt: bigint; rev: bigint | null }[]>(`
      SELECT COUNT(*) as cnt, SUM(totalAmount) as rev FROM SalesOrder
      WHERE orderType = 'DELIVERY' AND status = 'CANCELLED' ${cYearCr}
    `).then(r => ({ cnt: n(r[0]?.cnt), rev: n(r[0]?.rev) })),
    // Total cancelled revenue (lost) in period
    prisma.$queryRawUnsafe<{ rev: bigint | null }[]>(`
      SELECT SUM(totalAmount) as rev FROM SalesOrder WHERE status = 'CANCELLED' ${cYearCr}
    `).then(r => n(r[0]?.rev)),
  ]);

  // Delivery success rate = delivered / (delivered + cancelled)
  const deliveryAttempted = deliveredStats.cnt + deliveryCancelledStats.cnt;
  const deliverySuccessRate = deliveryAttempted > 0
    ? Math.round((deliveredStats.cnt / deliveryAttempted) * 100)
    : 100;

  // Repair completion rate in period = completed / (completed + currently in-progress)
  const repairAttempted = totRepairCnt + inProgressRepairs;
  const repairCompletionRate = repairAttempted > 0
    ? Math.round((totRepairCnt / repairAttempted) * 100)
    : 100;

  // Warranty claim rate = warranty orders / total completed repairs (in period)
  const warrantyRate = totRepairCnt > 0
    ? Math.round((totWarranty / totRepairCnt) * 100)
    : 0;

  // ── Pie breakdown (period-filtered) ───────────────────────
  const [counterCnt, deliveryCnt, repairCnt] = await Promise.all([
    prisma.salesOrder.count({ where: {
      orderType: "COUNTER", status: "COUNTER_SALE",
      ...(yearRange ? { completedAt: yearRange } : {}),
    }}),
    prisma.salesOrder.count({ where: {
      orderType: "DELIVERY", status: "DELIVERED",
      ...(yearRange ? { completedAt: yearRange } : {}),
    }}),
    prisma.repairOrder.count({ where: {
      status: "COMPLETED",
      ...(yearRange ? { completedAt: yearRange } : {}),
    }}),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      period, year,
      chartData,
      summary: {
        totalRevenue:    totRevenue,
        salesRevenue:    totSales,
        repairRevenue:   totRepair,
        totalOrders:     totOrders,
        salesCount:      totSalesCnt,
        repairCount:     totRepairCnt,
        avgRevenue:      totOrders > 0 ? Math.round(totRevenue / totOrders) : 0,
        // Cancelled
        cancelledCount:   totCancelled,
        cancelledRevenue: cancelledRevRes,
        // Warranty
        warrantyCount:    totWarranty,
        warrantyRate,
        // Repair time
        avgRepairDays:    avgRepairDaysRes !== null ? Math.round(avgRepairDaysRes * 10) / 10 : null,
        repairCompletionRate,
        // New customers
        newCustomers: newCustomerCnt,
        // Channel breakdown
        counterCount:   counterStats.cnt,
        counterRevenue: counterStats.rev,
        deliveryCount:   deliveredStats.cnt,
        deliveryRevenue: deliveredStats.rev,
        deliveryCancelledCount:   deliveryCancelledStats.cnt,
        deliveryCancelledRevenue: deliveryCancelledStats.rev,
        deliverySuccessRate,
      },
      operations: {
        inProgressRepairs,
        processingOrders,
        lowStockProducts: lowStockCnt,
      },
      topProducts,
      pieData: [
        { name: "Bán tại quầy", value: counterCnt, color: "#C49A2A" },
        { name: "Giao hàng",    value: deliveryCnt, color: "#3b82f6" },
        { name: "Đơn sửa",      value: repairCnt,   color: "#22c55e" },
      ],
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCache, reportKey, TTL } from "@/lib/cache";

type Row = { period: string; rev: bigint | number | null; cnt: bigint | number | null };

function n(v: bigint | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === "bigint" ? Number(v) : v;
}

// ── Data fetcher (called only on cache miss) ───────────────────
async function fetchReports(period: string, year: number) {
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
      SELECT EXTRACT(YEAR FROM "completedAt")::INTEGER::TEXT as y
        FROM "RepairOrder" WHERE "completedAt" IS NOT NULL
      UNION
      SELECT EXTRACT(YEAR FROM "completedAt")::INTEGER::TEXT as y
        FROM "SalesOrder"  WHERE "completedAt" IS NOT NULL
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

  // Range filter — btree-compatible
  const yearStart = `'${year}-01-01'`;
  const yearEnd   = `'${year + 1}-01-01'`;
  const cYear   = period !== "year"
    ? `AND "completedAt" >= ${yearStart} AND "completedAt" < ${yearEnd}` : "";
  const cYearCr = period !== "year"
    ? `AND "createdAt" >= ${yearStart} AND "createdAt" < ${yearEnd}` : "";
  const yearRange = period !== "year"
    ? { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) }
    : undefined;

  const periodExprC =
    period === "month"   ? `to_char("completedAt", 'MM')` :
    period === "quarter" ? `EXTRACT(QUARTER FROM "completedAt")::INTEGER::TEXT` :
                           `EXTRACT(YEAR FROM "completedAt")::INTEGER::TEXT`;
  const periodExprCr =
    period === "month"   ? `to_char("createdAt", 'MM')` :
    period === "quarter" ? `EXTRACT(QUARTER FROM "createdAt")::INTEGER::TEXT` :
                           `EXTRACT(YEAR FROM "createdAt")::INTEGER::TEXT`;

  // ── ALL 21 queries in ONE round trip ──────────────────────
  const [
    salesRows, repairRows, cancelledByPeriod, warrantyByPeriod,
    topRows,
    inProgressRepairs, processingOrders,
    lowStockCntRaw, avgRepairDaysRaw,
    newCustomerCnt,
    counterStatsRaw, deliveredStatsRaw, deliveryCancelledStatsRaw, cancelledRevRaw,
    counterCnt, deliveryCnt, repairCnt,
    employeeRows, paymentRows, inventoryRows, topCustomerRows,
  ] = await Promise.all([
    prisma.$queryRawUnsafe<Row[]>(`
      SELECT ${periodExprC} as period, SUM("totalAmount") as rev, COUNT(*) as cnt
      FROM "SalesOrder"
      WHERE "status" IN ('COUNTER_SALE','DELIVERED') AND "completedAt" IS NOT NULL ${cYear}
      GROUP BY period
    `),
    prisma.$queryRawUnsafe<Row[]>(`
      SELECT ${periodExprC} as period, SUM("repairFee") as rev, COUNT(*) as cnt
      FROM "RepairOrder"
      WHERE "status" = 'COMPLETED' AND "completedAt" IS NOT NULL ${cYear}
      GROUP BY period
    `),
    prisma.$queryRawUnsafe<{ period: string; cnt: bigint }[]>(`
      SELECT ${periodExprCr} as period, COUNT(*) as cnt
      FROM "SalesOrder" WHERE "status" = 'CANCELLED' ${cYearCr}
      GROUP BY period
    `),
    prisma.$queryRawUnsafe<{ period: string; cnt: bigint }[]>(`
      SELECT ${periodExprCr} as period, COUNT(*) as cnt
      FROM "RepairOrder" WHERE "isWarrantyOrder" = TRUE ${cYearCr}
      GROUP BY period
    `),
    prisma.$queryRawUnsafe<{ productName: string; qty: bigint; rev: bigint }[]>(`
      SELECT soi."productName",
             SUM(soi."quantity") as qty,
             SUM(soi."quantity" * soi."unitPrice") as rev
      FROM "SalesOrderItem" soi
      JOIN "SalesOrder" so ON so."id" = soi."salesOrderId"
      WHERE so."status" IN ('COUNTER_SALE','DELIVERED') AND so."completedAt" IS NOT NULL
        ${period !== "year" ? `AND so."completedAt" >= ${yearStart} AND so."completedAt" < ${yearEnd}` : ""}
      GROUP BY soi."productName"
      ORDER BY qty DESC
      LIMIT 8
    `),
    prisma.repairOrder.count({ where: { status: "IN_PROGRESS" } }),
    prisma.salesOrder.count({ where: { status: "PROCESSING" } }),
    prisma.$queryRawUnsafe<{ cnt: bigint }[]>(
      `SELECT COUNT(*) as cnt FROM "Product" WHERE "isActive" = TRUE AND "stockQuantity" <= "lowStockThreshold"`
    ),
    prisma.$queryRawUnsafe<{ avg: number | null }[]>(`
      SELECT AVG(EXTRACT(EPOCH FROM ("completedAt" - "createdAt")) / 86400) as avg
      FROM "RepairOrder" WHERE "status" = 'COMPLETED' AND "completedAt" IS NOT NULL ${cYear}
    `),
    prisma.customer.count({ where: yearRange ? { createdAt: yearRange } : {} }),
    prisma.$queryRawUnsafe<{ cnt: bigint; rev: bigint | null }[]>(`
      SELECT COUNT(*) as cnt, SUM("totalAmount") as rev FROM "SalesOrder"
      WHERE "orderType" = 'COUNTER' AND "status" = 'COUNTER_SALE' AND "completedAt" IS NOT NULL ${cYear}
    `),
    prisma.$queryRawUnsafe<{ cnt: bigint; rev: bigint | null }[]>(`
      SELECT COUNT(*) as cnt, SUM("totalAmount") as rev FROM "SalesOrder"
      WHERE "orderType" = 'DELIVERY' AND "status" = 'DELIVERED' AND "completedAt" IS NOT NULL ${cYear}
    `),
    prisma.$queryRawUnsafe<{ cnt: bigint; rev: bigint | null }[]>(`
      SELECT COUNT(*) as cnt, SUM("totalAmount") as rev FROM "SalesOrder"
      WHERE "orderType" = 'DELIVERY' AND "status" = 'CANCELLED' ${cYearCr}
    `),
    prisma.$queryRawUnsafe<{ rev: bigint | null }[]>(`
      SELECT SUM("totalAmount") as rev FROM "SalesOrder" WHERE "status" = 'CANCELLED' ${cYearCr}
    `),
    prisma.salesOrder.count({ where: { orderType: "COUNTER",  status: "COUNTER_SALE", ...(yearRange ? { completedAt: yearRange } : {}) }}),
    prisma.salesOrder.count({ where: { orderType: "DELIVERY", status: "DELIVERED",    ...(yearRange ? { completedAt: yearRange } : {}) }}),
    prisma.repairOrder.count({ where: { status: "COMPLETED",                          ...(yearRange ? { completedAt: yearRange } : {}) }}),
    prisma.$queryRawUnsafe<{ name: string; cnt: bigint; rev: bigint | null }[]>(`
      SELECT e."name", COUNT(*) as cnt, SUM(so."totalAmount") as rev
      FROM "Employee" e
      JOIN "SalesOrder" so ON so."employeeId" = e."id"
      WHERE so."status" = 'DELIVERED' AND so."completedAt" IS NOT NULL
        ${period !== "year" ? `AND so."completedAt" >= ${yearStart} AND so."completedAt" < ${yearEnd}` : ""}
      GROUP BY e."id", e."name"
      ORDER BY cnt DESC
      LIMIT 5
    `),
    prisma.$queryRawUnsafe<{ method: string | null; cnt: bigint; rev: bigint | null }[]>(`
      SELECT "paymentMethod" as method, COUNT(*) as cnt, SUM("totalAmount") as rev
      FROM "SalesOrder"
      WHERE "status" IN ('COUNTER_SALE','DELIVERED') AND "completedAt" IS NOT NULL ${cYear}
      GROUP BY "paymentMethod"
    `),
    prisma.$queryRawUnsafe<{ total: bigint; low_stock: bigint; out_of_stock: bigint; stock_cost: bigint | null; stock_retail: bigint | null }[]>(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE "stockQuantity" > 0 AND "stockQuantity" <= "lowStockThreshold") as low_stock,
        COUNT(*) FILTER (WHERE "stockQuantity" = 0) as out_of_stock,
        SUM("stockQuantity" * "costPrice") as stock_cost,
        SUM("stockQuantity" * "sellingPrice") as stock_retail
      FROM "Product" WHERE "isActive" = TRUE
    `),
    prisma.$queryRawUnsafe<{ name: string; phone: string; cnt: bigint; rev: bigint | null }[]>(`
      SELECT c."name", c."phone", COUNT(*) as cnt, SUM(so."totalAmount") as rev
      FROM "Customer" c
      JOIN "SalesOrder" so ON so."customerId" = c."id"
      WHERE so."status" IN ('COUNTER_SALE','DELIVERED') AND so."completedAt" IS NOT NULL ${cYear}
      GROUP BY c."id", c."name", c."phone"
      ORDER BY rev DESC NULLS LAST
      LIMIT 5
    `),
  ]);

  // Unpack raw results
  const lowStockCnt      = n(lowStockCntRaw[0]?.cnt);
  const avgRepairDaysRes = avgRepairDaysRaw[0]?.avg ?? null;
  const counterStats     = { cnt: n(counterStatsRaw[0]?.cnt),              rev: n(counterStatsRaw[0]?.rev) };
  const deliveredStats   = { cnt: n(deliveredStatsRaw[0]?.cnt),            rev: n(deliveredStatsRaw[0]?.rev) };
  const deliveryCancelledStats = { cnt: n(deliveryCancelledStatsRaw[0]?.cnt), rev: n(deliveryCancelledStatsRaw[0]?.rev) };
  const cancelledRevRes  = n(cancelledRevRaw[0]?.rev);

  const salesMap:     Record<string, { rev: number; cnt: number }> = {};
  const repairMap:    Record<string, { rev: number; cnt: number }> = {};
  const cancelledMap: Record<string, number> = {};
  const warrantyMap:  Record<string, number> = {};

  salesRows.forEach(r         => { salesMap[r.period]     = { rev: n(r.rev), cnt: n(r.cnt) }; });
  repairRows.forEach(r        => { repairMap[r.period]    = { rev: n(r.rev), cnt: n(r.cnt) }; });
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

  const totSales     = chartData.reduce((a, d) => a + d.salesRevenue,  0);
  const totRepair    = chartData.reduce((a, d) => a + d.repairRevenue, 0);
  const totRevenue   = totSales + totRepair;
  const totSalesCnt  = chartData.reduce((a, d) => a + d.salesCount,    0);
  const totRepairCnt = chartData.reduce((a, d) => a + d.repairCount,   0);
  const totOrders    = totSalesCnt + totRepairCnt;
  const totCancelled = chartData.reduce((a, d) => a + d.cancelledCount, 0);
  const totWarranty  = chartData.reduce((a, d) => a + d.warrantyCount,  0);

  const topProducts  = topRows.map(r => ({ name: r.productName, quantity: n(r.qty), revenue: n(r.rev) }));

  const deliveryAttempted    = deliveredStats.cnt + deliveryCancelledStats.cnt;
  const deliverySuccessRate  = deliveryAttempted > 0 ? Math.round((deliveredStats.cnt / deliveryAttempted) * 100) : 100;
  const repairAttempted      = totRepairCnt + inProgressRepairs;
  const repairCompletionRate = repairAttempted > 0 ? Math.round((totRepairCnt / repairAttempted) * 100) : 100;
  const warrantyRate         = totRepairCnt > 0 ? Math.round((totWarranty / totRepairCnt) * 100) : 0;

  const payLabel: Record<string, string> = { CASH: "Tiền mặt", BANK_TRANSFER: "Chuyển khoản" };
  const inv = inventoryRows[0];

  return {
    period, year, chartData,
    summary: {
      totalRevenue:    totRevenue,
      salesRevenue:    totSales,
      repairRevenue:   totRepair,
      totalOrders:     totOrders,
      salesCount:      totSalesCnt,
      repairCount:     totRepairCnt,
      avgRevenue:      totOrders > 0 ? Math.round(totRevenue / totOrders) : 0,
      cancelledCount:   totCancelled,
      cancelledRevenue: cancelledRevRes,
      warrantyCount:    totWarranty,
      warrantyRate,
      avgRepairDays:    avgRepairDaysRes !== null ? Math.round(avgRepairDaysRes * 10) / 10 : null,
      repairCompletionRate,
      newCustomers:    newCustomerCnt,
      counterCount:    counterStats.cnt,
      counterRevenue:  counterStats.rev,
      deliveryCount:   deliveredStats.cnt,
      deliveryRevenue: deliveredStats.rev,
      deliveryCancelledCount:   deliveryCancelledStats.cnt,
      deliveryCancelledRevenue: deliveryCancelledStats.rev,
      deliverySuccessRate,
    },
    operations: { inProgressRepairs, processingOrders, lowStockProducts: lowStockCnt },
    topProducts,
    pieData: [
      { name: "Bán tại quầy", value: counterCnt, color: "#C49A2A" },
      { name: "Giao hàng",    value: deliveryCnt, color: "#3b82f6" },
      { name: "Đơn sửa",      value: repairCnt,   color: "#22c55e" },
    ],
    topEmployees: employeeRows.map(r => ({ name: r.name, deliveryCount: n(r.cnt), revenue: n(r.rev) })),
    paymentBreakdown: paymentRows.map(r => ({
      method: r.method ? (payLabel[r.method] ?? r.method) : "Chưa xác định",
      count: n(r.cnt),
      revenue: n(r.rev),
    })),
    inventory: {
      totalActive:      n(inv?.total),
      lowStock:         n(inv?.low_stock),
      outOfStock:       n(inv?.out_of_stock),
      stockCostValue:   n(inv?.stock_cost),
      stockRetailValue: n(inv?.stock_retail),
    },
    topCustomers: topCustomerRows.map(r => ({
      name: r.name, phone: r.phone, orderCount: n(r.cnt), revenue: n(r.rev),
    })),
  };
}

// ── Route handler ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const t0 = performance.now();
  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") ?? "month";
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

  const key = reportKey(period, year);
  const { data, hit } = await withCache(key, TTL.REPORTS, () => fetchReports(period, year));

  const ms = Math.round(performance.now() - t0);
  console.log(`[reports] ${period}/${year} → ${hit ? "HIT" : "MISS"} ${ms}ms`);

  return NextResponse.json(
    { success: true, data },
    { headers: {
        "X-Cache":         hit ? "HIT" : "MISS",
        "X-Response-Time": `${ms}ms`,
        "Cache-Control":   "private, max-age=60, stale-while-revalidate=240",
      },
    }
  );
}

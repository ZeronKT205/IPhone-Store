"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { Wrench, TrendingUp, Package, ShieldCheck, AlertTriangle } from "lucide-react";
import { REPAIR_STATUS_LABEL, SALES_ORDER_STATUS_LABEL } from "@/constants/enums";
import { fmtDate, fmtCurrency } from "@/lib/format";

function fmt(n: number) { return fmtCurrency(n); }

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((r) => { if (r.success) setData(r.data); })
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats ?? {};

  return (
    <div>
      <Header title="Tổng quan" subtitle="Thống kê hoạt động cửa hàng tháng này" />

      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Đơn đang sửa"
            value={loading ? "–" : stats.repairInProgress ?? 0}
            unit="Phiếu"
            icon={<Wrench size={20} />}
            iconBg="#FEF3C7"
            iconColor="#D97706"
          />
          <StatCard
            label="Hoàn thành tháng này"
            value={loading ? "–" : stats.repairCompletedThisMonth ?? 0}
            unit="Phiếu"
            trend={stats.repairTrend}
            icon={<ShieldCheck size={20} />}
            iconBg="#DCFCE7"
            iconColor="#16A34A"
          />
          <StatCard
            label="Doanh thu tháng"
            value={loading ? "–" : new Intl.NumberFormat("vi-VN").format(stats.revenueThisMonth ?? 0)}
            unit="đồng"
            trend={stats.saleTrend}
            icon={<TrendingUp size={20} />}
          />
          <StatCard
            label="Kho cần nhập thêm"
            value={loading ? "–" : stats.lowStockCount ?? 0}
            unit="Sản phẩm"
            icon={<AlertTriangle size={20} />}
            iconBg="#FEE2E2"
            iconColor="#DC2626"
          />
        </div>

        {/* Recent orders */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Repair */}
          <div
            className="p-0 overflow-hidden"
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <Wrench size={15} style={{ color: "var(--color-brand)" }} />
                <span className="font-medium text-sm">Đơn sửa gần đây</span>
              </div>
              <a href="/repair-orders" className="text-xs" style={{ color: "var(--color-brand)" }}>
                Xem tất cả →
              </a>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--color-bg)" }}>
                  {["Mã đơn", "Khách hàng", "Trạng thái", "Ngày"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium"
                      style={{ color: "var(--color-text-subtle)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentRepairs ?? []).map((o: any) => (
                  <tr key={o.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td className="px-4 py-2.5 font-mono text-xs"
                      style={{ color: "var(--color-brand-dark)" }}>{o.orderCode}</td>
                    <td className="px-4 py-2.5">{o.customerName}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={o.status === "COMPLETED" ? "success" : "warning"} dot>
                        {REPAIR_STATUS_LABEL[o.status as keyof typeof REPAIR_STATUS_LABEL]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {fmtDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
                {!loading && !data?.recentRepairs?.length && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-xs"
                    style={{ color: "var(--color-text-subtle)" }}>Chưa có đơn nào</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sales */}
          <div
            className="overflow-hidden"
            style={{
              backgroundColor: "var(--color-surface)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <Package size={15} style={{ color: "var(--color-brand)" }} />
                <span className="font-medium text-sm">Bán hàng gần đây</span>
              </div>
              <a href="/sales" className="text-xs" style={{ color: "var(--color-brand)" }}>
                Xem tất cả →
              </a>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--color-bg)" }}>
                  {["Mã đơn", "Tổng tiền", "Trạng thái", "Ngày"].map((h) => (
                    <th key={h} className="text-left px-4 py-2 text-xs font-medium"
                      style={{ color: "var(--color-text-subtle)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.recentSales ?? []).map((o: any) => (
                  <tr key={o.id} style={{ borderTop: "1px solid var(--color-border)" }}>
                    <td className="px-4 py-2.5 font-mono text-xs"
                      style={{ color: "var(--color-brand-dark)" }}>{o.orderCode}</td>
                    <td className="px-4 py-2.5 font-medium">{fmt(o.totalAmount)}</td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={
                          o.status === "DELIVERED" || o.status === "COUNTER_SALE" ? "success"
                          : o.status === "PROCESSING" ? "warning"
                          : "danger"
                        }
                        dot
                      >
                        {SALES_ORDER_STATUS_LABEL[o.status as keyof typeof SALES_ORDER_STATUS_LABEL]}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {fmtDate(o.createdAt)}
                    </td>
                  </tr>
                ))}
                {!loading && !data?.recentSales?.length && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-xs"
                    style={{ color: "var(--color-text-subtle)" }}>Chưa có đơn nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

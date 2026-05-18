"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import { fmtCurrency } from "@/lib/format";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, Wrench, ShoppingCart, BarChart3,
  Package, ChevronDown, Truck, AlertTriangle,
  UserPlus, Clock, ShieldAlert, XCircle,
  CheckCircle2, TrendingDown,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────
const GOLD   = "#C49A2A";
const BLUE   = "#3b82f6";
const GREEN  = "#22c55e";
const GOLD2  = "#E2C97E";
const RED    = "#ef4444";
const AMBER  = "#f59e0b";

type Period = "month" | "quarter" | "year";

function fmtShort(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " tỷ";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + "K";
  return String(n);
}

function fmtDays(d: number | null): string {
  if (d === null) return "—";
  if (d < 1) return `${Math.round(d * 24)}h`;
  return `${d} ngày`;
}

// ── Custom tooltip ────────────────────────────────────────────
function ChartTooltip({ active, payload, label, isCurrency = true }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="text-sm" style={{
      backgroundColor: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      minWidth: 160,
    }}>
      <p className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5" style={{ color: "var(--color-text-muted)" }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.color }} />
            {p.name}
          </span>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>
            {isCurrency ? fmtCurrency(p.value) : p.value.toLocaleString("vi-VN")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, small }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; color: string; small?: boolean;
}) {
  return (
    <div className="p-4" style={{
      backgroundColor: "var(--color-surface)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-card)",
    }}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</p>
        <div className={`${small ? "w-7 h-7" : "w-8 h-8"} rounded-lg flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: color + "20", color }}>
          <Icon size={small ? 14 : 16} />
        </div>
      </div>
      <p className={`${small ? "text-xl" : "text-2xl"} font-bold`} style={{ color: "var(--color-text)" }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-subtle)" }}>{sub}</p>}
    </div>
  );
}

// ── Rate bar ──────────────────────────────────────────────────
function RateBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold w-10 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ period, year: String(year) });
    fetch(`/api/reports?${p}`)
      .then(r => r.json())
      .then(r => { if (r.success) setData(r.data); })
      .finally(() => setLoading(false));
  }, [period, year]);

  useEffect(() => { load(); }, [load]);

  const s            = data?.summary         ?? {};
  const ops          = data?.operations      ?? {};
  const chartData    = data?.chartData       ?? [];
  const topProducts  = data?.topProducts     ?? [];
  const pieData      = data?.pieData         ?? [];
  const topEmployees = data?.topEmployees    ?? [];
  const paymentBreakdown = data?.paymentBreakdown ?? [];
  const inventory    = data?.inventory       ?? {};
  const topCustomers = data?.topCustomers    ?? [];

  const periodLabel = period === "month" ? "tháng" : period === "quarter" ? "quý" : "năm";
  const subtitle = period === "year" ? "Tất cả các năm" : `Năm ${year}`;

  return (
    <div>
      <Header
        title="Báo cáo"
        subtitle={`Thống kê theo ${periodLabel} · ${subtitle}`}
      />

      <div className="p-6 space-y-5">

        {/* ── Period + Year selector ─────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-1 p-1 rounded-lg"
            style={{ backgroundColor: "var(--color-bg)" }}>
            {(["month","quarter","year"] as Period[]).map(p => (
              <button key={p}
                onClick={() => setPeriod(p)}
                className="px-4 py-1.5 text-sm font-medium rounded transition-all"
                style={{
                  backgroundColor: period === p ? "var(--color-brand)" : "transparent",
                  color: period === p ? "#fff" : "var(--color-text-muted)",
                  boxShadow: period === p ? "0 1px 4px rgba(196,154,42,0.3)" : "none",
                }}>
                {p === "month" ? "Theo tháng" : p === "quarter" ? "Theo quý" : "Theo năm"}
              </button>
            ))}
          </div>

          {period !== "year" && (
            <div className="relative">
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="appearance-none pl-4 pr-9 py-2 text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  color: "var(--color-text)",
                }}>
                {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--color-text-subtle)" }} />
            </div>
          )}
        </div>

        {/* ── Tình trạng hiện tại (real-time) ────────────── */}
        <div className="p-4" style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          borderLeft: `3px solid ${AMBER}`,
        }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: AMBER }}>
            Tình trạng hiện tại
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: GOLD + "20", color: GOLD }}>
                <Wrench size={15} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                  {loading ? "—" : (ops.inProgressRepairs ?? 0)}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Đơn đang sửa</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: BLUE + "20", color: BLUE }}>
                <Truck size={15} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                  {loading ? "—" : (ops.processingOrders ?? 0)}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Đang giao hàng</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: AMBER + "20", color: AMBER }}>
                <AlertTriangle size={15} />
              </div>
              <div>
                <p className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                  {loading ? "—" : (ops.lowStockProducts ?? 0)}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Hàng sắp hết kho</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat cards – doanh thu ──────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Tổng doanh thu"     value={loading ? "—" : fmtShort(s.totalRevenue ?? 0)}
            sub={loading ? "" : fmtCurrency(s.totalRevenue ?? 0)} icon={TrendingUp} color={GOLD} />
          <StatCard label="Doanh thu bán hàng" value={loading ? "—" : fmtShort(s.salesRevenue ?? 0)}
            sub={`${s.salesCount ?? 0} đơn`} icon={ShoppingCart} color={BLUE} />
          <StatCard label="Doanh thu sửa chữa" value={loading ? "—" : fmtShort(s.repairRevenue ?? 0)}
            sub={`${s.repairCount ?? 0} đơn`} icon={Wrench} color={GREEN} />
          <StatCard label="Doanh thu trung bình" value={loading ? "—" : fmtShort(s.avgRevenue ?? 0)}
            sub={`Tổng ${s.totalOrders ?? 0} đơn`} icon={BarChart3} color="#8b5cf6" />
        </div>

        {/* ── Stat cards – vận hành ───────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard small label="Đơn hủy kỳ này"
            value={loading ? "—" : String(s.cancelledCount ?? 0)}
            sub={loading || !s.cancelledRevenue ? "0đ mất" : `${fmtShort(s.cancelledRevenue)} mất`}
            icon={XCircle} color={RED} />
          <StatCard small label="Khách hàng mới"
            value={loading ? "—" : String(s.newCustomers ?? 0)}
            sub="trong kỳ"
            icon={UserPlus} color="#06b6d4" />
          <StatCard small label="Đơn bảo hành"
            value={loading ? "—" : String(s.warrantyCount ?? 0)}
            sub={loading ? "" : `${s.warrantyRate ?? 0}% so với sửa`}
            icon={ShieldAlert} color={AMBER} />
          <StatCard small label="T/g sửa trung bình"
            value={loading ? "—" : fmtDays(s.avgRepairDays ?? null)}
            sub="/ đơn hoàn thành"
            icon={Clock} color={GREEN} />
        </div>

        {/* ── Revenue area chart ─────────────────────────── */}
        <div className="p-5" style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
        }}>
          <p className="font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            Doanh thu theo {periodLabel}
          </p>
          {loading ? (
            <div className="h-64 flex items-center justify-center" style={{ color: "var(--color-text-subtle)" }}>
              Đang tải...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={GOLD} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradRepair" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={BLUE} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--color-text-subtle)" as string }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: "var(--color-text-subtle)" as string }} axisLine={false} tickLine={false} width={56} />
                <Tooltip content={<ChartTooltip isCurrency />} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{v}</span>}
                  iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="salesRevenue"  name="Bán hàng"  stroke={GOLD} fill="url(#gradSales)"  strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="repairRevenue" name="Sửa chữa"  stroke={BLUE} fill="url(#gradRepair)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Bar chart + Pie chart ──────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Bar: order count + cancelled */}
          <div className="xl:col-span-2 p-5" style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          }}>
            <p className="font-semibold mb-4" style={{ color: "var(--color-text)" }}>
              Số lượng đơn theo {periodLabel}
            </p>
            {loading ? (
              <div className="h-56 flex items-center justify-center" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--color-text-subtle)" as string }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-text-subtle)" as string }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<ChartTooltip isCurrency={false} />} />
                  <Legend formatter={(v) => <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{v}</span>}
                    iconType="circle" iconSize={8} />
                  <Bar dataKey="salesCount"    name="Đơn bán"    fill={GOLD}  radius={[3,3,0,0]} maxBarSize={28} />
                  <Bar dataKey="repairCount"   name="Đơn sửa"   fill={BLUE}  radius={[3,3,0,0]} maxBarSize={28} />
                  <Bar dataKey="cancelledCount" name="Đơn hủy"  fill={RED}   radius={[3,3,0,0]} maxBarSize={28} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie: breakdown */}
          <div className="p-5" style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          }}>
            <p className="font-semibold mb-4" style={{ color: "var(--color-text)" }}>
              Phân loại đơn {period !== "year" ? `(${year})` : "(tổng)"}
            </p>
            {loading ? (
              <div className="h-56 flex items-center justify-center" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%"
                      innerRadius={48} outerRadius={72}
                      paddingAngle={3} dataKey="value">
                      {pieData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => [v.toLocaleString("vi-VN") + " đơn", ""]}
                      contentStyle={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px", fontSize: 13,
                      }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((d: any) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-semibold" style={{ color: "var(--color-text)" }}>
                        {d.value.toLocaleString("vi-VN")}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Phân tích kênh bán ─────────────────────────── */}
        <div className="p-5" style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
        }}>
          <p className="font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            Phân tích kênh bán hàng
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Counter */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: GOLD + "20", color: GOLD }}>
                  <ShoppingCart size={14} />
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Bán tại quầy</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>Số đơn</span>
                  <span className="font-bold" style={{ color: "var(--color-text)" }}>{loading ? "—" : (s.counterCount ?? 0).toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>Doanh thu</span>
                  <span className="font-bold" style={{ color: GOLD }}>{loading ? "—" : fmtShort(s.counterRevenue ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>Tỷ lệ</span>
                  <span className="font-semibold" style={{ color: GREEN }}>
                    {loading ? "—" : (s.totalOrders > 0 ? Math.round(((s.counterCount ?? 0) / s.totalOrders) * 100) : 0) + "%"}
                  </span>
                </div>
                <div className="pt-1">
                  <RateBar pct={loading ? 0 : (s.totalOrders > 0 ? Math.round(((s.counterCount ?? 0) / s.totalOrders) * 100) : 0)} color={GOLD} />
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: BLUE + "20", color: BLUE }}>
                  <Truck size={14} />
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Giao hàng</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>Giao thành công</span>
                  <span className="font-bold" style={{ color: "var(--color-text)" }}>{loading ? "—" : (s.deliveryCount ?? 0).toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>Đơn hủy</span>
                  <span className="font-bold" style={{ color: RED }}>{loading ? "—" : (s.deliveryCancelledCount ?? 0).toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>Doanh thu</span>
                  <span className="font-bold" style={{ color: BLUE }}>{loading ? "—" : fmtShort(s.deliveryRevenue ?? 0)}</span>
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Tỷ lệ giao thành công</span>
                  </div>
                  <RateBar pct={loading ? 0 : (s.deliverySuccessRate ?? 100)} color={GREEN} />
                </div>
              </div>
            </div>

            {/* Repair */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: GREEN + "20", color: GREEN }}>
                  <Wrench size={14} />
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>Sửa chữa</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>Đơn hoàn thành</span>
                  <span className="font-bold" style={{ color: "var(--color-text)" }}>{loading ? "—" : (s.repairCount ?? 0).toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>T/g trung bình</span>
                  <span className="font-bold" style={{ color: "var(--color-text)" }}>{loading ? "—" : fmtDays(s.avgRepairDays ?? null)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>Đơn bảo hành</span>
                  <span className="font-bold" style={{ color: AMBER }}>
                    {loading ? "—" : `${s.warrantyCount ?? 0} đơn (${s.warrantyRate ?? 0}%)`}
                  </span>
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Tỷ lệ hoàn thành</span>
                  </div>
                  <RateBar pct={loading ? 0 : (s.repairCompletionRate ?? 100)} color={GREEN} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Cancelled & warranty per period ────────────── */}
        <div className="p-5" style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
        }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={15} style={{ color: RED }} />
            <p className="font-semibold" style={{ color: "var(--color-text)" }}>
              Đơn hủy &amp; bảo hành theo {periodLabel}
            </p>
          </div>
          {loading ? (
            <div className="h-44 flex items-center justify-center" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--color-text-subtle)" as string }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-text-subtle)" as string }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip isCurrency={false} />} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{v}</span>}
                  iconType="circle" iconSize={8} />
                <Bar dataKey="cancelledCount" name="Đơn hủy"    fill={RED}   radius={[3,3,0,0]} maxBarSize={28} opacity={0.8} />
                <Bar dataKey="warrantyCount"  name="Đơn bảo hành" fill={AMBER} radius={[3,3,0,0]} maxBarSize={28} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Top products ───────────────────────────────── */}
        <div className="p-5" style={{
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
        }}>
          <div className="flex items-center gap-2 mb-4">
            <Package size={16} style={{ color: "var(--color-brand)" }} />
            <p className="font-semibold" style={{ color: "var(--color-text)" }}>
              Sản phẩm bán chạy {period !== "year" ? `(${year})` : "(tổng)"}
            </p>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
          ) : topProducts.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Chưa có dữ liệu</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}>
                    {["#", "SẢN PHẨM", "SỐ LƯỢNG", "DOANH THU", ""].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold"
                        style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p: any, i: number) => {
                    const maxRev = topProducts[0]?.revenue ?? 1;
                    const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
                    return (
                      <tr key={p.name}
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>
                        <td className="px-4 py-3 text-xs font-bold w-8" style={{ color: i < 3 ? GOLD : "var(--color-text-subtle)" }}>
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text)" }}>{p.name}</td>
                        <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                          {p.quantity.toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: "var(--color-text)" }}>
                          {fmtCurrency(p.revenue)}
                        </td>
                        <td className="px-4 py-3 w-32">
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: GOLD2 }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Nhân viên + Thanh toán ─────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Top employees */}
          <div className="p-5" style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          }}>
            <div className="flex items-center gap-2 mb-4">
              <Truck size={15} style={{ color: BLUE }} />
              <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                Nhân viên giao hàng xuất sắc
              </p>
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
            ) : topEmployees.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Chưa có dữ liệu</div>
            ) : (
              <div className="space-y-3">
                {topEmployees.map((e: any, i: number) => {
                  const maxCnt = topEmployees[0]?.deliveryCount ?? 1;
                  const pct = maxCnt > 0 ? (e.deliveryCount / maxCnt) * 100 : 0;
                  return (
                    <div key={e.name} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-bold text-right flex-shrink-0"
                        style={{ color: i < 3 ? GOLD : "var(--color-text-subtle)" }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{e.name}</span>
                          <span className="text-xs ml-2 flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>
                            {e.deliveryCount} đơn · {fmtShort(e.revenue)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: BLUE }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment breakdown */}
          <div className="p-5" style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          }}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={15} style={{ color: GREEN }} />
              <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                Phương thức thanh toán
              </p>
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
            ) : paymentBreakdown.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Chưa có dữ liệu</div>
            ) : (
              <div className="space-y-4">
                {paymentBreakdown.map((p: any, i: number) => {
                  const totalCnt = paymentBreakdown.reduce((a: number, x: any) => a + x.count, 0);
                  const pct = totalCnt > 0 ? Math.round((p.count / totalCnt) * 100) : 0;
                  const color = i === 0 ? GOLD : i === 1 ? BLUE : GREEN;
                  return (
                    <div key={p.method}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium" style={{ color: "var(--color-text)" }}>{p.method}</span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          {p.count.toLocaleString("vi-VN")} đơn · {fmtShort(p.revenue)}
                        </span>
                      </div>
                      <RateBar pct={pct} color={color} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Tồn kho + Khách hàng VIP ───────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Inventory snapshot */}
          <div className="p-5" style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          }}>
            <div className="flex items-center gap-2 mb-4">
              <Package size={15} style={{ color: "var(--color-brand)" }} />
              <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                Tình trạng kho hàng
              </p>
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sản phẩm đang bán",  value: (inventory.totalActive ?? 0).toLocaleString("vi-VN"),  color: GREEN },
                  { label: "Cảnh báo tồn thấp",  value: (inventory.lowStock    ?? 0).toLocaleString("vi-VN"),  color: AMBER },
                  { label: "Hết hàng",            value: (inventory.outOfStock  ?? 0).toLocaleString("vi-VN"),  color: RED   },
                  { label: "Giá vốn tồn kho",     value: fmtShort(inventory.stockCostValue   ?? 0),             color: GOLD  },
                  { label: "Giá bán tồn kho",     value: fmtShort(inventory.stockRetailValue ?? 0),             color: BLUE  },
                  { label: "Lãi tiềm năng",       value: fmtShort((inventory.stockRetailValue ?? 0) - (inventory.stockCostValue ?? 0)), color: GREEN },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-lg"
                    style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                    <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>{item.label}</p>
                    <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top customers */}
          <div className="p-5" style={{
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-card)",
          }}>
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={15} style={{ color: "#06b6d4" }} />
              <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                Khách hàng VIP {period !== "year" ? `(${year})` : "(tổng)"}
              </p>
            </div>
            {loading ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
            ) : topCustomers.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-subtle)" }}>Chưa có dữ liệu</div>
            ) : (
              <div className="space-y-2">
                {topCustomers.map((c: any, i: number) => {
                  const maxRev = topCustomers[0]?.revenue ?? 1;
                  const pct = maxRev > 0 ? (c.revenue / maxRev) * 100 : 0;
                  return (
                    <div key={c.phone} className="flex items-center gap-3">
                      <span className="w-5 text-xs font-bold text-right flex-shrink-0"
                        style={{ color: i < 3 ? GOLD : "var(--color-text-subtle)" }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="min-w-0">
                            <span className="text-sm font-medium truncate block" style={{ color: "var(--color-text)" }}>{c.name}</span>
                            <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>{c.phone}</span>
                          </div>
                          <span className="text-xs ml-2 flex-shrink-0 text-right" style={{ color: "var(--color-text-muted)" }}>
                            {c.orderCount} đơn<br />
                            <span style={{ color: GOLD }}>{fmtShort(c.revenue)}</span>
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#06b6d4" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

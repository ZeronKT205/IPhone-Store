import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
}

export default function StatCard({
  label, value, unit, trend, icon, iconColor, iconBg,
}: StatCardProps) {
  const positive = trend !== undefined && trend >= 0;

  return (
    <div
      className="flex-1 min-w-0 px-4 py-4"
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide mb-2"
            style={{ color: "var(--color-text-subtle)" }}>
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            {value}
          </p>
          {unit && (
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{unit}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {positive
                ? <TrendingUp size={12} style={{ color: "var(--color-success)" }} />
                : <TrendingDown size={12} style={{ color: "var(--color-danger)" }} />
              }
              <span
                className="text-xs font-medium"
                style={{ color: positive ? "var(--color-success)" : "var(--color-danger)" }}
              >
                {positive ? "+" : ""}{trend}%
              </span>
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBg || "var(--color-brand-100)" }}
        >
          <span style={{ color: iconColor || "var(--color-brand)" }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Bell, User, ChevronDown } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        minHeight: "60px",
      }}
    >
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          className="relative w-9 h-9 rounded flex items-center justify-center transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Bell size={18} />
          <span
            className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-medium flex items-center justify-center text-white"
            style={{ backgroundColor: "var(--color-brand)" }}
          >
            3
          </span>
        </button>

        {/* User */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--color-brand-50)" }}
          >
            <User size={13} style={{ color: "var(--color-brand)" }} />
          </div>
          <span className="text-sm font-medium">Chủ cửa hàng</span>
          <ChevronDown size={14} style={{ color: "var(--color-text-muted)" }} />
        </button>

        {actions}
      </div>
    </header>
  );
}

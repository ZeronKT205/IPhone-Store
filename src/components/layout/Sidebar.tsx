"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Package,
  ShoppingCart,
  ShieldCheck,
  Settings,
  LogOut,
  Phone,
  Users,
  UserCheck,
  BarChart3,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",     label: "Tổng quan",     icon: LayoutDashboard },
  { href: "/repair-orders", label: "Đơn sửa chữa",  icon: Wrench },
  { href: "/inventory",     label: "Kho hàng",       icon: Package },
  { href: "/sales",         label: "Bán hàng",       icon: ShoppingCart },
  { href: "/warranty",      label: "Bảo hành",       icon: ShieldCheck },
  { href: "/customers",     label: "Khách hàng",     icon: Users },
  { href: "/employees",     label: "Nhân viên",      icon: UserCheck },
  { href: "/reports",       label: "Báo cáo",        icon: BarChart3 },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onMenuToggle?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-[220px] flex flex-col overflow-hidden z-40
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      style={{ backgroundColor: "var(--color-sidebar)" }}
    >
      {/* Logo + mobile close button */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #d4af37, #aa7c11)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/duotech_logo.png" alt="DUO TECH" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight" style={{ color: "var(--color-sidebar-text)" }}>
              DUO TECH
            </p>
            <p className="text-xs" style={{ color: "var(--color-sidebar-muted)" }}>
              Quản lý sửa chữa
            </p>
          </div>
        </div>
        {/* Close button – only on mobile */}
        <button
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded"
          style={{ color: "var(--color-sidebar-muted)" }}
          onClick={onClose}
          aria-label="Đóng menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors"
              style={{
                backgroundColor: active ? "var(--color-sidebar-active)" : "transparent",
                color: active ? "#fff" : "var(--color-sidebar-text)",
                opacity: active ? 1 : 0.85,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "var(--color-sidebar-hover)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Decorative wave */}
      <div className="relative">
        <svg viewBox="0 0 220 80" fill="none" className="w-full opacity-20 pointer-events-none">
          <path d="M-20 60 C30 20, 80 80, 130 30 S200 10, 240 50"
            stroke="var(--color-brand)" strokeWidth="2" fill="none" />
          <path d="M-20 70 C40 30, 90 85, 140 40 S210 15, 250 55"
            stroke="var(--color-brand-light)" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Bottom: support + settings + logout */}
      <div className="px-3 pb-4 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--color-sidebar-active)" }}>
              <Phone size={13} className="text-white" />
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--color-sidebar-text)" }}>
              Hỗ trợ khách hàng
            </span>
          </div>
          <a href="tel:0948203816" className="text-sm font-bold pl-9 block hover:underline"
            style={{ color: "var(--color-brand-light)" }}>
            0948 203 816
          </a>
          <p className="text-xs pl-9" style={{ color: "var(--color-sidebar-muted)" }}>
            8:00 – 22:00 mỗi ngày
          </p>
        </div>

        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors"
          style={{
            color: "var(--color-sidebar-text)",
            opacity: isActive("/settings") ? 1 : 0.7,
            backgroundColor: isActive("/settings") ? "var(--color-sidebar-active)" : "transparent",
          }}
        >
          <Settings size={17} />
          <span>Cài đặt</span>
        </Link>

        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors"
          style={{ color: "var(--color-sidebar-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-sidebar-muted)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LogOut size={17} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

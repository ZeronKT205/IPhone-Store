"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />

      <main
        className="flex-1 min-w-0 lg:ml-[220px]"
        style={{ minHeight: "100vh" }}
      >
        {/* Mobile top bar (hamburger) */}
        <div
          className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 lg:hidden"
          style={{
            backgroundColor: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            minHeight: "56px",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px]"
            style={{ color: "var(--color-text)" }}
            aria-label="Mở menu"
          >
            <span className="block w-5 h-0.5 rounded" style={{ backgroundColor: "currentcolor" }} />
            <span className="block w-5 h-0.5 rounded" style={{ backgroundColor: "currentcolor" }} />
            <span className="block w-5 h-0.5 rounded" style={{ backgroundColor: "currentcolor" }} />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #d4af37, #aa7c11)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/duotech_logo.png" alt="DUO TECH" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>DUO TECH</span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}

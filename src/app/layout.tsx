import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DUO TECH – Quản lý cửa hàng sửa chữa",
  description: "Ứng dụng quản lý cửa hàng sửa chữa điện thoại | DUO TECH. Hotline: 0948 203 816",
  icons: {
    icon: "/favicon_phone.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

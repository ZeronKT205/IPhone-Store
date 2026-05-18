import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function fmt(d: Date | string | null | undefined) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("vi-VN");
}

function money(n: number | null | undefined) {
  return n ?? 0;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const sheetsParam = searchParams.get("sheets");
  const requestedSheets = sheetsParam ? sheetsParam.split(",") : ["repairs", "sales", "items", "products", "customers", "employees"];

  const dateFrom = from ? new Date(from) : undefined;
  const dateTo = to ? new Date(to + "T23:59:59") : undefined;
  const dateFilter = dateFrom || dateTo
    ? { createdAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
    : {};

  const wb = XLSX.utils.book_new();

  const [repairs, sales, items, products, customers, employees] = await Promise.all([
    requestedSheets.includes("repairs")
      ? prisma.repairOrder.findMany({
          where: dateFilter,
          select: {
            orderCode: true, customerName: true, phoneNumber: true,
            description: true, repairFee: true, warrantyMonths: true,
            status: true, isWarrantyOrder: true, createdAt: true, completedAt: true,
            warranty: { select: { expiryDate: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve(null),
    requestedSheets.includes("sales")
      ? prisma.salesOrder.findMany({
          where: dateFilter,
          select: {
            orderCode: true, orderType: true, customerName: true, customerPhone: true,
            deliveryAddress: true, deliveryPerson: true, totalAmount: true,
            paymentMethod: true, status: true, notes: true, createdAt: true, completedAt: true,
            employee: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve(null),
    requestedSheets.includes("items")
      ? prisma.salesOrderItem.findMany({
          select: {
            productName: true, quantity: true, unitPrice: true,
            salesOrder: { select: { orderCode: true, createdAt: true } },
          },
          orderBy: { salesOrder: { createdAt: "desc" } },
        })
      : Promise.resolve(null),
    requestedSheets.includes("products")
      ? prisma.product.findMany({
          select: {
            name: true, unit: true, costPrice: true, sellingPrice: true,
            stockQuantity: true, lowStockThreshold: true, isActive: true,
            category: { select: { name: true } },
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve(null),
    requestedSheets.includes("customers")
      ? prisma.customer.findMany({
          select: {
            name: true, phone: true, address: true, createdAt: true,
            _count: { select: { salesOrders: true } },
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve(null),
    requestedSheets.includes("employees")
      ? prisma.employee.findMany({
          select: {
            name: true, phone: true, dateOfBirth: true, cccd: true, isActive: true,
            _count: { select: { salesOrders: true } },
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve(null),
  ]);

  if (repairs) {
    const statusLabel: Record<string, string> = { IN_PROGRESS: "Đang sửa", COMPLETED: "Hoàn thành" };
    const rows = repairs.map((r) => ({
      "Mã đơn": r.orderCode,
      "Khách hàng": r.customerName,
      "Số điện thoại": r.phoneNumber,
      "Mô tả lỗi": r.description,
      "Phí sửa (đ)": money(r.repairFee),
      "BH dự kiến (tháng)": r.warrantyMonths ?? 0,
      "Trạng thái": statusLabel[r.status] ?? r.status,
      "Đơn bảo hành": r.isWarrantyOrder ? "Có" : "",
      "BH hết hạn": r.warranty ? fmt(r.warranty.expiryDate) : "",
      "Ngày tạo": fmt(r.createdAt),
      "Hoàn thành": fmt(r.completedAt),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [10, 20, 15, 30, 15, 18, 14, 14, 14, 14, 14].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Đơn sửa chữa");
  }

  if (sales) {
    const typeLabel: Record<string, string> = { COUNTER: "Tại quầy", DELIVERY: "Giao hàng" };
    const statusLabel: Record<string, string> = {
      COUNTER_SALE: "Đã bán", PROCESSING: "Đang giao",
      DELIVERED: "Đã giao", CANCELLED: "Đã hủy",
    };
    const payLabel: Record<string, string> = { CASH: "Tiền mặt", BANK_TRANSFER: "Chuyển khoản" };
    const rows = sales.map((s) => ({
      "Mã đơn": s.orderCode,
      "Loại": typeLabel[s.orderType] ?? s.orderType,
      "Khách hàng": s.customerName ?? "",
      "SĐT khách": s.customerPhone ?? "",
      "Địa chỉ giao": s.deliveryAddress ?? "",
      "Người giao": s.employee?.name ?? s.deliveryPerson ?? "",
      "Tổng tiền (đ)": money(s.totalAmount),
      "Thanh toán": s.paymentMethod ? (payLabel[s.paymentMethod] ?? s.paymentMethod) : "",
      "Trạng thái": statusLabel[s.status] ?? s.status,
      "Ghi chú": s.notes ?? "",
      "Ngày tạo": fmt(s.createdAt),
      "Hoàn thành": fmt(s.completedAt),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [12, 12, 20, 14, 28, 18, 15, 16, 14, 20, 14, 14].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Đơn bán hàng");
  }

  if (items) {
    const rows = items.map((i) => ({
      "Mã đơn": i.salesOrder.orderCode,
      "Sản phẩm": i.productName,
      "Số lượng": i.quantity,
      "Đơn giá (đ)": money(i.unitPrice),
      "Thành tiền (đ)": i.quantity * i.unitPrice,
      "Ngày đặt": fmt(i.salesOrder.createdAt),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [12, 30, 12, 14, 16, 14].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Chi tiết đơn bán");
  }

  if (products) {
    const rows = products.map((p) => ({
      "Tên sản phẩm": p.name,
      "Danh mục": p.category.name,
      "Đơn vị": p.unit,
      "Giá nhập (đ)": p.costPrice ?? "",
      "Giá bán (đ)": money(p.sellingPrice),
      "Tồn kho": p.stockQuantity,
      "Ngưỡng cảnh báo": p.lowStockThreshold,
      "Trạng thái": p.isActive ? "Đang bán" : "Ngừng bán",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [28, 16, 10, 14, 14, 10, 16, 12].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Sản phẩm");
  }

  if (customers) {
    const rows = customers.map((c) => ({
      "Tên khách hàng": c.name,
      "Số điện thoại": c.phone,
      "Địa chỉ": c.address ?? "",
      "Số đơn hàng": c._count.salesOrders,
      "Ngày tạo": fmt(c.createdAt),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [24, 14, 30, 14, 14].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Khách hàng");
  }

  if (employees) {
    const rows = employees.map((e) => ({
      "Tên nhân viên": e.name,
      "Số điện thoại": e.phone ?? "",
      "Ngày sinh": fmt(e.dateOfBirth),
      "CCCD": e.cccd ?? "",
      "Tổng đơn giao": e._count.salesOrders,
      "Trạng thái": e.isActive ? "Hoạt động" : "Nghỉ việc",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [24, 14, 14, 16, 14, 12].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Nhân viên");
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const today = new Date().toISOString().slice(0, 10);
  const filename = `bao-cao-${today}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

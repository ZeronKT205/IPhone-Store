"use client";

import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import { Store, Phone, Clock, QrCode, Upload, Trash2, CheckCircle, FileSpreadsheet, Download, Loader2, Save } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

const SHEET_OPTIONS = [
  { key: "repairs",   label: "Đơn sửa chữa",    desc: "Toàn bộ đơn sửa và trạng thái bảo hành" },
  { key: "sales",     label: "Đơn bán hàng",     desc: "Đơn tại quầy và đơn giao hàng" },
  { key: "items",     label: "Chi tiết đơn bán", desc: "Từng sản phẩm trong mỗi đơn bán" },
  { key: "products",  label: "Sản phẩm",         desc: "Danh sách hàng hoá, giá và tồn kho" },
  { key: "customers", label: "Khách hàng",       desc: "Danh bạ khách hàng và số đơn" },
  { key: "employees", label: "Nhân viên",        desc: "Thông tin nhân sự và số đơn giao" },
];

export default function SettingsPage() {
  // Export state
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [selectedSheets, setSelectedSheets] = useState<string[]>(SHEET_OPTIONS.map((s) => s.key));
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  const toggleSheet = (key: string) =>
    setSelectedSheets((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const handleExport = async () => {
    if (selectedSheets.length === 0) return;
    setExporting(true);
    setExportMsg("");
    try {
      const p = new URLSearchParams();
      p.set("sheets", selectedSheets.join(","));
      if (exportFrom) p.set("from", exportFrom);
      if (exportTo) p.set("to", exportTo);
      const res = await fetch(`/api/export?${p}`);
      if (!res.ok) { setExportMsg("Xuất thất bại, vui lòng thử lại."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = cd.match(/filename="(.+)"/);
      a.href = url;
      a.download = match?.[1] ?? "bao-cao.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      setExportMsg("Xuất thành công!");
      setTimeout(() => setExportMsg(""), 3000);
    } finally {
      setExporting(false);
    }
  };

  // Store settings state
  const [storeForm, setStoreForm] = useState({ storeName: "", storePhone: "", storeAddress: "", storeHours: "8:00 – 22:00 mỗi ngày" });
  const [configForm, setConfigForm] = useState({ lowStockThreshold: "5" });
  const [storeSaving, setStoreSaving] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [storeMsg, setStoreMsg] = useState("");
  const [configMsg, setConfigMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings/store").then((r) => r.json()).then((r) => {
      if (r.success) {
        setStoreForm({ storeName: r.data.storeName ?? "", storePhone: r.data.storePhone ?? "", storeAddress: r.data.storeAddress ?? "", storeHours: r.data.storeHours ?? "8:00 – 22:00 mỗi ngày" });
        setConfigForm({ lowStockThreshold: String(r.data.lowStockThreshold ?? 5) });
      }
    });
  }, []);

  const handleSaveStore = async () => {
    setStoreSaving(true); setStoreMsg("");
    const res = await fetch("/api/settings/store", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(storeForm) }).then((r) => r.json());
    setStoreSaving(false);
    setStoreMsg(res.success ? "Đã lưu thông tin cửa hàng" : (res.error ?? "Lỗi lưu"));
    setTimeout(() => setStoreMsg(""), 3000);
  };

  const handleSaveConfig = async () => {
    setConfigSaving(true); setConfigMsg("");
    const res = await fetch("/api/settings/store", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lowStockThreshold: parseInt(configForm.lowStockThreshold) || 5 }) }).then((r) => r.json());
    setConfigSaving(false);
    setConfigMsg(res.success ? "Đã lưu cấu hình" : (res.error ?? "Lỗi lưu"));
    setTimeout(() => setConfigMsg(""), 3000);
  };

  // QR state
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrUploading, setQrUploading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [qrSuccess, setQrSuccess] = useState("");
  const [deleteQrOpen, setDeleteQrOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings/qr")
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.exists) setQrUrl(r.url + "?t=" + Date.now());
      })
      .finally(() => setQrLoading(false));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrUploading(true);
    setQrError("");
    setQrSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/settings/qr", { method: "POST", body: formData }).then((r) => r.json());

    setQrUploading(false);
    if (!res.success) {
      setQrError(res.error);
      return;
    }
    setQrUrl(res.url + "?t=" + Date.now());
    setQrSuccess("Đã cập nhật QR chuyển khoản thành công");
    setTimeout(() => setQrSuccess(""), 3000);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteQr = async () => {
    await fetch("/api/settings/qr", { method: "DELETE" });
    setQrUrl(null);
    setDeleteQrOpen(false);
    setQrSuccess("Đã xóa QR");
    setTimeout(() => setQrSuccess(""), 2000);
  };

  return (
    <div>
      <Header title="Cài đặt" subtitle="Thông tin cửa hàng và cấu hình hệ thống" />

      <div className="p-6 space-y-4 max-w-2xl">
        {/* Thông tin cửa hàng */}
        <div className="p-5"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Store size={16} style={{ color: "var(--color-brand)" }} />
            <p className="font-semibold">Thông tin cửa hàng</p>
          </div>
          <div className="space-y-3">
            <Input label="Tên cửa hàng" value={storeForm.storeName}
              onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Số điện thoại" value={storeForm.storePhone}
                onChange={(e) => setStoreForm({ ...storeForm, storePhone: e.target.value })} />
              <Input label="Giờ làm việc" prefix={<Clock size={13} />} value={storeForm.storeHours}
                onChange={(e) => setStoreForm({ ...storeForm, storeHours: e.target.value })} />
            </div>
            <Input label="Địa chỉ" placeholder="Địa chỉ cửa hàng..." value={storeForm.storeAddress}
              onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })} />
          </div>
          {storeMsg && (
            <p className="text-sm mt-3 px-3 py-2 flex items-center gap-2"
              style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", borderRadius: "var(--radius)" }}>
              <CheckCircle size={13} /> {storeMsg}
            </p>
          )}
          <div className="flex justify-end mt-4">
            <Button loading={storeSaving} icon={<Save size={13} />} onClick={handleSaveStore}>
              Lưu thay đổi
            </Button>
          </div>
        </div>

        {/* Cấu hình nghiệp vụ */}
        <div className="p-5"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Phone size={16} style={{ color: "var(--color-brand)" }} />
            <p className="font-semibold">Cấu hình nghiệp vụ</p>
          </div>
          <div className="space-y-3">
            <Input label="Ngưỡng cảnh báo tồn kho mặc định" type="number"
              hint="Hiển thị cảnh báo khi số lượng tồn kho <= ngưỡng này"
              value={configForm.lowStockThreshold}
              onChange={(e) => setConfigForm({ lowStockThreshold: e.target.value })} />
          </div>
          {configMsg && (
            <p className="text-sm mt-3 px-3 py-2 flex items-center gap-2"
              style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", borderRadius: "var(--radius)" }}>
              <CheckCircle size={13} /> {configMsg}
            </p>
          )}
          <div className="flex justify-end mt-4">
            <Button loading={configSaving} icon={<Save size={13} />} onClick={handleSaveConfig}>
              Lưu thay đổi
            </Button>
          </div>
        </div>

        {/* QR Chuyển khoản */}
        <div className="p-5"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2 mb-1">
            <QrCode size={16} style={{ color: "var(--color-brand)" }} />
            <p className="font-semibold">QR chuyển khoản</p>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            Hiển thị khi khách chọn thanh toán chuyển khoản tại quầy hoặc khi giao hàng.
          </p>

          {qrError && (
            <p className="text-sm mb-3 px-3 py-2 rounded"
              style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>
              {qrError}
            </p>
          )}
          {qrSuccess && (
            <p className="text-sm mb-3 px-3 py-2 rounded flex items-center gap-2"
              style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", borderRadius: "var(--radius)" }}>
              <CheckCircle size={14} /> {qrSuccess}
            </p>
          )}

          <div className="flex gap-5 items-start">
            {/* Preview */}
            <div
              className="flex-shrink-0 flex items-center justify-center overflow-hidden"
              style={{
                width: 160, height: 160,
                borderRadius: "var(--radius-md)",
                border: "2px dashed var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
            >
              {qrLoading ? (
                <div className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Đang tải...</div>
              ) : qrUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="QR chuyển khoản" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2" style={{ color: "var(--color-text-subtle)" }}>
                  <QrCode size={36} style={{ opacity: 0.3 }} />
                  <span className="text-xs text-center leading-snug px-2">Chưa có QR</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {qrUrl ? "Thay thế QR hiện tại" : "Tải lên QR mới"}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                Hỗ trợ PNG, JPG, WebP – tối đa 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex gap-2 mt-1">
                <Button
                  size="sm"
                  loading={qrUploading}
                  icon={<Upload size={13} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {qrUrl ? "Thay ảnh" : "Tải lên"}
                </Button>
                {qrUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 size={13} />}
                    onClick={() => setDeleteQrOpen(true)}
                    style={{ color: "var(--color-danger)" }}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Xuất dữ liệu */}
        <div className="p-5"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet size={16} style={{ color: "var(--color-brand)" }} />
            <p className="font-semibold">Xuất dữ liệu ra Excel</p>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            Tải toàn bộ dữ liệu hoạt động ra file <code className="text-xs px-1 py-0.5 rounded"
              style={{ backgroundColor: "var(--color-bg)", fontFamily: "monospace" }}>.xlsx</code> — mỗi mục là một sheet riêng.
          </p>

          {/* Sheet selection */}
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>
            CHỌN DỮ LIỆU XUẤT
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {SHEET_OPTIONS.map((opt) => {
              const checked = selectedSheets.includes(opt.key);
              return (
                <label key={opt.key}
                  className="flex items-start gap-2.5 p-3 cursor-pointer transition-colors"
                  style={{
                    borderRadius: "var(--radius)",
                    border: `1px solid ${checked ? "var(--color-brand)" : "var(--color-border)"}`,
                    backgroundColor: checked ? "rgba(var(--color-brand-rgb, 34,197,94),0.05)" : "var(--color-bg)",
                  }}
                  onClick={() => toggleSheet(opt.key)}>
                  <input type="checkbox" checked={checked} readOnly
                    className="mt-0.5 w-3.5 h-3.5 flex-shrink-0"
                    style={{ accentColor: "var(--color-brand)" }} />
                  <div>
                    <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text)" }}>{opt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-subtle)" }}>{opt.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Date range */}
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>
            LỌC THEO NGÀY TẠO <span style={{ color: "var(--color-text-subtle)", fontWeight: 400 }}>(tuỳ chọn)</span>
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Input label="Từ ngày" type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} />
            <Input label="Đến ngày" type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} />
          </div>

          {exportMsg && (
            <p className="text-sm mb-3 px-3 py-2 flex items-center gap-2"
              style={{
                backgroundColor: exportMsg.includes("thất bại") ? "var(--color-danger-bg)" : "var(--color-success-bg)",
                color: exportMsg.includes("thất bại") ? "var(--color-danger)" : "var(--color-success)",
                borderRadius: "var(--radius)",
              }}>
              <CheckCircle size={14} /> {exportMsg}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
              {selectedSheets.length === 0
                ? "Chưa chọn sheet nào"
                : `${selectedSheets.length} sheet được chọn`}
            </p>
            <Button
              icon={exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              loading={exporting}
              disabled={selectedSheets.length === 0}
              onClick={handleExport}>
              Xuất Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Delete QR confirm */}
      <Modal open={deleteQrOpen} onClose={() => setDeleteQrOpen(false)} title="Xóa QR chuyển khoản?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteQrOpen(false)}>Hủy</Button>
            <Button variant="danger" icon={<Trash2 size={13} />} onClick={handleDeleteQr}>Xóa QR</Button>
          </>
        }>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Mã QR chuyển khoản sẽ bị xóa và không hiển thị cho khách nữa. Bạn có thể tải lên lại bất kỳ lúc nào.
        </p>
      </Modal>
    </div>
  );
}

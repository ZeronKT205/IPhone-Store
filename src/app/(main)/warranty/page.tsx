"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ExpandableText from "@/components/ui/ExpandableText";
import { Search, ShieldCheck, ShieldOff, Shield, Plus, ShieldAlert } from "lucide-react";
import { fmtDate } from "@/lib/format";

type WarrantyItem = {
  id: string;
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  description: string;
  completedAt: string;
  expiryDate: string;
  warrantyNotes: string | null;
  isActive: boolean;
};

export default function WarrantyPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<WarrantyItem[] | null>(null);
  const [searching, setSearching] = useState(false);

  // Warranty order creation
  const [warrantyOrderOpen, setWarrantyOrderOpen] = useState(false);
  const [warrantyOrderSelected, setWarrantyOrderSelected] = useState<WarrantyItem | null>(null);
  const [warrantyOrderForm, setWarrantyOrderForm] = useState({ description: "" });
  const [warrantyOrderSaving, setWarrantyOrderSaving] = useState(false);
  const [warrantyOrderError, setWarrantyOrderError] = useState("");
  const [warrantyOrderSuccess, setWarrantyOrderSuccess] = useState("");

  // Create from header: search for order first
  const [searchOrderOpen, setSearchOrderOpen] = useState(false);
  const [searchOrderQ, setSearchOrderQ] = useState("");
  const [searchOrderResults, setSearchOrderResults] = useState<WarrantyItem[]>([]);
  const [searchOrderLoading, setSearchOrderLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/warranties")
      .then((r) => r.json())
      .then((r) => { if (r.success) setData(r.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/warranties/search?q=${encodeURIComponent(searchQ)}`).then((r) => r.json());
    setSearching(false);
    if (res.success) setSearchResults(res.data);
  };

  const clearSearch = () => { setSearchResults(null); setSearchQ(""); };
  const displayList: WarrantyItem[] = searchResults ?? data?.items ?? [];
  const stats = data?.stats ?? {};

  // Search for order to create warranty claim
  const handleSearchOrder = async () => {
    if (!searchOrderQ.trim()) return;
    setSearchOrderLoading(true);
    const res = await fetch(`/api/warranties/search?q=${encodeURIComponent(searchOrderQ)}`).then((r) => r.json());
    setSearchOrderLoading(false);
    if (res.success) setSearchOrderResults(res.data);
  };

  const openWarrantyOrder = (item: WarrantyItem) => {
    setWarrantyOrderSelected(item);
    setWarrantyOrderForm({ description: "" });
    setWarrantyOrderError("");
    setWarrantyOrderSuccess("");
    setWarrantyOrderOpen(true);
    setSearchOrderOpen(false);
  };

  const handleCreateWarrantyOrder = async () => {
    if (!warrantyOrderSelected) return;
    setWarrantyOrderSaving(true); setWarrantyOrderError("");
    const res = await fetch("/api/repair-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: warrantyOrderSelected.customerName,
        phoneNumber: warrantyOrderSelected.phoneNumber,
        description: warrantyOrderForm.description || `Bảo hành – ${warrantyOrderSelected.description}`,
        isWarrantyOrder: true,
        originalOrderId: warrantyOrderSelected.id,
      }),
    }).then((r) => r.json());
    setWarrantyOrderSaving(false);
    if (!res.success) { setWarrantyOrderError(res.error); return; }
    setWarrantyOrderSuccess(`Đã tạo đơn bảo hành ${res.data.orderCode}`);
  };

  return (
    <div>
      <Header
        title="Bảo hành"
        subtitle="Quản lý phiếu bảo hành, tra cứu thời hạn bảo hành"
        actions={
          <Button icon={<Plus size={14} />} onClick={() => { setSearchOrderQ(""); setSearchOrderResults([]); setSearchOrderOpen(true); }}>
            Tạo đơn bảo hành mới
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Search + stats row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-4 items-start">
          <div className="p-4"
            style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
            <p className="font-semibold mb-1">Tìm kiếm bảo hành</p>
            <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
              Nhập số điện thoại khách hàng hoặc mã đơn sửa để tra cứu
            </p>
            <div className="flex gap-2">
              <Input className="flex-1" placeholder="Nhập SĐT hoặc mã đơn sửa..."
                prefix={<Search size={14} />} value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              <Button loading={searching} onClick={handleSearch}>Tìm kiếm</Button>
              {searchResults && <Button variant="secondary" onClick={clearSearch}>Xóa</Button>}
            </div>
          </div>
          <StatCard label="CÒN BẢO HÀNH" value={loading ? "–" : stats.active ?? 0} unit="Phiếu" trend={12}
            icon={<ShieldCheck size={20} />} iconBg="#DCFCE7" iconColor="#16A34A" />
          <StatCard label="HẾT HẠN BẢO HÀNH" value={loading ? "–" : stats.expired ?? 0} unit="Phiếu" trend={-8}
            icon={<ShieldOff size={20} />} iconBg="#FEE2E2" iconColor="#DC2626" />
          <StatCard label="TỔNG BẢO HÀNH" value={loading ? "–" : stats.total ?? 0} unit="Phiếu" trend={5}
            icon={<Shield size={20} />} iconBg="var(--color-brand-100)" iconColor="var(--color-brand)" />
        </div>

        {searchResults !== null && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Kết quả tìm kiếm cho "{searchQ}": <strong>{searchResults.length}</strong> phiếu
          </p>
        )}

        {/* Table */}
        <div className="overflow-x-auto"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <p className="font-semibold">Danh sách bảo hành</p>
          </div>
          <table className="w-full text-sm min-w-[950px]">
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["MÃ ĐƠN SỬA", "KHÁCH HÀNG", "SĐT", "NỘI DUNG SỬA CHỮA", "NGÀY HOÀN THÀNH", "HẾT HẠN BẢO HÀNH", "TRẠNG THÁI", "THAO TÁC"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                    style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayList.map((item, i) => (
                <tr key={item.orderCode + i}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                  <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: "var(--color-brand-dark)" }}>
                    {item.orderCode}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.customerName}</td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>{item.phoneNumber}</td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <ExpandableText text={item.description} />
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>{fmtDate(item.completedAt)}</td>
                  <td className="px-4 py-3 text-xs font-medium">{fmtDate(item.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={item.isActive ? "success" : "danger"} dot>
                      {item.isActive ? "Còn bảo hành" : "Hết hạn bảo hành"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant={item.isActive ? "secondary" : "ghost"}
                      icon={<ShieldAlert size={12} />}
                      disabled={!item.isActive}
                      title={item.isActive ? "Tạo đơn bảo hành" : "Đã hết hạn bảo hành"}
                      onClick={() => openWarrantyOrder(item)}>
                      Tạo đơn BH
                    </Button>
                  </td>
                </tr>
              ))}
              {!loading && displayList.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center" style={{ color: "var(--color-text-subtle)" }}>
                  {searchResults !== null ? "Không tìm thấy kết quả phù hợp" : "Chưa có phiếu bảo hành nào"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search order modal (from header button) */}
      <Modal open={searchOrderOpen} onClose={() => setSearchOrderOpen(false)}
        title="Tìm đơn sửa chữa cần bảo hành"
        footer={<Button variant="secondary" onClick={() => setSearchOrderOpen(false)}>Đóng</Button>}>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input className="flex-1" placeholder="Nhập SĐT hoặc mã đơn sửa..."
              prefix={<Search size={14} />} value={searchOrderQ}
              onChange={(e) => setSearchOrderQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchOrder()} />
            <Button loading={searchOrderLoading} onClick={handleSearchOrder}>Tìm</Button>
          </div>
          {searchOrderResults.length > 0 && (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {searchOrderResults.map((item) => (
                <button key={item.id}
                  className="w-full text-left px-3 py-2.5 rounded text-sm transition-colors"
                  style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  onClick={() => openWarrantyOrder(item)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.customerName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs" style={{ color: "var(--color-brand-dark)" }}>{item.orderCode}</span>
                      <Badge variant={item.isActive ? "success" : "danger"} dot>
                        {item.isActive ? "Còn BH" : "Hết hạn"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>{item.description}</p>
                </button>
              ))}
            </div>
          )}
          {searchOrderResults.length === 0 && searchOrderQ && !searchOrderLoading && (
            <p className="text-sm text-center py-4" style={{ color: "var(--color-text-subtle)" }}>Không tìm thấy đơn nào</p>
          )}
        </div>
      </Modal>

      {/* Create warranty order modal */}
      <Modal open={warrantyOrderOpen} onClose={() => setWarrantyOrderOpen(false)}
        title="Tạo đơn sửa chữa bảo hành"
        subtitle={warrantyOrderSelected ? `${warrantyOrderSelected.customerName} – ${warrantyOrderSelected.orderCode}` : undefined}
        footer={
          warrantyOrderSuccess
            ? <Button variant="secondary" onClick={() => setWarrantyOrderOpen(false)}>Đóng</Button>
            : <>
                <Button variant="secondary" onClick={() => setWarrantyOrderOpen(false)}>Hủy</Button>
                <Button loading={warrantyOrderSaving} icon={<ShieldAlert size={14} />} onClick={handleCreateWarrantyOrder}>
                  Tạo đơn bảo hành
                </Button>
              </>
        }>
        <div className="space-y-3">
          {warrantyOrderError && (
            <p className="text-sm p-2 rounded" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>
              {warrantyOrderError}
            </p>
          )}
          {warrantyOrderSuccess ? (
            <div className="text-center py-4 space-y-2">
              <ShieldCheck size={40} className="mx-auto" style={{ color: "var(--color-success)" }} />
              <p className="font-semibold" style={{ color: "var(--color-success)" }}>{warrantyOrderSuccess}</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Đơn đã được tạo và chuyển sang tab Đơn sửa chữa</p>
            </div>
          ) : (
            <>
              {/* Pre-filled customer info */}
              <div className="p-3 rounded space-y-1"
                style={{ backgroundColor: "var(--color-bg)", borderRadius: "var(--radius)", border: "1px solid var(--color-border)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--color-text-subtle)" }}>THÔNG TIN KHÁCH HÀNG (tự điền)</p>
                <p className="text-sm font-medium">{warrantyOrderSelected?.customerName} — {warrantyOrderSelected?.phoneNumber}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Đơn gốc: {warrantyOrderSelected?.orderCode} | BH đến: {fmtDate(warrantyOrderSelected?.expiryDate ?? "")}
                </p>
              </div>

              {/* Issue description */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Mô tả vấn đề bảo hành <span style={{ color: "var(--color-text-muted)" }}>(để trống = dùng mô tả gốc)</span>
                </label>
                <textarea rows={3} className="w-full text-sm resize-none"
                  style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "8px 12px", outline: "none", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                  placeholder={`Bảo hành – ${warrantyOrderSelected?.description ?? ""}`}
                  value={warrantyOrderForm.description}
                  onChange={(e) => setWarrantyOrderForm({ description: e.target.value })} />
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

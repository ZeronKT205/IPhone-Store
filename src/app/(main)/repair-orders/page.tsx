"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ExpandableText from "@/components/ui/ExpandableText";
import { Plus, Search, CheckCircle, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { RepairStatus, REPAIR_STATUS_LABEL } from "@/constants/enums";
import { fmtDate, fmtCurrency } from "@/lib/format";

function fmt(n: number) { return n ? fmtCurrency(n) : "–"; }

const statusBadge = (s: RepairStatus) =>
  s === RepairStatus.COMPLETED ? "success" : "warning";

type WarrantyTemplate = "none" | "3m" | "6m" | "12m" | "custom";

const WARRANTY_TEMPLATES: { key: WarrantyTemplate; label: string; months: number; days: number }[] = [
  { key: "none",   label: "Không BH",  months: 0,  days: 0   },
  { key: "3m",     label: "3 tháng",   months: 3,  days: 90  },
  { key: "6m",     label: "6 tháng",   months: 6,  days: 180 },
  { key: "12m",    label: "12 tháng",  months: 12, days: 365 },
  { key: "custom", label: "Tự chỉnh",  months: 0,  days: 0   },
];

function monthsToTemplate(months: number): WarrantyTemplate {
  if (months === 0)  return "none";
  if (months === 3)  return "3m";
  if (months === 6)  return "6m";
  if (months === 12) return "12m";
  return "custom";
}

function templateToMonths(tpl: WarrantyTemplate, customDays: string): number {
  const map: Record<WarrantyTemplate, number> = { none: 0, "3m": 3, "6m": 6, "12m": 12, custom: 0 };
  if (tpl === "custom") return Math.max(1, Math.round(parseInt(customDays || "30") / 30));
  return map[tpl];
}

function WarrantyPicker({ value, customDays, onChangeTemplate, onChangeCustomDays, showNotes, notes, onChangeNotes }: {
  value: WarrantyTemplate;
  customDays: string;
  onChangeTemplate: (v: WarrantyTemplate) => void;
  onChangeCustomDays: (v: string) => void;
  showNotes?: boolean;
  notes?: string;
  onChangeNotes?: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--color-text)" }}>
        <ShieldCheck size={14} style={{ color: "var(--color-brand)" }} />
        Bảo hành
      </label>
      <div className="flex flex-wrap gap-2">
        {WARRANTY_TEMPLATES.map((t) => {
          const active = value === t.key;
          return (
            <button key={t.key} type="button"
              onClick={() => onChangeTemplate(t.key)}
              className="px-3 py-1.5 text-sm font-medium"
              style={{
                borderRadius: "var(--radius)",
                border: `1px solid ${active ? "var(--color-brand)" : "var(--color-border)"}`,
                backgroundColor: active ? "var(--color-brand)" : "var(--color-surface)",
                color: active ? "#fff" : "var(--color-text)",
                transition: "background-color 0.15s, border-color 0.15s, transform 0.1s",
                willChange: "transform",
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.95)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {value === "custom" && (
        <Input label="Số ngày bảo hành" type="number" placeholder="30"
          value={customDays} onChange={(e) => onChangeCustomDays(e.target.value)} />
      )}

      {showNotes && value !== "none" && onChangeNotes && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Ghi chú bảo hành</label>
          <textarea rows={2} className="w-full text-sm resize-none"
            style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "6px 10px", outline: "none", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
            placeholder="Điều kiện bảo hành, ngoại lệ..."
            value={notes ?? ""}
            onChange={(e) => onChangeNotes(e.target.value)} />
        </div>
      )}
    </div>
  );
}

const emptyForm = { customerName: "", phoneNumber: "", description: "", repairFee: "", warrantyTemplate: "none" as WarrantyTemplate, customDays: "30" };

export default function RepairOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [form, setForm] = useState(emptyForm);
  const [completeForm, setCompleteForm] = useState({
    repairFee: "",
    warrantyTemplate: "none" as WarrantyTemplate,
    customDays: "30",
    warrantyNotes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    fetch(`/api/repair-orders?${p}`)
      .then((r) => r.json())
      .then((r) => { if (r.success) { setOrders(r.data.items); setTotal(r.data.total); } })
      .finally(() => setLoading(false));
  }, [q, status]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setSaving(true); setError("");
    const warrantyMonths = templateToMonths(form.warrantyTemplate, form.customDays);
    const res = await fetch("/api/repair-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.customerName,
        phoneNumber: form.phoneNumber,
        description: form.description,
        repairFee: form.repairFee ? parseInt(form.repairFee) : 0,
        warrantyMonths,
      }),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setCreateOpen(false);
    setForm(emptyForm);
    load();
  };

  const handleComplete = async () => {
    if (!selected) return;
    setSaving(true); setError("");

    const tpl = WARRANTY_TEMPLATES.find((t) => t.key === completeForm.warrantyTemplate)!;
    const days = tpl.key === "custom" ? parseInt(completeForm.customDays) || 0 : tpl.days;
    const hasWarranty = days > 0;

    const res = await fetch(`/api/repair-orders/${selected.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repairFee: parseInt(completeForm.repairFee) || 0,
        hasWarranty,
        warrantyDurationDays: hasWarranty ? days : undefined,
        warrantyNotes: completeForm.warrantyNotes || undefined,
      }),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setCompleteOpen(false);
    load();
  };

  const handleEdit = async () => {
    if (!selected) return;
    setSaving(true); setError("");

    const warrantyMonths = templateToMonths(form.warrantyTemplate, form.customDays);
    const res = await fetch(`/api/repair-orders/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: form.customerName,
        phoneNumber: form.phoneNumber,
        description: form.description,
        warrantyMonths,
      }),
    }).then((r) => r.json());
    if (!res.success) { setSaving(false); setError(res.error); return; }

    const newFee = form.repairFee !== "" ? parseInt(form.repairFee) : selected.repairFee;
    if (newFee !== selected.repairFee) {
      const feeRes = await fetch(`/api/repair-orders/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repairFee: newFee }),
      }).then((r) => r.json());
      if (!feeRes.success) { setSaving(false); setError(feeRes.error); return; }
    }
    setSaving(false);
    setEditOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/repair-orders/${selected.id}`, { method: "DELETE" }).then((r) => r.json());
    setSaving(false);
    if (res.success) { setDeleteOpen(false); load(); }
    else setError(res.error);
  };

  const openComplete = (o: any) => {
    setSelected(o);
    const tpl = monthsToTemplate(o.warrantyMonths ?? 0);
    const customDays = tpl === "custom" ? String((o.warrantyMonths ?? 0) * 30) : "30";
    setCompleteForm({ repairFee: String(o.repairFee || ""), warrantyTemplate: tpl, customDays, warrantyNotes: "" });
    setError("");
    setCompleteOpen(true);
  };

  const openEdit = (o: any) => {
    setSelected(o);
    const tpl = monthsToTemplate(o.warrantyMonths ?? 0);
    const customDays = tpl === "custom" ? String((o.warrantyMonths ?? 0) * 30) : "30";
    setForm({ customerName: o.customerName, phoneNumber: o.phoneNumber, description: o.description, repairFee: String(o.repairFee ?? ""), warrantyTemplate: tpl, customDays });
    setError("");
    setEditOpen(true);
  };

  return (
    <div>
      <Header
        title="Đơn sửa chữa"
        subtitle={`Tổng ${total} phiếu`}
        actions={
          <Button icon={<Plus size={14} />} onClick={() => { setForm(emptyForm); setError(""); setCreateOpen(true); }}>
            Tạo đơn mới
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3 p-3"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex-1 min-w-[200px]">
            <Input prefix={<Search size={14} />} placeholder="Tìm theo tên, SĐT, mã đơn..."
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="text-sm px-3 h-9 cursor-pointer"
            style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
            value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="IN_PROGRESS">Đang sửa</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
        </div>

        <div className="overflow-x-auto"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm min-w-[850px]">
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["MÃ ĐƠN", "KHÁCH HÀNG", "SĐT", "MÔ TẢ LỖI", "GIÁ SỬA", "NGÀY TẠO", "TRẠNG THÁI / BẢO HÀNH", "THAO TÁC"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                    style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const hasWarranty = !!o.warranty;
                const warrantyActive = hasWarranty && new Date(o.warranty.expiryDate) > new Date();
                const plannedMonths = o.warrantyMonths ?? 0;
                return (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--color-border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                    <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: "var(--color-brand-dark)" }}>
                      {o.orderCode}
                      {o.isWarrantyOrder && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded font-semibold"
                          style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "var(--color-success)", fontSize: "10px" }}>BH</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{o.customerName}</td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>{o.phoneNumber}</td>
                    <td className="px-4 py-3 max-w-[200px]"><ExpandableText text={o.description} /></td>
                    <td className="px-4 py-3 font-medium">{fmt(o.repairFee)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={statusBadge(o.status)} dot>
                          {REPAIR_STATUS_LABEL[o.status as RepairStatus]}
                        </Badge>
                        {o.status === RepairStatus.IN_PROGRESS && plannedMonths > 0 && (
                          <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-brand)" }}>
                            <ShieldCheck size={11} />
                            Dự kiến BH {plannedMonths}T
                          </span>
                        )}
                        {o.status === RepairStatus.IN_PROGRESS && plannedMonths === 0 && (
                          <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Không BH</span>
                        )}
                        {o.status === RepairStatus.COMPLETED && hasWarranty && (
                          <div className="flex items-center gap-1 text-xs"
                            style={{ color: warrantyActive ? "var(--color-success)" : "var(--color-text-subtle)" }}>
                            <ShieldCheck size={11} />
                            <span>{warrantyActive ? `BH đến ${fmtDate(o.warranty.expiryDate)}` : "Hết hạn BH"}</span>
                          </div>
                        )}
                        {o.status === RepairStatus.COMPLETED && !hasWarranty && (
                          <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>Không BH</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {o.status === RepairStatus.IN_PROGRESS && (
                          <>
                            <Button size="sm" variant="secondary" icon={<CheckCircle size={12} />}
                              onClick={() => openComplete(o)}>Hoàn thành</Button>
                            <Button size="sm" variant="ghost" icon={<Pencil size={12} />} onClick={() => openEdit(o)} />
                            <Button size="sm" variant="ghost" icon={<Trash2 size={12} />}
                              onClick={() => { setSelected(o); setError(""); setDeleteOpen(true); }}
                              style={{ color: "var(--color-danger)" }} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center" style={{ color: "var(--color-text-subtle)" }}>
                  Không có đơn nào
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo đơn sửa mới"
        footer={<><Button variant="secondary" onClick={() => setCreateOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleCreate}>Tạo đơn</Button></>}>
        <div className="space-y-3">
          {error && <p className="text-sm p-2 rounded" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>{error}</p>}
          <Input label="Tên khách hàng" required placeholder="Nguyễn Văn A"
            value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          <Input label="Số điện thoại" required placeholder="0912345678" type="tel"
            value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              Mô tả lỗi máy <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <textarea placeholder="Mô tả tình trạng máy, yêu cầu sửa chữa..." rows={3}
              className="w-full text-sm resize-none"
              style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "8px 12px", color: "var(--color-text)", outline: "none", backgroundColor: "var(--color-surface)" }}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Input label="Giá sửa dự kiến (nếu biết)" placeholder="0" type="number"
            value={form.repairFee} onChange={(e) => setForm({ ...form, repairFee: e.target.value })} />
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
            <WarrantyPicker
              value={form.warrantyTemplate}
              customDays={form.customDays}
              onChangeTemplate={(v) => setForm({ ...form, warrantyTemplate: v })}
              onChangeCustomDays={(v) => setForm({ ...form, customDays: v })}
            />
          </div>
        </div>
      </Modal>

      {/* Complete Modal */}
      <Modal open={completeOpen} onClose={() => setCompleteOpen(false)}
        title="Xác nhận hoàn thành sửa chữa"
        subtitle={selected ? `Đơn ${selected.orderCode} – ${selected.customerName}` : undefined}
        footer={<><Button variant="secondary" onClick={() => setCompleteOpen(false)}>Hủy</Button><Button loading={saving} icon={<CheckCircle size={14} />} onClick={handleComplete}>Xác nhận hoàn thành</Button></>}>
        <div className="space-y-4">
          {error && <p className="text-sm p-2 rounded" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>{error}</p>}
          <Input label="Giá sửa chữa (đ)" required placeholder="150000" type="number"
            value={completeForm.repairFee}
            onChange={(e) => setCompleteForm({ ...completeForm, repairFee: e.target.value })} />
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
            <WarrantyPicker
              value={completeForm.warrantyTemplate}
              customDays={completeForm.customDays}
              onChangeTemplate={(v) => setCompleteForm({ ...completeForm, warrantyTemplate: v })}
              onChangeCustomDays={(v) => setCompleteForm({ ...completeForm, customDays: v })}
              showNotes
              notes={completeForm.warrantyNotes}
              onChangeNotes={(v) => setCompleteForm({ ...completeForm, warrantyNotes: v })}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Xóa đơn sửa chữa?"
        subtitle={selected ? `${selected.orderCode} – ${selected.customerName}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Hủy</Button>
            <Button variant="danger" loading={saving} icon={<Trash2 size={13} />} onClick={handleDelete}>Xóa đơn</Button>
          </>
        }>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Đơn sửa chữa này sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn không?
        </p>
        {error && <p className="text-sm mt-2 p-2 rounded" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>{error}</p>}
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Chỉnh sửa đơn"
        subtitle={selected ? `Đơn ${selected.orderCode}` : undefined}
        footer={<><Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleEdit}>Lưu thay đổi</Button></>}>
        <div className="space-y-3">
          {error && <p className="text-sm p-2 rounded" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>{error}</p>}
          <Input label="Tên khách hàng" value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          <Input label="Số điện thoại" value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Mô tả lỗi</label>
            <textarea rows={3} className="w-full text-sm resize-none"
              style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", padding: "8px 12px", outline: "none", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Input label="Giá sửa (đ)" type="number" placeholder="0"
            value={form.repairFee} onChange={(e) => setForm({ ...form, repairFee: e.target.value })} />
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
            <WarrantyPicker
              value={form.warrantyTemplate}
              customDays={form.customDays}
              onChangeTemplate={(v) => setForm({ ...form, warrantyTemplate: v })}
              onChangeCustomDays={(v) => setForm({ ...form, customDays: v })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

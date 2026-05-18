"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { Plus, Search, Pencil, Trash2, UserCheck, UserX, Truck } from "lucide-react";

type Employee = {
  id: string;
  name: string;
  phone: string | null;
  dateOfBirth: string | null;
  cccd: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { salesOrders: number };
};

function ErrBanner({ msg }: { msg: string }) {
  return (
    <p className="text-sm px-3 py-2 rounded"
      style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>
      {msg}
    </p>
  );
}

const emptyForm = { name: "", phone: "", dateOfBirth: "", cccd: "", isActive: true };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    fetch(`/api/employees?${p}`)
      .then((r) => r.json())
      .then((r) => { if (r.success) setEmployees(r.data); })
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setSaving(true); setError("");
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isActive: form.isActive }),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setCreateOpen(false);
    setForm(emptyForm);
    load();
  };

  const handleEdit = async () => {
    if (!selected) return;
    setSaving(true); setError("");
    const res = await fetch(`/api/employees/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form }),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setEditOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/employees/${selected.id}`, { method: "DELETE" }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setDeleteOpen(false);
    load();
  };

  const openEdit = (e: Employee) => {
    setSelected(e);
    setForm({
      name: e.name,
      phone: e.phone ?? "",
      dateOfBirth: e.dateOfBirth ? e.dateOfBirth.slice(0, 10) : "",
      cccd: e.cccd ?? "",
      isActive: e.isActive,
    });
    setError("");
    setEditOpen(true);
  };

  const activeCount = employees.filter((e) => e.isActive).length;
  const deliveringCount = employees.filter((e) => (e._count?.salesOrders ?? 0) > 0).length;

  return (
    <div>
      <Header
        title="Nhân viên"
        subtitle={`${employees.length} nhân viên – ${activeCount} hoạt động${deliveringCount > 0 ? ` – ${deliveringCount} đang giao hàng` : ""}`}
        actions={
          <Button icon={<Plus size={14} />} onClick={() => { setForm(emptyForm); setError(""); setCreateOpen(true); }}>
            Thêm nhân viên
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="p-3"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <Input prefix={<Search size={14} />} placeholder="Tìm theo tên nhân viên..."
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["NHÂN VIÊN", "SỐ ĐIỆN THOẠI", "NGÀY SINH", "CCCD", "TRẠNG THÁI", "THAO TÁC"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                    style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}
                  style={{ borderBottom: "1px solid var(--color-border)", opacity: e.isActive ? 1 : 0.6 }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = "var(--color-bg)")}
                  onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = "")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const delivering = (e._count?.salesOrders ?? 0) > 0;
                        const bg = !e.isActive ? "var(--color-bg)" : delivering ? "rgba(59,130,246,0.12)" : "rgba(34,197,94,0.12)";
                        const color = !e.isActive ? "var(--color-text-subtle)" : delivering ? "#3b82f6" : "var(--color-success)";
                        const icon = !e.isActive ? <UserX size={13} /> : delivering ? <Truck size={13} /> : <UserCheck size={13} />;
                        return (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: bg, color }}>
                            {icon}
                          </div>
                        );
                      })()}
                      <span className="font-medium">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                    {e.phone || <span style={{ color: "var(--color-text-subtle)" }}>–</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                    {e.dateOfBirth
                      ? new Date(e.dateOfBirth).toLocaleDateString("vi-VN")
                      : <span style={{ color: "var(--color-text-subtle)" }}>–</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                    {e.cccd || <span style={{ color: "var(--color-text-subtle)" }}>–</span>}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const delivering = (e._count?.salesOrders ?? 0) > 0;
                      if (!e.isActive) return <Badge variant="neutral" dot>Nghỉ việc</Badge>;
                      if (delivering) return (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1"
                          style={{ backgroundColor: "rgba(59,130,246,0.1)", color: "#3b82f6", borderRadius: "var(--radius)" }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#3b82f6" }} />
                          Đang giao hàng
                        </span>
                      );
                      return <Badge variant="success" dot>Hoạt động</Badge>;
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" icon={<Pencil size={12} />} onClick={() => openEdit(e)} />
                      <Button size="sm" variant="ghost" icon={<Trash2 size={12} />}
                        onClick={() => { setSelected(e); setError(""); setDeleteOpen(true); }}
                        style={{ color: "var(--color-danger)" }} />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && employees.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center"
                  style={{ color: "var(--color-text-subtle)" }}>Chưa có nhân viên nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Thêm nhân viên mới"
        footer={<><Button variant="secondary" onClick={() => setCreateOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleCreate}>Thêm</Button></>}>
        <div className="space-y-3">
          {error && <ErrBanner msg={error} />}
          <Input label="Tên nhân viên" required placeholder="Nguyễn Văn A"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Số điện thoại" placeholder="0901234567"
              value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Ngày sinh" type="date"
              value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <Input label="Số CCCD" placeholder="001234567890"
            value={form.cccd} onChange={(e) => setForm({ ...form, cccd: e.target.value })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive-create" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4" style={{ accentColor: "var(--color-brand)" }} />
            <label htmlFor="isActive-create" className="text-sm" style={{ color: "var(--color-text)" }}>
              Đang hoạt động
            </label>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Sửa thông tin nhân viên"
        subtitle={selected?.name}
        footer={<><Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleEdit}>Lưu</Button></>}>
        <div className="space-y-3">
          {error && <ErrBanner msg={error} />}
          <Input label="Tên nhân viên" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Số điện thoại" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Ngày sinh" type="date"
              value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <Input label="Số CCCD" value={form.cccd}
            onChange={(e) => setForm({ ...form, cccd: e.target.value })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive-edit" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4" style={{ accentColor: "var(--color-brand)" }} />
            <label htmlFor="isActive-edit" className="text-sm" style={{ color: "var(--color-text)" }}>
              Đang hoạt động
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Xóa nhân viên"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Hủy</Button>
            <Button loading={saving} onClick={handleDelete}
              style={{ backgroundColor: "var(--color-danger)", color: "#fff" }}>Xóa</Button>
          </>
        }>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Bạn có chắc muốn xóa nhân viên <strong style={{ color: "var(--color-text)" }}>{selected?.name}</strong>?
          Thao tác này không thể hoàn tác.
        </p>
        {error && <ErrBanner msg={error} />}
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { Plus, Search, Pencil, Trash2, User } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  createdAt: string;
};

function ErrBanner({ msg }: { msg: string }) {
  return (
    <p className="text-sm px-3 py-2 rounded"
      style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>
      {msg}
    </p>
  );
}

const emptyForm = { name: "", phone: "", address: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    fetch(`/api/customers?${p}`)
      .then((r) => r.json())
      .then((r) => { if (r.success) setCustomers(r.data); })
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    setSaving(true); setError("");
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    const res = await fetch(`/api/customers/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setEditOpen(false);
    load();
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/customers/${selected.id}`, { method: "DELETE" }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setDeleteOpen(false);
    load();
  };

  const openEdit = (c: Customer) => {
    setSelected(c);
    setForm({ name: c.name, phone: c.phone, address: c.address ?? "" });
    setError("");
    setEditOpen(true);
  };

  const openDelete = (c: Customer) => {
    setSelected(c);
    setError("");
    setDeleteOpen(true);
  };

  return (
    <div>
      <Header
        title="Khách hàng"
        subtitle={`${customers.length} khách hàng`}
        actions={
          <Button icon={<Plus size={14} />} onClick={() => { setForm(emptyForm); setError(""); setCreateOpen(true); }}>
            Thêm khách hàng
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="p-3"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <Input prefix={<Search size={14} />} placeholder="Tìm theo tên hoặc số điện thoại..."
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                {["KHÁCH HÀNG", "SỐ ĐIỆN THOẠI", "ĐỊA CHỈ", "NGÀY THÊM", "THAO TÁC"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                    style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--color-brand-light)", color: "var(--color-brand)" }}>
                        <User size={13} />
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral">{c.phone}</Badge>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                    {c.address || <span style={{ color: "var(--color-text-subtle)" }}>–</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" icon={<Pencil size={12} />} onClick={() => openEdit(c)} />
                      <Button size="sm" variant="ghost" icon={<Trash2 size={12} />}
                        onClick={() => openDelete(c)}
                        style={{ color: "var(--color-danger)" }} />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && customers.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center"
                  style={{ color: "var(--color-text-subtle)" }}>Chưa có khách hàng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Thêm khách hàng mới"
        footer={<><Button variant="secondary" onClick={() => setCreateOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleCreate}>Thêm</Button></>}>
        <div className="space-y-3">
          {error && <ErrBanner msg={error} />}
          <Input label="Tên khách hàng" required placeholder="Nguyễn Văn A"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Số điện thoại" required placeholder="0901234567"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Địa chỉ" placeholder="123 Đường ABC, Quận 1"
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Sửa thông tin khách hàng"
        subtitle={selected?.name}
        footer={<><Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleEdit}>Lưu</Button></>}>
        <div className="space-y-3">
          {error && <ErrBanner msg={error} />}
          <Input label="Tên khách hàng" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Số điện thoại" required value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Địa chỉ" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Xóa khách hàng"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Hủy</Button>
            <Button loading={saving} onClick={handleDelete}
              style={{ backgroundColor: "var(--color-danger)", color: "#fff" }}>Xóa</Button>
          </>
        }>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Bạn có chắc muốn xóa khách hàng <strong style={{ color: "var(--color-text)" }}>{selected?.name}</strong>?
          Thao tác này không thể hoàn tác.
        </p>
        {error && <ErrBanner msg={error} />}
      </Modal>
    </div>
  );
}

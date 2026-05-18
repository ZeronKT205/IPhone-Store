"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  Plus, Search, Pencil, PackagePlus, AlertTriangle,
  Eye, EyeOff, Tag, Layers,
} from "lucide-react";

type Category = { id: string; name: string; _count?: { products: number } };
type Product = {
  id: string; name: string; categoryId: string;
  category: Category; unit: string; image?: string | null;
  costPrice: number | null; sellingPrice: number;
  stockQuantity: number; lowStockThreshold: number;
  isActive: boolean; isLowStock: boolean;
};

type Tab = "products" | "categories";

function fmt(n: number | null) {
  if (!n) return "–";
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

// ─── Error banner ──────────────────────────────────────────
function ErrBanner({ msg }: { msg: string }) {
  return (
    <p className="text-sm px-3 py-2 rounded"
      style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>
      {msg}
    </p>
  );
}

export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("products");

  // ── Products ──────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = { name: "", categoryId: "", unit: "Cái", costPrice: "", sellingPrice: "", stockQuantity: "0", lowStockThreshold: "5" };
  const [form, setForm] = useState(emptyForm);
  const [stockQty, setStockQty] = useState("");

  // ── Categories ────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [catCreateOpen, setCatCreateOpen] = useState(false);
  const [catEditOpen, setCatEditOpen] = useState(false);
  const [catDeleteOpen, setCatDeleteOpen] = useState(false);
  const [catSelected, setCatSelected] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catSaving, setCatSaving] = useState(false);
  const [catError, setCatError] = useState("");

  const loadCategories = useCallback(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((r) => { if (r.success) setCategories(r.data); });
  }, []);

  const loadProducts = useCallback(() => {
    setLoadingProducts(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (showAll) p.set("showAll", "true");
    fetch(`/api/products?${p}`)
      .then((r) => r.json())
      .then((r) => { if (r.success) setProducts(r.data); })
      .finally(() => setLoadingProducts(false));
  }, [q, showAll]);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Product handlers ──────────────────────────────────
  const handleCreate = async () => {
    setSaving(true); setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        costPrice: form.costPrice ? parseInt(form.costPrice) : undefined,
        sellingPrice: parseInt(form.sellingPrice),
        stockQuantity: parseInt(form.stockQuantity),
        lowStockThreshold: parseInt(form.lowStockThreshold),
      }),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setCreateOpen(false);
    setForm(emptyForm);
    loadProducts();
  };

  const handleEdit = async () => {
    if (!selected) return;
    setSaving(true); setError("");
    const res = await fetch(`/api/products/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        categoryId: form.categoryId,
        unit: form.unit,
        costPrice: form.costPrice ? parseInt(form.costPrice) : undefined,
        sellingPrice: parseInt(form.sellingPrice),
        lowStockThreshold: parseInt(form.lowStockThreshold),
      }),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setEditOpen(false);
    loadProducts();
  };

  const handleAddStock = async () => {
    if (!selected) return;
    setSaving(true); setError("");
    const res = await fetch(`/api/products/${selected.id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: parseInt(stockQty) }),
    }).then((r) => r.json());
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setStockOpen(false);
    loadProducts();
  };

  const handleToggle = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    loadProducts();
  };

  const openEdit = (p: Product) => {
    setSelected(p);
    setForm({
      name: p.name,
      categoryId: p.categoryId,
      unit: p.unit,
      costPrice: String(p.costPrice ?? ""),
      sellingPrice: String(p.sellingPrice),
      stockQuantity: String(p.stockQuantity),
      lowStockThreshold: String(p.lowStockThreshold),
    });
    setError("");
    setEditOpen(true);
  };

  // ── Category handlers ─────────────────────────────────
  const handleCatCreate = async () => {
    setCatSaving(true); setCatError("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName }),
    }).then((r) => r.json());
    setCatSaving(false);
    if (!res.success) { setCatError(res.error); return; }
    setCatCreateOpen(false);
    setCatName("");
    loadCategories();
  };

  const handleCatEdit = async () => {
    if (!catSelected) return;
    setCatSaving(true); setCatError("");
    const res = await fetch(`/api/categories/${catSelected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName }),
    }).then((r) => r.json());
    setCatSaving(false);
    if (!res.success) { setCatError(res.error); return; }
    setCatEditOpen(false);
    loadCategories();
    loadProducts();
  };

  const handleCatDelete = async () => {
    if (!catSelected) return;
    setCatSaving(true);
    const res = await fetch(`/api/categories/${catSelected.id}`, { method: "DELETE" }).then((r) => r.json());
    setCatSaving(false);
    if (!res.success) { setCatError(res.error); return; }
    setCatDeleteOpen(false);
    loadCategories();
  };

  const lowCount = products.filter((p) => p.isLowStock && p.isActive).length;

  return (
    <div>
      <Header
        title="Kho hàng"
        subtitle={`${products.length} sản phẩm${lowCount ? ` – ${lowCount} cần nhập thêm` : ""}`}
        actions={
          tab === "products"
            ? <Button icon={<Plus size={14} />} onClick={() => { setForm(emptyForm); setError(""); setCreateOpen(true); }}>Thêm sản phẩm</Button>
            : <Button icon={<Plus size={14} />} onClick={() => { setCatName(""); setCatError(""); setCatCreateOpen(true); }}>Thêm danh mục</Button>
        }
      />

      <div className="p-6 space-y-4">
        {lowCount > 0 && tab === "products" && (
          <div className="flex items-center gap-2 px-4 py-3 rounded text-sm"
            style={{ backgroundColor: "var(--color-warning-bg)", color: "var(--color-warning)", borderRadius: "var(--radius-md)", border: "1px solid #FDE68A" }}>
            <AlertTriangle size={15} />
            <span>{lowCount} sản phẩm đang có tồn kho thấp — cần nhập thêm hàng</span>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 w-fit"
          style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
          {([
            ["products", "Sản phẩm", <Layers key="p" size={14} />],
            ["categories", "Danh mục", <Tag key="c" size={14} />],
          ] as const).map(([key, label, icon]) => (
            <button key={key} onClick={() => setTab(key)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
              style={{
                borderRadius: "var(--radius)",
                backgroundColor: tab === key ? "var(--color-brand)" : "transparent",
                color: tab === key ? "#fff" : "var(--color-text-muted)",
              }}>
              {icon}{label}
            </button>
          ))}
        </div>

        {/* ── Products tab ── */}
        {tab === "products" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 p-3"
              style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
              <div className="flex-1 min-w-[200px]">
                <Input prefix={<Search size={14} />} placeholder="Tìm sản phẩm..." value={q}
                  onChange={(e) => setQ(e.target.value)} />
              </div>
              <button
                className="flex items-center gap-2 text-sm px-3 py-2 rounded transition-colors"
                style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", color: showAll ? "var(--color-brand)" : "var(--color-text-muted)" }}
                onClick={() => setShowAll(!showAll)}>
                {showAll ? <Eye size={14} /> : <EyeOff size={14} />}
                {showAll ? "Hiện tất cả" : "Ẩn sản phẩm đã ẩn"}
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto"
              style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
              <table className="w-full text-sm min-w-[750px]">
                <thead>
                  <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                    {["ẢNH", "TÊN SẢN PHẨM", "DANH MỤC", "ĐƠN VỊ", "GIÁ NHẬP", "GIÁ BÁN", "TỒN KHO", "TRẠNG THÁI", "THAO TÁC"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                        style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}
                      style={{ borderBottom: "1px solid var(--color-border)", opacity: p.isActive ? 1 : 0.5 }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                      {/* Ảnh */}
                      <td className="px-4 py-2.5">
                        <div className="w-10 h-10 flex items-center justify-center overflow-hidden"
                          style={{ borderRadius: "var(--radius)", backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                          {p.image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                            : <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>–</span>
                          }
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-medium">{p.name}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="neutral">{p.category?.name ?? "–"}</Badge>
                      </td>
                      <td className="px-4 py-2.5" style={{ color: "var(--color-text-muted)" }}>{p.unit}</td>
                      <td className="px-4 py-2.5" style={{ color: "var(--color-text-muted)" }}>{fmt(p.costPrice)}</td>
                      <td className="px-4 py-2.5 font-medium">{fmt(p.sellingPrice)}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-semibold"
                          style={{ color: p.isLowStock ? "var(--color-danger)" : "var(--color-success)" }}>
                          {p.stockQuantity}
                        </span>
                        {p.isLowStock && <AlertTriangle size={13} className="inline ml-1.5" style={{ color: "var(--color-warning)" }} />}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={p.isActive ? "success" : "neutral"} dot>
                          {p.isActive ? "Đang bán" : "Đã ẩn"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="secondary" icon={<PackagePlus size={12} />}
                            onClick={() => { setSelected(p); setStockQty(""); setError(""); setStockOpen(true); }}>
                            Nhập kho
                          </Button>
                          <Button size="sm" variant="ghost" icon={<Pencil size={12} />}
                            onClick={() => openEdit(p)} />
                          <Button size="sm" variant="ghost"
                            icon={p.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                            onClick={() => handleToggle(p)}
                            style={{ color: "var(--color-text-muted)" }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loadingProducts && products.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-10 text-center"
                      style={{ color: "var(--color-text-subtle)" }}>Chưa có sản phẩm nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Categories tab ── */}
        {tab === "categories" && (
          <div className="overflow-x-auto"
            style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["TÊN DANH MỤC", "SỐ SẢN PHẨM", "THAO TÁC"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} style={{ borderBottom: "1px solid var(--color-border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <Tag size={14} style={{ color: "var(--color-brand)" }} />
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>
                      {cat._count?.products ?? 0} sản phẩm
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" icon={<Pencil size={12} />}
                          onClick={() => { setCatSelected(cat); setCatName(cat.name); setCatError(""); setCatEditOpen(true); }} />
                        <Button size="sm" variant="ghost" icon={<Eye size={12} />}
                          onClick={() => { setQ(""); setTab("products"); }}
                          style={{ color: "var(--color-text-muted)" }}
                          title="Xem sản phẩm" />
                        <Button size="sm" variant="ghost"
                          onClick={() => { setCatSelected(cat); setCatError(""); setCatDeleteOpen(true); }}
                          style={{ color: (cat._count?.products ?? 0) > 0 ? "var(--color-text-subtle)" : "var(--color-danger)" }}
                          disabled={(cat._count?.products ?? 0) > 0}
                          title={(cat._count?.products ?? 0) > 0 ? "Có sản phẩm, không thể xóa" : "Xóa danh mục"}>
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-10 text-center"
                    style={{ color: "var(--color-text-subtle)" }}>Chưa có danh mục nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Thêm sản phẩm mới"
        footer={<><Button variant="secondary" onClick={() => setCreateOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleCreate}>Thêm sản phẩm</Button></>}>
        <div className="space-y-3">
          {error && <ErrBanner msg={error} />}
          <Input label="Tên sản phẩm" required placeholder="Ốp lưng iPhone 15"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Danh mục <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <select
                className="text-sm px-3 h-9"
                style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Chọn danh mục</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Đơn vị" required placeholder="Cái"
              value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Giá nhập (đ)" type="number" placeholder="0"
              value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            <Input label="Giá bán (đ)" required type="number" placeholder="0"
              value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Số lượng ban đầu" type="number"
              value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
            <Input label="Ngưỡng cảnh báo" type="number"
              value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Chỉnh sửa sản phẩm"
        subtitle={selected?.name}
        footer={<><Button variant="secondary" onClick={() => setEditOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleEdit}>Lưu</Button></>}>
        <div className="space-y-3">
          {error && <ErrBanner msg={error} />}
          <Input label="Tên sản phẩm" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>Danh mục</label>
              <select
                className="text-sm px-3 h-9"
                style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Chọn danh mục</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="Đơn vị" value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Giá nhập (đ)" type="number"
              value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            <Input label="Giá bán (đ)" type="number"
              value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
          </div>
          <Input label="Ngưỡng cảnh báo" type="number"
            value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
        </div>
      </Modal>

      {/* Add Stock Modal */}
      <Modal open={stockOpen} onClose={() => setStockOpen(false)} title="Nhập kho"
        subtitle={selected ? `${selected.name} – Tồn hiện tại: ${selected.stockQuantity}` : undefined}
        footer={<><Button variant="secondary" onClick={() => setStockOpen(false)}>Hủy</Button><Button loading={saving} onClick={handleAddStock}>Nhập kho</Button></>}>
        <div className="space-y-3">
          {error && <ErrBanner msg={error} />}
          <Input label="Số lượng nhập" required type="number" placeholder="10"
            value={stockQty} onChange={(e) => setStockQty(e.target.value)} />
        </div>
      </Modal>

      {/* Create Category Modal */}
      <Modal open={catCreateOpen} onClose={() => setCatCreateOpen(false)} title="Thêm danh mục mới"
        footer={<><Button variant="secondary" onClick={() => setCatCreateOpen(false)}>Hủy</Button><Button loading={catSaving} onClick={handleCatCreate}>Thêm</Button></>}>
        <div className="space-y-3">
          {catError && <ErrBanner msg={catError} />}
          <Input label="Tên danh mục" required placeholder="VD: Phụ kiện, Linh kiện..."
            value={catName} onChange={(e) => setCatName(e.target.value)} />
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal open={catEditOpen} onClose={() => setCatEditOpen(false)} title="Sửa danh mục"
        subtitle={catSelected?.name}
        footer={<><Button variant="secondary" onClick={() => setCatEditOpen(false)}>Hủy</Button><Button loading={catSaving} onClick={handleCatEdit}>Lưu</Button></>}>
        <div className="space-y-3">
          {catError && <ErrBanner msg={catError} />}
          <Input label="Tên danh mục" required value={catName}
            onChange={(e) => setCatName(e.target.value)} />
        </div>
      </Modal>

      {/* Delete Category Modal */}
      <Modal open={catDeleteOpen} onClose={() => setCatDeleteOpen(false)} title="Xóa danh mục?"
        subtitle={catSelected?.name}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCatDeleteOpen(false)}>Hủy</Button>
            <Button variant="danger" loading={catSaving} onClick={handleCatDelete}>Xóa danh mục</Button>
          </>
        }>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Danh mục <strong style={{ color: "var(--color-text)" }}>{catSelected?.name}</strong> sẽ bị xóa vĩnh viễn.
          Thao tác này không thể hoàn tác.
        </p>
        {catError && <p className="text-sm mt-2 p-2 rounded" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>{catError}</p>}
      </Modal>
    </div>
  );
}

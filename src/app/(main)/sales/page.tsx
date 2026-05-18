"use client";

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  Search, ShoppingCart, Trash2, Plus, Minus, Truck,
  CheckCircle, Ban, Package, Tag, ReceiptText,
} from "lucide-react";
import {
  OrderType, PaymentMethod, SalesOrderStatus,
  SALES_ORDER_STATUS_LABEL, ORDER_TYPE_LABEL, PAYMENT_METHOD_LABEL,
} from "@/constants/enums";
import { fmtDate, fmtCurrency } from "@/lib/format";

// ─── types ────────────────────────────────────────────────
type Product = {
  id: string; name: string; sellingPrice: number;
  stockQuantity: number;
  categoryId: string; category: { id: string; name: string };
  isLowStock: boolean; image?: string | null;
};
type CartItem = { product: Product; quantity: number };
type Tab = "pos" | "history";

// ─── helpers ──────────────────────────────────────────────
const fmt = fmtCurrency;

const statusVariant: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  COUNTER_SALE: "success", PROCESSING: "warning",
  DELIVERED: "success", CANCELLED: "danger",
};

// ─── ProductCard ──────────────────────────────────────────
function ProductCard({
  product, onAdd,
}: { product: Product; onAdd: (p: Product) => void }) {
  const outOfStock = product.stockQuantity === 0;
  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className="text-left w-full"
      style={{
        backgroundColor: "var(--color-surface)",
        border: `1px solid var(--color-border)`,
        borderRadius: "var(--radius-md)",
        padding: "12px",
        opacity: outOfStock ? 0.45 : 1,
        cursor: outOfStock ? "not-allowed" : "pointer",
        boxShadow: "var(--shadow-card)",
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.1s",
        willChange: "transform",
      }}
      onMouseEnter={(e) => {
        if (!outOfStock) {
          e.currentTarget.style.borderColor = "var(--color-brand)";
          e.currentTarget.style.boxShadow = "0 0 0 2px rgba(196,154,42,0.15), 0 2px 8px rgba(0,0,0,0.06)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
        e.currentTarget.style.transform = "";
      }}
      onMouseDown={(e) => { if (!outOfStock) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
    >
      {/* Product image or category icon */}
      {product.image ? (
        <div className="w-full h-24 mb-2.5 overflow-hidden flex items-center justify-center"
          style={{ borderRadius: "var(--radius)", backgroundColor: "var(--color-bg)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
            style={{ maxHeight: "96px" }}
          />
        </div>
      ) : (
        <div
          className="w-9 h-9 rounded flex items-center justify-center mb-2.5"
          style={{ backgroundColor: "#C49A2A20" }}
        >
          <Package size={16} style={{ color: "#C49A2A" }} />
        </div>
      )}

      <p
        className="text-sm font-semibold leading-snug mb-1 line-clamp-2"
        style={{ color: "var(--color-text)" }}
      >
        {product.name}
      </p>

      <p className="text-base font-bold mb-2" style={{ color: "var(--color-brand-dark)" }}>
        {fmt(product.sellingPrice)}
      </p>

      <div className="flex items-center justify-between">
        <span
          className="text-xs"
          style={{ color: product.isLowStock ? "var(--color-danger)" : "var(--color-text-subtle)" }}
        >
          Còn {product.stockQuantity}
        </span>
        {!outOfStock && (
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ backgroundColor: "var(--color-brand)", color: "#fff" }}
          >
            <Plus size={12} />
          </div>
        )}
        {outOfStock && (
          <span className="text-xs" style={{ color: "var(--color-danger)" }}>Hết hàng</span>
        )}
      </div>
    </button>
  );
}

// ─── CartRow ──────────────────────────────────────────────
function CartRow({
  item, onInc, onDec, onRemove,
}: { item: CartItem; onInc: () => void; onDec: () => void; onRemove: () => void }) {
  return (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug" style={{ color: "var(--color-text)" }}>
          {item.product.name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {fmt(item.product.sellingPrice)} / cái
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onDec}
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ border: "1px solid var(--color-border)", color: "var(--color-text-muted)", transition: "transform 0.1s, background-color 0.1s" }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.88)"; e.currentTarget.style.backgroundColor = "var(--color-bg)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.backgroundColor = ""; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.backgroundColor = ""; }}
        >
          <Minus size={11} />
        </button>
        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          onClick={onInc}
          disabled={item.quantity >= item.product.stockQuantity}
          className="w-6 h-6 rounded flex items-center justify-center disabled:opacity-40"
          style={{ border: "1px solid var(--color-border)", color: "var(--color-text-muted)", transition: "transform 0.1s, background-color 0.1s" }}
          onMouseDown={(e) => { if (item.quantity < item.product.stockQuantity) { e.currentTarget.style.transform = "scale(0.88)"; e.currentTarget.style.backgroundColor = "var(--color-bg)"; } }}
          onMouseUp={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.backgroundColor = ""; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.backgroundColor = ""; }}
        >
          <Plus size={11} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-semibold w-20 text-right" style={{ color: "var(--color-text)" }}>
          {fmt(item.product.sellingPrice * item.quantity)}
        </span>
        <button onClick={onRemove}
          style={{ color: "var(--color-text-subtle)", transition: "color 0.15s, transform 0.1s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-danger)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-text-subtle)"; e.currentTarget.style.transform = ""; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.85)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function SalesPage() {
  const [tab, setTab] = useState<Tab>("pos");

  // POS state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [productQ, setProductQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.COUNTER);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    customerName: "", customerPhone: "", customerId: "",
    deliveryAddress: "", employeeId: "", notes: "",
  });
  const [availableEmployees, setAvailableEmployees] = useState<{ id: string; name: string }[]>([]);
  const [customerLookup, setCustomerLookup] = useState<{ id: string; name: string } | null>(null);
  const [customerSuggestions, setCustomerSuggestions] = useState<{ id: string; name: string; phone: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posError, setPosError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // History state
  const [orders, setOrders] = useState<any[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyQ, setHistoryQ] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");
  const [processingCount, setProcessingCount] = useState(0);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelSaving, setCancelSaving] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deliverPayment, setDeliverPayment] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [deliverSaving, setDeliverSaving] = useState(false);
  const [deliverError, setDeliverError] = useState("");

  // Load products + categories for POS
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((r) => { if (r.success) setProducts(r.data); });
    fetch("/api/categories")
      .then((r) => r.json())
      .then((r) => { if (r.success) setCategories(r.data); });
  }, []);

  // Load QR bank transfer image
  useEffect(() => {
    fetch("/api/settings/qr")
      .then((r) => r.json())
      .then((r) => { if (r.success && r.exists) setQrUrl(r.url + "?t=" + Date.now()); });
  }, []);

  // Load processing count for badge
  useEffect(() => {
    fetch("/api/sales-orders?status=PROCESSING")
      .then((r) => r.json())
      .then((r) => { if (r.success) setProcessingCount(r.data.total ?? 0); });
  }, []);

  const refreshProcessingCount = useCallback(() => {
    fetch("/api/sales-orders?status=PROCESSING")
      .then((r) => r.json())
      .then((r) => { if (r.success) setProcessingCount(r.data.total ?? 0); });
  }, []);

  // Fetch available employees for delivery form
  const loadAvailableEmployees = useCallback(() => {
    fetch("/api/employees?available=true")
      .then((r) => r.json())
      .then((r) => { if (r.success) setAvailableEmployees(r.data); });
  }, []);

  // Lookup customer by phone
  const lookupCustomerByPhone = useCallback((phone: string) => {
    if (phone.length < 10) { setCustomerLookup(null); setDeliveryForm((f) => ({ ...f, customerId: "" })); return; }
    fetch(`/api/customers?phone=${encodeURIComponent(phone)}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data) {
          setCustomerLookup(r.data);
          setDeliveryForm((f) => ({ ...f, customerName: r.data.name, customerId: r.data.id }));
        } else {
          setCustomerLookup(null);
          setDeliveryForm((f) => ({ ...f, customerId: "" }));
        }
      });
  }, []);

  // Load order history
  const loadHistory = useCallback(() => {
    setHistoryLoading(true);
    const p = new URLSearchParams();
    if (historyQ) p.set("q", historyQ);
    if (historyStatus) p.set("status", historyStatus);
    fetch(`/api/sales-orders?${p}`)
      .then((r) => r.json())
      .then((r) => { if (r.success) { setOrders(r.data.items); setHistoryTotal(r.data.total); } })
      .finally(() => setHistoryLoading(false));
  }, [historyQ, historyStatus]);

  useEffect(() => { if (tab === "history") loadHistory(); }, [tab, loadHistory]);

  // ── Cart logic ──
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== productId));

  const clearCart = () => {
    setCart([]);
    setOrderType(OrderType.COUNTER);
    setDeliveryForm({ customerName: "", customerPhone: "", customerId: "", deliveryAddress: "", employeeId: "", notes: "" });
    setCustomerLookup(null);
    setCustomerSuggestions([]);
    setShowSuggestions(false);
    setPosError("");
  };

  const cartTotal = cart.reduce((s, i) => s + i.product.sellingPrice * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // ── Checkout ──
  const handleCheckout = async () => {
    setSaving(true); setPosError("");
    const items = cart.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
    const body =
      orderType === OrderType.COUNTER
        ? { orderType, items, paymentMethod }
        : {
            orderType,
            items,
            customerName: deliveryForm.customerName,
            customerPhone: deliveryForm.customerPhone,
            ...(deliveryForm.customerId ? { customerId: deliveryForm.customerId } : {}),
            deliveryAddress: deliveryForm.deliveryAddress,
            employeeId: deliveryForm.employeeId,
            notes: deliveryForm.notes || undefined,
          };

    const res = await fetch("/api/sales-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());

    setSaving(false);
    if (!res.success) { setPosError(res.error); return; }
    setCheckoutOpen(false);
    clearCart();
    setSuccessMsg(
      orderType === OrderType.COUNTER
        ? `✓ Đơn ${res.data.orderCode} đã hoàn thành`
        : `✓ Đơn ${res.data.orderCode} đang giao`
    );
    setTimeout(() => setSuccessMsg(""), 4000);
    // Refresh products stock
    fetch("/api/products").then((r) => r.json()).then((r) => { if (r.success) setProducts(r.data); });
  };

  // ── Deliver (history) ──
  const handleDeliver = async () => {
    if (!selected) return;
    setDeliverSaving(true); setDeliverError("");
    const res = await fetch(`/api/sales-orders/${selected.id}/deliver`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethod: deliverPayment }),
    }).then((r) => r.json());
    setDeliverSaving(false);
    if (!res.success) { setDeliverError(res.error); return; }
    setDeliverOpen(false);
    loadHistory();
    refreshProcessingCount();
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelSaving(true);
    const res = await fetch(`/api/sales-orders/${cancelTarget.id}/cancel`, { method: "PATCH" }).then((r) => r.json());
    setCancelSaving(false);
    if (res.success) { setCancelOpen(false); loadHistory(); refreshProcessingCount(); }
  };

  // ── Filtered products ──
  const filteredProducts = products.filter((p) => {
    const matchQ = !productQ || p.name.toLowerCase().includes(productQ.toLowerCase());
    const matchCat = !categoryFilter || p.categoryId === categoryFilter;
    return matchQ && matchCat;
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <Header
        title="Bán hàng"
        subtitle={tab === "pos" ? `${cartCount} sản phẩm trong giỏ` : `Tổng ${historyTotal} đơn`}
      />

      {/* Tab bar */}
      <div
        className="flex items-center gap-1 px-6 py-2"
        style={{ backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        <button
          onClick={() => setTab("pos")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            borderRadius: "var(--radius)",
            backgroundColor: tab === "pos" ? "var(--color-brand-100)" : "transparent",
            color: tab === "pos" ? "var(--color-brand-dark)" : "var(--color-text-muted)",
            borderBottom: tab === "pos" ? `2px solid var(--color-brand)` : "2px solid transparent",
          }}
        >
          <ShoppingCart size={14} />
          Bán hàng tại quầy
        </button>
        <button
          onClick={() => setTab("history")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            borderRadius: "var(--radius)",
            backgroundColor: tab === "history" ? "var(--color-brand-100)" : "transparent",
            color: tab === "history" ? "var(--color-brand-dark)" : "var(--color-text-muted)",
            borderBottom: tab === "history" ? `2px solid var(--color-brand)` : "2px solid transparent",
          }}
        >
          <ReceiptText size={14} />
          Lịch sử đơn hàng
          {processingCount > 0 && (
            <span
              className="flex items-center justify-center text-white font-bold"
              style={{
                backgroundColor: "var(--color-danger)",
                borderRadius: "999px",
                fontSize: "10px",
                minWidth: "18px",
                height: "18px",
                padding: "0 5px",
                lineHeight: 1,
              }}
            >
              {processingCount}
            </span>
          )}
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div
          className="mx-6 mt-3 px-4 py-2.5 text-sm font-medium rounded"
          style={{
            backgroundColor: "var(--color-success-bg)",
            color: "var(--color-success)",
            borderRadius: "var(--radius-md)",
            border: "1px solid #86EFAC",
          }}
        >
          {successMsg}
        </div>
      )}

      {/* ── POS TAB ── */}
      {tab === "pos" && (
        <div
          className="flex flex-1 overflow-hidden"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          {/* Left: Product grid */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search + filter */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{ backgroundColor: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex-1">
                <Input
                  prefix={<Search size={14} />}
                  placeholder="Tìm sản phẩm..."
                  value={productQ}
                  onChange={(e) => setProductQ(e.target.value)}
                />
              </div>
              <select
                className="text-sm px-3 h-9 cursor-pointer"
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Tất cả loại</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="text-xs" style={{ color: "var(--color-text-subtle)", whiteSpace: "nowrap" }}>
                {filteredProducts.length} sản phẩm
              </span>
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredProducts.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full gap-3"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  <Package size={40} style={{ opacity: 0.3 }} />
                  <p className="text-sm">Không tìm thấy sản phẩm</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} onAdd={addToCart} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart panel */}
          <div
            className="flex flex-col w-[340px] xl:w-[380px] flex-shrink-0 overflow-hidden"
            style={{
              backgroundColor: "var(--color-surface)",
              borderLeft: "1px solid var(--color-border)",
            }}
          >
            {/* Cart header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} style={{ color: "var(--color-brand)" }} />
                <span className="font-semibold text-sm">Giỏ hàng</span>
                {cart.length > 0 && (
                  <span
                    className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: "var(--color-brand)" }}
                  >
                    {cart.length}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--color-danger)" }}
                >
                  <Trash2 size={12} /> Xóa tất cả
                </button>
              )}
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4">
              {cart.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full gap-3 py-10"
                  style={{ color: "var(--color-text-subtle)" }}
                >
                  <ShoppingCart size={36} style={{ opacity: 0.2 }} />
                  <p className="text-sm text-center">
                    Chọn sản phẩm từ bên trái<br />để thêm vào giỏ hàng
                  </p>
                </div>
              ) : (
                <div>
                  {cart.map((item) => (
                    <CartRow
                      key={item.product.id}
                      item={item}
                      onInc={() => updateQty(item.product.id, +1)}
                      onDec={() => updateQty(item.product.id, -1)}
                      onRemove={() => removeFromCart(item.product.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer */}
            <div
              className="px-4 py-4 space-y-3"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              {/* Order type */}
              <div className="flex gap-1 p-1" style={{ backgroundColor: "var(--color-bg)", borderRadius: "var(--radius)" }}>
                {([OrderType.COUNTER, OrderType.DELIVERY] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className="flex-1 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: orderType === t ? "var(--color-surface)" : "transparent",
                      color: orderType === t ? "var(--color-text)" : "var(--color-text-muted)",
                      boxShadow: orderType === t ? "var(--shadow-card)" : "none",
                    }}
                  >
                    {ORDER_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {cartCount} sản phẩm
                  </span>
                  <span style={{ color: "var(--color-text-muted)" }}>{fmt(cartTotal)}</span>
                </div>
                <div
                  className="flex justify-between items-center pt-2"
                  style={{ borderTop: "1px solid var(--color-border)" }}
                >
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="text-lg font-bold" style={{ color: "var(--color-brand-dark)" }}>
                    {fmt(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout button */}
              <Button
                className="w-full justify-center"
                size="lg"
                disabled={cart.length === 0}
                icon={orderType === OrderType.COUNTER ? <CheckCircle size={16} /> : <Truck size={16} />}
                onClick={() => { setPosError(""); if (orderType === OrderType.DELIVERY) loadAvailableEmployees(); setCheckoutOpen(true); }}
              >
                {orderType === OrderType.COUNTER ? "Thanh toán ngay" : "Tạo đơn giao hàng"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Filters */}
          <div
            className="flex flex-wrap items-center gap-3 p-3"
            style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex-1 min-w-[200px]">
              <Input prefix={<Search size={14} />} placeholder="Tìm theo mã, tên, SĐT..." value={historyQ}
                onChange={(e) => setHistoryQ(e.target.value)} />
            </div>
            <select
              className="text-sm px-3 h-9 cursor-pointer"
              style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
              value={historyStatus} onChange={(e) => setHistoryStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="COUNTER_SALE">Tại quầy</option>
              <option value="PROCESSING">Đang giao</option>
              <option value="DELIVERED">Giao thành công</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
            <Button size="sm" variant="secondary" onClick={loadHistory}>Tải lại</Button>
          </div>

          <div
            className="overflow-x-auto"
            style={{ backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}
          >
            <table className="w-full text-sm min-w-[1050px]">
              <thead>
                <tr style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
                  {["MÃ ĐƠN", "HÌNH THỨC", "SẢN PHẨM", "TỔNG TIỀN", "NGÀY TẠO", "NGƯỜI GIAO", "THANH TOÁN", "TRẠNG THÁI", "THAO TÁC"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                      style={{ color: "var(--color-text-subtle)", letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid var(--color-border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}>
                    <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: "var(--color-brand-dark)" }}>
                      {o.orderCode}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={o.orderType === "COUNTER" ? "neutral" : "brand"}>
                        {ORDER_TYPE_LABEL[o.orderType as OrderType]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {o.items.slice(0, 2).map((it: any) => `${it.productName} ×${it.quantity}`).join(", ")}
                      {o.items.length > 2 && ` +${o.items.length - 2}`}
                    </td>
                    <td className="px-4 py-3 font-semibold">{fmt(o.totalAmount)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {o.deliveryPerson || <span style={{ color: "var(--color-text-subtle)" }}>–</span>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.paymentMethod
                        ? <Badge variant={o.paymentMethod === "BANK_TRANSFER" ? "brand" : "neutral"}>{PAYMENT_METHOD_LABEL[o.paymentMethod as PaymentMethod]}</Badge>
                        : <span style={{ color: "var(--color-text-subtle)" }}>–</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[o.status] ?? "neutral"} dot>
                        {SALES_ORDER_STATUS_LABEL[o.status as SalesOrderStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {o.status === SalesOrderStatus.PROCESSING && (
                          <>
                            <Button size="sm" variant="secondary" icon={<CheckCircle size={12} />}
                              onClick={() => { setSelected(o); setDeliverPayment(PaymentMethod.CASH); setDeliverError(""); setDeliverOpen(true); }}>
                              Hoàn thành
                            </Button>
                            <Button size="sm" variant="ghost" icon={<Ban size={12} />}
                              onClick={() => { setCancelTarget(o); setCancelOpen(true); }}
                              style={{ color: "var(--color-danger)" }} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!historyLoading && orders.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center" style={{ color: "var(--color-text-subtle)" }}>
                    Chưa có đơn bán nào
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ── */}
      <Modal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title={orderType === OrderType.COUNTER ? "Xác nhận thanh toán" : "Thông tin giao hàng"}
        subtitle={`${cartCount} sản phẩm – Tổng ${fmt(cartTotal)}`}
        width={orderType === OrderType.DELIVERY ? 500 : 420}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCheckoutOpen(false)}>Hủy</Button>
            <Button
              loading={saving}
              icon={orderType === OrderType.COUNTER ? <CheckCircle size={14} /> : <Truck size={14} />}
              onClick={handleCheckout}
            >
              {orderType === OrderType.COUNTER ? "Xác nhận thanh toán" : "Tạo đơn giao hàng"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {posError && (
            <p className="text-sm p-2 rounded" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>
              {posError}
            </p>
          )}

          {/* Order summary */}
          <div className="space-y-1.5">
            {cart.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span style={{ color: "var(--color-text-muted)" }}>
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium">{fmt(item.product.sellingPrice * item.quantity)}</span>
              </div>
            ))}
            <div
              className="flex justify-between items-center pt-2 mt-1"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <span className="font-semibold">Tổng cộng</span>
              <span className="font-bold text-base" style={{ color: "var(--color-brand-dark)" }}>
                {fmt(cartTotal)}
              </span>
            </div>
          </div>

          {/* Counter sale: payment method */}
          {orderType === OrderType.COUNTER && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Hình thức thanh toán</p>
              <div className="grid grid-cols-2 gap-2">
                {([PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className="py-2.5 text-sm font-medium"
                    style={{
                      borderRadius: "var(--radius)",
                      transition: "border-color 0.15s, background-color 0.15s, transform 0.1s",
                      border: `1px solid ${paymentMethod === m ? "var(--color-brand)" : "var(--color-border)"}`,
                      backgroundColor: paymentMethod === m ? "var(--color-brand-50)" : "var(--color-surface)",
                      color: paymentMethod === m ? "var(--color-brand-dark)" : "var(--color-text)",
                    }}
                    onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                    onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                  >
                    {PAYMENT_METHOD_LABEL[m]}
                  </button>
                ))}
              </div>

              {/* QR chuyển khoản */}
              {paymentMethod === PaymentMethod.BANK_TRANSFER && (
                <div
                  className="flex flex-col items-center gap-3 py-4 px-4 rounded"
                  style={{
                    backgroundColor: "var(--color-bg)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    marginTop: "8px",
                  }}
                >
                  {qrUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrUrl}
                        alt="QR chuyển khoản"
                        style={{ width: 180, height: 180, objectFit: "contain", borderRadius: "var(--radius)" }}
                      />
                      <p className="text-xs text-center" style={{ color: "var(--color-text-muted)" }}>
                        Quét mã để thanh toán chuyển khoản
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-center py-2" style={{ color: "var(--color-text-subtle)" }}>
                      Chưa cài QR chuyển khoản — vào Cài đặt để tải lên
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delivery fields */}
          {orderType === OrderType.DELIVERY && (
            <div className="space-y-3" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
              {/* Phone field with customer autocomplete */}
              <div className="relative">
                <Input label="SĐT / Tên khách hàng" required placeholder="Nhập SĐT hoặc tên để tìm..."
                  value={deliveryForm.customerPhone}
                  autoComplete="off"
                  onChange={(e) => {
                    const val = e.target.value;
                    setDeliveryForm((f) => ({ ...f, customerPhone: val, customerId: "", customerName: "" }));
                    setCustomerLookup(null);
                    if (val.length >= 3) {
                      fetch(`/api/customers?q=${encodeURIComponent(val)}`)
                        .then((r) => r.json())
                        .then((r) => {
                          if (r.success) {
                            setCustomerSuggestions(r.data.slice(0, 6));
                            setShowSuggestions(r.data.length > 0);
                          }
                        });
                    } else {
                      setCustomerSuggestions([]);
                      setShowSuggestions(false);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => { if (customerSuggestions.length > 0) setShowSuggestions(true); }}
                />
                {showSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 mt-1 overflow-hidden"
                    style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)" }}>
                    {customerSuggestions.map((c) => (
                      <button key={c.id} type="button"
                        className="w-full text-left px-3 py-2 flex items-center justify-between text-sm transition-colors"
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                        onMouseDown={() => {
                          setDeliveryForm((f) => ({ ...f, customerPhone: c.phone, customerName: c.name, customerId: c.id }));
                          setCustomerLookup({ id: c.id, name: c.name });
                          setCustomerSuggestions([]);
                          setShowSuggestions(false);
                        }}>
                        <span className="font-medium" style={{ color: "var(--color-text)" }}>{c.name}</span>
                        <span style={{ color: "var(--color-text-muted)" }}>{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
                {customerLookup && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs" style={{ color: "var(--color-success)" }}>
                      Khách đã có: <strong>{customerLookup.name}</strong>
                    </p>
                    <button className="text-xs" style={{ color: "var(--color-text-subtle)" }}
                      onClick={() => {
                        setCustomerLookup(null);
                        setDeliveryForm((f) => ({ ...f, customerId: "", customerName: "", customerPhone: "" }));
                      }}>Xóa</button>
                  </div>
                )}
              </div>
              {/* Customer name – editable if new customer */}
              <Input label="Tên khách hàng" required
                value={deliveryForm.customerName}
                disabled={!!customerLookup}
                onChange={(e) => setDeliveryForm((f) => ({ ...f, customerName: e.target.value }))}
                placeholder={customerLookup ? customerLookup.name : "Nhập tên khách hàng mới"}
              />
              <Input label="Địa chỉ giao" required value={deliveryForm.deliveryAddress}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryAddress: e.target.value })} />
              {/* Employee select */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  Người giao hàng <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <select
                  className="text-sm px-3 h-9"
                  style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius)", backgroundColor: "var(--color-surface)", color: "var(--color-text)" }}
                  value={deliveryForm.employeeId}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, employeeId: e.target.value })}>
                  <option value="">Chọn nhân viên giao hàng</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
                {availableEmployees.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--color-warning)" }}>
                    Hiện không có nhân viên rảnh
                  </p>
                )}
              </div>
              <Input label="Ghi chú" value={deliveryForm.notes}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, notes: e.target.value })} />
            </div>
          )}
        </div>
      </Modal>

      {/* ── Complete Delivery Modal (history tab) ── */}
      <Modal
        open={deliverOpen}
        onClose={() => setDeliverOpen(false)}
        title="Xác nhận giao thành công"
        subtitle={selected ? `Đơn ${selected.orderCode}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeliverOpen(false)}>Hủy</Button>
            <Button loading={deliverSaving} onClick={handleDeliver} icon={<Truck size={14} />}>
              Xác nhận đã giao
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {deliverError && (
            <p className="text-sm p-2 rounded" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", borderRadius: "var(--radius)" }}>
              {deliverError}
            </p>
          )}
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Shipper mang tiền về với hình thức:</p>
          <div className="grid grid-cols-2 gap-3">
            {([PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER] as const).map((m) => (
              <button key={m} onClick={() => setDeliverPayment(m)}
                className="py-3 text-sm font-medium transition-colors"
                style={{
                  borderRadius: "var(--radius)",
                  border: `1px solid ${deliverPayment === m ? "var(--color-brand)" : "var(--color-border)"}`,
                  backgroundColor: deliverPayment === m ? "var(--color-brand-50)" : "var(--color-surface)",
                  color: deliverPayment === m ? "var(--color-brand-dark)" : "var(--color-text)",
                  transition: "border-color 0.15s, background-color 0.15s, transform 0.1s",
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = ""; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}>
                {PAYMENT_METHOD_LABEL[m]}
              </button>
            ))}
          </div>

          {deliverPayment === PaymentMethod.BANK_TRANSFER && qrUrl && (
            <div
              className="flex flex-col items-center gap-2 py-3"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR chuyển khoản"
                style={{ width: 160, height: 160, objectFit: "contain", borderRadius: "var(--radius)" }}
              />
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                QR chuyển khoản nhận tiền
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Hủy đơn giao hàng?"
        subtitle={cancelTarget ? `${cancelTarget.orderCode} – ${cancelTarget.customerName ?? ""}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancelOpen(false)}>Quay lại</Button>
            <Button variant="danger" loading={cancelSaving} icon={<Ban size={13} />} onClick={handleCancel}>
              Xác nhận hủy đơn
            </Button>
          </>
        }>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Đơn hàng sẽ bị hủy và hàng tồn kho sẽ được hoàn lại. Thao tác này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}

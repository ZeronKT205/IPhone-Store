# Flow Logic – Cửa Hàng Sửa Điện Thoại

> Tài liệu này mô tả luồng nghiệp vụ chi tiết của từng chức năng chính.  
> Mục tiêu: bất kỳ dev nào đọc xong cũng hiểu dữ liệu đi qua hệ thống như thế nào.

---

## 1. Đơn Sửa Chữa (RepairOrder)

### 1.1 Vòng đời đơn sửa chữa

```
[Tạo đơn]
    │
    ▼
 IN_PROGRESS ──────────────────────────────────────────┐
    │                                                    │
    ├── Sửa thông tin (tên, SĐT, mô tả, phí, BH dự kiến) │
    │                                                    │
    ├── Bấm "Hoàn thành" → CompleteModal                │
    │       │                                           │
    │       ├── Nhập repairFee (final)                  │
    │       ├── Chọn template bảo hành                  │
    │       │       • Không BH  → warrantyDurationDays = 0
    │       │       • 3 tháng   → 90 ngày               │
    │       │       • 6 tháng   → 180 ngày              │
    │       │       • 12 tháng  → 365 ngày              │
    │       │       • Tự chỉnh  → nhập số ngày          │
    │       └── POST /api/repair-orders/[id]/complete    │
    │                                                    │
    ▼                                                    │
 COMPLETED ◄──────────────────────────────────────────────┘
    │
    ├── [Nếu hasWarranty=true] → INSERT Warranty
    │       startDate  = completedAt
    │       expiryDate = completedAt + warrantyDurationDays
    │
    └── RepairOrder trở thành read-only (không sửa/xóa được)
```

### 1.2 Tạo đơn bảo hành (Warranty Claim)

Khi khách hàng quay lại bảo hành:

```
Tab "Bảo hành"
    │
    ├── Tìm kiếm bằng SĐT hoặc mã đơn
    │       GET /api/warranties/search?q={phone|orderCode}
    │       → Trả danh sách {repairOrderId, orderCode, customerName,
    │                        phone, expiryDate, isActive, description}
    │
    └── Bấm "Tạo đơn BH" trên đơn bảo hành còn hiệu lực
            │
            ▼
        POST /api/repair-orders
            body: {
              customerName,
              phoneNumber,
              description:      "Bảo hành: [mô tả gốc]",
              isWarrantyOrder:  true,
              originalOrderId:  repairOrder.id,
              repairFee:        0,
              warrantyMonths:   0
            }
            │
            ▼
        Đơn mới tạo với status = IN_PROGRESS
        Hiển thị badge "BH" màu xanh lá trên mã đơn
        orderCode tự động = SC-YYYYMMDD-###
```

### 1.3 Quy tắc bảo vệ trạng thái

| Hành động | IN_PROGRESS | COMPLETED |
|-----------|:-----------:|:---------:|
| PATCH info | ✅ | ❌ 403 |
| PATCH fee | ✅ | ❌ 403 |
| POST complete | ✅ | ❌ 403 |
| DELETE | ✅ | ❌ 403 |

---

## 2. Bán Hàng (SalesOrder)

### 2.1 Bán tại quầy (COUNTER)

```
POS Screen (tab "Bán hàng tại quầy")
    │
    ├── Chọn sản phẩm từ lưới → thêm vào giỏ
    │       stockQuantity hiển thị real-time
    │       Nếu hết hàng → card mờ, disabled
    │
    ├── Giỏ hàng:
    │       +/- số lượng (max = stockQuantity)
    │       Xóa từng item
    │       Xóa toàn bộ giỏ
    │
    ├── Chọn loại đơn:
    │       • COUNTER → thanh toán ngay
    │       • DELIVERY → tạo đơn giao hàng
    │
    └── Bấm "Thanh toán ngay" (COUNTER)
            │
            ▼
        CheckoutModal (Counter):
            - Chọn paymentMethod: CASH | BANK_TRANSFER
            - Nếu BANK_TRANSFER: hiển thị QR chuyển khoản
            - Hiển thị tóm tắt đơn + tổng tiền
            │
            ▼
        POST /api/sales-orders
            body: { orderType: COUNTER, items[], paymentMethod }
            │
            ▼
        Server:
            - Kiểm tra stockQuantity từng item
            - Tính totalAmount = Σ(quantity × sellingPrice)
            - INSERT SalesOrder { status: COUNTER_SALE, completedAt: now() }
            - INSERT SalesOrderItems (snapshot productName + unitPrice)
            - UPDATE product.stockQuantity -= quantity (mỗi item)
            │
            ▼
        status = COUNTER_SALE (kết thúc ngay, không thể thay đổi)
        Toast thành công: "✓ Đơn SO-... đã hoàn thành"
        Giỏ hàng tự động xóa, stock lưới cập nhật
```

### 2.2 Giao hàng (DELIVERY)

```
POS Screen
    └── Bấm "Tạo đơn giao hàng"
            │
            ▼
        CheckoutModal (Delivery):
            ├── Nhập SĐT khách → tự động gợi ý từ Customer DB
            │       GET /api/customers?q={phone} khi nhập ≥ 3 ký tự
            │       Chọn → tự điền tên + customerId
            ├── Tên khách hàng (auto-fill hoặc nhập tay)
            ├── Địa chỉ giao hàng [required]
            └── Chọn nhân viên giao
                    GET /api/employees?available=true
                    (chỉ nhân viên isActive=true && không có đơn PROCESSING nào)
            │
            ▼
        POST /api/sales-orders
            body: { orderType: DELIVERY, items[], customerName,
                    customerPhone, customerId?, deliveryAddress, employeeId }
            │
            ▼
        Server:
            - Kiểm tra employee tồn tại, isActive
            - Kiểm tra stock
            - INSERT SalesOrder { status: PROCESSING }
            - INSERT SalesOrderItems
            - UPDATE stockQuantity (trừ ngay khi tạo đơn)
            │
            ▼
        status = PROCESSING

Tab "Lịch sử đơn hàng" → Badge đỏ hiện số đơn đang giao
    │
    ├── Bấm "Hoàn thành" trên đơn PROCESSING
    │       PATCH /api/sales-orders/[id]/deliver
    │       body: { paymentMethod: CASH | BANK_TRANSFER }
    │       → status = DELIVERED, completedAt = now()
    │
    └── Bấm "Hủy" (ban icon) → ConfirmModal → Xác nhận
            PATCH /api/sales-orders/[id]/cancel
            → status = CANCELLED
            → stock HOÀN LẠI cho từng item trong đơn
```

### 2.3 Trạng thái SalesOrder

```
                 ┌─────────────────┐
  COUNTER ──────►│  COUNTER_SALE   │ (terminal)
                 └─────────────────┘

                 ┌─────────────────┐     deliver     ┌───────────┐
  DELIVERY ─────►│   PROCESSING    │────────────────►│ DELIVERED │ (terminal)
                 └─────────────────┘                 └───────────┘
                          │
                          │ cancel
                          ▼
                 ┌─────────────────┐
                 │   CANCELLED     │ (terminal, stock hoàn lại)
                 └─────────────────┘
```

---

## 3. Kho Hàng (Inventory)

### 3.1 Quản lý sản phẩm

```
Tạo sản phẩm:
    POST /api/products
    body: { name, categoryId, unit, costPrice?, sellingPrice, stockQuantity, lowStockThreshold }
    → stockQuantity ban đầu được đặt khi tạo

Nhập kho:
    PATCH /api/products/[id]/stock
    body: { quantity: số lượng nhập thêm }
    → product.stockQuantity += quantity

Bật/Tắt sản phẩm (eye icon):
    PATCH /api/products/[id]
    body: { isActive: !current }
    → isActive=false: sản phẩm ẩn khỏi POS, vẫn giữ trong DB
    → isActive=true: sản phẩm hiện lại trong POS

Cảnh báo tồn kho thấp:
    isLowStock = stockQuantity <= lowStockThreshold
    → Badge đỏ "Sắp hết" trên card sản phẩm trong POS
    → Banner cảnh báo ở trang Kho hàng
    → Ngưỡng cảnh báo mặc định: 5 (cấu hình tại Settings)
```

### 3.2 Quản lý danh mục

```
Category là bảng dynamic (người dùng tự tạo).
Một Category có nhiều Products.
Xóa Category chỉ được khi _count.products === 0.
```

### 3.3 Luồng stock khi đặt hàng / hủy hàng

```
Tạo SalesOrder (COUNTER hoặc DELIVERY):
    Foreach item in items:
        product.stockQuantity -= item.quantity

Hủy SalesOrder (CANCELLED):
    Foreach item in order.items:
        product.stockQuantity += item.quantity

Hoàn thành DELIVERY (DELIVERED):
    Stock không thay đổi (đã trừ lúc tạo đơn)

RepairOrder KHÔNG ảnh hưởng stock.
```

---

## 4. Bảo Hành (Warranty)

### 4.1 Tạo bảo hành

```
Warranty chỉ được tạo khi hoàn thành RepairOrder:

POST /api/repair-orders/[id]/complete
    body.hasWarranty = true
    body.warrantyDurationDays = N
    │
    ▼
INSERT Warranty {
    repairOrderId: order.id,
    startDate:     order.completedAt,
    expiryDate:    order.completedAt + N days,
    notes:         body.warrantyNotes
}
```

### 4.2 Trạng thái bảo hành

```
Warranty.isActive (computed, không lưu DB):
    isActive = expiryDate > now()

Hiển thị trong bảng RepairOrder:
    IN_PROGRESS + warrantyMonths > 0  → "Dự kiến BH Xm" (badge xanh dương)
    COMPLETED + warranty exists       → "BH đến DD/MM/YYYY" (badge xanh lá)
    COMPLETED + no warranty           → không hiển thị
```

### 4.3 Tìm kiếm bảo hành

```
GET /api/warranties/search?q={input}
    input có thể là: SĐT, tên khách, mã đơn (SC-...)
    
    WHERE: phoneNumber LIKE %q% 
        OR customerName LIKE %q%
        OR orderCode LIKE %q%
    
    Response mỗi record:
    {
      id:           repairOrder.id,
      orderCode:    "SC-20250501-001",
      customerName: "Nguyễn Văn A",
      phone:        "0901234567",
      description:  "Màn hình bị bể",
      startDate:    "2025-01-01",
      expiryDate:   "2025-07-01",
      isActive:     true,         // expiryDate > now()
      daysLeft:     45            // số ngày còn lại
    }
```

---

## 5. Khách Hàng (Customer)

### 5.1 Tạo và tra cứu

```
Khách hàng có thể tạo thủ công qua trang "Khách hàng"
hoặc tự động lưu khi tạo đơn giao hàng (nếu chọn từ gợi ý).

Customer.phone là unique index → không trùng SĐT.

Autocomplete khi tạo đơn giao hàng:
    Gõ SĐT ≥ 3 ký tự → debounce → GET /api/customers?q={phone}
    → Dropdown gợi ý (tên + SĐT)
    → Chọn → tự điền customerName, customerId vào form
    → SalesOrder.customerId = customer.id (liên kết)
```

### 5.2 Liên kết với SalesOrder

```
SalesOrder.customerId  → nullable FK
SalesOrder.customerName, customerPhone → lưu snapshot

Lý do lưu snapshot: nếu customer bị xóa hoặc đổi tên/SĐT,
lịch sử đơn hàng vẫn hiển thị đúng thông tin tại thời điểm đặt.
```

---

## 6. Nhân Viên (Employee)

### 6.1 Trạng thái hoạt động

```
Employee.isActive = true  → đang làm việc, có thể giao hàng
Employee.isActive = false → nghỉ việc, không xuất hiện trong danh sách giao hàng

Hiển thị trạng thái trong bảng nhân viên:
    isActive=false        → "Nghỉ việc" (grey)
    isActive=true + đang có đơn PROCESSING → "Đang giao hàng" (blue)
    isActive=true + không có đơn PROCESSING → "Hoạt động" (green)
```

### 6.2 Lọc nhân viên available

```
GET /api/employees?available=true

WHERE:
    isActive = true
    NOT EXISTS (SalesOrder WHERE employeeId = employee.id AND status = PROCESSING)

Dùng khi: chọn nhân viên giao hàng trong form tạo đơn delivery.
Tránh giao 2 đơn cho cùng 1 nhân viên đang bận.

_count.salesOrders (PROCESSING) cũng được trả về để hiển thị trạng thái.
```

---

## 7. Cài Đặt (Settings)

### 7.1 Lưu trữ

```
Settings không lưu vào SQLite mà ghi ra file JSON:
    data/settings.json

Fields:
    storeName:          Tên cửa hàng
    storePhone:         SĐT cửa hàng  
    storeAddress:       Địa chỉ
    storeHours:         Giờ làm việc
    lowStockThreshold:  Ngưỡng cảnh báo tồn kho

API:
    GET  /api/settings/store  → đọc file
    PATCH /api/settings/store → ghi đè file (merge với data cũ)
```

### 7.2 QR Chuyển khoản

```
Upload ảnh QR:
    POST /api/settings/qr (multipart/form-data)
    → Lưu vào public/qr.png (ghi đè nếu đã có)
    → Trả về URL công khai

Hiển thị QR:
    - Trang Cài đặt: xem trước
    - Modal checkout tại quầy: khi chọn BANK_TRANSFER
    - Modal xác nhận giao hàng: khi shipper thu chuyển khoản
```

### 7.3 Xuất dữ liệu Excel

```
GET /api/export?sheets={comma-separated}&from={date}&to={date}

sheets có thể là: repairs, sales, items, products, customers, employees
from/to: lọc theo createdAt (tuỳ chọn, bỏ trống = tất cả)

Trả về file .xlsx với mỗi sheet = một bảng dữ liệu.
Tên file: bao-cao-YYYY-MM-DD.xlsx
```

---

## 8. Dashboard

```
GET /api/dashboard

Trả về:
    todayRevenue:       Tổng tiền từ đơn COUNTER_SALE + DELIVERED hôm nay
    monthRevenue:       Tổng tiền tháng này
    pendingRepairs:     Số đơn sửa đang IN_PROGRESS
    processingOrders:   Số đơn giao đang PROCESSING
    lowStockCount:      Số sản phẩm stockQuantity <= lowStockThreshold
    recentRepairs:      5 đơn sửa mới nhất
    activeWarranties:   Số bảo hành còn hiệu lực
```

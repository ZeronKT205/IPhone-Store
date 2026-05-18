# Quy tắc đặt tên – Backend (Next.js / TypeScript)

> Tài liệu này là nguồn sự thật duy nhất cho convention đặt tên trong toàn bộ codebase.  
> Áp dụng cho: API routes, Prisma schema, TypeScript types, functions, constants, files & folders.

---

## 1. Quy tắc tổng quát

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| File / thư mục | `kebab-case` | `repair-order.ts`, `sales-order/` |
| TypeScript interface / type | `PascalCase` | `RepairOrder`, `SalesOrderItem` |
| TypeScript enum | `PascalCase` (tên) + `SCREAMING_SNAKE_CASE` (giá trị) | `RepairStatus.IN_PROGRESS` |
| Biến / tham số | `camelCase` | `repairOrder`, `customerName` |
| Hàm / method | `camelCase`, bắt đầu bằng động từ | `createRepairOrder`, `updateStock` |
| Hằng số / config | `SCREAMING_SNAKE_CASE` | `LOW_STOCK_THRESHOLD`, `ORDER_CODE_PREFIX` |
| Prisma model | `PascalCase`, số ít | `RepairOrder`, `Product` |
| Prisma field | `camelCase` | `repairFee`, `stockQuantity` |
| API route segment | `kebab-case`, số nhiều | `/api/repair-orders`, `/api/sales-orders` |
| Zod schema | `camelCase` + hậu tố `Schema` | `createRepairOrderSchema` |

---

## 2. Mapping thuật ngữ nghiệp vụ → code

### 2.1 Entity (Model)

| Nghiệp vụ (VI) | Tên trong code (EN) | Ghi chú |
|---------------|---------------------|---------|
| Đơn sửa chữa | `RepairOrder` | Mã SC-YYYYMMDD-001 |
| Bảo hành | `Warranty` | Gắn 1-1 với `RepairOrder` |
| Sản phẩm / Phụ kiện / Linh kiện | `Product` | Thuộc một `Category` |
| Danh mục sản phẩm | `Category` | VD: "Phụ kiện", "Linh kiện" |
| Đơn bán hàng | `SalesOrder` | Mã SO-YYYYMMDD-001 |
| Chi tiết đơn bán | `SalesOrderItem` | Bảng pivot, snapshot giá lúc bán |
| Khách hàng | `Customer` | Optional – gắn với SalesOrder |
| Nhân viên | `Employee` | Giao hàng, gắn với SalesOrder |

### 2.2 Field của RepairOrder

| Nghiệp vụ (VI) | Tên field | Kiểu |
|---------------|-----------|------|
| Mã đơn sửa | `orderCode` | `String` (VD: `SC-20250501-001`) |
| Tên khách hàng | `customerName` | `String` |
| Số điện thoại | `phoneNumber` | `String` |
| Mô tả lỗi / Ghi chú | `description` | `String` |
| Giá sửa chữa | `repairFee` | `Int` (VNĐ, không dùng float) |
| Bảo hành dự kiến | `warrantyMonths` | `Int` (default 0, tháng) |
| Trạng thái | `status` | `RepairStatus` enum |
| Ngày tiếp nhận | `createdAt` | `DateTime` (auto) |
| Ngày hoàn thành | `completedAt` | `DateTime?` (nullable) |
| Đơn bảo hành? | `isWarrantyOrder` | `Boolean` (default false) |
| Đơn gốc (nếu là BH) | `originalOrderId` | `String?` FK → `RepairOrder` |

### 2.3 Field của Warranty

| Nghiệp vụ (VI) | Tên field | Kiểu |
|---------------|-----------|------|
| FK đơn sửa | `repairOrderId` | `String` (unique FK) |
| Ngày bắt đầu BH | `startDate` | `DateTime` |
| Ngày hết hạn BH | `expiryDate` | `DateTime` |
| Ghi chú BH | `notes` | `String?` |

### 2.4 Field của Product

| Nghiệp vụ (VI) | Tên field | Kiểu |
|---------------|-----------|------|
| Tên sản phẩm | `name` | `String` |
| Danh mục | `categoryId` | `String` FK → `Category` |
| Đơn vị tính | `unit` | `String` (VD: "Cái", "Hộp") |
| Giá nhập | `costPrice` | `Int?` (nullable) |
| Giá bán | `sellingPrice` | `Int` |
| Tồn kho | `stockQuantity` | `Int` |
| Ngưỡng cảnh báo | `lowStockThreshold` | `Int` (default 5) |
| Đang bán? | `isActive` | `Boolean` (default true) |
| Ảnh | `image` | `String?` (đường dẫn file) |

### 2.5 Field của SalesOrder

| Nghiệp vụ (VI) | Tên field | Kiểu |
|---------------|-----------|------|
| Mã đơn bán | `orderCode` | `String` (VD: `SO-20250501-001`) |
| Hình thức | `orderType` | `OrderType` enum |
| Trạng thái | `status` | `SalesOrderStatus` enum |
| Tên khách (giao hàng) | `customerName` | `String?` |
| SĐT khách (giao hàng) | `customerPhone` | `String?` |
| Địa chỉ giao | `deliveryAddress` | `String?` |
| Người giao (legacy text) | `deliveryPerson` | `String?` |
| Ghi chú | `notes` | `String?` |
| Hình thức thanh toán | `paymentMethod` | `PaymentMethod?` enum |
| Tổng tiền | `totalAmount` | `Int` (tính từ items) |
| Ngày tạo | `createdAt` | `DateTime` (auto) |
| Ngày hoàn thành | `completedAt` | `DateTime?` |
| FK khách hàng | `customerId` | `String?` FK → `Customer` |
| FK nhân viên giao | `employeeId` | `String?` FK → `Employee` |

### 2.6 Field của SalesOrderItem

| Nghiệp vụ (VI) | Tên field | Kiểu |
|---------------|-----------|------|
| FK đơn hàng | `salesOrderId` | `String` FK → `SalesOrder` |
| FK sản phẩm | `productId` | `String` FK → `Product` |
| Tên sản phẩm (snapshot) | `productName` | `String` (lưu tên lúc bán, không join) |
| Số lượng | `quantity` | `Int` |
| Giá tại thời điểm bán | `unitPrice` | `Int` (snapshot giá bán lúc đặt) |

### 2.7 Field của Customer

| Nghiệp vụ (VI) | Tên field | Kiểu |
|---------------|-----------|------|
| Tên khách hàng | `name` | `String` |
| Số điện thoại | `phone` | `String` (unique) |
| Địa chỉ | `address` | `String?` |
| Ngày tạo | `createdAt` | `DateTime` (auto) |

### 2.8 Field của Employee

| Nghiệp vụ (VI) | Tên field | Kiểu |
|---------------|-----------|------|
| Tên nhân viên | `name` | `String` |
| Số điện thoại | `phone` | `String?` |
| Ngày sinh | `dateOfBirth` | `DateTime?` |
| Số CCCD | `cccd` | `String?` |
| Đang làm? | `isActive` | `Boolean` (default true) |
| Ngày tạo | `createdAt` | `DateTime` (auto) |

---

## 3. Enum

### RepairStatus
```
IN_PROGRESS   → "Đang sửa"
COMPLETED     → "Hoàn thành"
```

### SalesOrderStatus
```
COUNTER_SALE  → "Thành công" (bán tại quầy, kết thúc ngay)
PROCESSING    → "Đang giao"  (chờ shipper giao)
DELIVERED     → "Giao thành công"
CANCELLED     → "Đã hủy"
```

### OrderType
```
COUNTER       → "Bán tại quầy"
DELIVERY      → "Giao hàng"
```

### PaymentMethod
```
CASH          → "Tiền mặt"
BANK_TRANSFER → "Chuyển khoản"
```

> **Lưu ý:** Không còn enum `ProductCategory` — danh mục sản phẩm được quản lý trong bảng `Category` (dynamic, do người dùng tạo).

---

## 4. Cấu trúc file & thư mục thực tế

```
src/
├── app/
│   ├── (main)/                     # Layout có Sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── repair-orders/page.tsx
│   │   ├── warranty/page.tsx
│   │   ├── sales/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── employees/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── repair-orders/
│       │   └── [id]/
│       │       ├── route.ts          # GET, PATCH, DELETE
│       │       ├── complete/route.ts # POST → hoàn thành đơn
│       │       └── fee/route.ts      # PATCH → chỉnh phí (legacy)
│       ├── products/
│       │   └── [id]/
│       │       ├── route.ts          # GET, PATCH, DELETE
│       │       └── stock/route.ts    # PATCH → nhập kho
│       ├── sales-orders/
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── deliver/route.ts  # PATCH → xác nhận giao
│       │       └── cancel/route.ts   # PATCH → hủy đơn
│       ├── warranties/
│       │   ├── route.ts
│       │   └── search/route.ts       # GET → tra cứu BH
│       ├── categories/
│       │   └── [id]/route.ts
│       ├── customers/
│       │   └── [id]/route.ts
│       ├── employees/
│       │   └── [id]/route.ts
│       ├── dashboard/route.ts        # GET → thống kê tổng quan
│       ├── export/route.ts           # GET → xuất Excel (.xlsx)
│       └── settings/
│           ├── qr/route.ts           # GET, POST, DELETE ảnh QR
│           └── store/route.ts        # GET, PATCH thông tin cửa hàng
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       └── ExpandableText.tsx
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── order-code.ts                 # Sinh mã SC-..., SO-...
│   ├── format.ts                     # fmtDate, fmtCurrency
│   └── validations/
│       ├── repair-order.schema.ts
│       ├── product.schema.ts
│       ├── sales-order.schema.ts
│       └── customer.schema.ts
├── constants/
│   ├── enums.ts                      # Tất cả enum + label map
│   └── config.ts                     # ORDER_CODE_PREFIX, ...
└── data/
    └── settings.json                 # Cài đặt cửa hàng (persist local)
```

---

## 5. Quy tắc đặt tên function (API handlers)

### Động từ chuẩn

| Hành động | Động từ | Ví dụ |
|-----------|---------|-------|
| Lấy danh sách | `GET` route | `GET /api/repair-orders` |
| Lấy một bản ghi | `GET` route `[id]` | `GET /api/repair-orders/[id]` |
| Tạo mới | `POST` | `POST /api/repair-orders` |
| Cập nhật | `PATCH` | `PATCH /api/repair-orders/[id]` |
| Xóa | `DELETE` | `DELETE /api/repair-orders/[id]` |
| Hành động nghiệp vụ | `POST/PATCH` sub-route | `POST /api/repair-orders/[id]/complete` |
| Nhập kho | `PATCH` stock sub-route | `PATCH /api/products/[id]/stock` |
| Tìm kiếm | query param `q` | `GET /api/warranties/search?q=...` |

---

## 6. Quy tắc Response API

Mọi response từ API route đều theo cấu trúc chuẩn:

```typescript
// Thành công – danh sách có phân trang
{ success: true, data: { items: T[], total: number, page: number, pageSize: number } }

// Thành công – một object
{ success: true, data: T }

// Thất bại
{ success: false, error: string }
```

HTTP status codes:
- `200` — GET thành công
- `201` — POST tạo mới thành công
- `400` — Validation lỗi (Zod)
- `403` — Không được phép (VD: sửa đơn đã COMPLETED)
- `404` — Không tìm thấy
- `500` — Lỗi server

---

## 7. Business rules – RepairOrder

### 7.1 Quyền thao tác theo trạng thái

| Hành động | IN_PROGRESS | COMPLETED |
|-----------|:-----------:|:---------:|
| Sửa thông tin (tên, SĐT, mô tả) | ✅ | ❌ |
| Chỉnh `repairFee` | ✅ | ❌ |
| Đánh dấu hoàn thành | ✅ | ❌ |
| Xóa đơn | ✅ | ❌ |

Backend kiểm tra `status` trước mọi PATCH/DELETE — trả `403` nếu `COMPLETED`.

### 7.2 Flow hoàn thành đơn

```
Bấm "Hoàn thành" trên đơn IN_PROGRESS
  → Modal CompleteRepairOrder hiện ra:
      - Xác nhận repairFee                       [required, Int]
      - Chọn template bảo hành:
          Không BH | 3 tháng | 6 tháng | 12 tháng | Tự chỉnh
      - Nếu có BH: số ngày + ghi chú BH
  → POST /api/repair-orders/[id]/complete
  → Server: status → COMPLETED, completedAt = now()
  → Nếu hasWarranty: INSERT Warranty { startDate=now, expiryDate=now+days }
```

---

## 8. Business rules – SalesOrder

### 8.1 Bán tại quầy (COUNTER)

Khi tạo đơn `orderType=COUNTER`:
- `status` set ngay thành `COUNTER_SALE`
- `paymentMethod` required
- `totalAmount` = sum(quantity × sellingPrice)
- Stock của mỗi product bị trừ ngay lập tức

### 8.2 Giao hàng (DELIVERY)

| Status | Ý nghĩa | Hành động có thể |
|--------|---------|-----------------|
| `PROCESSING` | Đang chuẩn bị / shipper chưa giao | Xác nhận đã giao, Hủy đơn |
| `DELIVERED` | Giao thành công, đã thu tiền | — (không sửa) |
| `CANCELLED` | Đã hủy, stock được hoàn lại | — |

Khi `PATCH /deliver`: `status → DELIVERED`, `paymentMethod` ghi nhận, `completedAt = now()`.  
Khi `PATCH /cancel`: `status → CANCELLED`, stock của từng item được **hoàn lại**.

---

## 9. Mã đơn – Quy tắc sinh ID

| Module | Prefix | Ví dụ |
|--------|--------|-------|
| Đơn sửa chữa | `SC` | `SC-20250501-001` |
| Đơn bán hàng | `SO` | `SO-20250501-001` |

Format: `{PREFIX}-{YYYYMMDD}-{SEQ 3 chữ số, reset theo ngày}`

Sequence reset về `001` mỗi ngày mới. Nếu ngày có > 999 đơn → `SC-20250501-1000`.

ID nội bộ (primary key Prisma) dùng `cuid()`.

-- ════════════════════════════════════════════════════════════════
--  DUO TECH – Quản lý Sửa Điện Thoại
--  Supabase / PostgreSQL  –  Schema + Seed
--
--  Cách dùng:
--    1. Mở Supabase → SQL Editor
--    2. Paste toàn bộ nội dung file này rồi bấm Run
--    3. Nếu muốn chạy lại từ đầu: chạy phần "Dọn dẹp" ở cuối file trước
-- ════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────
-- 1.  ENUM TYPES
-- ────────────────────────────────────────────────────────────────

CREATE TYPE "RepairStatus"     AS ENUM ('IN_PROGRESS', 'COMPLETED');
CREATE TYPE "OrderType"        AS ENUM ('COUNTER', 'DELIVERY');
CREATE TYPE "SalesOrderStatus" AS ENUM ('COUNTER_SALE', 'PROCESSING', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentMethod"    AS ENUM ('CASH', 'BANK_TRANSFER');


-- ────────────────────────────────────────────────────────────────
-- 2.  TABLES  (thứ tự tôn trọng FK)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE "Category" (
  "id"   TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "Customer" (
  "id"        TEXT        PRIMARY KEY,
  "name"      TEXT        NOT NULL,
  "phone"     TEXT        NOT NULL UNIQUE,
  "address"   TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Employee" (
  "id"          TEXT        PRIMARY KEY,
  "name"        TEXT        NOT NULL,
  "phone"       TEXT,
  "dateOfBirth" TIMESTAMPTZ,
  "cccd"        TEXT,
  "isActive"    BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Product" (
  "id"                TEXT        PRIMARY KEY,
  "name"              TEXT        NOT NULL,
  "categoryId"        TEXT        NOT NULL REFERENCES "Category"("id"),
  "unit"              TEXT        NOT NULL,
  "image"             TEXT,
  "costPrice"         INTEGER,
  "sellingPrice"      INTEGER     NOT NULL,
  "stockQuantity"     INTEGER     NOT NULL DEFAULT 0,
  "lowStockThreshold" INTEGER     NOT NULL DEFAULT 5,
  "isActive"          BOOLEAN     NOT NULL DEFAULT TRUE,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Self-referencing: warrant order trỏ về đơn sửa gốc
CREATE TABLE "RepairOrder" (
  "id"              TEXT           PRIMARY KEY,
  "orderCode"       TEXT           NOT NULL UNIQUE,
  "customerName"    TEXT           NOT NULL,
  "phoneNumber"     TEXT           NOT NULL,
  "description"     TEXT           NOT NULL,
  "repairFee"       INTEGER        NOT NULL DEFAULT 0,
  "warrantyMonths"  INTEGER        NOT NULL DEFAULT 0,
  "status"          "RepairStatus" NOT NULL DEFAULT 'IN_PROGRESS',
  "isWarrantyOrder" BOOLEAN        NOT NULL DEFAULT FALSE,
  "originalOrderId" TEXT           REFERENCES "RepairOrder"("id"),
  "createdAt"       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "completedAt"     TIMESTAMPTZ
);

CREATE TABLE "Warranty" (
  "id"            TEXT        PRIMARY KEY,
  "repairOrderId" TEXT        NOT NULL UNIQUE REFERENCES "RepairOrder"("id"),
  "startDate"     TIMESTAMPTZ NOT NULL,
  "expiryDate"    TIMESTAMPTZ NOT NULL,
  "notes"         TEXT
);

CREATE TABLE "SalesOrder" (
  "id"              TEXT                PRIMARY KEY,
  "orderCode"       TEXT                NOT NULL UNIQUE,
  "orderType"       "OrderType"         NOT NULL,
  "status"          "SalesOrderStatus"  NOT NULL,
  "customerName"    TEXT,
  "customerPhone"   TEXT,
  "deliveryAddress" TEXT,
  "deliveryPerson"  TEXT,
  "notes"           TEXT,
  "paymentMethod"   "PaymentMethod",
  "totalAmount"     INTEGER             NOT NULL DEFAULT 0,
  "customerId"      TEXT                REFERENCES "Customer"("id"),
  "employeeId"      TEXT                REFERENCES "Employee"("id"),
  "createdAt"       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "completedAt"     TIMESTAMPTZ
);

CREATE TABLE "SalesOrderItem" (
  "id"           TEXT    PRIMARY KEY,
  "salesOrderId" TEXT    NOT NULL REFERENCES "SalesOrder"("id"),
  "productId"    TEXT    NOT NULL REFERENCES "Product"("id"),
  "productName"  TEXT    NOT NULL,   -- snapshot tại thời điểm bán
  "quantity"     INTEGER NOT NULL,
  "unitPrice"    INTEGER NOT NULL    -- snapshot tại thời điểm bán
);


-- ────────────────────────────────────────────────────────────────
-- 3.  INDEXES
-- ────────────────────────────────────────────────────────────────

CREATE INDEX ON "RepairOrder" ("phoneNumber");
CREATE INDEX ON "RepairOrder" ("status");
CREATE INDEX ON "RepairOrder" ("createdAt");
CREATE INDEX ON "Product"     ("isActive");
CREATE INDEX ON "Product"     ("stockQuantity");
CREATE INDEX ON "SalesOrder"  ("status");
CREATE INDEX ON "SalesOrder"  ("orderType");
CREATE INDEX ON "SalesOrder"  ("createdAt");
CREATE INDEX ON "Customer"    ("phone");


-- ────────────────────────────────────────────────────────────────
-- 4.  TRIGGER – tự động cập nhật Product.updatedAt
--     (Prisma xử lý phía client; trigger này bảo vệ khi dùng raw SQL)
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION _set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER product_set_updated_at
  BEFORE UPDATE ON "Product"
  FOR EACH ROW EXECUTE FUNCTION _set_updated_at();


-- ════════════════════════════════════════════════════════════════
--  SEED DATA  –  dữ liệu mẫu thực tế
-- ════════════════════════════════════════════════════════════════


-- ── Categories ───────────────────────────────────────────────────
INSERT INTO "Category" ("id", "name") VALUES
  ('cat1', 'Phụ kiện'),
  ('cat2', 'Linh kiện'),
  ('cat3', 'Điện thoại cũ');


-- ── Customers ────────────────────────────────────────────────────
INSERT INTO "Customer" ("id", "name", "phone", "address", "createdAt") VALUES
  ('cust1', 'Nguyễn Văn An',  '0901234567', '12 Lê Lợi, Q.1, TP.HCM',            '2025-01-10 08:00:00+07'),
  ('cust2', 'Trần Thị Bình',  '0912345678', '45 Nguyễn Trãi, Q.5, TP.HCM',        '2025-01-15 09:30:00+07'),
  ('cust3', 'Lê Văn Cường',   '0923456789', '8 Hai Bà Trưng, Q.3, TP.HCM',        '2025-02-02 10:00:00+07'),
  ('cust4', 'Phạm Thị Dung',  '0934567890', '33 Đinh Tiên Hoàng, Bình Thạnh',     '2025-02-20 14:00:00+07'),
  ('cust5', 'Hoàng Văn Em',   '0945678901', '17 Cách Mạng Tháng 8, Q.3, TP.HCM', '2025-03-05 11:00:00+07');


-- ── Employees ────────────────────────────────────────────────────
INSERT INTO "Employee" ("id", "name", "phone", "dateOfBirth", "cccd", "isActive", "createdAt") VALUES
  ('emp1', 'Nguyễn Thị Lan', '0971234567', '1998-05-12 00:00:00+07', '079098001234', TRUE, '2024-06-01 08:00:00+07'),
  ('emp2', 'Trần Văn Minh',  '0982345678', '1995-09-23 00:00:00+07', '079095005678', TRUE, '2024-06-01 08:00:00+07');


-- ── Products ─────────────────────────────────────────────────────
-- stockQuantity phản ánh trạng thái sau tất cả đơn hàng bên dưới:
--   prod1: 42 – 1 (so1) = 41
--   prod2: 88 – 1 (so1) = 87
--   prod3: 65 – 1 (so2) = 64
--   prod4: 18 – 1 (so3) = 17
--   prod5:  8 – 1 (so4, đang giao) = 7
--   prod6: 12 – 1 (so5) + 1 (hủy, hoàn kho) = 12
--   prod7:  5, chưa có đơn
--   prod8:  2 – 1 (so6) = 1
INSERT INTO "Product"
  ("id", "name", "categoryId", "unit", "costPrice", "sellingPrice",
   "stockQuantity", "lowStockThreshold", "isActive", "createdAt", "updatedAt") VALUES
  ('prod1', 'Ốp lưng iPhone 14',          'cat1', 'Cái',   85000,   150000,  41, 10, TRUE, '2025-01-05 08:00:00+07', '2025-01-05 08:00:00+07'),
  ('prod2', 'Cáp sạc Type-C 1m',          'cat1', 'Cái',   30000,    60000,  87,  8, TRUE, '2025-01-05 08:00:00+07', '2025-01-05 08:00:00+07'),
  ('prod3', 'Kính cường lực iPhone 14',   'cat1', 'Cái',   20000,    45000,  64, 10, TRUE, '2025-01-05 08:00:00+07', '2025-01-05 08:00:00+07'),
  ('prod4', 'Tai nghe Bluetooth TWS',     'cat1', 'Cái',  150000,   280000,  17,  5, TRUE, '2025-01-05 08:00:00+07', '2025-01-05 08:00:00+07'),
  ('prod5', 'Màn hình iPhone 11 (zin)',   'cat2', 'Cái',  400000,   650000,   7,  3, TRUE, '2025-01-10 08:00:00+07', '2025-01-10 08:00:00+07'),
  ('prod6', 'Pin iPhone 12 (zin)',        'cat2', 'Cái',  250000,   420000,  12,  3, TRUE, '2025-01-10 08:00:00+07', '2025-01-10 08:00:00+07'),
  ('prod7', 'IC sạc không dây iPhone',   'cat2', 'Cái',  180000,   350000,   5,  2, TRUE, '2025-01-10 08:00:00+07', '2025-01-10 08:00:00+07'),
  ('prod8', 'Samsung Galaxy A34 (99%)',  'cat3', 'Cái', 4500000,  5800000,   1,  1, TRUE, '2025-02-01 08:00:00+07', '2025-02-01 08:00:00+07');


-- ── RepairOrders ──────────────────────────────────────────────────
-- ro1 COMPLETED  – màn hình iPhone 13  → có bảo hành 6 tháng
-- ro2 COMPLETED  – IC sạc Samsung S22  → có bảo hành 3 tháng
-- ro3 IN_PROGRESS – camera iPhone 14
-- ro4 IN_PROGRESS – màn hình Oppo A74 rớt nước
-- ro5 COMPLETED  – đơn bảo hành từ ro1 (cảm ứng lại)
-- ro6 IN_PROGRESS – jack cắm Xiaomi 12
INSERT INTO "RepairOrder"
  ("id", "orderCode", "customerName", "phoneNumber", "description",
   "repairFee", "warrantyMonths", "status", "isWarrantyOrder", "originalOrderId",
   "createdAt", "completedAt") VALUES
  ('ro1', 'SC-20250401-001', 'Nguyễn Văn An', '0901234567',
    'iPhone 13 vỡ màn hình, cảm ứng không nhận',
    650000, 6, 'COMPLETED', FALSE, NULL,
    '2025-04-01 09:00:00+07', '2025-04-03 16:30:00+07'),

  ('ro2', 'SC-20250401-002', 'Trần Thị Bình', '0912345678',
    'Samsung S22 không nhận sạc – chết IC sạc không dây',
    320000, 3, 'COMPLETED', FALSE, NULL,
    '2025-04-01 14:00:00+07', '2025-04-02 11:00:00+07'),

  ('ro3', 'SC-20250415-003', 'Lê Văn Cường', '0923456789',
    'iPhone 14 Pro camera sau bị mờ, lấy nét kém sau khi rơi',
    0, 0, 'IN_PROGRESS', FALSE, NULL,
    '2025-04-15 10:30:00+07', NULL),

  ('ro4', 'SC-20250501-004', 'Phạm Thị Dung', '0934567890',
    'Oppo A74 màn hình đen sau khi rớt nước – cần kiểm tra bo mạch',
    0, 0, 'IN_PROGRESS', FALSE, NULL,
    '2025-05-01 08:45:00+07', NULL),

  ('ro5', 'SC-20250503-005', 'Nguyễn Văn An', '0901234567',
    '[Bảo hành] iPhone 13 – màn hình lại bị lệch cảm ứng góc dưới',
    0, 0, 'COMPLETED', TRUE, 'ro1',
    '2025-05-03 10:00:00+07', '2025-05-05 15:00:00+07'),

  ('ro6', 'SC-20250510-006', 'Hoàng Văn Em', '0945678901',
    'Xiaomi 12 hư jack cắm tai nghe 3.5mm, hở kết nối',
    0, 0, 'IN_PROGRESS', FALSE, NULL,
    '2025-05-10 13:00:00+07', NULL);


-- ── Warranties ────────────────────────────────────────────────────
-- Chỉ tạo Warranty record khi RepairOrder COMPLETED có warrantyMonths > 0
-- war3 là bảo hành lại từ đơn bảo hành ro5 (1 tháng)
INSERT INTO "Warranty" ("id", "repairOrderId", "startDate", "expiryDate", "notes") VALUES
  ('war1', 'ro1',
    '2025-04-03 16:30:00+07',
    '2025-10-03 16:30:00+07',
    'Bảo hành 6 tháng linh kiện màn hình iPhone 13 zin'),

  ('war2', 'ro2',
    '2025-04-02 11:00:00+07',
    '2025-07-02 11:00:00+07',
    'Bảo hành 3 tháng IC sạc – không bảo hành hỏng do nước'),

  ('war3', 'ro5',
    '2025-05-05 15:00:00+07',
    '2025-06-05 15:00:00+07',
    'Bảo hành lại 1 tháng theo chính sách đơn bảo hành');


-- ── SalesOrders ───────────────────────────────────────────────────
-- so1 COUNTER COUNTER_SALE  – mua ốp + cáp
-- so2 COUNTER COUNTER_SALE  – mua kính cường lực
-- so3 DELIVERY DELIVERED    – tai nghe giao cho cust1, nhân viên emp1
-- so4 DELIVERY PROCESSING   – màn hình iPhone đang giao cho cust2, emp2
-- so5 DELIVERY CANCELLED    – pin iPhone bị hủy (kho đã được hoàn trả)
-- so6 COUNTER COUNTER_SALE  – bán Samsung cũ
INSERT INTO "SalesOrder"
  ("id", "orderCode", "orderType", "status",
   "customerName", "customerPhone", "deliveryAddress",
   "paymentMethod", "totalAmount",
   "customerId", "employeeId", "createdAt", "completedAt") VALUES
  ('so1', 'SO-20250401-001', 'COUNTER',  'COUNTER_SALE',
    NULL, NULL, NULL,
    'CASH', 210000,
    NULL, NULL, '2025-04-01 10:00:00+07', '2025-04-01 10:00:00+07'),

  ('so2', 'SO-20250410-002', 'COUNTER',  'COUNTER_SALE',
    NULL, NULL, NULL,
    'BANK_TRANSFER', 45000,
    NULL, NULL, '2025-04-10 15:30:00+07', '2025-04-10 15:30:00+07'),

  ('so3', 'SO-20250415-003', 'DELIVERY', 'DELIVERED',
    'Nguyễn Văn An', '0901234567', '12 Lê Lợi, Q.1, TP.HCM',
    'BANK_TRANSFER', 280000,
    'cust1', 'emp1', '2025-04-15 09:00:00+07', '2025-04-17 14:00:00+07'),

  ('so4', 'SO-20250501-004', 'DELIVERY', 'PROCESSING',
    'Trần Thị Bình', '0912345678', '45 Nguyễn Trãi, Q.5, TP.HCM',
    NULL, 650000,
    'cust2', 'emp2', '2025-05-01 10:00:00+07', NULL),

  ('so5', 'SO-20250505-005', 'DELIVERY', 'CANCELLED',
    'Lê Văn Cường', '0923456789', '8 Hai Bà Trưng, Q.3, TP.HCM',
    NULL, 420000,
    'cust3', 'emp1', '2025-05-05 11:00:00+07', NULL),

  ('so6', 'SO-20250510-006', 'COUNTER',  'COUNTER_SALE',
    NULL, NULL, NULL,
    'CASH', 5800000,
    NULL, NULL, '2025-05-10 14:00:00+07', '2025-05-10 14:00:00+07');


-- ── SalesOrderItems ───────────────────────────────────────────────
-- unitPrice là snapshot lúc bán – không thay đổi kể cả khi Product.sellingPrice đổi sau
INSERT INTO "SalesOrderItem"
  ("id", "salesOrderId", "productId", "productName", "quantity", "unitPrice") VALUES
  -- so1: ốp lưng + cáp  →  150000 + 60000 = 210000
  ('soi1', 'so1', 'prod1', 'Ốp lưng iPhone 14',       1, 150000),
  ('soi2', 'so1', 'prod2', 'Cáp sạc Type-C 1m',        1,  60000),

  -- so2: kính cường lực  →  45000
  ('soi3', 'so2', 'prod3', 'Kính cường lực iPhone 14', 1,  45000),

  -- so3: tai nghe (giao thành công)  →  280000
  ('soi4', 'so3', 'prod4', 'Tai nghe Bluetooth TWS',   1, 280000),

  -- so4: màn hình (đang giao, chưa thu tiền)  →  650000
  ('soi5', 'so4', 'prod5', 'Màn hình iPhone 11 (zin)', 1, 650000),

  -- so5: pin (đã hủy – kho đã hoàn 1 cái)  →  420000
  ('soi6', 'so5', 'prod6', 'Pin iPhone 12 (zin)',      1, 420000),

  -- so6: Samsung cũ  →  5800000
  ('soi7', 'so6', 'prod8', 'Samsung Galaxy A34 (99%)', 1, 5800000);


-- ════════════════════════════════════════════════════════════════
--  DỌN DẸP  –  chạy phần này để reset hoàn toàn (DROP ALL)
--  Bỏ comment và chạy riêng khi cần
-- ════════════════════════════════════════════════════════════════

/*
DROP TABLE IF EXISTS "SalesOrderItem" CASCADE;
DROP TABLE IF EXISTS "SalesOrder"     CASCADE;
DROP TABLE IF EXISTS "Warranty"       CASCADE;
DROP TABLE IF EXISTS "RepairOrder"    CASCADE;
DROP TABLE IF EXISTS "Product"        CASCADE;
DROP TABLE IF EXISTS "Category"       CASCADE;
DROP TABLE IF EXISTS "Customer"       CASCADE;
DROP TABLE IF EXISTS "Employee"       CASCADE;
DROP FUNCTION IF EXISTS _set_updated_at CASCADE;
DROP TYPE IF EXISTS "RepairStatus"     CASCADE;
DROP TYPE IF EXISTS "OrderType"        CASCADE;
DROP TYPE IF EXISTS "SalesOrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod"    CASCADE;
*/

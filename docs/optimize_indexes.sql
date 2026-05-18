-- =========================================================================
-- OPTIMIZE INDEXES FOR PHONE STORE DB
-- Paste this script into Supabase SQL Editor to apply advanced optimizations.
-- =========================================================================

-- 1. Enable pg_trgm extension for fast LIKE / ILIKE / contains searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Index for Warranty expiryDate (optimizes Dashboard & Reports count queries)
CREATE INDEX IF NOT EXISTS "Warranty_expiryDate_idx" 
  ON "Warranty" ("expiryDate");

-- 3. Trigram (GIN) indexes for RepairOrder search columns (customerName, phoneNumber, orderCode)
-- Optimizes "LIKE %q%" searches inside /api/repair-orders
CREATE INDEX IF NOT EXISTS "RepairOrder_customerName_trgm_idx" 
  ON "RepairOrder" USING gin ("customerName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "RepairOrder_phoneNumber_trgm_idx" 
  ON "RepairOrder" USING gin ("phoneNumber" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "RepairOrder_orderCode_trgm_idx" 
  ON "RepairOrder" USING gin ("orderCode" gin_trgm_ops);

-- 4. Trigram (GIN) indexes for SalesOrder search columns (customerName, customerPhone, orderCode)
-- Optimizes "LIKE %q%" searches inside /api/sales-orders
CREATE INDEX IF NOT EXISTS "SalesOrder_customerName_trgm_idx" 
  ON "SalesOrder" USING gin ("customerName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "SalesOrder_customerPhone_trgm_idx" 
  ON "SalesOrder" USING gin ("customerPhone" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "SalesOrder_orderCode_trgm_idx" 
  ON "SalesOrder" USING gin ("orderCode" gin_trgm_ops);

-- 5. Foreign Key B-Tree Index for Customer (phone)
CREATE INDEX IF NOT EXISTS "Customer_phone_idx" 
  ON "Customer" ("phone");

-- 6. Verify GIN indexes can be used
ANALYZE "RepairOrder";
ANALYZE "SalesOrder";
ANALYZE "Warranty";

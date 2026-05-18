-- =====================================================
-- Performance indexes — paste vào Supabase SQL Editor
-- =====================================================

-- RepairOrder: composite index cho queries theo status + completedAt
CREATE INDEX CONCURRENTLY IF NOT EXISTS "RepairOrder_status_completedAt_idx"
  ON "RepairOrder" ("status", "completedAt");

-- RepairOrder: index riêng completedAt cho range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "RepairOrder_completedAt_idx"
  ON "RepairOrder" ("completedAt");

-- SalesOrder: composite index cho queries theo status + completedAt
CREATE INDEX CONCURRENTLY IF NOT EXISTS "SalesOrder_status_completedAt_idx"
  ON "SalesOrder" ("status", "completedAt");

-- SalesOrder: index riêng completedAt cho range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "SalesOrder_completedAt_idx"
  ON "SalesOrder" ("completedAt");

-- SalesOrder: FK indexes cho JOINs
CREATE INDEX CONCURRENTLY IF NOT EXISTS "SalesOrder_employeeId_idx"
  ON "SalesOrder" ("employeeId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "SalesOrder_customerId_idx"
  ON "SalesOrder" ("customerId");

-- SalesOrderItem: FK indexes cho JOINs
CREATE INDEX CONCURRENTLY IF NOT EXISTS "SalesOrderItem_salesOrderId_idx"
  ON "SalesOrderItem" ("salesOrderId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "SalesOrderItem_productId_idx"
  ON "SalesOrderItem" ("productId");

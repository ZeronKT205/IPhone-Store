export enum RepairStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export enum SalesOrderStatus {
  COUNTER_SALE = "COUNTER_SALE",
  PROCESSING = "PROCESSING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum OrderType {
  COUNTER = "COUNTER",
  DELIVERY = "DELIVERY",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export const REPAIR_STATUS_LABEL: Record<RepairStatus, string> = {
  [RepairStatus.IN_PROGRESS]: "Đang sửa",
  [RepairStatus.COMPLETED]: "Hoàn thành",
};

export const SALES_ORDER_STATUS_LABEL: Record<SalesOrderStatus, string> = {
  [SalesOrderStatus.COUNTER_SALE]: "Thành công",
  [SalesOrderStatus.PROCESSING]: "Đang giao",
  [SalesOrderStatus.DELIVERED]: "Giao thành công",
  [SalesOrderStatus.CANCELLED]: "Đã hủy",
};

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  [OrderType.COUNTER]: "Bán tại quầy",
  [OrderType.DELIVERY]: "Giao hàng",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Tiền mặt",
  [PaymentMethod.BANK_TRANSFER]: "Chuyển khoản",
};


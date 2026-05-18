import { OrderType, PaymentMethod, SalesOrderStatus } from "@/constants/enums";

export type SalesOrderItem = {
  id: string;
  salesOrderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type SalesOrder = {
  id: string;
  orderCode: string;
  orderType: OrderType;
  status: SalesOrderStatus;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  deliveryPerson: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod | null;
  totalAmount: number;
  createdAt: Date;
  completedAt: Date | null;
  items: SalesOrderItem[];
};

export type CreateSalesOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateCounterSaleInput = {
  items: CreateSalesOrderItemInput[];
  notes?: string;
};

export type CreateDeliveryOrderInput = {
  items: CreateSalesOrderItemInput[];
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryPerson: string;
  notes?: string;
};

export type CompleteDeliveryInput = {
  paymentMethod: PaymentMethod;
};

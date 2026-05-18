import { z } from "zod";
import { PaymentMethod } from "@/constants/enums";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive("Số lượng phải > 0"),
});

export const createCounterSaleSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cần ít nhất 1 sản phẩm"),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  notes: z.string().optional(),
});

export const createDeliveryOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cần ít nhất 1 sản phẩm"),
  // Customer: customerId nếu chọn khách có sẵn, hoặc nhập thủ công
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  customerPhone: z.preprocess(
    (v) => typeof v === "string" ? v.replace(/[\s\-\.]/g, "") : v,
    z.string().min(10, "SĐT không hợp lệ").max(11, "SĐT không hợp lệ").regex(/^[0-9]+$/, "SĐT không hợp lệ")
  ),
  deliveryAddress: z.string().min(1, "Vui lòng nhập địa chỉ giao"),
  // Employee
  employeeId: z.string().min(1, "Vui lòng chọn người giao hàng"),
  notes: z.string().optional(),
});

export const completeDeliverySchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
});

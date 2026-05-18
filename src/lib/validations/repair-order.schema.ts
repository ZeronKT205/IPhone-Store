import { z } from "zod";

export const createRepairOrderSchema = z.object({
  customerName: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  phoneNumber: z.preprocess(
    (v) => typeof v === "string" ? v.replace(/[\s\-\.]/g, "") : v,
    z.string().min(10, "Số điện thoại không hợp lệ").max(11).regex(/^[0-9]+$/, "Số điện thoại chỉ gồm chữ số")
  ),
  description: z.string().min(1, "Vui lòng mô tả lỗi máy"),
  repairFee: z.number().int().nonnegative().optional().default(0),
  warrantyMonths: z.number().int().nonnegative().optional().default(0),
  isWarrantyOrder: z.boolean().optional().default(false),
  originalOrderId: z.string().optional(),
});

export const updateRepairOrderSchema = z.object({
  customerName: z.string().min(1).optional(),
  phoneNumber: z.string().min(10).max(11).regex(/^[0-9]+$/).optional(),
  description: z.string().min(1).optional(),
  warrantyMonths: z.number().int().nonnegative().optional(),
});

export const updateRepairFeeSchema = z.object({
  repairFee: z.number().int().nonnegative("Giá sửa phải >= 0"),
});

export const completeRepairOrderSchema = z.object({
  repairFee: z.number().int().nonnegative("Giá sửa phải >= 0"),
  hasWarranty: z.boolean(),
  warrantyDurationDays: z.number().int().positive().optional(),
  warrantyNotes: z.string().optional(),
}).refine(
  (d) => !d.hasWarranty || (d.hasWarranty && d.warrantyDurationDays),
  { message: "Vui lòng nhập thời hạn bảo hành", path: ["warrantyDurationDays"] }
);

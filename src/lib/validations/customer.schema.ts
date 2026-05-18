import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  phone: z.preprocess(
    (v) => typeof v === "string" ? v.replace(/[\s\-\.]/g, "") : v,
    z.string().min(10, "SĐT không hợp lệ").max(11, "SĐT không hợp lệ").regex(/^[0-9]+$/, "SĐT không hợp lệ")
  ),
  address: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

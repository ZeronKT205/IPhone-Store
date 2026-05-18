import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên sản phẩm"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  unit: z.string().min(1, "Vui lòng nhập đơn vị"),
  image: z.string().optional(),
  costPrice: z.number().int().nonnegative().optional(),
  sellingPrice: z.number().int().positive("Giá bán phải > 0"),
  stockQuantity: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
});

export const updateProductSchema = createProductSchema.partial();

export const addStockSchema = z.object({
  quantity: z.number().int().positive("Số lượng nhập phải > 0"),
});

export type ProductCategory = { id: string; name: string };

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  category: ProductCategory;
  unit: string;
  image?: string | null;
  costPrice: number | null;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductInput = {
  name: string;
  categoryId: string;
  unit: string;
  costPrice?: number;
  sellingPrice: number;
  stockQuantity: number;
  lowStockThreshold?: number;
};

export type UpdateProductInput = Partial<
  Pick<Product, "name" | "categoryId" | "unit" | "costPrice" | "sellingPrice" | "lowStockThreshold" | "isActive">
>;

export type AddStockInput = {
  productId: string;
  quantity: number;
};

export type LowStockAlert = {
  productId: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
};

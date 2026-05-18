export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export type PaginatedData<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type DateRange = {
  from: Date;
  to: Date;
};

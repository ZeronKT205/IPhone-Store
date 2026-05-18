import { RepairStatus } from "@/constants/enums";

export type RepairOrder = {
  id: string;
  orderCode: string;
  customerName: string;
  phoneNumber: string;
  description: string;
  repairFee: number;
  status: RepairStatus;
  isWarrantyOrder: boolean;
  originalOrderId: string | null;
  createdAt: Date;
  completedAt: Date | null;
  warranty: Warranty | null;
};

export type Warranty = {
  id: string;
  repairOrderId: string;
  startDate: Date;
  expiryDate: Date;
  notes: string | null;
};

export type CreateRepairOrderInput = {
  customerName: string;
  phoneNumber: string;
  description: string;
  repairFee?: number;
};

// Chỉ áp dụng khi status === IN_PROGRESS.
// Không bao gồm repairFee — muốn chỉnh giá phải dùng UpdateRepairFeeInput.
// Khi status === COMPLETED, API từ chối mọi request chỉnh sửa.
export type UpdateRepairOrderInput = Partial<
  Pick<RepairOrder, "customerName" | "phoneNumber" | "description">
>;

// Chỉnh giá trước khi hoàn thành — chỉ hợp lệ khi status === IN_PROGRESS.
export type UpdateRepairFeeInput = {
  repairFee: number;
};

// Payload của form xác nhận khi bấm nút "Đánh dấu hoàn thành".
// Gửi lên POST /api/repair-orders/[id]/complete.
// Sau khi gọi thành công: status → COMPLETED, repairFee và warranty được ghi nhận,
// mọi chỉnh sửa tiếp theo (kể cả repairFee) đều bị từ chối.
export type CompleteRepairOrderInput = {
  repairFee: number;
  hasWarranty: boolean;
  warrantyDurationDays?: number;
  warrantyNotes?: string;
};

export type WarrantySearchResult = {
  orderCode: string;
  customerName: string;
  description: string;
  completedAt: Date;
  expiryDate: Date;
  isActive: boolean;
};

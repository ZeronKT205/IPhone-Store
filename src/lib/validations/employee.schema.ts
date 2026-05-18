import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên nhân viên"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(), // ISO date string
  cccd: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

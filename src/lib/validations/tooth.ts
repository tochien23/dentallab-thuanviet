import { z } from "zod";

/**
 * Schema tạo / cập nhật chi tiết răng
 */
export const toothFormSchema = z.object({
  treatment_id: z.string().uuid("Vui lòng chọn ca điều trị"),
  tooth_number: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số răng (theo chuẩn FDI, VD: 11, 21, 46)")
    .max(10, "Số răng không hợp lệ"),
  jaw: z.enum(["upper", "lower"], {
    errorMap: () => ({ message: "Vui lòng chọn hàm trên hoặc hàm dưới" }),
  }),
  material: z
    .string()
    .trim()
    .min(2, "Chất liệu răng sứ phải có ít nhất 2 ký tự")
    .max(100, "Chất liệu không quá 100 ký tự"),
  brand: z
    .string()
    .trim()
    .min(2, "Thương hiệu phôi sứ phải có ít nhất 2 ký tự")
    .max(100, "Thương hiệu không quá 100 ký tự"),
  shade: z
    .string()
    .trim()
    .max(20, "Mã màu răng không quá 20 ký tự")
    .optional()
    .nullable()
    .or(z.literal("")),
  notes: z.string().max(1000, "Ghi chú không quá 1000 ký tự").optional().nullable().or(z.literal("")),
});

export type ToothFormValues = z.infer<typeof toothFormSchema>;

import { z } from "zod";

/**
 * Schema xác thực khi tìm kiếm thẻ bảo hành
 */
export const warrantySearchSchema = z.object({
  searchQuery: z
    .string()
    .trim()
    .min(3, "Mã bảo hành hoặc mã QR phải có ít nhất 3 ký tự")
    .max(100, "Mã tìm kiếm quá dài"),
});

export type WarrantySearchInput = z.infer<typeof warrantySearchSchema>;

/**
 * Schema tạo mới / chỉnh sửa thẻ bảo hành (Dành cho Quản trị viên)
 */
export const warrantyFormSchema = z.object({
  warranty_code: z
    .string()
    .trim()
    .min(3, "Mã bảo hành phải có ít nhất 3 ký tự")
    .max(50, "Mã bảo hành không được vượt quá 50 ký tự")
    .regex(/^[A-Za-z0-9\-_]+$/, "Mã bảo hành chỉ chứa chữ cái, số, dấu gạch ngang hoặc gạch dưới"),
  patient_id: z.string().uuid("Vui lòng chọn khách hàng hợp lệ"),
  treatment_id: z.string().uuid("Vui lòng chọn ca điều trị hợp lệ"),
  tooth_id: z.string().uuid("Vị trí răng không hợp lệ").optional().nullable(),
  product_name: z
    .string()
    .trim()
    .min(2, "Tên dòng sản phẩm răng sứ phải có ít nhất 2 ký tự")
    .max(150, "Tên dòng sản phẩm không được vượt quá 150 ký tự"),
  brand: z
    .string()
    .trim()
    .min(2, "Thương hiệu phải có ít nhất 2 ký tự")
    .max(100, "Thương hiệu không được vượt quá 100 ký tự"),
  warranty_period_months: z
    .number({ invalid_type_error: "Thời hạn bảo hành phải là số" })
    .int("Thời hạn phải là số nguyên")
    .positive("Thời hạn bảo hành phải lớn hơn 0 tháng")
    .max(360, "Thời hạn bảo hành tối đa là 30 năm (360 tháng)"),
  activated_at: z.string().min(1, "Vui lòng chọn ngày kích hoạt"),
  status: z.enum(["pending", "active", "expired", "suspended", "cancelled"], {
    errorMap: () => ({ message: "Trạng thái bảo hành không hợp lệ" }),
  }),
  public_note: z.string().max(1000, "Ghi chú công khai không quá 1000 ký tự").optional().nullable(),
});

export type WarrantyFormValues = z.infer<typeof warrantyFormSchema>;

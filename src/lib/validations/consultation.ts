import { z } from "zod";

/**
 * Schema xác thực form đăng ký tư vấn
 * Sử dụng Zod v4 API
 */
export const consultationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(150, "Họ tên không được vượt quá 150 ký tự"),
  phone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .max(15, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\-\s()]+$/, "Số điện thoại chỉ chứa chữ số và ký tự +, -, (, )"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .max(255, "Email quá dài")
    .optional()
    .or(z.literal("")),
  service: z
    .string()
    .min(1, "Vui lòng chọn dịch vụ quan tâm"),
  message: z
    .string()
    .max(1000, "Nội dung không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>;
export type ConsultationFormValues = ConsultationFormData;

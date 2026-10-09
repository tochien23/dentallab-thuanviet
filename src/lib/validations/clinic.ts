import { z } from "zod";

/**
 * Schema tạo / cập nhật thông tin phòng khám & lab
 */
export const clinicFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên phòng khám / Lab phải có ít nhất 2 ký tự")
    .max(200, "Tên không quá 200 ký tự"),
  address: z
    .string()
    .trim()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  phone: z
    .string()
    .trim()
    .min(9, "Số điện thoại không hợp lệ")
    .max(20, "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .max(255, "Email quá dài")
    .optional()
    .nullable()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type ClinicFormValues = z.infer<typeof clinicFormSchema>;

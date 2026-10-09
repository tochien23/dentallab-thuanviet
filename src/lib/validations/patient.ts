import { z } from "zod";

/**
 * Schema tạo / cập nhật hồ sơ bệnh nhân
 */
export const patientFormSchema = z.object({
  patient_code: z
    .string()
    .trim()
    .min(3, "Mã bệnh nhân phải có ít nhất 3 ký tự")
    .max(50, "Mã bệnh nhân không được vượt quá 50 ký tự"),
  full_name: z
    .string()
    .trim()
    .min(2, "Họ và tên bệnh nhân phải có ít nhất 2 ký tự")
    .max(150, "Họ tên không được vượt quá 150 ký tự"),
  phone: z
    .string()
    .trim()
    .min(9, "Số điện thoại không hợp lệ")
    .max(20, "Số điện thoại không hợp lệ")
    .regex(/^[0-9+\-\s()]+$/, "Số điện thoại chỉ chứa chữ số và ký tự +, -, (, )"),
  email: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .max(255, "Email quá dài")
    .optional()
    .nullable()
    .or(z.literal("")),
  date_of_birth: z
    .string()
    .optional()
    .nullable()
    .or(z.literal("")),
  gender: z
    .enum(["male", "female", "other"], {
      errorMap: () => ({ message: "Giới tính không hợp lệ" }),
    })
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(2000, "Ghi chú không được vượt quá 2000 ký tự")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

import { z } from "zod";

/**
 * Schema tạo / cập nhật ca điều trị phục hình
 */
export const treatmentFormSchema = z.object({
  case_code: z
    .string()
    .trim()
    .min(3, "Mã hồ sơ ca phải có ít nhất 3 ký tự")
    .max(50, "Mã hồ sơ ca không quá 50 ký tự"),
  patient_id: z.string().uuid("Vui lòng chọn bệnh nhân"),
  clinic_id: z.string().uuid("Vui lòng chọn phòng khám"),
  dentist_name: z
    .string()
    .trim()
    .min(2, "Tên bác sĩ phải có ít nhất 2 ký tự")
    .max(150, "Tên bác sĩ không quá 150 ký tự"),
  treatment_date: z.string().min(1, "Vui lòng chọn ngày điều trị"),
  notes: z.string().max(2000, "Ghi chú không quá 2000 ký tự").optional().nullable().or(z.literal("")),
});

export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;

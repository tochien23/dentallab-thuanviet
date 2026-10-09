/**
 * TypeScript definitions cho Database Supabase / PostgreSQL
 * Dental Warranty Portal (SmileLab Dental)
 */

export type UserRole = "admin" | "staff" | "technician";
export type Gender = "male" | "female" | "other";
export type JawType = "upper" | "lower";
export type WarrantyStatus = "pending" | "active" | "expired" | "suspended" | "cancelled";
export type ConsultationStatus = "new" | "contacted" | "resolved" | "cancelled";

export interface Profile {
  id: string; // references auth.users(id)
  full_name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  patient_code: string;
  full_name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Treatment {
  id: string;
  case_code: string;
  patient_id: string;
  clinic_id: string;
  dentist_name: string;
  treatment_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tooth {
  id: string;
  treatment_id: string;
  tooth_number: string;
  jaw: JawType;
  material: string;
  brand: string;
  shade: string | null;
  notes: string | null;
  created_at: string;
}

export interface Warranty {
  id: string;
  warranty_code: string;
  qr_token: string;
  patient_id: string;
  treatment_id: string;
  tooth_id: string | null;
  product_name: string;
  brand: string;
  warranty_period_months: number;
  activated_at: string;
  expires_at: string;
  status: WarrantyStatus;
  public_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarrantyLog {
  id: string;
  warranty_id: string;
  action: string;
  description: string;
  created_by: string | null;
  created_at: string;
}

export interface ConsultationRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  service: string;
  message: string | null;
  status: ConsultationStatus;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Kết quả trả về từ hàm Stored Procedure RPC tra cứu công khai: get_public_warranty_info
 * Tuyệt đối không chứa thông tin riêng tư (số điện thoại, email, địa chỉ, bệnh án)
 */
export interface PublicWarrantyResult {
  warranty_code: string;
  product_name: string;
  brand: string;
  tooth_number: string | null;
  jaw: JawType | null;
  material: string | null;
  shade: string | null;
  clinic_name: string | null;
  activated_at: string;
  expires_at: string;
  status: WarrantyStatus;
  effective_status: "active" | "expired" | "suspended" | "cancelled" | "pending";
  public_note: string | null;
  masked_patient_name: string | null;
}

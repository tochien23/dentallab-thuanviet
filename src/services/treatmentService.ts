import { getDbClient } from "./dbHelper";
import { Treatment, Patient, Clinic } from "@/types/database.types";
import { TreatmentFormValues } from "@/lib/validations/treatment";
import { MOCK_TREATMENTS, MOCK_PATIENTS, MOCK_CLINICS } from "./mockData";

export interface TreatmentWithDetails extends Treatment {
  patient?: Patient;
  clinic?: Clinic;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder-project"));
}

let localTreatments: Treatment[] = [...MOCK_TREATMENTS];

export const treatmentService = {
  /**
   * Lấy danh sách ca điều trị kèm thông tin bệnh nhân và phòng khám
   */
  async getAllTreatments(query?: string): Promise<TreatmentWithDetails[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        let queryBuilder = supabase
          .from("treatments")
          .select("*, patient:patients(*), clinic:clinics(*)")
          .order("treatment_date", { ascending: false });

        if (query && query.trim()) {
          const q = `%${query.trim()}%`;
          queryBuilder = queryBuilder.or(`case_code.ilike.${q},dentist_name.ilike.${q}`);
        }

        const { data, error } = await queryBuilder;
        if (!error && data) {
          return data as TreatmentWithDetails[];
        }
      } catch (err) {
        console.warn("[treatmentService] Lỗi khi lấy danh sách ca điều trị từ Supabase:", err);
      }
    }

    // Mock search with relations
    let result = localTreatments.map((t) => ({
      ...t,
      patient: MOCK_PATIENTS.find((p) => p.id === t.patient_id),
      clinic: MOCK_CLINICS.find((c) => c.id === t.clinic_id),
    }));

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.case_code.toLowerCase().includes(q) ||
          t.dentist_name.toLowerCase().includes(q) ||
          t.patient?.full_name.toLowerCase().includes(q)
      );
    }

    return result;
  },

  /**
   * Lấy chi tiết ca điều trị
   */
  async getTreatmentById(id: string): Promise<TreatmentWithDetails | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("treatments")
          .select("*, patient:patients(*), clinic:clinics(*)")
          .eq("id", id)
          .single();

        if (!error && data) {
          return data as TreatmentWithDetails;
        }
      } catch (err) {
        console.warn("[treatmentService] Lỗi khi lấy thông tin ca điều trị:", err);
      }
    }

    const t = localTreatments.find((item) => item.id === id);
    if (!t) return null;

    return {
      ...t,
      patient: MOCK_PATIENTS.find((p) => p.id === t.patient_id),
      clinic: MOCK_CLINICS.find((c) => c.id === t.clinic_id),
    };
  },

  /**
   * Tạo ca điều trị mới
   */
  async createTreatment(
    values: TreatmentFormValues
  ): Promise<{ success: boolean; data?: Treatment; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("treatments")
          .insert(values)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data: data as Treatment };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi lưu ca điều trị";
        return { success: false, error: message };
      }
    }

    const exists = localTreatments.some(
      (t) => t.case_code.toLowerCase() === values.case_code.toLowerCase()
    );
    if (exists) {
      return { success: false, error: "Mã ca điều trị này đã tồn tại." };
    }

    const newTreatment: Treatment = {
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      case_code: values.case_code,
      patient_id: values.patient_id,
      clinic_id: values.clinic_id,
      dentist_name: values.dentist_name,
      treatment_date: values.treatment_date,
      notes: values.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localTreatments = [newTreatment, ...localTreatments];
    return { success: true, data: newTreatment };
  },

  /**
   * Cập nhật ca điều trị
   */
  async updateTreatment(
    id: string,
    values: TreatmentFormValues
  ): Promise<{ success: boolean; data?: Treatment; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("treatments")
          .update(values)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data: data as Treatment };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật ca điều trị";
        return { success: false, error: message };
      }
    }

    const index = localTreatments.findIndex((t) => t.id === id);
    if (index === -1) {
      return { success: false, error: "Không tìm thấy ca điều trị cần cập nhật." };
    }

    const updated: Treatment = {
      ...localTreatments[index],
      ...values,
      notes: values.notes || null,
      updated_at: new Date().toISOString(),
    };

    localTreatments[index] = updated;
    return { success: true, data: updated };
  },

  /**
   * Xóa ca điều trị
   */
  async deleteTreatment(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { error } = await supabase.from("treatments").delete().eq("id", id);
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi xóa ca điều trị";
        return { success: false, error: message };
      }
    }

    localTreatments = localTreatments.filter((t) => t.id !== id);
    return { success: true };
  },
};

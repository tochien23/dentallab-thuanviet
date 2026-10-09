import { getDbClient } from "./dbHelper";
import { Patient } from "@/types/database.types";
import { PatientFormValues } from "@/lib/validations/patient";
import { MOCK_PATIENTS } from "./mockData";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder-project"));
}

// In-memory list cho mock mode để hỗ trợ các thao tác CRUD ngay tức thì khi offline
let localPatients: Patient[] = [...MOCK_PATIENTS];

export const patientService = {
  /**
   * Lấy danh sách bệnh nhân với tìm kiếm theo tên, sđt hoặc mã bệnh nhân
   */
  async getAllPatients(query?: string): Promise<Patient[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        let queryBuilder = supabase
          .from("patients")
          .select("*")
          .order("created_at", { ascending: false });

        if (query && query.trim()) {
          const q = `%${query.trim()}%`;
          queryBuilder = queryBuilder.or(
            `full_name.ilike.${q},phone.ilike.${q},patient_code.ilike.${q}`
          );
        }

        const { data, error } = await queryBuilder;
        if (!error && data) {
          return data as Patient[];
        }
      } catch (err) {
        console.warn("[patientService] Lỗi khi lấy danh sách bệnh nhân từ Supabase:", err);
      }
    }

    // Mock search
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      return localPatients.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.patient_code.toLowerCase().includes(q)
      );
    }

    return [...localPatients];
  },

  /**
   * Lấy chi tiết bệnh nhân theo ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("patients")
          .select("*")
          .eq("id", id)
          .single();

        if (!error && data) {
          return data as Patient;
        }
      } catch (err) {
        console.warn("[patientService] Lỗi khi lấy thông tin bệnh nhân:", err);
      }
    }

    return localPatients.find((p) => p.id === id) || null;
  },

  /**
   * Tạo mới hồ sơ bệnh nhân
   */
  async createPatient(
    values: PatientFormValues
  ): Promise<{ success: boolean; data?: Patient; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("patients")
          .insert(values)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data: data as Patient };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi lưu bệnh nhân";
        return { success: false, error: message };
      }
    }

    // Kiểm tra trùng mã bệnh nhân trong local
    const exists = localPatients.some(
      (p) => p.patient_code.toLowerCase() === values.patient_code.toLowerCase()
    );
    if (exists) {
      return { success: false, error: "Mã bệnh nhân này đã tồn tại trong hệ thống." };
    }

    const mockNew: Patient = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      patient_code: values.patient_code,
      full_name: values.full_name,
      phone: values.phone,
      email: values.email || null,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender || null,
      notes: values.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localPatients = [mockNew, ...localPatients];
    return { success: true, data: mockNew };
  },

  /**
   * Cập nhật thông tin bệnh nhân
   */
  async updatePatient(
    id: string,
    values: PatientFormValues
  ): Promise<{ success: boolean; data?: Patient; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("patients")
          .update(values)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data: data as Patient };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật bệnh nhân";
        return { success: false, error: message };
      }
    }

    const index = localPatients.findIndex((p) => p.id === id);
    if (index === -1) {
      return { success: false, error: "Không tìm thấy hồ sơ bệnh nhân cần sửa." };
    }

    const updated: Patient = {
      ...localPatients[index],
      ...values,
      email: values.email || null,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender || null,
      notes: values.notes || null,
      updated_at: new Date().toISOString(),
    };

    localPatients[index] = updated;
    return { success: true, data: updated };
  },

  /**
   * Xóa bệnh nhân
   */
  async deletePatient(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { error } = await supabase.from("patients").delete().eq("id", id);
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi xóa bệnh nhân";
        return { success: false, error: message };
      }
    }

    localPatients = localPatients.filter((p) => p.id !== id);
    return { success: true };
  },
};

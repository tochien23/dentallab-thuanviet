import { createClient } from "@/lib/supabase/client";
import { getDbClient } from "./dbHelper";
import { ConsultationRequest, ConsultationStatus } from "@/types/database.types";
import { ConsultationFormValues } from "@/lib/validations/consultation";
import { MOCK_CONSULTATIONS } from "./mockData";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder-project"));
}

let localConsultations: ConsultationRequest[] = [...MOCK_CONSULTATIONS];

export const consultationService = {
  /**
   * Tạo yêu cầu tư vấn mới từ landing page
   */
  async createConsultation(
    values: ConsultationFormValues
  ): Promise<{ success: boolean; data?: ConsultationRequest; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const newPayload = {
          full_name: values.fullName,
          phone: values.phone,
          email: values.email || null,
          service: values.service,
          message: values.message || null,
          status: "new" as const,
        };

        const { error } = await supabase
          .from("consultation_requests")
          .insert([newPayload]);

        if (error) {
          return { success: false, error: error.message };
        }

        return {
          success: true,
          data: {
            id: `c-${Date.now()}`,
            ...newPayload,
            internal_note: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
        return { success: false, error: message };
      }
    }

    const mockNew: ConsultationRequest = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      full_name: values.fullName,
      phone: values.phone,
      email: values.email || null,
      service: values.service,
      message: values.message || null,
      status: "new",
      internal_note: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localConsultations = [mockNew, ...localConsultations];
    return { success: true, data: mockNew };
  },

  async submitConsultation(
    values: ConsultationFormValues
  ): Promise<{ success: boolean; data?: ConsultationRequest; error?: string }> {
    return consultationService.createConsultation(values);
  },

  /**
   * Lấy danh sách toàn bộ yêu cầu tư vấn cho Quản trị viên
   */
  async getAllConsultations(
    statusFilter?: string,
    query?: string
  ): Promise<ConsultationRequest[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        let queryBuilder = supabase
          .from("consultation_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (statusFilter && statusFilter !== "all") {
          queryBuilder = queryBuilder.eq("status", statusFilter);
        }

        if (query && query.trim()) {
          const q = `%${query.trim()}%`;
          queryBuilder = queryBuilder.or(
            `full_name.ilike.${q},phone.ilike.${q},service.ilike.${q}`
          );
        }

        const { data, error } = await queryBuilder;
        if (!error && data) {
          return data as ConsultationRequest[];
        }
      } catch (err) {
        console.warn("[consultationService] Lỗi khi lấy danh sách tư vấn:", err);
      }
    }

    let result = [...localConsultations];

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.service.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      );
    }

    return result;
  },

  /**
   * Cập nhật trạng thái và ghi chú nội bộ cho yêu cầu tư vấn
   */
  async updateConsultation(
    id: string,
    status: ConsultationStatus,
    internalNote?: string | null
  ): Promise<{ success: boolean; data?: ConsultationRequest; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("consultation_requests")
          .update({
            status,
            internal_note: internalNote,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data: data as ConsultationRequest };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật tư vấn";
        return { success: false, error: message };
      }
    }

    const index = localConsultations.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, error: "Không tìm thấy yêu cầu tư vấn." };
    }

    const updated: ConsultationRequest = {
      ...localConsultations[index],
      status,
      internal_note: internalNote !== undefined ? internalNote : localConsultations[index].internal_note,
      updated_at: new Date().toISOString(),
    };

    localConsultations[index] = updated;
    return { success: true, data: updated };
  },

  /**
   * Xóa yêu cầu tư vấn
   */
  async deleteConsultation(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { error } = await supabase
          .from("consultation_requests")
          .delete()
          .eq("id", id);

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi xóa yêu cầu tư vấn";
        return { success: false, error: message };
      }
    }

    localConsultations = localConsultations.filter((c) => c.id !== id);
    return { success: true };
  },
};

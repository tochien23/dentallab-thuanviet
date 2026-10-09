import { getDbClient } from "./dbHelper";
import { Tooth, Treatment } from "@/types/database.types";
import { ToothFormValues } from "@/lib/validations/tooth";
import { MOCK_TEETH, MOCK_TREATMENTS } from "./mockData";

export interface ToothWithTreatment extends Tooth {
  treatment?: Treatment;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder-project"));
}

let localTeeth: Tooth[] = [...MOCK_TEETH];

export const toothService = {
  /**
   * Lấy danh sách chi tiết răng, có thể lọc theo treatmentId hoặc tìm kiếm
   */
  async getAllTeeth(treatmentId?: string, query?: string): Promise<ToothWithTreatment[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        let queryBuilder = supabase
          .from("teeth")
          .select("*, treatment:treatments(*)")
          .order("created_at", { ascending: false });

        if (treatmentId) {
          queryBuilder = queryBuilder.eq("treatment_id", treatmentId);
        }

        const { data, error } = await queryBuilder;
        if (!error && data) {
          return data as ToothWithTreatment[];
        }
      } catch (err) {
        console.warn("[toothService] Lỗi khi lấy danh sách răng từ Supabase:", err);
      }
    }

    let result = localTeeth.map((tooth) => ({
      ...tooth,
      treatment: MOCK_TREATMENTS.find((t) => t.id === tooth.treatment_id),
    }));

    if (treatmentId) {
      result = result.filter((t) => t.treatment_id === treatmentId);
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.tooth_number.toLowerCase().includes(q) ||
          t.material.toLowerCase().includes(q) ||
          t.brand.toLowerCase().includes(q) ||
          (t.shade && t.shade.toLowerCase().includes(q)) ||
          (t.treatment && t.treatment.case_code.toLowerCase().includes(q))
      );
    }

    return result;
  },

  /**
   * Lấy chi tiết răng theo ID
   */
  async getToothById(id: string): Promise<ToothWithTreatment | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("teeth")
          .select("*, treatment:treatments(*)")
          .eq("id", id)
          .single();

        if (!error && data) {
          return data as ToothWithTreatment;
        }
      } catch (err) {
        console.warn("[toothService] Lỗi lấy chi tiết răng:", err);
      }
    }

    const t = localTeeth.find((tooth) => tooth.id === id);
    if (!t) return null;

    return {
      ...t,
      treatment: MOCK_TREATMENTS.find((item) => item.id === t.treatment_id),
    };
  },

  /**
   * Tạo chi tiết răng mới
   */
  async createTooth(
    values: ToothFormValues
  ): Promise<{ success: boolean; data?: Tooth; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("teeth")
          .insert(values)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data: data as Tooth };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi lưu chi tiết răng";
        return { success: false, error: message };
      }
    }

    const newTooth: Tooth = {
      id: `tooth-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      treatment_id: values.treatment_id,
      tooth_number: values.tooth_number,
      jaw: values.jaw,
      material: values.material,
      brand: values.brand,
      shade: values.shade || null,
      notes: values.notes || null,
      created_at: new Date().toISOString(),
    };

    localTeeth = [newTooth, ...localTeeth];
    return { success: true, data: newTooth };
  },

  /**
   * Cập nhật chi tiết răng
   */
  async updateTooth(
    id: string,
    values: ToothFormValues
  ): Promise<{ success: boolean; data?: Tooth; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("teeth")
          .update(values)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, data: data as Tooth };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật răng";
        return { success: false, error: message };
      }
    }

    const index = localTeeth.findIndex((t) => t.id === id);
    if (index === -1) {
      return { success: false, error: "Không tìm thấy chi tiết răng cần sửa." };
    }

    const updated: Tooth = {
      ...localTeeth[index],
      ...values,
      shade: values.shade || null,
      notes: values.notes || null,
    };

    localTeeth[index] = updated;
    return { success: true, data: updated };
  },

  /**
   * Xóa chi tiết răng
   */
  async deleteTooth(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { error } = await supabase.from("teeth").delete().eq("id", id);
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi xóa chi tiết răng";
        return { success: false, error: message };
      }
    }

    localTeeth = localTeeth.filter((t) => t.id !== id);
    return { success: true };
  },
};

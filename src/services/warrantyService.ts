import { createClient } from "@/lib/supabase/client";
import { getDbClient } from "./dbHelper";
import {
  PublicWarrantyResult,
  Warranty,
  WarrantyLog,
  WarrantyStatus,
  Patient,
  Treatment,
  Tooth,
} from "@/types/database.types";
import { WarrantyFormValues } from "@/lib/validations/warranty";
import {
  MOCK_PUBLIC_WARRANTIES,
  MOCK_WARRANTIES,
  MOCK_WARRANTY_LOGS,
  MOCK_PATIENTS,
  MOCK_TREATMENTS,
  MOCK_TEETH,
} from "./mockData";

export interface WarrantyWithDetails extends Warranty {
  patient?: Patient;
  treatment?: Treatment;
  tooth?: Tooth;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder-project"));
}

function isValidUUID(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

let localWarranties: Warranty[] = [...MOCK_WARRANTIES];
let localWarrantyLogs: WarrantyLog[] = [...MOCK_WARRANTY_LOGS];

export const warrantyService = {
  /**
   * Tra cứu công khai (RPC) cho bệnh nhân & khách hàng
   */
  async searchPublicWarranty(query: string): Promise<PublicWarrantyResult | null> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return null;

    if (isSupabaseConfigured()) {
      // 1. Thử gọi RPC get_public_warranty_info
      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("get_public_warranty_info", {
          p_search_query: cleanQuery,
        });

        if (!error && data && data.length > 0) {
          return data[0] as PublicWarrantyResult;
        }
      } catch (err) {
        console.warn("[warrantyService] Ngoại lệ tra cứu Supabase RPC:", err);
      }

      // 2. Dự phòng phía Client: Gọi API Route nội bộ
      if (typeof window !== "undefined") {
        try {
          const res = await fetch(`/api/public/warranty?code=${encodeURIComponent(cleanQuery)}`);
          if (res.ok) {
            const json = await res.json();
            return (json.data as PublicWarrantyResult) || null;
          }
        } catch (apiErr) {
          console.warn("[warrantyService] Lỗi gọi API /api/public/warranty:", apiErr);
        }
      }

      // 3. Dự phòng phía Server: Truy vấn trực tiếp qua createAdminClient
      if (typeof window === "undefined") {
        try {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const admin = createAdminClient();
          const { data: w } = await admin
            .from("warranties")
            .select(`
              warranty_code,
              product_name,
              brand,
              activated_at,
              expires_at,
              status,
              public_note,
              patient:patients(full_name),
              tooth:teeth(tooth_number, jaw, material, shade),
              treatment:treatments(clinic:clinics(name))
            `)
            .or(`warranty_code.ilike.${cleanQuery},qr_token.ilike.${cleanQuery}`)
            .limit(1)
            .maybeSingle();

          if (w) {
            const rawName = (w.patient as { full_name?: string } | null)?.full_name || "";
            const maskedName = rawName ? rawName.replace(/(\S)\S+/g, "$1***") : null;
            const isExpired = new Date() > new Date(w.expires_at);
            let effectiveStatus: "active" | "expired" | "suspended" | "cancelled" | "pending" = "active";
            if (w.status === "suspended") effectiveStatus = "suspended";
            else if (w.status === "cancelled") effectiveStatus = "cancelled";
            else if (w.status === "pending") effectiveStatus = "pending";
            else if (isExpired) effectiveStatus = "expired";
            else effectiveStatus = "active";

            const toothInfo = w.tooth as {
              tooth_number?: string;
              jaw?: "upper" | "lower";
              material?: string;
              shade?: string;
            } | null;

            const treatmentInfo = w.treatment as { clinic?: { name?: string } } | null;

            return {
              warranty_code: w.warranty_code,
              product_name: w.product_name,
              brand: w.brand,
              tooth_number: toothInfo?.tooth_number || null,
              jaw: toothInfo?.jaw || null,
              material: toothInfo?.material || null,
              shade: toothInfo?.shade || null,
              clinic_name: treatmentInfo?.clinic?.name || null,
              activated_at: w.activated_at,
              expires_at: w.expires_at,
              status: w.status,
              effective_status: effectiveStatus,
              public_note: w.public_note || null,
              masked_patient_name: maskedName,
            };
          }
          return null;
        } catch (serverErr) {
          console.warn("[warrantyService] Server fallback query error:", serverErr);
        }
      }
    }

    const normalized = cleanQuery.toLowerCase();
    const mock = MOCK_PUBLIC_WARRANTIES.find(
      (w) => w.warranty_code.toLowerCase() === normalized
    );

    return mock || null;
  },

  /**
   * Lấy danh sách toàn bộ thẻ bảo hành cho trang Quản trị (Admin)
   */
  async getAllWarranties(
    query?: string,
    statusFilter?: string
  ): Promise<WarrantyWithDetails[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        let queryBuilder = supabase
          .from("warranties")
          .select("*, patient:patients(*), treatment:treatments(*), tooth:teeth(*)")
          .order("created_at", { ascending: false });

        if (statusFilter && statusFilter !== "all") {
          queryBuilder = queryBuilder.eq("status", statusFilter);
        }

        if (query && query.trim()) {
          const q = `%${query.trim()}%`;
          queryBuilder = queryBuilder.or(
            `warranty_code.ilike.${q},product_name.ilike.${q},brand.ilike.${q}`
          );
        }

        const { data, error } = await queryBuilder;
        if (!error && data) {
          return data as WarrantyWithDetails[];
        }
      } catch (err) {
        console.warn("[warrantyService] Lỗi khi lấy danh sách bảo hành:", err);
      }
    }

    let result = localWarranties.map((w) => ({
      ...w,
      patient: MOCK_PATIENTS.find((p) => p.id === w.patient_id),
      treatment: MOCK_TREATMENTS.find((t) => t.id === w.treatment_id),
      tooth: MOCK_TEETH.find((th) => th.id === w.tooth_id),
    }));

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((w) => w.status === statusFilter);
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.warranty_code.toLowerCase().includes(q) ||
          w.product_name.toLowerCase().includes(q) ||
          w.brand.toLowerCase().includes(q) ||
          (w.patient && w.patient.full_name.toLowerCase().includes(q))
      );
    }

    return result;
  },

  /**
   * Lấy chi tiết 1 thẻ bảo hành
   */
  async getWarrantyById(id: string): Promise<WarrantyWithDetails | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data, error } = await supabase
          .from("warranties")
          .select("*, patient:patients(*), treatment:treatments(*), tooth:teeth(*)")
          .eq("id", id)
          .single();

        if (!error && data) {
          return data as WarrantyWithDetails;
        }
      } catch (err) {
        console.warn("[warrantyService] Lỗi lấy chi tiết thẻ:", err);
      }
    }

    const w = localWarranties.find((item) => item.id === id);
    if (!w) return null;

    return {
      ...w,
      patient: MOCK_PATIENTS.find((p) => p.id === w.patient_id),
      treatment: MOCK_TREATMENTS.find((t) => t.id === w.treatment_id),
      tooth: MOCK_TEETH.find((th) => th.id === w.tooth_id),
    };
  },

  /**
   * Cấp mới thẻ bảo hành & ghi log khởi tạo
   */
  async createWarranty(
    values: WarrantyFormValues,
    performedBy = "Quản Trị Viên SmileLab"
  ): Promise<{ success: boolean; data?: Warranty; error?: string }> {
    // Tự động tính expires_at = activated_at + warranty_period_months
    const activatedDate = new Date(values.activated_at);
    const expiresDate = new Date(activatedDate);
    expiresDate.setMonth(expiresDate.getMonth() + values.warranty_period_months);

    const qrToken = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const newRecord = {
          ...values,
          qr_token: qrToken,
          expires_at: expiresDate.toISOString(),
        };

        const { data, error } = await supabase
          .from("warranties")
          .insert(newRecord)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        // Ghi log
        await supabase.from("warranty_logs").insert({
          warranty_id: data.id,
          action: "create",
          description: `Cấp mới thẻ bảo hành mã ${values.warranty_code} thời hạn ${values.warranty_period_months} tháng.`,
          created_by: isValidUUID(performedBy) ? performedBy : null,
        });

        return { success: true, data: data as Warranty };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
        return { success: false, error: message };
      }
    }

    const exists = localWarranties.some(
      (w) => w.warranty_code.toLowerCase() === values.warranty_code.toLowerCase()
    );
    if (exists) {
      return { success: false, error: "Mã thẻ bảo hành này đã được sử dụng." };
    }

    const newWarranty: Warranty = {
      id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      warranty_code: values.warranty_code,
      qr_token: qrToken,
      patient_id: values.patient_id,
      treatment_id: values.treatment_id,
      tooth_id: values.tooth_id || null,
      product_name: values.product_name,
      brand: values.brand,
      warranty_period_months: values.warranty_period_months,
      activated_at: values.activated_at,
      expires_at: expiresDate.toISOString(),
      status: values.status,
      public_note: values.public_note || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localWarranties = [newWarranty, ...localWarranties];

    // Ghi log
    const logItem: WarrantyLog = {
      id: `log-${Date.now()}`,
      warranty_id: newWarranty.id,
      action: "create",
      description: `Cấp mới thẻ bảo hành mã ${newWarranty.warranty_code} (${newWarranty.warranty_period_months} tháng)`,
      created_by: performedBy,
      created_at: new Date().toISOString(),
    };
    localWarrantyLogs = [logItem, ...localWarrantyLogs];

    return { success: true, data: newWarranty };
  },

  /**
   * Cập nhật trạng thái thẻ bảo hành (Kích hoạt, Tạm khóa, Hủy, Còn hạn)
   */
  async updateWarrantyStatus(
    id: string,
    status: WarrantyStatus,
    note?: string,
    performedBy = "Quản Trị Viên SmileLab"
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { error } = await supabase
          .from("warranties")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id);

        if (error) {
          return { success: false, error: error.message };
        }

        await supabase.from("warranty_logs").insert({
          warranty_id: id,
          action: `status_change_to_${status}`,
          description: `Đổi trạng thái thẻ sang "${status}". ${note ? `Lý do: ${note}` : ""}`,
          created_by: isValidUUID(performedBy) ? performedBy : null,
        });

        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật trạng thái";
        return { success: false, error: message };
      }
    }

    const index = localWarranties.findIndex((w) => w.id === id);
    if (index === -1) {
      return { success: false, error: "Không tìm thấy thẻ bảo hành." };
    }

    localWarranties[index] = {
      ...localWarranties[index],
      status,
      updated_at: new Date().toISOString(),
    };

    const logItem: WarrantyLog = {
      id: `log-${Date.now()}`,
      warranty_id: id,
      action: `status_change_to_${status}`,
      description: `Đổi trạng thái thẻ sang "${status}". ${note ? `Ghi chú: ${note}` : ""}`,
      created_by: performedBy,
      created_at: new Date().toISOString(),
    };
    localWarrantyLogs = [logItem, ...localWarrantyLogs];

    return { success: true };
  },

  /**
   * Gia hạn thời gian bảo hành (Extend warranty)
   */
  async extendWarranty(
    id: string,
    additionalMonths: number,
    note?: string,
    performedBy = "Quản Trị Viên SmileLab"
  ): Promise<{ success: boolean; error?: string }> {
    if (additionalMonths <= 0) {
      return { success: false, error: "Số tháng gia hạn phải lớn hơn 0." };
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { data: w } = await supabase
          .from("warranties")
          .select("expires_at, warranty_period_months")
          .eq("id", id)
          .single();

        if (!w) return { success: false, error: "Không tìm thấy thẻ bảo hành." };

        const currentExpires = new Date(w.expires_at);
        currentExpires.setMonth(currentExpires.getMonth() + additionalMonths);

        const { error } = await supabase
          .from("warranties")
          .update({
            expires_at: currentExpires.toISOString(),
            warranty_period_months: w.warranty_period_months + additionalMonths,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (error) return { success: false, error: error.message };

        await supabase.from("warranty_logs").insert({
          warranty_id: id,
          action: "extend",
          description: `Gia hạn thêm ${additionalMonths} tháng. Ngày hết hạn mới: ${currentExpires.toLocaleDateString("vi-VN")}. ${note ? `Lý do: ${note}` : ""}`,
          created_by: isValidUUID(performedBy) ? performedBy : null,
        });

        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi gia hạn thẻ";
        return { success: false, error: message };
      }
    }

    const index = localWarranties.findIndex((w) => w.id === id);
    if (index === -1) {
      return { success: false, error: "Không tìm thấy thẻ bảo hành." };
    }

    const w = localWarranties[index];
    const newExpires = new Date(w.expires_at);
    newExpires.setMonth(newExpires.getMonth() + additionalMonths);

    localWarranties[index] = {
      ...w,
      warranty_period_months: w.warranty_period_months + additionalMonths,
      expires_at: newExpires.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const logItem: WarrantyLog = {
      id: `log-${Date.now()}`,
      warranty_id: id,
      action: "extend",
      description: `Gia hạn thêm ${additionalMonths} tháng. Hạn mới: ${newExpires.toLocaleDateString("vi-VN")}. ${note ? `Ghi chú: ${note}` : ""}`,
      created_by: performedBy,
      created_at: new Date().toISOString(),
    };
    localWarrantyLogs = [logItem, ...localWarrantyLogs];

    return { success: true };
  },

  /**
   * Cập nhật thông tin thẻ bảo hành
   */
  async updateWarranty(
    id: string,
    values: WarrantyFormValues,
    performedBy = "Quản Trị Viên SmileLab"
  ): Promise<{ success: boolean; data?: Warranty; error?: string }> {
    const activatedDate = new Date(values.activated_at);
    const expiresDate = new Date(activatedDate);
    expiresDate.setMonth(expiresDate.getMonth() + values.warranty_period_months);

    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const updatePayload = {
          ...values,
          expires_at: expiresDate.toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("warranties")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        await supabase.from("warranty_logs").insert({
          warranty_id: id,
          action: "update",
          description: `Cập nhật thông tin thẻ bảo hành mã ${values.warranty_code}.`,
          created_by: isValidUUID(performedBy) ? performedBy : null,
        });

        return { success: true, data: data as Warranty };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật bảo hành";
        return { success: false, error: message };
      }
    }

    const index = localWarranties.findIndex((w) => w.id === id);
    if (index === -1) {
      return { success: false, error: "Không tìm thấy thẻ bảo hành cần cập nhật." };
    }

    const updated: Warranty = {
      ...localWarranties[index],
      ...values,
      tooth_id: values.tooth_id || null,
      public_note: values.public_note || null,
      expires_at: expiresDate.toISOString(),
      updated_at: new Date().toISOString(),
    };

    localWarranties[index] = updated;

    const logItem: WarrantyLog = {
      id: `log-${Date.now()}`,
      warranty_id: id,
      action: "update",
      description: `Cập nhật thông tin thẻ ${updated.warranty_code}`,
      created_by: performedBy,
      created_at: new Date().toISOString(),
    };
    localWarrantyLogs = [logItem, ...localWarrantyLogs];

    return { success: true, data: updated };
  },

  /**
   * Xóa thẻ bảo hành
   */
  async deleteWarranty(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        const { error } = await supabase.from("warranties").delete().eq("id", id);
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi xóa thẻ bảo hành";
        return { success: false, error: message };
      }
    }

    localWarranties = localWarranties.filter((w) => w.id !== id);
    localWarrantyLogs = localWarrantyLogs.filter((log) => log.warranty_id !== id);
    return { success: true };
  },

  /**
   * Lấy lịch sử thao tác của 1 thẻ bảo hành (hoặc toàn bộ)
   */
  async getWarrantyLogs(warrantyId?: string): Promise<WarrantyLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await getDbClient();
        let queryBuilder = supabase
          .from("warranty_logs")
          .select("*")
          .order("created_at", { ascending: false });

        if (warrantyId) {
          queryBuilder = queryBuilder.eq("warranty_id", warrantyId);
        }

        const { data, error } = await queryBuilder;
        if (!error && data) {
          return data as WarrantyLog[];
        }
      } catch (err) {
        console.warn("[warrantyService] Lỗi lấy nhật ký bảo hành:", err);
      }
    }

    if (warrantyId) {
      return localWarrantyLogs.filter((l) => l.warranty_id === warrantyId);
    }

    return [...localWarrantyLogs];
  },
};

import { isFirebaseConfigured, db } from "@/lib/firebase/client";
import { ConsultationRequest, ConsultationStatus } from "@/types/database.types";
import { ConsultationFormValues } from "@/lib/validations/consultation";
import { MOCK_CONSULTATIONS } from "./mockData";

let localConsultations: ConsultationRequest[] = [...MOCK_CONSULTATIONS];

export const consultationService = {
  /**
   * Tạo yêu cầu tư vấn mới từ landing page
   */
  async createConsultation(
    values: ConsultationFormValues
  ): Promise<{ success: boolean; data?: ConsultationRequest; error?: string }> {
    if (isFirebaseConfigured()) {
      try {
        const { collection, addDoc } = await import("firebase/firestore");

        const newPayload = {
          full_name: values.fullName,
          phone: values.phone,
          address: values.address || null,
          service: values.service,
          message: values.message || null,
          status: "new" as const,
          internal_note: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "consultations"), newPayload);

        return {
          success: true,
          data: { id: docRef.id, ...newPayload },
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
      address: values.address || null,
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
    if (isFirebaseConfigured()) {
      try {
        const { collection, getDocs, query: fbQuery, orderBy, where } = await import("firebase/firestore");

        let q = fbQuery(collection(db, "consultations"), orderBy("created_at", "desc"));

        if (statusFilter && statusFilter !== "all") {
          q = fbQuery(
            collection(db, "consultations"),
            where("status", "==", statusFilter)
          );
        }

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ConsultationRequest));
        if (statusFilter && statusFilter !== "all") {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        // Client-side filter cho query tìm kiếm (Firestore không hỗ trợ full-text search native)
        if (query && query.trim()) {
          const qLower = query.trim().toLowerCase();
          results = results.filter(
            (c) =>
              c.full_name.toLowerCase().includes(qLower) ||
              c.phone.includes(qLower) ||
              c.service.toLowerCase().includes(qLower) ||
              (c.address && c.address.toLowerCase().includes(qLower))
          );
        }

        return results;
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
          (c.address && c.address.toLowerCase().includes(q))
      );
    }

    return result;
  },

  /**
   * Cập nhật trạng thái và ghi chú nội bộ
   */
  async updateConsultation(
    id: string,
    status: ConsultationStatus,
    internalNote?: string | null
  ): Promise<{ success: boolean; data?: ConsultationRequest; error?: string }> {
    if (isFirebaseConfigured()) {
      try {
        const { doc, updateDoc, getDoc } = await import("firebase/firestore");

        const ref = doc(db, "consultations", id);
        const updatePayload: Record<string, unknown> = {
          status,
          updated_at: new Date().toISOString(),
        };
        if (internalNote !== undefined) updatePayload.internal_note = internalNote;

        await updateDoc(ref, updatePayload);

        const snap = await getDoc(ref);
        return { success: true, data: { id: snap.id, ...snap.data() } as ConsultationRequest };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật tư vấn";
        return { success: false, error: message };
      }
    }

    const index = localConsultations.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, error: "Không tìm thấy yêu cầu tư vấn." };

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
    if (isFirebaseConfigured()) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "consultations", id));
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

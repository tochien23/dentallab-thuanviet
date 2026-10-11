import { isFirebaseConfigured, db } from "@/lib/firebase/client";
import { Clinic } from "@/types/database.types";
import { ClinicFormValues } from "@/lib/validations/clinic";
import { MOCK_CLINICS } from "./mockData";

let localClinics: Clinic[] = [...MOCK_CLINICS];

export const clinicService = {
  /**
   * Lấy danh sách phòng khám (có thể lọc theo từ khóa hoặc trạng thái hoạt động)
   */
  async getAllClinics(query?: string, activeOnly = false): Promise<Clinic[]> {
    if (isFirebaseConfigured()) {
      try {
        const { collection, getDocs, query: fbQuery, where } = await import("firebase/firestore");

        let q = fbQuery(collection(db, "clinics"));
        if (activeOnly) {
          q = fbQuery(collection(db, "clinics"), where("is_active", "==", true));
        }

        const snapshot = await getDocs(q);
        let clinics = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Clinic));

        if (query && query.trim()) {
          const qLower = query.trim().toLowerCase();
          clinics = clinics.filter(
            (c) =>
              c.name.toLowerCase().includes(qLower) ||
              c.address.toLowerCase().includes(qLower) ||
              c.phone.includes(qLower)
          );
        }

        return clinics.sort((a, b) => a.name.localeCompare(b.name, "vi"));
      } catch (err) {
        console.warn("[clinicService] Lỗi khi lấy danh sách phòng khám:", err);
      }
    }

    let results = [...localClinics];
    if (activeOnly) {
      results = results.filter((c) => c.is_active);
    }
    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(qLower) ||
          c.address.toLowerCase().includes(qLower) ||
          c.phone.includes(qLower)
      );
    }
    return results.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  },

  /**
   * Lấy thông tin phòng khám theo ID
   */
  async getClinicById(id: string): Promise<Clinic | null> {
    if (isFirebaseConfigured()) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "clinics", id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as Clinic;
      } catch (err) {
        console.warn("[clinicService] Lỗi khi lấy thông tin phòng khám:", err);
      }
    }
    return localClinics.find((c) => c.id === id) || null;
  },

  /**
   * Tạo phòng khám / cơ sở mới
   */
  async createClinic(
    values: ClinicFormValues
  ): Promise<{ success: boolean; data?: Clinic; error?: string }> {
    if (isFirebaseConfigured()) {
      try {
        const { collection, addDoc } = await import("firebase/firestore");

        const payload = {
          name: values.name,
          address: values.address,
          phone: values.phone,
          is_active: values.is_active !== undefined ? values.is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "clinics"), payload);
        return { success: true, data: { id: docRef.id, ...payload } as Clinic };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi lưu phòng khám";
        return { success: false, error: message };
      }
    }

    const mockNew: Clinic = {
      id: `clinic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: values.name,
      address: values.address,
      phone: values.phone,
      is_active: values.is_active !== undefined ? values.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localClinics = [mockNew, ...localClinics];
    return { success: true, data: mockNew };
  },

  /**
   * Cập nhật thông tin phòng khám
   */
  async updateClinic(
    id: string,
    values: Partial<ClinicFormValues>
  ): Promise<{ success: boolean; data?: Clinic; error?: string }> {
    if (isFirebaseConfigured()) {
      try {
        const { doc, updateDoc, getDoc } = await import("firebase/firestore");

        const updatePayload = {
          ...values,
          updated_at: new Date().toISOString(),
        };

        await updateDoc(doc(db, "clinics", id), updatePayload);
        const snap = await getDoc(doc(db, "clinics", id));
        return { success: true, data: { id: snap.id, ...snap.data() } as Clinic };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật phòng khám";
        return { success: false, error: message };
      }
    }

    const index = localClinics.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, error: "Không tìm thấy phòng khám cần sửa." };

    const updated: Clinic = {
      ...localClinics[index],
      ...values,
      updated_at: new Date().toISOString(),
    };

    localClinics[index] = updated;
    return { success: true, data: updated };
  },

  /**
   * Xóa phòng khám
   */
  async deleteClinic(id: string): Promise<{ success: boolean; error?: string }> {
    if (isFirebaseConfigured()) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "clinics", id));
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi xóa phòng khám";
        return { success: false, error: message };
      }
    }

    localClinics = localClinics.filter((c) => c.id !== id);
    return { success: true };
  },
};

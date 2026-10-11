import { isFirebaseConfigured, db } from "@/lib/firebase/client";
import { Patient } from "@/types/database.types";
import { PatientFormValues } from "@/lib/validations/patient";
import { MOCK_PATIENTS } from "./mockData";

let localPatients: Patient[] = [...MOCK_PATIENTS];

export const patientService = {
  /**
   * Lấy danh sách bệnh nhân
   */
  async getAllPatients(query?: string): Promise<Patient[]> {
    if (isFirebaseConfigured()) {
      try {
        const { collection, getDocs, orderBy, query: fbQuery } = await import("firebase/firestore");

        const q = fbQuery(collection(db, "patients"), orderBy("created_at", "desc"));
        const snapshot = await getDocs(q);
        let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Patient));

        if (query && query.trim()) {
          const qLower = query.trim().toLowerCase();
          results = results.filter(
            (p) =>
              p.full_name.toLowerCase().includes(qLower) ||
              p.phone.includes(qLower) ||
              p.patient_code.toLowerCase().includes(qLower) ||
              (p.address && p.address.toLowerCase().includes(qLower))
          );
        }

        return results;
      } catch (err) {
        console.warn("[patientService] Lỗi khi lấy danh sách bệnh nhân:", err);
      }
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      return localPatients.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.patient_code.toLowerCase().includes(q) ||
          (p.address && p.address.toLowerCase().includes(q))
      );
    }

    return [...localPatients];
  },

  /**
   * Lấy chi tiết bệnh nhân theo ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    if (isFirebaseConfigured()) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "patients", id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as Patient;
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
    if (isFirebaseConfigured()) {
      try {
        const { collection, addDoc, query: fbQuery, where, getDocs } = await import("firebase/firestore");

        // Kiểm tra trùng patient_code
        const q = fbQuery(collection(db, "patients"), where("patient_code", "==", values.patient_code));
        const existing = await getDocs(q);
        if (!existing.empty) {
          return { success: false, error: "Mã bệnh nhân này đã tồn tại trong hệ thống." };
        }

        const payload = {
          ...values,
          address: values.address || null,
          date_of_birth: values.date_of_birth || null,
          gender: values.gender || null,
          notes: values.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "patients"), payload);
        return { success: true, data: { id: docRef.id, ...payload } as Patient };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi lưu bệnh nhân";
        return { success: false, error: message };
      }
    }

    const exists = localPatients.some(
      (p) => p.patient_code.toLowerCase() === values.patient_code.toLowerCase()
    );
    if (exists) return { success: false, error: "Mã bệnh nhân này đã tồn tại trong hệ thống." };

    const mockNew: Patient = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      patient_code: values.patient_code,
      full_name: values.full_name,
      phone: values.phone,
      address: values.address || null,
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
    if (isFirebaseConfigured()) {
      try {
        const { doc, updateDoc, getDoc } = await import("firebase/firestore");

        const updatePayload = {
          ...values,
          address: values.address || null,
          date_of_birth: values.date_of_birth || null,
          gender: values.gender || null,
          notes: values.notes || null,
          updated_at: new Date().toISOString(),
        };

        await updateDoc(doc(db, "patients", id), updatePayload);
        const snap = await getDoc(doc(db, "patients", id));
        return { success: true, data: { id: snap.id, ...snap.data() } as Patient };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật bệnh nhân";
        return { success: false, error: message };
      }
    }

    const index = localPatients.findIndex((p) => p.id === id);
    if (index === -1) return { success: false, error: "Không tìm thấy hồ sơ bệnh nhân cần sửa." };

    const updated: Patient = {
      ...localPatients[index],
      ...values,
      address: values.address || null,
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
    if (isFirebaseConfigured()) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "patients", id));
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

import { isFirebaseConfigured, db } from "@/lib/firebase/client";
import { Treatment, Patient, Clinic } from "@/types/database.types";
import { TreatmentFormValues } from "@/lib/validations/treatment";
import { MOCK_TREATMENTS, MOCK_PATIENTS, MOCK_CLINICS } from "./mockData";

export interface TreatmentWithDetails extends Treatment {
  patient?: Patient;
  clinic?: Clinic;
}

let localTreatments: Treatment[] = [...MOCK_TREATMENTS];

export const treatmentService = {
  /**
   * Lấy danh sách ca điều trị kèm thông tin bệnh nhân và phòng khám
   */
  async getAllTreatments(query?: string): Promise<TreatmentWithDetails[]> {
    if (isFirebaseConfigured()) {
      try {
        const { collection, getDocs, orderBy, query: fbQuery } = await import("firebase/firestore");

        const q = fbQuery(collection(db, "treatments"), orderBy("treatment_date", "desc"));
        const snapshot = await getDocs(q);
        let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Treatment));

        if (query && query.trim()) {
          const qLower = query.trim().toLowerCase();
          results = results.filter(
            (t) =>
              t.case_code.toLowerCase().includes(qLower) ||
              t.dentist_name.toLowerCase().includes(qLower)
          );
        }

        // Enrich với patient & clinic (parallel fetch)
        const enriched = await Promise.all(
          results.map(async (t) => {
            const { doc, getDoc } = await import("firebase/firestore");
            const [patientSnap, clinicSnap] = await Promise.all([
              getDoc(doc(db, "patients", t.patient_id)),
              getDoc(doc(db, "clinics", t.clinic_id)),
            ]);
            return {
              ...t,
              patient: patientSnap.exists() ? ({ id: patientSnap.id, ...patientSnap.data() } as Patient) : undefined,
              clinic: clinicSnap.exists() ? ({ id: clinicSnap.id, ...clinicSnap.data() } as Clinic) : undefined,
            };
          })
        );

        return enriched;
      } catch (err) {
        console.warn("[treatmentService] Lỗi khi lấy danh sách ca điều trị:", err);
      }
    }

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
    if (isFirebaseConfigured()) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");

        const snap = await getDoc(doc(db, "treatments", id));
        if (!snap.exists()) return null;

        const t = { id: snap.id, ...snap.data() } as Treatment;
        const [patientSnap, clinicSnap] = await Promise.all([
          getDoc(doc(db, "patients", t.patient_id)),
          getDoc(doc(db, "clinics", t.clinic_id)),
        ]);

        return {
          ...t,
          patient: patientSnap.exists() ? ({ id: patientSnap.id, ...patientSnap.data() } as Patient) : undefined,
          clinic: clinicSnap.exists() ? ({ id: clinicSnap.id, ...clinicSnap.data() } as Clinic) : undefined,
        };
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
    if (isFirebaseConfigured()) {
      try {
        const { collection, addDoc, query: fbQuery, where, getDocs } = await import("firebase/firestore");

        const q = fbQuery(collection(db, "treatments"), where("case_code", "==", values.case_code));
        const existing = await getDocs(q);
        if (!existing.empty) return { success: false, error: "Mã ca điều trị này đã tồn tại." };

        const payload = {
          ...values,
          notes: values.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, "treatments"), payload);
        return { success: true, data: { id: docRef.id, ...payload } as Treatment };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi lưu ca điều trị";
        return { success: false, error: message };
      }
    }

    const exists = localTreatments.some(
      (t) => t.case_code.toLowerCase() === values.case_code.toLowerCase()
    );
    if (exists) return { success: false, error: "Mã ca điều trị này đã tồn tại." };

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
    if (isFirebaseConfigured()) {
      try {
        const { doc, updateDoc, getDoc } = await import("firebase/firestore");

        const updatePayload = {
          ...values,
          notes: values.notes || null,
          updated_at: new Date().toISOString(),
        };

        await updateDoc(doc(db, "treatments", id), updatePayload);
        const snap = await getDoc(doc(db, "treatments", id));
        return { success: true, data: { id: snap.id, ...snap.data() } as Treatment };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật ca điều trị";
        return { success: false, error: message };
      }
    }

    const index = localTreatments.findIndex((t) => t.id === id);
    if (index === -1) return { success: false, error: "Không tìm thấy ca điều trị cần cập nhật." };

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
    if (isFirebaseConfigured()) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "treatments", id));
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

import { isFirebaseConfigured, db } from "@/lib/firebase/client";
import { Tooth, Treatment } from "@/types/database.types";
import { ToothFormValues } from "@/lib/validations/tooth";
import { MOCK_TEETH, MOCK_TREATMENTS } from "./mockData";

export interface ToothWithTreatment extends Tooth {
  treatment?: Treatment;
}

let localTeeth: Tooth[] = [...MOCK_TEETH];

export const toothService = {
  /**
   * Lấy danh sách chi tiết răng
   */
  async getAllTeeth(treatmentId?: string, query?: string): Promise<ToothWithTreatment[]> {
    if (isFirebaseConfigured()) {
      try {
        const { collection, getDocs, orderBy, query: fbQuery, where } = await import("firebase/firestore");

        let q = fbQuery(collection(db, "teeth"), orderBy("created_at", "desc"));

        if (treatmentId) {
          q = fbQuery(
            collection(db, "teeth"),
            where("treatment_id", "==", treatmentId)
          );
        }

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Tooth));
        if (treatmentId) {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        if (query && query.trim()) {
          const qLower = query.trim().toLowerCase();
          results = results.filter(
            (t) =>
              t.tooth_number.toLowerCase().includes(qLower) ||
              t.material.toLowerCase().includes(qLower) ||
              t.brand.toLowerCase().includes(qLower) ||
              (t.shade && t.shade.toLowerCase().includes(qLower))
          );
        }

        // Enrich với treatment
        const enriched = await Promise.all(
          results.map(async (tooth) => {
            const { doc, getDoc } = await import("firebase/firestore");
            const treatmentSnap = await getDoc(doc(db, "treatments", tooth.treatment_id));
            return {
              ...tooth,
              treatment: treatmentSnap.exists()
                ? ({ id: treatmentSnap.id, ...treatmentSnap.data() } as Treatment)
                : undefined,
            };
          })
        );

        return enriched;
      } catch (err) {
        console.warn("[toothService] Lỗi khi lấy danh sách răng:", err);
      }
    }

    let result = localTeeth.map((tooth) => ({
      ...tooth,
      treatment: MOCK_TREATMENTS.find((t) => t.id === tooth.treatment_id),
    }));

    if (treatmentId) result = result.filter((t) => t.treatment_id === treatmentId);

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
    if (isFirebaseConfigured()) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");

        const snap = await getDoc(doc(db, "teeth", id));
        if (!snap.exists()) return null;

        const tooth = { id: snap.id, ...snap.data() } as Tooth;
        const treatmentSnap = await getDoc(doc(db, "treatments", tooth.treatment_id));

        return {
          ...tooth,
          treatment: treatmentSnap.exists()
            ? ({ id: treatmentSnap.id, ...treatmentSnap.data() } as Treatment)
            : undefined,
        };
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
    if (isFirebaseConfigured()) {
      try {
        const { collection, addDoc } = await import("firebase/firestore");

        const payload = {
          ...values,
          shade: values.shade || null,
          notes: values.notes || null,
          created_at: new Date().toISOString(),
        };
        const docRef = await addDoc(collection(db, "teeth"), payload);
        return { success: true, data: { id: docRef.id, ...payload } as Tooth };
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
    if (isFirebaseConfigured()) {
      try {
        const { doc, updateDoc, getDoc } = await import("firebase/firestore");

        const updatePayload = {
          ...values,
          shade: values.shade || null,
          notes: values.notes || null,
        };

        await updateDoc(doc(db, "teeth", id), updatePayload);
        const snap = await getDoc(doc(db, "teeth", id));
        return { success: true, data: { id: snap.id, ...snap.data() } as Tooth };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật răng";
        return { success: false, error: message };
      }
    }

    const index = localTeeth.findIndex((t) => t.id === id);
    if (index === -1) return { success: false, error: "Không tìm thấy chi tiết răng cần sửa." };

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
    if (isFirebaseConfigured()) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "teeth", id));
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

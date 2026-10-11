import { isFirebaseConfigured, db } from "@/lib/firebase/client";
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

let localWarranties: Warranty[] = [...MOCK_WARRANTIES];
let localWarrantyLogs: WarrantyLog[] = [...MOCK_WARRANTY_LOGS];

/** Tính effective_status từ status + expires_at */
function computeEffectiveStatus(
  status: WarrantyStatus,
  expiresAt: string
): PublicWarrantyResult["effective_status"] {
  if (status === "suspended") return "suspended";
  if (status === "cancelled") return "cancelled";
  if (status === "pending") return "pending";
  if (new Date() > new Date(expiresAt)) return "expired";
  return "active";
}

/** Mask tên bệnh nhân: Nguyễn Văn An → N*** V*** A*** */
function maskName(name: string): string {
  return name.replace(/(\S)\S+/g, "$1***");
}

export const warrantyService = {
  /**
   * Tra cứu công khai thẻ bảo hành (không tiết lộ thông tin nhạy cảm)
   */
  async searchPublicWarranty(query: string): Promise<PublicWarrantyResult | null> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return null;

    if (isFirebaseConfigured()) {
      try {
        const { collection, getDocs, query: fbQuery, where, or } = await import("firebase/firestore");

        // Tìm theo warranty_code hoặc qr_token
        const [byCode, byToken] = await Promise.all([
          getDocs(
            fbQuery(collection(db, "warranties"), where("warranty_code", "==", cleanQuery.toUpperCase()))
          ),
          getDocs(
            fbQuery(collection(db, "warranties"), where("qr_token", "==", cleanQuery))
          ),
        ]);

        const snap = byCode.empty ? byToken : byCode;
        if (snap.empty) return null;

        const w = { id: snap.docs[0].id, ...snap.docs[0].data() } as Warranty;

        // Lấy thông tin bổ sung
        const { doc, getDoc } = await import("firebase/firestore");
        const [patientSnap, toothSnap, treatmentSnap] = await Promise.all([
          w.patient_id ? getDoc(doc(db, "patients", w.patient_id)) : Promise.resolve(null),
          w.tooth_id ? getDoc(doc(db, "teeth", w.tooth_id)) : Promise.resolve(null),
          w.treatment_id ? getDoc(doc(db, "treatments", w.treatment_id)) : Promise.resolve(null),
        ]);

        let clinicName: string | null = null;
        if (treatmentSnap?.exists()) {
          const treatment = treatmentSnap.data() as Treatment;
          if (treatment.clinic_id) {
            const clinicSnap = await getDoc(doc(db, "clinics", treatment.clinic_id));
            clinicName = clinicSnap.exists() ? (clinicSnap.data().name as string) : null;
          }
        }

        const patient = patientSnap?.exists() ? (patientSnap.data() as Patient) : null;
        const tooth = toothSnap?.exists() ? (toothSnap.data() as Tooth) : null;

        return {
          warranty_code: w.warranty_code,
          product_name: w.product_name,
          brand: w.brand,
          tooth_number: tooth?.tooth_number || null,
          jaw: tooth?.jaw || null,
          material: tooth?.material || null,
          shade: tooth?.shade || null,
          clinic_name: clinicName,
          activated_at: w.activated_at,
          expires_at: w.expires_at,
          status: w.status,
          effective_status: computeEffectiveStatus(w.status, w.expires_at),
          public_note: w.public_note || null,
          masked_patient_name: patient?.full_name ? maskName(patient.full_name) : null,
        };
      } catch (err) {
        console.warn("[warrantyService] Lỗi tra cứu Firebase:", err);
      }
    }

    const mock = MOCK_PUBLIC_WARRANTIES.find(
      (w) => w.warranty_code.toLowerCase() === cleanQuery
    );
    return mock || null;
  },

  /**
   * Lấy danh sách toàn bộ thẻ bảo hành (Admin)
   */
  async getAllWarranties(
    query?: string,
    statusFilter?: string
  ): Promise<WarrantyWithDetails[]> {
    if (isFirebaseConfigured()) {
      try {
        const { collection, getDocs, orderBy, query: fbQuery, where } = await import("firebase/firestore");

        let q = fbQuery(collection(db, "warranties"), orderBy("created_at", "desc"));

        if (statusFilter && statusFilter !== "all") {
          q = fbQuery(
            collection(db, "warranties"),
            where("status", "==", statusFilter)
          );
        }

        const snapshot = await getDocs(q);
        let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Warranty));
        if (statusFilter && statusFilter !== "all") {
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        // Client-side text search
        if (query && query.trim()) {
          const qLower = query.trim().toLowerCase();
          results = results.filter(
            (w) =>
              w.warranty_code.toLowerCase().includes(qLower) ||
              w.product_name.toLowerCase().includes(qLower) ||
              w.brand.toLowerCase().includes(qLower)
          );
        }

        // Enrich với patient, treatment, tooth
        const { doc, getDoc } = await import("firebase/firestore");
        const enriched = await Promise.all(
          results.map(async (w) => {
            const [patientSnap, treatmentSnap, toothSnap] = await Promise.all([
              w.patient_id ? getDoc(doc(db, "patients", w.patient_id)) : Promise.resolve(null),
              w.treatment_id ? getDoc(doc(db, "treatments", w.treatment_id)) : Promise.resolve(null),
              w.tooth_id ? getDoc(doc(db, "teeth", w.tooth_id)) : Promise.resolve(null),
            ]);
            return {
              ...w,
              patient: patientSnap?.exists() ? ({ id: patientSnap.id, ...patientSnap.data() } as Patient) : undefined,
              treatment: treatmentSnap?.exists() ? ({ id: treatmentSnap.id, ...treatmentSnap.data() } as Treatment) : undefined,
              tooth: toothSnap?.exists() ? ({ id: toothSnap.id, ...toothSnap.data() } as Tooth) : undefined,
            };
          })
        );

        return enriched;
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
    if (isFirebaseConfigured()) {
      try {
        const { doc, getDoc } = await import("firebase/firestore");

        const snap = await getDoc(doc(db, "warranties", id));
        if (!snap.exists()) return null;

        const w = { id: snap.id, ...snap.data() } as Warranty;
        const [patientSnap, treatmentSnap, toothSnap] = await Promise.all([
          w.patient_id ? getDoc(doc(db, "patients", w.patient_id)) : Promise.resolve(null),
          w.treatment_id ? getDoc(doc(db, "treatments", w.treatment_id)) : Promise.resolve(null),
          w.tooth_id ? getDoc(doc(db, "teeth", w.tooth_id)) : Promise.resolve(null),
        ]);

        return {
          ...w,
          patient: patientSnap?.exists() ? ({ id: patientSnap.id, ...patientSnap.data() } as Patient) : undefined,
          treatment: treatmentSnap?.exists() ? ({ id: treatmentSnap.id, ...treatmentSnap.data() } as Treatment) : undefined,
          tooth: toothSnap?.exists() ? ({ id: toothSnap.id, ...toothSnap.data() } as Tooth) : undefined,
        };
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
   * Cấp mới thẻ bảo hành
   */
  async createWarranty(
    values: WarrantyFormValues,
    performedBy = "Quản Trị Viên SmileLab"
  ): Promise<{ success: boolean; data?: Warranty; error?: string }> {
    const activatedDate = new Date(values.activated_at);
    const expiresDate = new Date(activatedDate);
    expiresDate.setMonth(expiresDate.getMonth() + values.warranty_period_months);

    const qrToken = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    if (isFirebaseConfigured()) {
      try {
        const { collection, addDoc, query: fbQuery, where, getDocs } = await import("firebase/firestore");

        // Kiểm tra trùng warranty_code
        const q = fbQuery(
          collection(db, "warranties"),
          where("warranty_code", "==", values.warranty_code)
        );
        const existing = await getDocs(q);
        if (!existing.empty) return { success: false, error: "Mã thẻ bảo hành này đã được sử dụng." };

        const payload = {
          ...values,
          qr_token: qrToken,
          expires_at: expiresDate.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "warranties"), payload);
        const newWarranty = { id: docRef.id, ...payload } as Warranty;

        // Ghi log vào sub-collection
        await addDoc(collection(db, "warranties", docRef.id, "logs"), {
          warranty_id: docRef.id,
          action: "create",
          description: `Cấp mới thẻ bảo hành mã ${values.warranty_code} thời hạn ${values.warranty_period_months} tháng.`,
          created_by: performedBy,
          created_at: new Date().toISOString(),
        });

        return { success: true, data: newWarranty };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
        return { success: false, error: message };
      }
    }

    const exists = localWarranties.some(
      (w) => w.warranty_code.toLowerCase() === values.warranty_code.toLowerCase()
    );
    if (exists) return { success: false, error: "Mã thẻ bảo hành này đã được sử dụng." };

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
    localWarrantyLogs = [
      {
        id: `log-${Date.now()}`,
        warranty_id: newWarranty.id,
        action: "create",
        description: `Cấp mới thẻ bảo hành mã ${newWarranty.warranty_code} (${newWarranty.warranty_period_months} tháng)`,
        created_by: performedBy,
        created_at: new Date().toISOString(),
      },
      ...localWarrantyLogs,
    ];

    return { success: true, data: newWarranty };
  },

  /**
   * Cập nhật trạng thái thẻ bảo hành
   */
  async updateWarrantyStatus(
    id: string,
    status: WarrantyStatus,
    note?: string,
    performedBy = "Quản Trị Viên SmileLab"
  ): Promise<{ success: boolean; error?: string }> {
    if (isFirebaseConfigured()) {
      try {
        const { doc, updateDoc, collection, addDoc } = await import("firebase/firestore");

        await updateDoc(doc(db, "warranties", id), {
          status,
          updated_at: new Date().toISOString(),
        });

        await addDoc(collection(db, "warranties", id, "logs"), {
          warranty_id: id,
          action: `status_change_to_${status}`,
          description: `Đổi trạng thái thẻ sang "${status}". ${note ? `Lý do: ${note}` : ""}`,
          created_by: performedBy,
          created_at: new Date().toISOString(),
        });

        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật trạng thái";
        return { success: false, error: message };
      }
    }

    const index = localWarranties.findIndex((w) => w.id === id);
    if (index === -1) return { success: false, error: "Không tìm thấy thẻ bảo hành." };

    localWarranties[index] = { ...localWarranties[index], status, updated_at: new Date().toISOString() };
    localWarrantyLogs = [
      {
        id: `log-${Date.now()}`,
        warranty_id: id,
        action: `status_change_to_${status}`,
        description: `Đổi trạng thái thẻ sang "${status}". ${note ? `Ghi chú: ${note}` : ""}`,
        created_by: performedBy,
        created_at: new Date().toISOString(),
      },
      ...localWarrantyLogs,
    ];

    return { success: true };
  },

  /**
   * Gia hạn thời gian bảo hành
   */
  async extendWarranty(
    id: string,
    additionalMonths: number,
    note?: string,
    performedBy = "Quản Trị Viên SmileLab"
  ): Promise<{ success: boolean; error?: string }> {
    if (additionalMonths <= 0) return { success: false, error: "Số tháng gia hạn phải lớn hơn 0." };

    if (isFirebaseConfigured()) {
      try {
        const { doc, getDoc, updateDoc, collection, addDoc } = await import("firebase/firestore");

        const snap = await getDoc(doc(db, "warranties", id));
        if (!snap.exists()) return { success: false, error: "Không tìm thấy thẻ bảo hành." };

        const w = snap.data() as Warranty;
        const newExpires = new Date(w.expires_at);
        newExpires.setMonth(newExpires.getMonth() + additionalMonths);

        await updateDoc(doc(db, "warranties", id), {
          expires_at: newExpires.toISOString(),
          warranty_period_months: w.warranty_period_months + additionalMonths,
          updated_at: new Date().toISOString(),
        });

        await addDoc(collection(db, "warranties", id, "logs"), {
          warranty_id: id,
          action: "extend",
          description: `Gia hạn thêm ${additionalMonths} tháng. Ngày hết hạn mới: ${newExpires.toLocaleDateString("vi-VN")}. ${note ? `Lý do: ${note}` : ""}`,
          created_by: performedBy,
          created_at: new Date().toISOString(),
        });

        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi gia hạn thẻ";
        return { success: false, error: message };
      }
    }

    const index = localWarranties.findIndex((w) => w.id === id);
    if (index === -1) return { success: false, error: "Không tìm thấy thẻ bảo hành." };

    const w = localWarranties[index];
    const newExpires = new Date(w.expires_at);
    newExpires.setMonth(newExpires.getMonth() + additionalMonths);

    localWarranties[index] = {
      ...w,
      warranty_period_months: w.warranty_period_months + additionalMonths,
      expires_at: newExpires.toISOString(),
      updated_at: new Date().toISOString(),
    };

    localWarrantyLogs = [
      {
        id: `log-${Date.now()}`,
        warranty_id: id,
        action: "extend",
        description: `Gia hạn thêm ${additionalMonths} tháng. Hạn mới: ${newExpires.toLocaleDateString("vi-VN")}. ${note ? `Ghi chú: ${note}` : ""}`,
        created_by: performedBy,
        created_at: new Date().toISOString(),
      },
      ...localWarrantyLogs,
    ];

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

    if (isFirebaseConfigured()) {
      try {
        const { doc, updateDoc, getDoc, collection, addDoc } = await import("firebase/firestore");

        const updatePayload = {
          ...values,
          tooth_id: values.tooth_id || null,
          public_note: values.public_note || null,
          expires_at: expiresDate.toISOString(),
          updated_at: new Date().toISOString(),
        };

        await updateDoc(doc(db, "warranties", id), updatePayload);
        const snap = await getDoc(doc(db, "warranties", id));

        await addDoc(collection(db, "warranties", id, "logs"), {
          warranty_id: id,
          action: "update",
          description: `Cập nhật thông tin thẻ bảo hành mã ${values.warranty_code}.`,
          created_by: performedBy,
          created_at: new Date().toISOString(),
        });

        return { success: true, data: { id: snap.id, ...snap.data() } as Warranty };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi cập nhật bảo hành";
        return { success: false, error: message };
      }
    }

    const index = localWarranties.findIndex((w) => w.id === id);
    if (index === -1) return { success: false, error: "Không tìm thấy thẻ bảo hành cần cập nhật." };

    const updated: Warranty = {
      ...localWarranties[index],
      ...values,
      tooth_id: values.tooth_id || null,
      public_note: values.public_note || null,
      expires_at: expiresDate.toISOString(),
      updated_at: new Date().toISOString(),
    };

    localWarranties[index] = updated;
    localWarrantyLogs = [
      {
        id: `log-${Date.now()}`,
        warranty_id: id,
        action: "update",
        description: `Cập nhật thông tin thẻ ${updated.warranty_code}`,
        created_by: performedBy,
        created_at: new Date().toISOString(),
      },
      ...localWarrantyLogs,
    ];

    return { success: true, data: updated };
  },

  /**
   * Xóa thẻ bảo hành
   */
  async deleteWarranty(id: string): Promise<{ success: boolean; error?: string }> {
    if (isFirebaseConfigured()) {
      try {
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "warranties", id));
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
   * Lấy lịch sử thao tác của thẻ bảo hành (sub-collection logs)
   */
  async getWarrantyLogs(warrantyId?: string): Promise<WarrantyLog[]> {
    if (isFirebaseConfigured()) {
      try {
        const { collection, getDocs, orderBy, query: fbQuery } = await import("firebase/firestore");

        if (warrantyId) {
          // Lấy logs từ sub-collection của một thẻ cụ thể
          const q = fbQuery(
            collection(db, "warranties", warrantyId, "logs"),
            orderBy("created_at", "desc")
          );
          const snapshot = await getDocs(q);
          return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WarrantyLog));
        }

        // Nếu không có warrantyId, trả về empty (collectionGroup cần index)
        return [];
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

import { patientService } from "./patientService";
import { treatmentService } from "./treatmentService";
import { warrantyService, WarrantyWithDetails } from "./warrantyService";
import { consultationService } from "./consultationService";
import { ConsultationRequest } from "@/types/database.types";

export interface DashboardStats {
  totalPatients: number;
  totalTreatments: number;
  totalWarranties: number;
  activeWarranties: number;
  expiredWarranties: number;
  suspendedWarranties: number;
  pendingWarranties: number;
  newConsultations: number;
  recentWarranties: WarrantyWithDetails[];
  recentConsultations: ConsultationRequest[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [patients, treatments, warranties, consultations] = await Promise.all([
      patientService.getAllPatients(),
      treatmentService.getAllTreatments(),
      warrantyService.getAllWarranties(),
      consultationService.getAllConsultations(),
    ]);

    const now = new Date();

    let activeCount = 0;
    let expiredCount = 0;
    let suspendedCount = 0;
    let pendingCount = 0;

    warranties.forEach((w) => {
      const expiresAt = new Date(w.expires_at);
      if (w.status === "suspended") {
        suspendedCount++;
      } else if (w.status === "pending") {
        pendingCount++;
      } else if (w.status === "active") {
        if (expiresAt < now) {
          expiredCount++;
        } else {
          activeCount++;
        }
      } else if (w.status === "expired") {
        expiredCount++;
      }
    });

    const newConsultations = consultations.filter((c) => c.status === "new").length;

    return {
      totalPatients: patients.length,
      totalTreatments: treatments.length,
      totalWarranties: warranties.length,
      activeWarranties: activeCount,
      expiredWarranties: expiredCount,
      suspendedWarranties: suspendedCount,
      pendingWarranties: pendingCount,
      newConsultations,
      recentWarranties: warranties.slice(0, 5),
      recentConsultations: consultations.slice(0, 5),
    };
  },
};

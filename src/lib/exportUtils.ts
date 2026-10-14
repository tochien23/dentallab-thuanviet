import * as XLSX from "xlsx";
import { WarrantyWithDetails } from "@/services/warrantyService";
import { TreatmentWithDetails } from "@/services/treatmentService";
import { Patient } from "@/types/database.types";

/**
 * Trợ giúp tính độ rộng các cột tự động theo nội dung
 */
function calculateColumnWidths(data: Record<string, unknown>[]): { wch: number }[] {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);

  return keys.map((key) => {
    let maxLength = key.length;
    for (const row of data) {
      const val = row[key];
      if (val !== null && val !== undefined) {
        const strVal = String(val);
        if (strVal.length > maxLength) {
          maxLength = strVal.length;
        }
      }
    }
    return { wch: Math.min(Math.max(maxLength + 4, 12), 45) };
  });
}

/**
 * Xuất mảng đối tượng ra file Excel (.xlsx)
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  fileName: string,
  sheetName = "Sheet1"
) {
  if (data.length === 0) {
    throw new Error("Không có dữ liệu để xuất file.");
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet["!cols"] = calculateColumnWidths(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, finalFileName);
}

/**
 * Trạng thái bảo hành tiếng Việt
 */
function formatWarrantyStatus(status: string, expiresAt: string): string {
  if (status === "suspended") return "Tạm dừng";
  if (status === "cancelled") return "Hủy bỏ";
  if (status === "pending") return "Chờ kích hoạt";
  if (new Date() > new Date(expiresAt) || status === "expired") return "Hết hạn";
  return "Còn hiệu lực";
}

/**
 * Xuất danh sách thẻ bảo hành ra Excel
 */
export function exportWarrantiesToExcel(
  warranties: WarrantyWithDetails[],
  customFileName?: string
) {
  const exportData = warranties.map((w, index) => {
    const isExpired = new Date(w.expires_at) < new Date();
    return {
      "STT": index + 1,
      "Mã thẻ bảo hành": w.warranty_code,
      "Họ tên khách hàng": w.patient?.full_name || "N/A",
      "Số điện thoại": w.patient?.phone || "N/A",
      "Dòng răng sứ": w.product_name,
      "Hãng phôi sứ": w.brand,
      "Vị trí răng": w.tooth?.tooth_number || "Toàn hàm / N/A",
      "Hàm": w.tooth ? (w.tooth.jaw === "upper" ? "Hàm trên" : "Hàm dưới") : "N/A",
      "Màu sứ (Shade)": w.tooth?.shade || "N/A",
      "Mã ca điều trị": w.treatment?.case_code || "N/A",
      "Bác sĩ điều trị": w.treatment?.dentist_name || "N/A",
      "Thời hạn (tháng)": w.warranty_period_months,
      "Ngày kích hoạt": new Date(w.activated_at).toLocaleDateString("vi-VN"),
      "Ngày hết hạn": new Date(w.expires_at).toLocaleDateString("vi-VN"),
      "Trạng thái": formatWarrantyStatus(w.status, w.expires_at),
      "Đã hết hạn?": isExpired ? "Đã hết hạn" : "Còn hạn",
      "Ghi chú công khai": w.public_note || "",
    };
  });

  const nowStr = new Date().toISOString().slice(0, 10);
  const fileName = customFileName || `Danh_sach_the_bao_hanh_${nowStr}.xlsx`;
  exportToExcel(exportData, fileName, "Thẻ Bảo Hành");
}

/**
 * Xuất danh sách hồ sơ bệnh nhân ra Excel
 */
export function exportPatientsToExcel(
  patients: Patient[],
  customFileName?: string
) {
  const exportData = patients.map((p, index) => ({
    "STT": index + 1,
    "Mã bệnh nhân": p.patient_code,
    "Họ và tên": p.full_name,
    "Số điện thoại": p.phone,
    "Địa chỉ": p.address || "",
    "Ngày sinh": p.date_of_birth || "",
    "Giới tính": p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : p.gender === "other" ? "Khác" : "",
    "Ghi chú bệnh án": p.notes || "",
    "Ngày tạo hồ sơ": new Date(p.created_at).toLocaleDateString("vi-VN"),
  }));

  const nowStr = new Date().toISOString().slice(0, 10);
  const fileName = customFileName || `Danh_sach_benh_nhan_${nowStr}.xlsx`;
  exportToExcel(exportData, fileName, "Bệnh Nhân");
}

/**
 * Xuất danh sách ca điều trị ra Excel
 */
export function exportTreatmentsToExcel(
  treatments: TreatmentWithDetails[],
  customFileName?: string
) {
  const exportData = treatments.map((t, index) => ({
    "STT": index + 1,
    "Mã ca điều trị": t.case_code,
    "Họ tên bệnh nhân": t.patient?.full_name || "N/A",
    "Số điện thoại": t.patient?.phone || "N/A",
    "Phòng khám / Labo": t.clinic?.name || "N/A",
    "Bác sĩ điều trị": t.dentist_name,
    "Ngày điều trị": t.treatment_date,
    "Ghi chú ca điều trị": t.notes || "",
  }));

  const nowStr = new Date().toISOString().slice(0, 10);
  const fileName = customFileName || `Danh_sach_ca_dieu_tri_${nowStr}.xlsx`;
  exportToExcel(exportData, fileName, "Ca Điều Trị");
}

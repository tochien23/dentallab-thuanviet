"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ClipboardList,
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Building2,
  Stethoscope,
  X,
  User,
  FileSpreadsheet,
} from "lucide-react";
import { exportTreatmentsToExcel } from "@/lib/exportUtils";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastContext";
import { treatmentService, TreatmentWithDetails } from "@/services/treatmentService";
import { patientService } from "@/services/patientService";
import { clinicService } from "@/services/clinicService";
import { toothService } from "@/services/toothService";
import { Patient, Clinic, Tooth } from "@/types/database.types";
import { treatmentFormSchema, TreatmentFormValues } from "@/lib/validations/treatment";

const PAGE_SIZE = 8;

export default function TreatmentsAdminPage() {
  const [treatments, setTreatments] = useState<TreatmentWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [teeth, setTeeth] = useState<Tooth[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<TreatmentWithDetails | null>(null);
  const [saving, setSaving] = useState(false);

  // Managing Teeth Modal State
  const [managingTeethTreatment, setManagingTeethTreatment] = useState<TreatmentWithDetails | null>(null);
  const [addingTooth, setAddingTooth] = useState(false);
  const [toothFormData, setToothFormData] = useState({
    tooth_number: "",
    jaw: "upper" as "upper" | "lower",
    material: "Zirconia",
    brand: "Ivoclar",
    shade: "A1",
    notes: "",
  });

  // Confirm Delete State
  const [deletingTreatment, setDeletingTreatment] = useState<TreatmentWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentFormSchema),
  });

  const loadData = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      const [tList, pList, cList, thList] = await Promise.all([
        treatmentService.getAllTreatments(query),
        patientService.getAllPatients(),
        clinicService.getAllClinics(),
        toothService.getAllTeeth(),
      ]);
      setTreatments(tList);
      setPatients(pList);
      setClinics(cList);
      setTeeth(thList);
    } catch {
      error("Lỗi", "Không thể tải dữ liệu ca điều trị.");
    } finally {
      setLoading(false);
    }
  }, [error]);


  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData(searchQuery);
  };

  const totalPages = Math.ceil(treatments.length / PAGE_SIZE) || 1;
  const paginatedTreatments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return treatments.slice(start, start + PAGE_SIZE);
  }, [treatments, currentPage]);

  const openCreateModal = () => {
    setEditingTreatment(null);
    const today = new Date().toISOString().split("T")[0];
    reset({
      case_code: `CASE-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      patient_id: patients[0]?.id || "",
      clinic_id: clinics[0]?.id || "",
      dentist_name: "BS. CKI Trần Minh Tuấn",
      treatment_date: today,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: TreatmentWithDetails) => {
    setEditingTreatment(t);
    reset({
      case_code: t.case_code,
      patient_id: t.patient_id,
      clinic_id: t.clinic_id,
      dentist_name: t.dentist_name,
      treatment_date: t.treatment_date,
      notes: t.notes || "",
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (values: TreatmentFormValues) => {
    setSaving(true);
    try {
      if (editingTreatment) {
        const res = await treatmentService.updateTreatment(editingTreatment.id, values);
        if (res.success) {
          success("Thành công", `Đã cập nhật ca điều trị ${values.case_code}.`);
          setIsModalOpen(false);
          loadData(searchQuery);
        } else {
          error("Lỗi", res.error || "Không thể cập nhật ca điều trị.");
        }
      } else {
        const res = await treatmentService.createTreatment(values);
        if (res.success) {
          success("Thành công", `Đã khởi tạo ca điều trị ${values.case_code}.`);
          setIsModalOpen(false);
          loadData(searchQuery);
        } else {
          error("Lỗi", res.error || "Không thể tạo ca điều trị.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTreatment) return;
    setIsDeleting(true);
    try {
      const res = await treatmentService.deleteTreatment(deletingTreatment.id);
      if (res.success) {
        success("Đã xóa", `Ca điều trị ${deletingTreatment.case_code} đã được xóa.`);
        setDeletingTreatment(null);
        loadData(searchQuery);
      } else {
        error("Lỗi", res.error || "Không thể xóa ca điều trị.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = () => {
    if (treatments.length === 0) {
      error("Thông báo", "Không có dữ liệu ca điều trị nào để xuất.");
      return;
    }
    try {
      exportTreatmentsToExcel(treatments);
      success("Xuất file thành công", `Đã tải về danh sách ${treatments.length} ca điều trị.`);
    } catch {
      error("Lỗi xuất file", "Đã có sự cố khi tạo file Excel.");
    }
  };

  const handleOpenManageTeeth = (t: TreatmentWithDetails) => {
    setManagingTeethTreatment(t);
    setToothFormData({
      tooth_number: "",
      jaw: "upper",
      material: "Zirconia",
      brand: "Ivoclar",
      shade: "A1",
      notes: "",
    });
    setAddingTooth(false);
  };

  const handleAddToothSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingTeethTreatment) return;
    if (!toothFormData.tooth_number.trim()) {
      error("Thiếu thông tin", "Vui lòng nhập vị trí số răng (theo chuẩn FDI, VD: 11, 21, 46).");
      return;
    }

    try {
      setAddingTooth(true);
      const res = await toothService.createTooth({
        treatment_id: managingTeethTreatment.id,
        tooth_number: toothFormData.tooth_number.trim(),
        jaw: toothFormData.jaw,
        material: toothFormData.material,
        brand: toothFormData.brand,
        shade: toothFormData.shade || null,
        notes: toothFormData.notes || null,
      });

      if (res.success && res.data) {
        setTeeth((prev) => [res.data as Tooth, ...prev]);
        success("Thành công", `Đã thêm răng ${toothFormData.tooth_number} vào ca điều trị.`);
        setToothFormData({
          tooth_number: "",
          jaw: "upper",
          material: "Zirconia",
          brand: "Ivoclar",
          shade: "A1",
          notes: "",
        });
      } else {
        error("Lỗi", res.error || "Không thể lưu thông tin răng.");
      }
    } finally {
      setAddingTooth(false);
    }
  };

  const handleDeleteTooth = async (toothId: string, toothNum: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vị trí răng ${toothNum} khỏi ca này?`)) return;
    try {
      const res = await toothService.deleteTooth(toothId);
      if (res.success) {
        setTeeth((prev) => prev.filter((t) => t.id !== toothId));
        success("Đã xóa", `Đã gỡ răng ${toothNum} khỏi ca điều trị.`);
      } else {
        error("Lỗi", res.error || "Không thể xóa răng.");
      }
    } catch {
      error("Lỗi", "Đã có sự cố khi xóa chi tiết răng.");
    }
  };

  return (
    <AdminLayoutWrapper
      title="Hồ Sơ Ca Điều Trị"
      subtitle="Quản lý lịch sử thực hiện phục hình nha khoa của từng bệnh nhân và bác sĩ phụ trách."
    >
      <div className="space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã ca, tên bác sĩ, bệnh nhân..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
              title="Xuất danh sách ca điều trị hiện tại ra file Excel"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Xuất Excel ({treatments.length})
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Tạo ca điều trị mới
            </button>
          </div>
        </div>

        {/* Content table */}
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : treatments.length === 0 ? (
          <EmptyState
            title="Không tìm thấy ca điều trị nào"
            description="Chưa có hồ sơ ca phục hình nào phù hợp với tìm kiếm."
            actionLabel="Tạo ca điều trị mới"
            onAction={openCreateModal}
            icon={<ClipboardList className="h-8 w-8 text-slate-400" />}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Mã ca hồ sơ</th>
                    <th className="py-3.5 px-4">Bệnh nhân</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Bác sĩ phụ trách</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Phòng khám</th>
                    <th className="py-3.5 px-4">Răng phục hình</th>
                    <th className="py-3.5 px-4">Ngày điều trị</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTreatments.map((t) => {
                    const caseTeeth = teeth.filter((th) => th.treatment_id === t.id);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <span className="font-mono text-xs font-bold text-navy-950 bg-slate-100 px-2.5 py-1 rounded-md">
                            {t.case_code}
                          </span>
                          {t.notes && (
                            <p className="text-xs text-slate-500 mt-1 max-w-xs truncate">{t.notes}</p>
                          )}
                        </td>
                        <td className="py-4 px-4 font-semibold text-navy-900">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span>{t.patient?.full_name || "Chưa xác định"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden md:table-cell text-xs text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-mint-600" />
                            <span>{t.dentist_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 hidden lg:table-cell text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate max-w-[180px]">{t.clinic?.name || "SmileLab"}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleOpenManageTeeth(t)}
                            title="Quản lý chi tiết các răng trong ca này"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-mint-50 px-2.5 py-1 text-xs font-semibold text-mint-800 border border-mint-200 hover:bg-mint-100 transition-colors cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-mint-600" />
                            <span>{caseTeeth.length} răng</span>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{t.treatment_date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenManageTeeth(t)}
                              title="Quản lý chi tiết răng trong ca"
                              className="rounded-lg p-1.5 text-mint-700 hover:bg-mint-50 transition-colors cursor-pointer"
                            >
                              <Sparkles className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(t)}
                              title="Sửa ca điều trị"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTreatment(t)}
                              title="Xóa ca điều trị"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={treatments.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal Thêm / Sửa Ca Điều Trị */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-bold text-navy-950">
                {editingTreatment ? "Cập nhật ca điều trị" : "Tạo ca điều trị mới"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Liên kết bệnh nhân, cơ sở thực hiện và bác sĩ điều trị trực tiếp.
              </p>

              <form onSubmit={handleSubmit(onSubmitForm)} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Mã hồ sơ ca <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("case_code")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-navy-950 focus:bg-white focus:border-mint-500 focus:outline-none"
                    />
                    {errors.case_code && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.case_code.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Ngày điều trị <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("treatment_date")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.treatment_date && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.treatment_date.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-navy-900">
                      Bệnh nhân tiếp nhận <span className="text-rose-500">*</span>
                    </label>
                    <Link
                      href="/admin/patients"
                      target="_blank"
                      className="text-[11px] font-medium text-mint-600 hover:text-mint-700 hover:underline"
                    >
                      + Thêm bệnh nhân
                    </Link>
                  </div>
                  <select
                    {...register("patient_id")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                  >
                    {patients.length === 0 && (
                      <option value="">-- Chưa có hồ sơ bệnh nhân --</option>
                    )}
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.patient_code} - {p.phone})
                      </option>
                    ))}
                  </select>
                  {errors.patient_id && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.patient_id.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-navy-900">
                      Phòng khám / Cơ sở <span className="text-rose-500">*</span>
                    </label>
                    <Link
                      href="/admin/clinics"
                      target="_blank"
                      className="text-[11px] font-medium text-mint-600 hover:text-mint-700 hover:underline"
                    >
                      + Thêm phòng khám
                    </Link>
                  </div>
                  <select
                    {...register("clinic_id")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                  >
                    {clinics.length === 0 && (
                      <option value="">-- Chưa có phòng khám đối tác --</option>
                    )}
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.is_active ? "" : "(Tạm ngưng)"}
                      </option>
                    ))}
                  </select>
                  {errors.clinic_id && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.clinic_id.message}</p>
                  )}
                  {clinics.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                      <span>⚠️ Hệ thống chưa có phòng khám nào. Vui lòng</span>
                      <Link href="/admin/clinics" className="underline font-semibold text-navy-950 hover:text-mint-600">
                        tạo phòng khám đối tác
                      </Link>
                      <span>trước.</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Bác sĩ điều trị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="BS. CKI Trần Minh Tuấn"
                    {...register("dentist_name")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                  {errors.dentist_name && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.dentist_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">Ghi chú ca điều trị</label>
                  <textarea
                    rows={3}
                    placeholder="Chẩn đoán, phục hình răng sứ loại nào, lưu ý kỹ thuật..."
                    {...register("notes")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                  {errors.notes && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.notes.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-navy-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-navy-900 disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : editingTreatment ? "Cập nhật" : "Tạo ca điều trị"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Managing Teeth Modal */}
        {managingTeethTreatment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-500/15 text-mint-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950">
                      Răng phục hình — Ca {managingTeethTreatment.case_code}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Bệnh nhân: <strong className="text-slate-700">{managingTeethTreatment.patient?.full_name || "N/A"}</strong> • Bác sĩ: {managingTeethTreatment.dentist_name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setManagingTeethTreatment(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-950 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto py-5 space-y-6">
                {/* List of teeth in treatment */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Danh sách răng trong ca (
                    {teeth.filter((t) => t.treatment_id === managingTeethTreatment.id).length} răng)
                  </h4>

                  {teeth.filter((t) => t.treatment_id === managingTeethTreatment.id).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center bg-slate-50/50">
                      <Sparkles className="mx-auto h-6 w-6 text-slate-300" />
                      <p className="text-xs font-medium text-slate-600 mt-1">
                        Chưa có vị trí răng nào được gán cho ca này
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Vui lòng nhập form bên dưới để thêm chi tiết từng răng phục hình.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                      {teeth
                        .filter((t) => t.treatment_id === managingTeethTreatment.id)
                        .map((th) => (
                          <div
                            key={th.id}
                            className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-900 font-mono font-bold text-white text-xs">
                                {th.tooth_number}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-navy-950">
                                  {th.material} ({th.brand})
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Hàm {th.jaw === "upper" ? "trên" : "dưới"}
                                  {th.shade && ` • Màu: ${th.shade}`}
                                  {th.notes && ` • ${th.notes}`}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteTooth(th.id, th.tooth_number)}
                              title="Xóa răng khỏi ca"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Form to add new tooth */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <h4 className="text-xs font-bold text-navy-950 mb-3 flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-mint-600" />
                    Thêm răng mới vào ca điều trị này
                  </h4>

                  <form onSubmit={handleAddToothSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Số răng (FDI) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="VD: 11, 21, 46..."
                          value={toothFormData.tooth_number}
                          onChange={(e) =>
                            setToothFormData({ ...toothFormData, tooth_number: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Hàm
                        </label>
                        <select
                          value={toothFormData.jaw}
                          onChange={(e) =>
                            setToothFormData({
                              ...toothFormData,
                              jaw: e.target.value as "upper" | "lower",
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                        >
                          <option value="upper">Hàm trên</option>
                          <option value="lower">Hàm dưới</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Màu sứ (VITA)
                        </label>
                        <input
                          type="text"
                          placeholder="A1, A2, OM1..."
                          value={toothFormData.shade}
                          onChange={(e) =>
                            setToothFormData({ ...toothFormData, shade: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Chất liệu răng sứ
                        </label>
                        <select
                          value={toothFormData.material}
                          onChange={(e) =>
                            setToothFormData({ ...toothFormData, material: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                        >
                          <option value="Zirconia">Zirconia cao cấp</option>
                          <option value="E.max">E.max Press / CAD</option>
                          <option value="Cercon HT">Cercon HT</option>
                          <option value="Lava Plus">Lava Plus 3M</option>
                          <option value="Răng sứ Kim loại">Răng sứ Kim loại</option>
                          <option value="Mặt dán Veneer">Mặt dán sứ Veneer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Hãng sản xuất phôi
                        </label>
                        <select
                          value={toothFormData.brand}
                          onChange={(e) =>
                            setToothFormData({ ...toothFormData, brand: e.target.value })
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                        >
                          <option value="Ivoclar">Ivoclar Vivadent</option>
                          <option value="Dentsply Sirona">Dentsply Sirona</option>
                          <option value="3M ESPE">3M ESPE</option>
                          <option value="Noritake">Noritake Katana</option>
                          <option value="Amann Girrbach">Amann Girrbach</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Ghi chú kỹ thuật răng
                      </label>
                      <input
                        type="text"
                        placeholder="Mão đơn, cầu răng, cùi răng..."
                        value={toothFormData.notes}
                        onChange={(e) =>
                          setToothFormData({ ...toothFormData, notes: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={addingTooth}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-navy-900 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        {addingTooth ? "Đang lưu..." : "Lưu vị trí răng này"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManagingTeethTreatment(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Hoàn tất & Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={Boolean(deletingTreatment)}
          title="Xác nhận xóa ca điều trị"
          message={`Bạn có chắc chắn muốn xóa ca điều trị ${deletingTreatment?.case_code}?`}
          confirmLabel="Xác nhận xóa"
          cancelLabel="Đóng"
          isDangerous={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTreatment(null)}
        />
      </div>
    </AdminLayoutWrapper>
  );
}

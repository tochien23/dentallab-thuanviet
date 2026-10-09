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
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastContext";
import { treatmentService, TreatmentWithDetails } from "@/services/treatmentService";
import { patientService } from "@/services/patientService";
import { clinicService } from "@/services/clinicService";
import { Patient, Clinic } from "@/types/database.types";
import { treatmentFormSchema, TreatmentFormValues } from "@/lib/validations/treatment";

const PAGE_SIZE = 8;

export default function TreatmentsAdminPage() {
  const [treatments, setTreatments] = useState<TreatmentWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<TreatmentWithDetails | null>(null);
  const [saving, setSaving] = useState(false);

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
      const [tList, pList, cList] = await Promise.all([
        treatmentService.getAllTreatments(query),
        patientService.getAllPatients(),
        clinicService.getAllClinics(),
      ]);
      setTreatments(tList);
      setPatients(pList);
      setClinics(cList);
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

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tạo ca điều trị mới
          </button>
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
                    <th className="py-3.5 px-4">Ngày điều trị</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTreatments.map((t) => (
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
                      <td className="py-4 px-4 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t.treatment_date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/teeth?treatmentId=${t.id}`}
                            title="Xem chi tiết răng phục hình"
                            className="rounded-lg p-1.5 text-mint-700 hover:bg-mint-50 transition-colors"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openEditModal(t)}
                            title="Sửa ca điều trị"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTreatment(t)}
                            title="Xóa ca điều trị"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                  <label className="block text-xs font-semibold text-navy-900">
                    Bệnh nhân tiếp nhận <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("patient_id")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                  >
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
                  <label className="block text-xs font-semibold text-navy-900">
                    Phòng khám / Cơ sở <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("clinic_id")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                  >
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.clinic_id && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.clinic_id.message}</p>
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

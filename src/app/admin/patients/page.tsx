"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  X,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastContext";
import { patientService } from "@/services/patientService";
import { Patient } from "@/types/database.types";
import { patientFormSchema, PatientFormValues } from "@/lib/validations/patient";

const PAGE_SIZE = 8;

export default function PatientsAdminPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm Delete State
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
  });

  const loadPatients = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients(query);
      setPatients(data);
    } catch {
      error("Lỗi", "Không thể tải danh sách bệnh nhân.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    loadPatients();
  }, [loadPatients]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPatients(searchQuery);
  };

  // Pagination calculation
  const totalPages = Math.ceil(patients.length / PAGE_SIZE) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return patients.slice(start, start + PAGE_SIZE);
  }, [patients, currentPage]);

  const openCreateModal = () => {
    setEditingPatient(null);
    reset({
      patient_code: `BN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: "",
      phone: "",
      email: "",
      date_of_birth: "",
      gender: "male",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Patient) => {
    setEditingPatient(p);
    reset({
      patient_code: p.patient_code,
      full_name: p.full_name,
      phone: p.phone,
      email: p.email || "",
      date_of_birth: p.date_of_birth || "",
      gender: p.gender || "male",
      notes: p.notes || "",
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (values: PatientFormValues) => {
    setSaving(true);
    try {
      if (editingPatient) {
        const res = await patientService.updatePatient(editingPatient.id, values);
        if (res.success) {
          success("Thành công", `Đã cập nhật thông tin bệnh nhân ${values.full_name}.`);
          setIsModalOpen(false);
          loadPatients(searchQuery);
        } else {
          error("Lỗi", res.error || "Không thể cập nhật bệnh nhân.");
        }
      } else {
        const res = await patientService.createPatient(values);
        if (res.success) {
          success("Thành công", `Đã thêm mới hồ sơ bệnh nhân ${values.full_name}.`);
          setIsModalOpen(false);
          loadPatients(searchQuery);
        } else {
          error("Lỗi", res.error || "Không thể tạo hồ sơ bệnh nhân.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPatient) return;
    setIsDeleting(true);
    try {
      const res = await patientService.deletePatient(deletingPatient.id);
      if (res.success) {
        success("Đã xóa", `Hồ sơ bệnh nhân ${deletingPatient.full_name} đã được gỡ bỏ.`);
        setDeletingPatient(null);
        loadPatients(searchQuery);
      } else {
        error("Lỗi", res.error || "Không thể xóa hồ sơ bệnh nhân.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayoutWrapper
      title="Quản lý Bệnh nhân & Khách hàng"
      subtitle="Danh sách hồ sơ bệnh nhân, thông tin liên lạc và quản lý thông tin điều trị."
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
              placeholder="Tìm theo tên, SĐT hoặc mã bệnh nhân..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
            />
          </form>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm bệnh nhân mới
          </button>
        </div>

        {/* Content table */}
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : patients.length === 0 ? (
          <EmptyState
            title="Không tìm thấy bệnh nhân nào"
            description="Chưa có hồ sơ bệnh nhân nào khớp với tiêu chí tìm kiếm của bạn."
            actionLabel="Thêm bệnh nhân mới"
            onAction={openCreateModal}
            icon={<Users className="h-8 w-8 text-slate-400" />}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Mã & Họ tên</th>
                    <th className="py-3.5 px-4">Số điện thoại</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Email</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Ngày sinh / Giới tính</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Ghi chú</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 font-bold text-navy-800 text-xs">
                            {p.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-navy-950">{p.full_name}</p>
                            <span className="font-mono text-xs text-slate-500">{p.patient_code}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{p.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell text-xs text-slate-500">
                        {p.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{p.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell text-xs text-slate-600">
                        <div>
                          <span>{p.date_of_birth || "Chưa cập nhật"}</span>
                          {p.gender && (
                            <span className="ml-2 rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 uppercase font-semibold">
                              {p.gender === "male" ? "Nam" : p.gender === "female" ? "Nữ" : "Khác"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden sm:table-cell text-xs text-slate-500 max-w-xs truncate">
                        {p.notes || "-"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            title="Sửa thông tin"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingPatient(p)}
                            title="Xóa hồ sơ"
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
              totalItems={patients.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal Thêm / Sửa Bệnh Nhân */}
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
                {editingPatient ? "Cập nhật hồ sơ bệnh nhân" : "Thêm mới hồ sơ bệnh nhân"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Nhập đầy đủ thông tin cá nhân và liên lạc để quản lý hồ sơ điều trị.
              </p>

              <form onSubmit={handleSubmit(onSubmitForm)} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Mã bệnh nhân <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("patient_code")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-navy-950 focus:bg-white focus:border-mint-500 focus:outline-none"
                    />
                    {errors.patient_code && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.patient_code.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn An"
                      {...register("full_name")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.full_name && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.full_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0912345678"
                      {...register("phone")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">Email</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      {...register("email")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">Ngày sinh</label>
                    <input
                      type="date"
                      {...register("date_of_birth")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">Giới tính</label>
                    <select
                      {...register("gender")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">Ghi chú điều trị</label>
                  <textarea
                    rows={3}
                    placeholder="Tình trạng răng miệng, tiền sử bệnh án, yêu cầu thẩm mỹ..."
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
                    {saving ? "Đang lưu..." : editingPatient ? "Cập nhật" : "Lưu hồ sơ"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={Boolean(deletingPatient)}
          title="Xác nhận xóa hồ sơ bệnh nhân"
          message={`Bạn có chắc chắn muốn xóa hồ sơ của bệnh nhân ${deletingPatient?.full_name}? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xác nhận xóa"
          cancelLabel="Đóng"
          isDangerous={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPatient(null)}
        />
      </div>
    </AdminLayoutWrapper>
  );
}

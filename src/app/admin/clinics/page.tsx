"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastContext";
import { clinicService } from "@/services/clinicService";
import { Clinic } from "@/types/database.types";
import { clinicFormSchema, ClinicFormValues } from "@/lib/validations/clinic";

const PAGE_SIZE = 8;

export default function ClinicsAdminPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm Delete State
  const [deletingClinic, setDeletingClinic] = useState<Clinic | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const loadClinics = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      const data = await clinicService.getAllClinics(query);
      setClinics(data);
    } catch {
      error("Lỗi", "Không thể tải danh sách phòng khám đối tác.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch on mount
    loadClinics();
  }, [loadClinics]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadClinics(searchQuery);
  };

  const totalPages = Math.ceil(clinics.length / PAGE_SIZE) || 1;
  const paginatedClinics = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return clinics.slice(start, start + PAGE_SIZE);
  }, [clinics, currentPage]);

  const openCreateModal = () => {
    setEditingClinic(null);
    reset({
      name: "",
      address: "",
      phone: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Clinic) => {
    setEditingClinic(c);
    reset({
      name: c.name,
      address: c.address,
      phone: c.phone,
      is_active: c.is_active,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (values: ClinicFormValues) => {
    setSaving(true);
    try {
      if (editingClinic) {
        const res = await clinicService.updateClinic(editingClinic.id, values);
        if (res.success) {
          success("Thành công", `Đã cập nhật thông tin phòng khám "${values.name}".`);
          setIsModalOpen(false);
          loadClinics(searchQuery);
        } else {
          error("Lỗi", res.error || "Không thể cập nhật phòng khám.");
        }
      } else {
        const res = await clinicService.createClinic(values);
        if (res.success) {
          success("Thành công", `Đã thêm phòng khám đối tác "${values.name}".`);
          setIsModalOpen(false);
          loadClinics(searchQuery);
        } else {
          error("Lỗi", res.error || "Không thể tạo phòng khám.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingClinic) return;
    setIsDeleting(true);
    try {
      const res = await clinicService.deleteClinic(deletingClinic.id);
      if (res.success) {
        success("Đã xóa", `Phòng khám "${deletingClinic.name}" đã được gỡ bỏ khỏi hệ thống.`);
        setDeletingClinic(null);
        loadClinics(searchQuery);
      } else {
        error("Lỗi", res.error || "Không thể xóa phòng khám.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleClinicStatus = async (c: Clinic) => {
    try {
      const newStatus = !c.is_active;
      const res = await clinicService.updateClinic(c.id, { is_active: newStatus });
      if (res.success) {
        success(
          "Cập nhật trạng thái",
          `Phòng khám "${c.name}" hiện ${newStatus ? "đang hoạt động" : "tạm ngưng hợp tác"}.`
        );
        loadClinics(searchQuery);
      } else {
        error("Lỗi", "Không thể cập nhật trạng thái phòng khám.");
      }
    } catch {
      error("Lỗi", "Đã xảy ra lỗi khi thay đổi trạng thái.");
    }
  };

  return (
    <AdminLayoutWrapper
      title="Quản lý Phòng khám & Cơ sở Đối tác"
      subtitle="Danh mục các phòng khám, nha khoa và đối tác liên kết điều trị và phát hành thẻ bảo hành."
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
              placeholder="Tìm theo tên phòng khám, địa chỉ hoặc SĐT..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
            />
          </form>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm phòng khám mới
          </button>
        </div>

        {/* Content table */}
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : clinics.length === 0 ? (
          <EmptyState
            title="Chưa có phòng khám / cơ sở nào"
            description="Hãy thêm phòng khám nha khoa đối tác đầu tiên để liên kết khi tạo ca điều trị và thẻ bảo hành."
            actionLabel="Thêm phòng khám mới"
            onAction={openCreateModal}
            icon={<Building2 className="h-8 w-8 text-slate-400" />}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Tên Phòng khám / Cơ sở</th>
                    <th className="py-3.5 px-4">Hotline liên hệ</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Địa chỉ cơ sở</th>
                    <th className="py-3.5 px-4 text-center">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedClinics.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 font-bold text-navy-800 text-xs">
                            <Building2 className="h-4 w-4 text-navy-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy-950">{c.name}</p>
                            <span className="font-mono text-[11px] text-slate-400">ID: {c.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{c.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 max-w-sm" title={c.address}>
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleClinicStatus(c)}
                          title="Nhấp để đổi trạng thái"
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          {c.is_active ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5">
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              Đang hợp tác
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5">
                              <XCircle className="h-3 w-3 text-slate-400" />
                              Tạm ngưng
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            title="Sửa thông tin"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingClinic(c)}
                            title="Xóa phòng khám"
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
              totalItems={clinics.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal Thêm / Sửa Phòng khám */}
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
                {editingClinic ? "Cập nhật phòng khám đối tác" : "Thêm phòng khám / cơ sở đối tác mới"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Thông tin này sẽ được chọn khi tạo hồ sơ điều trị và in trên chứng nhận bảo hành.
              </p>

              <form onSubmit={handleSubmit(onSubmitForm)} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Tên phòng khám / Nha khoa <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="VD: Nha Khoa Thẩm Mỹ SmileCare"
                      {...register("name")}
                      className="block w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Địa chỉ cơ sở <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Số nhà, Đường, Quận/Huyện, Tỉnh/TP"
                      {...register("address")}
                      className="block w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Số điện thoại hotline <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="0901234567 hoặc 028 3822 5566"
                      {...register("phone")}
                      className="block w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...register("is_active")}
                    className="h-4 w-4 rounded border-slate-300 text-mint-600 focus:ring-mint-500"
                  />
                  <label htmlFor="is_active" className="text-xs font-semibold text-navy-900 select-none cursor-pointer">
                    Đang hoạt động & cho phép liên kết ca điều trị
                  </label>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-xl bg-navy-950 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : editingClinic ? "Cập nhật" : "Tạo phòng khám"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog Xác nhận Xóa */}
        <ConfirmDialog
          isOpen={!!deletingClinic}
          title="Xác nhận xóa phòng khám"
          message={`Bạn có chắc chắn muốn xóa phòng khám "${deletingClinic?.name}"? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa vĩnh viễn"
          isLoading={isDeleting}
          isDangerous={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingClinic(null)}
        />
      </div>
    </AdminLayoutWrapper>
  );
}

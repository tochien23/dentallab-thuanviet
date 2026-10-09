"use client";

import React, { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Search,
  Plus,
  Edit2,
  Trash2,
  Palette,
  X,
  Filter,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastContext";
import { toothService, ToothWithTreatment } from "@/services/toothService";
import { treatmentService } from "@/services/treatmentService";
import { Treatment } from "@/types/database.types";
import { toothFormSchema, ToothFormValues } from "@/lib/validations/tooth";

const PAGE_SIZE = 8;

export default function TeethAdminPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={5} />}>
      <TeethAdminContent />
    </Suspense>
  );
}

function TeethAdminContent() {
  const searchParams = useSearchParams();
  const initialTreatmentId = searchParams.get("treatmentId") || "";

  const [teeth, setTeeth] = useState<ToothWithTreatment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(initialTreatmentId);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTooth, setEditingTooth] = useState<ToothWithTreatment | null>(null);
  const [saving, setSaving] = useState(false);

  // Confirm Delete State
  const [deletingTooth, setDeletingTooth] = useState<ToothWithTreatment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ToothFormValues>({
    resolver: zodResolver(toothFormSchema),
  });

  const loadData = useCallback(async (treatmentId?: string, query?: string) => {
    try {
      setLoading(true);
      const [tList, trList] = await Promise.all([
        toothService.getAllTeeth(treatmentId || undefined, query || undefined),
        treatmentService.getAllTreatments(),
      ]);
      setTeeth(tList);
      setTreatments(trList);
    } catch {
      error("Lỗi", "Không thể tải dữ liệu chi tiết răng.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    loadData(selectedTreatmentId, searchQuery);
  }, [selectedTreatmentId, loadData, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData(selectedTreatmentId, searchQuery);
  };

  const totalPages = Math.ceil(teeth.length / PAGE_SIZE) || 1;
  const paginatedTeeth = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return teeth.slice(start, start + PAGE_SIZE);
  }, [teeth, currentPage]);

  const openCreateModal = () => {
    setEditingTooth(null);
    reset({
      treatment_id: selectedTreatmentId || treatments[0]?.id || "",
      tooth_number: "11",
      jaw: "upper",
      material: "Sứ E.max Press",
      brand: "Ivoclar Vivadent",
      shade: "BL2",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tooth: ToothWithTreatment) => {
    setEditingTooth(tooth);
    reset({
      treatment_id: tooth.treatment_id,
      tooth_number: tooth.tooth_number,
      jaw: tooth.jaw,
      material: tooth.material,
      brand: tooth.brand,
      shade: tooth.shade || "",
      notes: tooth.notes || "",
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (values: ToothFormValues) => {
    setSaving(true);
    try {
      if (editingTooth) {
        const res = await toothService.updateTooth(editingTooth.id, values);
        if (res.success) {
          success("Thành công", `Đã cập nhật chi tiết răng ${values.tooth_number}.`);
          setIsModalOpen(false);
          loadData(selectedTreatmentId, searchQuery);
        } else {
          error("Lỗi", res.error || "Không thể cập nhật chi tiết răng.");
        }
      } else {
        const res = await toothService.createTooth(values);
        if (res.success) {
          success("Thành công", `Đã thêm chi tiết răng ${values.tooth_number}.`);
          setIsModalOpen(false);
          loadData(selectedTreatmentId, searchQuery);
        } else {
          error("Lỗi", res.error || "Không thể thêm chi tiết răng.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTooth) return;
    setIsDeleting(true);
    try {
      const res = await toothService.deleteTooth(deletingTooth.id);
      if (res.success) {
        success("Đã xóa", `Chi tiết răng ${deletingTooth.tooth_number} đã được xóa.`);
        setDeletingTooth(null);
        loadData(selectedTreatmentId, searchQuery);
      } else {
        error("Lỗi", res.error || "Không thể xóa răng.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayoutWrapper
      title="Chi Tiết Răng Phục Hình"
      subtitle="Quản lý sơ đồ răng theo chuẩn quốc tế FDI, phôi sứ, hãng sản xuất và bảng màu VITA."
    >
      <div className="space-y-6">
        {/* Actions & Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo số răng (11, 21...), vật liệu, hãng, màu shade..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
              />
            </form>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
              <select
                value={selectedTreatmentId}
                onChange={(e) => {
                  setSelectedTreatmentId(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
              >
                <option value="">Tất cả ca điều trị</option>
                {treatments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.case_code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm chi tiết răng
          </button>
        </div>

        {/* Content table */}
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : teeth.length === 0 ? (
          <EmptyState
            title="Không tìm thấy chi tiết răng nào"
            description="Chưa có dữ liệu răng phục hình nào phù hợp với bộ lọc hiện tại."
            actionLabel="Thêm chi tiết răng"
            onAction={openCreateModal}
            icon={<Sparkles className="h-8 w-8 text-slate-400" />}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Vị trí răng (FDI)</th>
                    <th className="py-3.5 px-4">Hàm</th>
                    <th className="py-3.5 px-4">Vật liệu sứ</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Thương hiệu</th>
                    <th className="py-3.5 px-4">Màu shade VITA</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Hồ sơ ca</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTeeth.map((tooth) => (
                    <tr key={tooth.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-navy-950">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-mint-100 text-mint-900 font-mono text-sm font-bold">
                          {tooth.tooth_number}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold">
                        <span
                          className={`rounded-full px-2.5 py-0.5 ${
                            tooth.jaw === "upper"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {tooth.jaw === "upper" ? "Hàm trên" : "Hàm dưới"}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-navy-900">
                        {tooth.material}
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell text-xs text-slate-600">
                        {tooth.brand}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {tooth.shade ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 font-mono font-bold text-amber-800">
                            <Palette className="h-3 w-3 text-amber-600" />
                            {tooth.shade}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell text-xs text-slate-500 font-mono">
                        {tooth.treatment?.case_code || "-"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(tooth)}
                            title="Sửa chi tiết răng"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTooth(tooth)}
                            title="Xóa răng"
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
              totalItems={teeth.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal Thêm / Sửa Chi Tiết Răng */}
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
                {editingTooth ? "Cập nhật chi tiết răng" : "Thêm mới chi tiết răng"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Khai báo số răng theo sơ đồ FDI, vật liệu phôi sứ và mã màu VITA.
              </p>

              <form onSubmit={handleSubmit(onSubmitForm)} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Thuộc ca điều trị <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("treatment_id")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                  >
                    {treatments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.case_code} — {t.dentist_name}
                      </option>
                    ))}
                  </select>
                  {errors.treatment_id && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.treatment_id.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Vị trí răng (FDI) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 11, 21, 46..."
                      {...register("tooth_number")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.tooth_number && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.tooth_number.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Cung hàm <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register("jaw")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                    >
                      <option value="upper">Hàm trên</option>
                      <option value="lower">Hàm dưới</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Vật liệu sứ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Sứ E.max Press, Zirconia..."
                      {...register("material")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.material && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.material.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Hãng sản xuất <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Ivoclar Vivadent, Dentsply..."
                      {...register("brand")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.brand && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.brand.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Bảng màu VITA Shade
                  </label>
                  <input
                    type="text"
                    placeholder="VD: BL2, A1, A2, OM3..."
                    {...register("shade")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                  {errors.shade && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.shade.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Vị trí phục hình, hình dạng giải phẫu răng..."
                    {...register("notes")}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
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
                    {saving ? "Đang lưu..." : editingTooth ? "Cập nhật" : "Lưu chi tiết"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={Boolean(deletingTooth)}
          title="Xác nhận xóa chi tiết răng"
          message={`Bạn có chắc muốn xóa chi tiết răng số ${deletingTooth?.tooth_number}?`}
          confirmLabel="Xác nhận xóa"
          cancelLabel="Đóng"
          isDangerous={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingTooth(null)}
        />
      </div>
    </AdminLayoutWrapper>
  );
}

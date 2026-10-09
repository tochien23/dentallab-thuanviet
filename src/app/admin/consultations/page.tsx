"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  MessageSquareHeart,
  Search,
  Phone,
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastContext";
import { consultationService } from "@/services/consultationService";
import { ConsultationRequest, ConsultationStatus } from "@/types/database.types";

const PAGE_SIZE = 8;

export default function ConsultationsAdminPage() {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit / Status update modal
  const [editingItem, setEditingItem] = useState<ConsultationRequest | null>(null);
  const [newStatus, setNewStatus] = useState<ConsultationStatus>("new");
  const [internalNote, setInternalNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm
  const [deletingItem, setDeletingItem] = useState<ConsultationRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  const loadConsultations = useCallback(async (status?: string, query?: string) => {
    try {
      setLoading(true);
      const data = await consultationService.getAllConsultations(status, query);
      setConsultations(data);
    } catch {
      error("Lỗi", "Không thể tải danh sách yêu cầu tư vấn.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    loadConsultations(statusFilter, searchQuery);
  }, [statusFilter, loadConsultations, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadConsultations(statusFilter, searchQuery);
  };

  const totalPages = Math.ceil(consultations.length / PAGE_SIZE) || 1;
  const paginatedConsultations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return consultations.slice(start, start + PAGE_SIZE);
  }, [consultations, currentPage]);

  const openEditModal = (item: ConsultationRequest) => {
    setEditingItem(item);
    setNewStatus(item.status);
    setInternalNote(item.internal_note || "");
  };

  const handleSaveStatus = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const res = await consultationService.updateConsultation(
        editingItem.id,
        newStatus,
        internalNote
      );
      if (res.success) {
        success("Thành công", `Đã cập nhật yêu cầu của ${editingItem.full_name}.`);
        setEditingItem(null);
        loadConsultations(statusFilter, searchQuery);
      } else {
        error("Lỗi", res.error || "Không thể cập nhật.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await consultationService.deleteConsultation(deletingItem.id);
      if (res.success) {
        success("Đã xóa", `Yêu cầu tư vấn của ${deletingItem.full_name} đã được xóa.`);
        setDeletingItem(null);
        loadConsultations(statusFilter, searchQuery);
      } else {
        error("Lỗi", res.error || "Không thể xóa yêu cầu.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayoutWrapper
      title="Yêu Cầu Tư Vấn Khách Hàng"
      subtitle="Tiếp nhận và quản lý các yêu cầu tư vấn gửi từ trang chủ SmileLab Dental."
    >
      <div className="space-y-6">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "all", label: "Tất cả" },
            { id: "new", label: "Chờ liên hệ (Mới)" },
            { id: "contacted", label: "Đã liên hệ" },
            { id: "resolved", label: "Đã xử lý / Đặt hẹn" },
            { id: "cancelled", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-navy-950 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên khách hàng, số điện thoại, dịch vụ..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
            />
          </form>
        </div>

        {/* Content table */}
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : consultations.length === 0 ? (
          <EmptyState
            title="Không có yêu cầu tư vấn nào"
            description="Chưa có yêu cầu tư vấn nào phù hợp với bộ lọc hiện tại."
            icon={<MessageSquareHeart className="h-8 w-8 text-slate-400" />}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Khách hàng</th>
                    <th className="py-3.5 px-4">Số điện thoại</th>
                    <th className="py-3.5 px-4">Dịch vụ quan tâm</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Nội dung lời nhắn</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedConsultations.map((c) => {
                    const createdTime = new Date(c.created_at).toLocaleString("vi-VN");
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div>
                            <p className="font-semibold text-navy-950">{c.full_name}</p>
                            <span className="text-[11px] text-slate-400">{createdTime}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-medium text-slate-700">
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 text-navy-900 hover:text-mint-600 font-semibold"
                          >
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{c.phone}</span>
                          </a>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-navy-900">
                            {c.service}
                          </span>
                        </td>

                        <td className="py-4 px-4 hidden md:table-cell text-xs text-slate-600 max-w-xs">
                          <p className="truncate">{c.message || "Không để lại lời nhắn"}</p>
                          {c.internal_note && (
                            <p className="mt-1 text-[11px] text-amber-700 italic truncate">
                              Ghi chú CSKH: {c.internal_note}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              c.status === "new"
                                ? "bg-rose-100 text-rose-800 animate-pulse"
                                : c.status === "contacted"
                                ? "bg-amber-100 text-amber-800"
                                : c.status === "resolved"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {c.status === "new" && "Chờ liên hệ"}
                            {c.status === "contacted" && "Đã liên hệ"}
                            {c.status === "resolved" && "Đã xử lý"}
                            {c.status === "cancelled" && "Đã hủy"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${c.phone}`}
                              title="Gọi điện tư vấn"
                              className="rounded-lg p-1.5 text-mint-700 hover:bg-mint-50 transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => openEditModal(c)}
                              title="Cập nhật trạng thái & ghi chú"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingItem(c)}
                              title="Xóa yêu cầu"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
              totalItems={consultations.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal Cập Nhật Trạng Thái & Ghi Chú CSKH */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <button
                onClick={() => setEditingItem(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-bold text-navy-950">
                Xử lý yêu cầu tư vấn
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Khách hàng: <span className="font-semibold text-navy-900">{editingItem.full_name}</span> ({editingItem.phone})
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Trạng thái chăm sóc
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ConsultationStatus)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                  >
                    <option value="new">Chờ liên hệ (Mới)</option>
                    <option value="contacted">Đã liên hệ điện thoại</option>
                    <option value="resolved">Đã xử lý / Đã đặt lịch hẹn khám</option>
                    <option value="cancelled">Khách hủy / Không có nhu cầu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Ghi chú nội bộ CSKH
                  </label>
                  <textarea
                    rows={3}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="VD: Đã gọi lúc 10h, khách hẹn 14h thứ Bảy đến thăm khám bọc răng sứ..."
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    disabled={isSaving}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    disabled={isSaving}
                    className="rounded-xl bg-navy-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-navy-900 disabled:opacity-50"
                  >
                    {isSaving ? "Đang lưu..." : "Cập nhật tiến độ"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={Boolean(deletingItem)}
          title="Xác nhận xóa yêu cầu tư vấn"
          message={`Bạn có chắc muốn xóa yêu cầu tư vấn của khách hàng ${deletingItem?.full_name}?`}
          confirmLabel="Xác nhận xóa"
          cancelLabel="Hủy"
          isDangerous={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      </div>
    </AdminLayoutWrapper>
  );
}

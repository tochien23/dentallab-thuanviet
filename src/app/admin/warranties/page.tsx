"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShieldCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ShieldOff,
  Clock,
  History,
  CalendarPlus,
  X,
  CheckCircle2,
  QrCode,
  Printer,
  Eye,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  PrintableWarrantyCertificate,
  WarrantyResultCard,
  WarrantySearchForm,
} from "@/components/warranty";
import { useToast } from "@/components/admin/ToastContext";
import { warrantyService, WarrantyWithDetails } from "@/services/warrantyService";
import { patientService } from "@/services/patientService";
import { treatmentService } from "@/services/treatmentService";
import { toothService } from "@/services/toothService";
import { Patient, Treatment, Tooth, WarrantyLog, WarrantyStatus, PublicWarrantyResult } from "@/types/database.types";
import { warrantyFormSchema, WarrantyFormValues } from "@/lib/validations/warranty";

const PAGE_SIZE = 8;

export default function WarrantiesAdminPage() {
  const [warranties, setWarranties] = useState<WarrantyWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [teeth, setTeeth] = useState<Tooth[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarranty, setEditingWarranty] = useState<WarrantyWithDetails | null>(null);
  const [saving, setSaving] = useState(false);

  // Extend Warranty Modal
  const [extendingWarranty, setExtendingWarranty] = useState<WarrantyWithDetails | null>(null);
  const [extendMonths, setExtendMonths] = useState(12);
  const [extendNote, setExtendNote] = useState("");
  const [isExtending, setIsExtending] = useState(false);

  // Status Change Modal
  const [changingStatusWarranty, setChangingStatusWarranty] = useState<WarrantyWithDetails | null>(null);
  const [newStatus, setNewStatus] = useState<WarrantyStatus>("active");
  const [statusNote, setStatusNote] = useState("");
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Logs Modal
  const [viewingLogsWarranty, setViewingLogsWarranty] = useState<WarrantyWithDetails | null>(null);
  const [warrantyLogs, setWarrantyLogs] = useState<WarrantyLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Delete Confirm
  const [deletingWarranty, setDeletingWarranty] = useState<WarrantyWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Print Certificate Modal
  const [printingWarranty, setPrintingWarranty] = useState<PublicWarrantyResult | null>(null);

  // Admin Lookup & Detail Card Modal
  const [isSearchLookupOpen, setIsSearchLookupOpen] = useState(false);
  const [viewingDetailWarranty, setViewingDetailWarranty] = useState<PublicWarrantyResult | null>(null);

  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WarrantyFormValues>({
    resolver: zodResolver(warrantyFormSchema),
  });

  const loadData = useCallback(async (query?: string, status?: string) => {
    try {
      setLoading(true);
      const [wList, pList, trList, thList] = await Promise.all([
        warrantyService.getAllWarranties(query, status),
        patientService.getAllPatients(),
        treatmentService.getAllTreatments(),
        toothService.getAllTeeth(),
      ]);
      setWarranties(wList);
      setPatients(pList);
      setTreatments(trList);
      setTeeth(thList);
    } catch {
      error("Lỗi", "Không thể tải danh sách thẻ bảo hành.");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    loadData(searchQuery, statusFilter);
  }, [statusFilter, loadData, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData(searchQuery, statusFilter);
  };

  const totalPages = Math.ceil(warranties.length / PAGE_SIZE) || 1;
  const paginatedWarranties = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return warranties.slice(start, start + PAGE_SIZE);
  }, [warranties, currentPage]);

  const openCreateModal = () => {
    setEditingWarranty(null);
    const today = new Date().toISOString().split("T")[0];
    const randomCode = `SL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    reset({
      warranty_code: randomCode,
      patient_id: patients[0]?.id || "",
      treatment_id: treatments[0]?.id || "",
      tooth_id: null,
      product_name: "Răng toàn sứ IPS E.max Press",
      brand: "Ivoclar Vivadent",
      warranty_period_months: 120,
      activated_at: today,
      status: "active",
      public_note: "Bảo hành chính hãng 10 năm theo tiêu chuẩn kỹ thuật nhà sản xuất.",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (w: WarrantyWithDetails) => {
    setEditingWarranty(w);
    reset({
      warranty_code: w.warranty_code,
      patient_id: w.patient_id,
      treatment_id: w.treatment_id,
      tooth_id: w.tooth_id,
      product_name: w.product_name,
      brand: w.brand,
      warranty_period_months: w.warranty_period_months,
      activated_at: w.activated_at.split("T")[0],
      status: w.status,
      public_note: w.public_note || "",
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (values: WarrantyFormValues) => {
    setSaving(true);
    try {
      if (editingWarranty) {
        const res = await warrantyService.updateWarranty(editingWarranty.id, values);
        if (res.success) {
          success("Thành công", `Đã cập nhật thẻ bảo hành ${values.warranty_code}.`);
          setIsModalOpen(false);
          loadData(searchQuery, statusFilter);
        } else {
          error("Lỗi", res.error || "Không thể cập nhật thẻ.");
        }
      } else {
        const res = await warrantyService.createWarranty(values);
        if (res.success) {
          success("Thành công", `Đã cấp mới thẻ bảo hành ${values.warranty_code}.`);
          setIsModalOpen(false);
          loadData(searchQuery, statusFilter);
        } else {
          error("Lỗi", res.error || "Không thể cấp thẻ bảo hành.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  // Open Extend Modal
  const openExtendModal = (w: WarrantyWithDetails) => {
    setExtendingWarranty(w);
    setExtendMonths(12);
    setExtendNote("Gia hạn bảo hành bổ sung cho khách hàng thân thiết.");
  };

  const handleConfirmExtend = async () => {
    if (!extendingWarranty) return;
    setIsExtending(true);
    try {
      const res = await warrantyService.extendWarranty(
        extendingWarranty.id,
        extendMonths,
        extendNote
      );
      if (res.success) {
        success("Đã gia hạn", `Thẻ ${extendingWarranty.warranty_code} đã được cộng thêm ${extendMonths} tháng.`);
        setExtendingWarranty(null);
        loadData(searchQuery, statusFilter);
      } else {
        error("Lỗi", res.error || "Không thể gia hạn.");
      }
    } finally {
      setIsExtending(false);
    }
  };

  // Open Status Change Modal
  const openStatusModal = (w: WarrantyWithDetails) => {
    setChangingStatusWarranty(w);
    setNewStatus(w.status);
    setStatusNote("");
  };

  const handleConfirmStatusChange = async () => {
    if (!changingStatusWarranty) return;
    setIsChangingStatus(true);
    try {
      const res = await warrantyService.updateWarrantyStatus(
        changingStatusWarranty.id,
        newStatus,
        statusNote
      );
      if (res.success) {
        success("Đã đổi trạng thái", `Thẻ ${changingStatusWarranty.warranty_code} đã chuyển sang "${newStatus}".`);
        setChangingStatusWarranty(null);
        loadData(searchQuery, statusFilter);
      } else {
        error("Lỗi", res.error || "Không thể đổi trạng thái.");
      }
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Open Logs Modal
  const openLogsModal = async (w: WarrantyWithDetails) => {
    setViewingLogsWarranty(w);
    setLoadingLogs(true);
    try {
      const logs = await warrantyService.getWarrantyLogs(w.id);
      setWarrantyLogs(logs);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingWarranty) return;
    setIsDeleting(true);
    try {
      const res = await warrantyService.deleteWarranty(deletingWarranty.id);
      if (res.success) {
        success("Đã xóa", `Thẻ bảo hành ${deletingWarranty.warranty_code} đã bị xóa.`);
        setDeletingWarranty(null);
        loadData(searchQuery, statusFilter);
      } else {
        error("Lỗi", res.error || "Không thể xóa thẻ bảo hành.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getPublicWarrantyFromDetails = (w: WarrantyWithDetails): PublicWarrantyResult => {
    const isExp = new Date(w.expires_at) < new Date();
    return {
      warranty_code: w.warranty_code,
      product_name: w.product_name,
      brand: w.brand,
      tooth_number: w.tooth?.tooth_number || null,
      jaw: w.tooth?.jaw || null,
      material: w.tooth?.material || null,
      shade: w.tooth?.shade || null,
      clinic_name: "SmileLab Dental Clinic & Lab",
      activated_at: w.activated_at,
      expires_at: w.expires_at,
      status: w.status,
      effective_status:
        w.status === "active" && isExp ? "expired" : w.status,
      public_note: w.public_note,
      masked_patient_name: w.patient
        ? w.patient.full_name
            .split(" ")
            .map((s) => (s.length > 0 ? s[0] + "***" : s))
            .join(" ")
        : "Khách hàng bảo mật",
    };
  };

  const handleOpenPrint = (w: WarrantyWithDetails) => {
    setPrintingWarranty(getPublicWarrantyFromDetails(w));
  };

  return (
    <AdminLayoutWrapper
      title="Quản Lý Thẻ Bảo Hành Điện Tử"
      subtitle="Cấp mới thẻ bảo hành, quản lý hiệu lực, gia hạn thời gian và theo dõi lịch sử thao tác."
    >
      <div className="space-y-6">
        {/* Status tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "all", label: "Tất cả thẻ" },
            { id: "active", label: "Còn hiệu lực" },
            { id: "expired", label: "Đã hết hạn" },
            { id: "suspended", label: "Tạm khóa" },
            { id: "pending", label: "Chờ kích hoạt" },
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

        {/* Search & Create Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã thẻ (SL-2026...), dòng sứ, khách hàng..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSearchLookupOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-navy-950 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
            >
              <Search className="h-4 w-4 text-mint-600" />
              Tra cứu thẻ (In phiếu)
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Cấp thẻ bảo hành mới
            </button>
          </div>
        </div>

        {/* Content table */}
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : warranties.length === 0 ? (
          <EmptyState
            title="Không tìm thấy thẻ bảo hành nào"
            description="Chưa có thẻ bảo hành nào phù hợp với bộ lọc hiện tại."
            actionLabel="Cấp thẻ bảo hành mới"
            onAction={openCreateModal}
            icon={<ShieldCheck className="h-8 w-8 text-slate-400" />}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Mã thẻ & Sản phẩm</th>
                    <th className="py-3.5 px-4">Bệnh nhân</th>
                    <th className="py-3.5 px-4">Thời hạn & Hết hạn</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedWarranties.map((w) => {
                    const expiresDate = new Date(w.expires_at).toLocaleDateString("vi-VN");
                    const isExpired = new Date(w.expires_at) < new Date();
                    return (
                      <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-mono font-bold text-navy-900 text-xs">
                              <QrCode className="h-5 w-5 text-mint-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setViewingDetailWarranty(getPublicWarrantyFromDetails(w))}
                                  className="font-mono text-xs font-bold text-navy-950 hover:text-mint-600 transition-colors text-left cursor-pointer"
                                  title="Nhấn để xem chứng nhận & in phiếu"
                                >
                                  {w.warranty_code}
                                </button>
                                <Link
                                  href={`/bao-hanh/${w.warranty_code}`}
                                  target="_blank"
                                  title="Xem trang tra cứu công khai"
                                  className="text-slate-400 hover:text-navy-900 transition-colors"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {w.product_name} ({w.brand})
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-medium text-navy-950">
                          <p>{w.patient?.full_name || "Bệnh nhân"}</p>
                          <span className="font-mono text-[11px] text-slate-400">
                            {w.treatment?.case_code || "-"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-xs text-slate-600">
                          <p className="font-semibold text-navy-900">
                            {w.warranty_period_months} tháng ({Math.round(w.warranty_period_months / 12)} năm)
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Hạn đến: <span className="font-medium">{expiresDate}</span>
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              w.status === "active" && !isExpired
                                ? "bg-emerald-100 text-emerald-800"
                                : w.status === "suspended"
                                ? "bg-rose-100 text-rose-800"
                                : w.status === "pending"
                                ? "bg-sky-100 text-sky-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {w.status === "active" && !isExpired && (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Còn hiệu lực</span>
                              </>
                            )}
                            {w.status === "suspended" && (
                              <>
                                <ShieldAlert className="h-3 w-3" />
                                <span>Tạm khóa</span>
                              </>
                            )}
                            {w.status === "pending" && (
                              <>
                                <Clock className="h-3 w-3" />
                                <span>Chờ kích hoạt</span>
                              </>
                            )}
                            {(w.status === "expired" || (w.status === "active" && isExpired)) && (
                              <>
                                <ShieldOff className="h-3 w-3" />
                                <span>Đã hết hạn</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingDetailWarranty(getPublicWarrantyFromDetails(w))}
                              title="Xem chi tiết thẻ bảo hành & In phiếu"
                              className="rounded-lg p-1.5 text-navy-900 hover:bg-mint-50 hover:text-mint-700 transition-colors cursor-pointer"
                            >
                              <Eye className="h-4 w-4 text-mint-600" />
                            </button>
                            <button
                              onClick={() => handleOpenPrint(w)}
                              title="Xem & In phiếu bảo hành điện tử"
                              className="rounded-lg p-1.5 text-navy-900 hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer"
                            >
                              <Printer className="h-4 w-4 text-amber-600" />
                            </button>
                            <Link
                              href={`/bao-hanh/${w.warranty_code}/in-the`}
                              target="_blank"
                              title="Mở bản in khổ A5/A4 trên trang riêng"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-950 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => openExtendModal(w)}
                              title="Gia hạn bảo hành"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-mint-50 hover:text-mint-700 transition-colors"
                            >
                              <CalendarPlus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openStatusModal(w)}
                              title="Đổi trạng thái thẻ"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openLogsModal(w)}
                              title="Xem lịch sử thay đổi (Logs)"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                            >
                              <History className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(w)}
                              title="Sửa thông tin thẻ"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingWarranty(w)}
                              title="Xóa thẻ bảo hành"
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
              totalItems={warranties.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Modal Thêm / Sửa Thẻ Bảo Hành */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-lg font-bold text-navy-950">
                {editingWarranty ? "Cập nhật thẻ bảo hành" : "Cấp phát thẻ bảo hành điện tử"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Khai báo mã thẻ, ca điều trị, số tháng bảo hành và ngày kích hoạt.
              </p>

              <form onSubmit={handleSubmit(onSubmitForm)} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Mã thẻ bảo hành <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("warranty_code")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-navy-950 focus:bg-white focus:border-mint-500 focus:outline-none"
                    />
                    {errors.warranty_code && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.warranty_code.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Bệnh nhân sở hữu <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register("patient_id")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name} ({p.patient_code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Vị trí răng (Tùy chọn)
                    </label>
                    <select
                      {...register("tooth_id")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                    >
                      <option value="">Toàn ca / Chưa gán răng cụ thể</option>
                      {teeth.map((th) => (
                        <option key={th.id} value={th.id}>
                          Răng số {th.tooth_number} ({th.material} - {th.shade || "N/A"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Dòng sản phẩm phục hình <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Răng toàn sứ E.max..."
                      {...register("product_name")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.product_name && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.product_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Hãng sản xuất phôi sứ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Ivoclar Vivadent..."
                      {...register("brand")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.brand && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.brand.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Thời hạn (Tháng) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register("warranty_period_months", { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.warranty_period_months && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.warranty_period_months.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Ngày kích hoạt <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register("activated_at")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.activated_at && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.activated_at.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900">
                      Trạng thái <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register("status")}
                      className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                    >
                      <option value="active">Còn hiệu lực</option>
                      <option value="pending">Chờ kích hoạt</option>
                      <option value="suspended">Tạm khóa</option>
                      <option value="expired">Đã hết hạn</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Ghi chú hiển thị công khai trên thẻ
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Chính sách bảo hành, điều kiện kiểm tra định kỳ..."
                    {...register("public_note")}
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
                    {saving ? "Đang lưu..." : editingWarranty ? "Cập nhật thẻ" : "Cấp thẻ bảo hành"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Gia Hạn Bảo Hành */}
        {extendingWarranty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <button
                onClick={() => setExtendingWarranty(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-100 text-mint-800">
                  <CalendarPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950">Gia hạn thẻ bảo hành</h3>
                  <p className="font-mono text-xs font-semibold text-slate-500">
                    {extendingWarranty.warranty_code}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Số tháng gia hạn thêm
                  </label>
                  <select
                    value={extendMonths}
                    onChange={(e) => setExtendMonths(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                  >
                    <option value={6}>+ 6 tháng (Nửa năm)</option>
                    <option value={12}>+ 12 tháng (1 năm)</option>
                    <option value={24}>+ 24 tháng (2 năm)</option>
                    <option value={36}>+ 36 tháng (3 năm)</option>
                    <option value={60}>+ 60 tháng (5 năm)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">Lý do gia hạn</label>
                  <textarea
                    rows={3}
                    value={extendNote}
                    onChange={(e) => setExtendNote(e.target.value)}
                    placeholder="Ghi rõ lý do gia hạn thẻ..."
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setExtendingWarranty(null)}
                    disabled={isExtending}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmExtend}
                    disabled={isExtending}
                    className="rounded-xl bg-navy-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-navy-900 disabled:opacity-50"
                  >
                    {isExtending ? "Đang xử lý..." : "Xác nhận gia hạn"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Đổi Trạng Thái Thẻ */}
        {changingStatusWarranty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <button
                onClick={() => setChangingStatusWarranty(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950">Đổi trạng thái thẻ</h3>
                  <p className="font-mono text-xs font-semibold text-slate-500">
                    {changingStatusWarranty.warranty_code}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Trạng thái mới
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as WarrantyStatus)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none bg-white"
                  >
                    <option value="active">Còn hiệu lực (Active)</option>
                    <option value="suspended">Tạm khóa (Suspended)</option>
                    <option value="pending">Chờ kích hoạt (Pending)</option>
                    <option value="expired">Đã hết hạn (Expired)</option>
                    <option value="cancelled">Đã hủy bỏ (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900">
                    Ghi chú nguyên nhân
                  </label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="VD: Khách hàng yêu cầu kiểm tra kỹ thuật, thay đổi ca điều trị..."
                    className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setChangingStatusWarranty(null)}
                    disabled={isChangingStatus}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmStatusChange}
                    disabled={isChangingStatus}
                    className="rounded-xl bg-navy-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-navy-900 disabled:opacity-50"
                  >
                    {isChangingStatus ? "Đang xử lý..." : "Cập nhật trạng thái"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Lịch Sử Thao Tác (Warranty Logs) */}
        {viewingLogsWarranty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setViewingLogsWarranty(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-navy-900">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950">Nhật ký thẻ bảo hành</h3>
                  <p className="font-mono text-xs font-semibold text-slate-500">
                    Mã thẻ: {viewingLogsWarranty.warranty_code}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                {loadingLogs ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Đang tải lịch sử...</p>
                ) : warrantyLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Chưa có bản ghi nhật ký nào.</p>
                ) : (
                  <div className="space-y-4">
                    {warrantyLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-600"
                      >
                        <div className="flex items-center justify-between text-navy-900 font-semibold">
                          <span className="capitalize">{log.action.replace(/_/g, " ")}</span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            {new Date(log.created_at).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-700">{log.description}</p>
                        <p className="mt-1.5 text-[11px] text-slate-400">
                          Thực hiện bởi: <span className="font-medium text-slate-600">{log.created_by || "Hệ thống"}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingLogsWarranty(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          isOpen={Boolean(deletingWarranty)}
          title="Xác nhận xóa thẻ bảo hành"
          message={`Bạn có chắc muốn xóa thẻ bảo hành ${deletingWarranty?.warranty_code}? Khách hàng sẽ không thể tra cứu thẻ này nữa.`}
          confirmLabel="Xác nhận xóa"
          cancelLabel="Hủy"
          isDangerous={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingWarranty(null)}
        />

        {/* Printable Warranty Certificate Modal */}
        {printingWarranty && (
          <PrintableWarrantyCertificate
            warranty={printingWarranty}
            isModal={true}
            onClose={() => setPrintingWarranty(null)}
          />
        )}

        {/* Admin Search Lookup Modal - Tra cứu nhanh và In thẻ */}
        {isSearchLookupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-50 text-mint-600">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Tra Cứu & In Thẻ Bảo Hành</h3>
                    <p className="text-xs text-slate-500">
                      Tra cứu nhanh thẻ bảo hành và xuất in trực tiếp cho khách hàng
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchLookupOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <WarrantySearchForm showPrint={true} />
            </div>
          </div>
        )}

        {/* Admin Detail Card Modal - Hiển thị thẻ với showPrint={true} */}
        {viewingDetailWarranty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-900">
                    <ShieldCheck className="h-5 w-5 text-mint-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Chi Tiết Thẻ Bảo Hành</h3>
                    <p className="font-mono text-xs font-semibold text-slate-500">
                      Mã thẻ: {viewingDetailWarranty.warranty_code}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingDetailWarranty(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <WarrantyResultCard warranty={viewingDetailWarranty} showPrint={true} />
            </div>
          </div>
        )}
      </div>
    </AdminLayoutWrapper>
  );
}

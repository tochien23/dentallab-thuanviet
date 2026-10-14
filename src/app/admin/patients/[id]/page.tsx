"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Users,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  ClipboardList,
  Edit2,
  Plus,
  ExternalLink,
  ShieldAlert,
  ShieldOff,
  Sparkles,
  FileText,
  Building2,
  UserCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import { useToast } from "@/components/admin/ToastContext";
import { patientService } from "@/services/patientService";
import { treatmentService, TreatmentWithDetails } from "@/services/treatmentService";
import { warrantyService, WarrantyWithDetails } from "@/services/warrantyService";
import { toothService, ToothWithTreatment } from "@/services/toothService";
import { authService } from "@/services/authService";
import { Patient, WarrantyStatus, UserRole } from "@/types/database.types";
import { patientFormSchema, PatientFormValues } from "@/lib/validations/patient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [treatments, setTreatments] = useState<TreatmentWithDetails[]>([]);
  const [warranties, setWarranties] = useState<WarrantyWithDetails[]>([]);
  const [teeth, setTeeth] = useState<ToothWithTreatment[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
  });

  const loadPatientData = useCallback(async () => {
    try {
      setLoading(true);
      const [p, trList, wList, thList, user] = await Promise.all([
        patientService.getPatientById(patientId),
        treatmentService.getTreatmentsByPatientId(patientId),
        warrantyService.getWarrantiesByPatientId(patientId),
        toothService.getAllTeeth(),
        authService.getCurrentUser(),
      ]);

      if (user) setCurrentRole(user.role as UserRole);

      if (!p) {
        error("Không tìm thấy", "Hồ sơ bệnh nhân không tồn tại hoặc đã bị xóa.");
        router.push("/admin/patients");
        return;
      }

      setPatient(p);
      setTreatments(trList);
      setWarranties(wList);
      setTeeth(thList);
    } catch {
      error("Lỗi", "Không thể tải dữ liệu hồ sơ bệnh nhân.");
    } finally {
      setLoading(false);
    }
  }, [patientId, error, router]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  const openEditModal = () => {
    if (!patient) return;
    reset({
      patient_code: patient.patient_code,
      full_name: patient.full_name,
      phone: patient.phone,
      address: patient.address || "",
      date_of_birth: patient.date_of_birth || "",
      gender: patient.gender || "male",
      notes: patient.notes || "",
    });
    setIsEditModalOpen(true);
  };

  const onSubmitEdit = async (values: PatientFormValues) => {
    if (!patient) return;
    setSaving(true);
    try {
      const res = await patientService.updatePatient(patient.id, values);
      if (res.success && res.data) {
        setPatient(res.data);
        success("Thành công", `Đã cập nhật hồ sơ bệnh nhân ${values.full_name}.`);
        setIsEditModalOpen(false);
      } else {
        error("Lỗi cập nhật", res.error || "Không thể lưu thông tin.");
      }
    } catch {
      error("Lỗi", "Đã có sự cố xảy ra khi cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  };

  const renderStatusBadge = (status: WarrantyStatus, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    if (status === "suspended") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
          <ShieldAlert className="h-3.5 w-3.5" />
          Tạm dừng
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
          <ShieldOff className="h-3.5 w-3.5" />
          Hủy bỏ
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
          <Clock className="h-3.5 w-3.5" />
          Chờ kích hoạt
        </span>
      );
    }
    if (isExpired || status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
          <Clock className="h-3.5 w-3.5" />
          Hết hạn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <ShieldCheck className="h-3.5 w-3.5" />
        Hiệu lực
      </span>
    );
  };

  // Tính toán số liệu thống kê nhanh
  const activeWarrantiesCount = warranties.filter((w) => {
    const isExpired = new Date(w.expires_at) < new Date();
    return w.status === "active" && !isExpired;
  }).length;

  const totalTeethTreated = treatments.reduce((count, tr) => {
    const trTeeth = teeth.filter((t) => t.treatment_id === tr.id);
    return count + trTeeth.length;
  }, 0);

  if (currentRole === "technician") {
    return (
      <AdminLayoutWrapper
        title="Hồ sơ chi tiết Bệnh nhân"
        subtitle="Hệ thống bảo vệ quyền riêng tư và thông tin y tế bệnh nhân."
      >
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-8 text-center max-w-xl mx-auto my-12 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-base font-bold text-navy-950">
            Hạn chế quyền truy cập hồ sơ cá nhân bệnh nhân
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Tài khoản của bạn thuộc vai trò <strong>Kỹ thuật viên Labo (Technician)</strong>. Bạn chỉ được phân quyền quản lý thông số kỹ thuật phục hình tại mục Hồ sơ ca điều trị và Thẻ bảo hành điện tử.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/admin/treatments"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-navy-900 transition-all"
            >
              Chuyển đến Hồ sơ Ca điều trị
            </Link>
          </div>
        </div>
      </AdminLayoutWrapper>
    );
  }

  return (
    <AdminLayoutWrapper
      title="Hồ sơ chi tiết Bệnh nhân"
      subtitle="Theo dõi toàn bộ lịch sử ca khám điều trị, răng phục hình và thẻ bảo hành điện tử."
    >
      <div className="space-y-6">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/admin/patients"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-navy-950 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách bệnh nhân
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-navy-950 transition-all shadow-xs cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Sửa thông tin
            </button>
            <Link
              href="/admin/treatments"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-navy-900 transition-all shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Tạo ca điều trị
            </Link>
            <Link
              href="/admin/warranties"
              className="inline-flex items-center gap-1.5 rounded-xl bg-mint-500 px-3.5 py-2 text-xs font-bold text-navy-950 hover:bg-mint-400 transition-all shadow-xs"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Cấp thẻ bảo hành
            </Link>
          </div>
        </div>

        {loading || !patient ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <>
            {/* Header Profile Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-2xl sm:text-3xl font-extrabold text-mint-400 shadow-md shadow-navy-950/20">
                    {patient.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="text-xl sm:text-2xl font-bold text-navy-950">
                        {patient.full_name}
                      </h1>
                      <span className="rounded-md bg-navy-50 px-2 py-0.5 text-xs font-mono font-semibold text-navy-800">
                        {patient.patient_code}
                      </span>
                      {patient.gender && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          {patient.gender === "male" ? "Nam" : patient.gender === "female" ? "Nữ" : "Khác"}
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{patient.address || "Chưa có địa chỉ"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Ngày sinh: {patient.date_of_birth || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Note Preview */}
                {patient.notes && (
                  <div className="w-full md:max-w-sm rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs text-amber-900">
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-amber-700" />
                      Ghi chú bệnh án / Lưu ý:
                    </p>
                    <p className="line-clamp-2 text-slate-700">{patient.notes}</p>
                  </div>
                )}
              </div>

              {/* Metric stats row */}
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500">Hồ sơ ca điều trị</p>
                  <p className="mt-1 text-2xl font-bold text-navy-950">{treatments.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500">Răng phục hình</p>
                  <p className="mt-1 text-2xl font-bold text-indigo-900">{totalTeethTreated}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100">
                  <p className="text-xs font-medium text-emerald-800">Bảo hành hiệu lực</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{activeWarrantiesCount}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500">Tổng thẻ đã cấp</p>
                  <p className="mt-1 text-2xl font-bold text-navy-950">{warranties.length}</p>
                </div>
              </div>
            </div>

            {/* Main Content Layout: 2 Columns */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Treatments History (7 cols) */}
              <div className="space-y-6 lg:col-span-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-navy-900" />
                    <h2 className="text-base font-bold text-navy-950">
                      Lịch sử ca điều trị ({treatments.length})
                    </h2>
                  </div>
                  <Link
                    href="/admin/treatments"
                    className="text-xs font-semibold text-mint-600 hover:text-mint-700 transition-colors"
                  >
                    Xem tất cả &rarr;
                  </Link>
                </div>

                {treatments.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <ClipboardList className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có ca điều trị nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bệnh nhân chưa có hồ sơ ca điều trị được tạo.</p>
                    <Link
                      href="/admin/treatments"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-3.5 py-2 text-xs font-semibold text-white hover:bg-navy-900 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tạo ca điều trị ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {treatments.map((tr) => {
                      const trTeeth = teeth.filter((t) => t.treatment_id === tr.id);
                      return (
                        <div
                          key={tr.id}
                          className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-slate-300"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-navy-950">
                                  {tr.case_code}
                                </span>
                                <span className="rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-700">
                                  {tr.treatment_date}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                                  BS: <strong className="text-slate-700">{tr.dentist_name}</strong>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                  {tr.clinic?.name || "Phòng khám / Labo"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Teeth details inside treatment */}
                          <div className="mt-3.5">
                            <p className="text-xs font-semibold text-slate-500 mb-2">
                              Răng thực hiện ({trTeeth.length} răng):
                            </p>
                            {trTeeth.length === 0 ? (
                              <p className="text-xs italic text-slate-400">
                                Chưa gán vị trí răng cụ thể cho ca này.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {trTeeth.map((tooth) => (
                                  <div
                                    key={tooth.id}
                                    className="flex items-start gap-2.5 rounded-xl bg-slate-50/80 p-2.5 border border-slate-100 text-xs"
                                  >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy-900 font-mono font-bold text-white text-xs">
                                      {tooth.tooth_number}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-navy-950 truncate">
                                        {tooth.material} ({tooth.brand})
                                      </p>
                                      <p className="text-slate-500 text-[11px]">
                                        Hàm {tooth.jaw === "upper" ? "trên" : "dưới"}
                                        {tooth.shade && ` • Màu: ${tooth.shade}`}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {tr.notes && (
                            <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 border border-slate-100">
                              <strong className="text-slate-700">Ghi chú:</strong> {tr.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Warranties List (5 cols) */}
              <div className="space-y-6 lg:col-span-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-mint-600" />
                    <h2 className="text-base font-bold text-navy-950">
                      Thẻ bảo hành điện tử ({warranties.length})
                    </h2>
                  </div>
                  <Link
                    href="/admin/warranties"
                    className="text-xs font-semibold text-mint-600 hover:text-mint-700 transition-colors"
                  >
                    Quản lý thẻ &rarr;
                  </Link>
                </div>

                {warranties.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có thẻ bảo hành</p>
                    <p className="text-xs text-slate-400 mt-1">Bệnh nhân chưa được cấp phát thẻ bảo hành nào.</p>
                    <Link
                      href="/admin/warranties"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-mint-500 px-3.5 py-2 text-xs font-bold text-navy-950 hover:bg-mint-400 transition-all shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Cấp thẻ mới
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {warranties.map((w) => (
                      <div
                        key={w.id}
                        className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all hover:border-slate-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-navy-950">
                                {w.warranty_code}
                              </span>
                              {renderStatusBadge(w.status, w.expires_at)}
                            </div>
                            <p className="mt-1 text-xs font-semibold text-slate-800">
                              {w.product_name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Hãng: <strong className="text-slate-700">{w.brand}</strong>
                              {w.tooth && ` • Vị trí răng: ${w.tooth.tooth_number}`}
                            </p>
                          </div>

                          <Link
                            href={`/bao-hanh/${w.warranty_code}`}
                            target="_blank"
                            title="Mở cổng tra cứu công khai"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-950 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </div>

                        <div className="mt-3.5 rounded-xl bg-slate-50/80 p-2.5 text-[11px] text-slate-600 border border-slate-100 space-y-1">
                          <div className="flex justify-between">
                            <span>Thời hạn bảo hành:</span>
                            <span className="font-semibold text-navy-950">
                              {w.warranty_period_months} tháng
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Kích hoạt:</span>
                            <span className="text-slate-700">
                              {new Date(w.activated_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hết hạn:</span>
                            <span className="font-semibold text-slate-900">
                              {new Date(w.expires_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>

                        {w.public_note && (
                          <p className="mt-2 text-[11px] text-slate-500 italic">
                            &ldquo;{w.public_note}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Modal chỉnh sửa nhanh hồ sơ */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy-950">
                  Cập nhật hồ sơ bệnh nhân
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-950 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitEdit)} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã bệnh nhân
                    </label>
                    <input
                      {...register("patient_code")}
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      {...register("full_name")}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.full_name && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.full_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      {...register("phone")}
                      placeholder="0912345678"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Giới tính
                    </label>
                    <select
                      {...register("gender")}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      {...register("date_of_birth")}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ liên hệ
                    </label>
                    <input
                      {...register("address")}
                      placeholder="Hà Tĩnh, Nghệ An..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ghi chú tiền sử / Tình trạng răng miệng
                  </label>
                  <textarea
                    rows={3}
                    {...register("notes")}
                    placeholder="Lịch sử dị ứng thuốc, bệnh lý nền..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-navy-950 px-4 py-2 text-xs font-semibold text-white hover:bg-navy-900 transition-colors disabled:opacity-50"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutWrapper>
  );
}

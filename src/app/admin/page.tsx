"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  ShieldCheck,
  MessageSquareHeart,
  ArrowUpRight,
  Plus,
  Clock,
  ShieldAlert,
  ShieldOff,
  Phone,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { dashboardService, DashboardStats } from "@/services/dashboardService";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Lỗi khi tải dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <AdminLayoutWrapper
      title="Bảng điều khiển quản trị"
      subtitle="Tổng quan hoạt động khám chữa bệnh, cấp thẻ bảo hành và yêu cầu tư vấn."
    >
      {loading || !stats ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="space-y-8">
          {/* Quick actions top bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-navy-950 to-navy-900 rounded-2xl p-6 text-white shadow-xl shadow-navy-950/10">
            <div>
              <h2 className="text-lg font-bold">Thao tác nhanh nghiệp vụ</h2>
              <p className="text-xs text-slate-300 mt-1">
                Tạo mới hồ sơ bệnh nhân, đăng ký ca điều trị hoặc cấp phát thẻ bảo hành điện tử.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/patients"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all"
              >
                <Plus className="h-4 w-4" />
                Thêm bệnh nhân
              </Link>
              <Link
                href="/admin/treatments"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all"
              >
                <Plus className="h-4 w-4" />
                Tạo ca điều trị
              </Link>
              <Link
                href="/admin/warranties"
                className="inline-flex items-center gap-2 rounded-xl bg-mint-500 px-4 py-2 text-xs font-bold text-navy-950 shadow-md shadow-mint-500/25 hover:bg-mint-400 transition-all"
              >
                <Plus className="h-4 w-4" />
                Cấp thẻ bảo hành
              </Link>
            </div>
          </div>

          {/* Metric cards grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Tổng Bệnh Nhân"
              value={stats.totalPatients}
              icon={Users}
              color="blue"
              href="/admin/patients"
            />
            <StatCard
              title="Hồ Sơ Ca Điều Trị"
              value={stats.totalTreatments}
              icon={ClipboardList}
              color="indigo"
              href="/admin/treatments"
            />
            <StatCard
              title="Thẻ Bảo Hành Điện Tử"
              value={stats.totalWarranties}
              icon={ShieldCheck}
              color="emerald"
              href="/admin/warranties"
            />
            <StatCard
              title="Yêu Cầu Tư Vấn Mới"
              value={stats.newConsultations}
              icon={MessageSquareHeart}
              color="rose"
              href="/admin/consultations"
            />
          </div>

          {/* Warranty status breakdown */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                  Trạng thái Thẻ bảo hành
                </h3>
                <p className="text-xs text-slate-500">Phân loại thẻ theo tình trạng hiệu lực</p>
              </div>
              <Link
                href="/admin/warranties"
                className="text-xs font-semibold text-mint-600 hover:text-mint-700 inline-flex items-center gap-1"
              >
                Xem tất cả
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-semibold">Còn hiệu lực</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-emerald-900">{stats.activeWarranties}</p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <ShieldOff className="h-4 w-4" />
                  <span className="text-xs font-semibold">Đã hết hạn</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-amber-900">{stats.expiredWarranties}</p>
              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                <div className="flex items-center gap-2 text-rose-700">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-xs font-semibold">Tạm khóa</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-rose-900">{stats.suspendedWarranties}</p>
              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-4">
                <div className="flex items-center gap-2 text-sky-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold">Chờ kích hoạt</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-sky-900">{stats.pendingWarranties}</p>
              </div>
            </div>
          </div>

          {/* Two-column tables: Recent warranties & Recent consultations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent warranties */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                    Thẻ bảo hành mới cấp
                  </h3>
                  <Link
                    href="/admin/warranties"
                    className="text-xs font-semibold text-mint-600 hover:text-mint-700 inline-flex items-center gap-1"
                  >
                    Quản lý thẻ
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {stats.recentWarranties.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Chưa có thẻ bảo hành nào.</p>
                  ) : (
                    stats.recentWarranties.map((w) => (
                      <div key={w.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-navy-950">
                              {w.warranty_code}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                w.status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : w.status === "suspended"
                                  ? "bg-red-100 text-red-800"
                                  : w.status === "pending"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {w.status === "active"
                                ? "Còn hạn"
                                : w.status === "suspended"
                                ? "Tạm khóa"
                                : w.status === "pending"
                                ? "Chờ kích hoạt"
                                : "Hết hạn"}
                            </span>
                          </div>
                          <p className="truncate text-xs text-slate-500 mt-0.5">
                            {w.patient?.full_name || "Bệnh nhân"} • {w.product_name}
                          </p>
                        </div>

                        <Link
                          href={`/bao-hanh/${w.warranty_code}`}
                          target="_blank"
                          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-navy-900 transition-colors"
                        >
                          Xem thẻ
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent consultations */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider">
                    Yêu cầu tư vấn mới nhận
                  </h3>
                  <Link
                    href="/admin/consultations"
                    className="text-xs font-semibold text-mint-600 hover:text-mint-700 inline-flex items-center gap-1"
                  >
                    Xem tất cả
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {stats.recentConsultations.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">Không có yêu cầu tư vấn nào.</p>
                  ) : (
                    stats.recentConsultations.map((c) => (
                      <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-navy-950 truncate">
                            {c.full_name}{" "}
                            <span className="font-normal text-slate-500">({c.service})</span>
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {c.phone}
                          </p>
                        </div>

                        <a
                          href={`tel:${c.phone}`}
                          className="shrink-0 rounded-lg bg-mint-50 border border-mint-200 px-2.5 py-1 text-xs font-semibold text-mint-800 hover:bg-mint-100 transition-colors"
                        >
                          Gọi ngay
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutWrapper>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "indigo" | "emerald" | "rose";
  href: string;
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-mint-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-mint-600 transition-colors" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p className="mt-1 text-3xl font-extrabold text-navy-950">{value}</p>
    </Link>
  );
}

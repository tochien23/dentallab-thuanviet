"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Stethoscope,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/services/authService";
import { CLINIC_INFO } from "@/lib/constants";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Đang tải...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      } else {
        setErrorMessage(result.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
      }
    } catch {
      setErrorMessage("Đã có sự cố kết nối. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Cột trái: Form đăng nhập */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo & Header */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-mint-500 to-mint-600 shadow-lg shadow-mint-500/25">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-navy-950">
                  Smile<span className="text-mint-600">Lab</span>
                </span>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Dental Clinic & Lab
                </span>
              </div>
            </Link>

            <h2 className="mt-8 text-2xl font-bold tracking-tight text-navy-950">
              Đăng nhập Quản trị
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Hệ thống quản lý hồ sơ nha khoa & thẻ bảo hành điện tử.
            </p>
          </div>

          {/* Error alert trực quan & hiện đại */}
          {errorMessage && (
            <div
              role="alert"
              className="mt-6 relative overflow-hidden rounded-2xl border border-rose-200/90 bg-gradient-to-r from-rose-50 via-rose-50/60 to-white p-4 shadow-sm shadow-rose-100/60 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 ring-4 ring-rose-50">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    Đăng nhập không thành công
                  </h4>
                  <p className="mt-1 text-xs text-rose-700 leading-relaxed font-medium">
                    {errorMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="absolute top-3 right-3 rounded-lg p-1 text-rose-400 hover:bg-rose-100/70 hover:text-rose-700 transition-colors cursor-pointer"
                  aria-label="Đóng thông báo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-navy-900 uppercase tracking-wider"
              >
                Email quản trị
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smilelabdental.vn"
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-navy-900 uppercase tracking-wider"
              >
                Mật khẩu
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-navy-950 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-navy-950/20 hover:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-500/30 disabled:opacity-60 transition-all cursor-pointer"
              >
                <span>{loading ? "Đang xác thực..." : "Đăng nhập quản trị"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-navy-900 transition-colors"
            >
              ← Quay lại trang chủ SmileLab Dental
            </Link>
          </div>
        </div>
      </div>

      {/* Cột phải: Visual banner */}
      <div className="relative hidden w-0 flex-1 lg:block bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-mint-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative h-full flex flex-col justify-between max-w-lg mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint-500/30 bg-mint-500/10 px-3.5 py-1.5 text-xs font-semibold text-mint-400 backdrop-blur-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Bảo mật dữ liệu y tế ISO chuẩn hóa</span>
            </div>
            <h3 className="mt-6 text-3xl font-extrabold tracking-tight leading-tight text-white">
              Hệ Thống Quản Trị Bảo Hành Nha Khoa Toàn Diện
            </h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Quản lý ca điều trị, chi tiết sơ đồ răng FDI, cấp phát mã bảo hành
              điện tử tức thì và tiếp nhận yêu cầu tư vấn khách hàng tập trung.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-2xl font-bold text-mint-400">100%</p>
                <p className="text-xs text-slate-300 mt-1">Minh bạch điện tử</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-2xl font-bold text-mint-400">24/7</p>
                <p className="text-xs text-slate-300 mt-1">Tra cứu QR tức thì</p>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} {CLINIC_INFO.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

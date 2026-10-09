"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  ShieldCheck,
  KeyRound,
  Mail,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { useToast } from "@/components/admin/ToastContext";
import { authService, AdminUser } from "@/services/authService";

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Form profile
  const [fullName, setFullName] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Form password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { success, error } = useToast();

  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then((u) => {
      if (isMounted) {
        setUser(u);
        if (u) setFullName(u.full_name);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error("Lỗi", "Họ tên không được để trống.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await authService.updateProfile(fullName);
      if (res.success) {
        success("Thành công", "Đã cập nhật họ tên thành công.");
        if (user) {
          setUser({ ...user, full_name: fullName.trim() });
        }
      } else {
        error("Thất bại", res.error || "Không thể cập nhật hồ sơ.");
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải từ 6 ký tự trở lên.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu mới không trùng khớp.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authService.changePassword(newPassword);
      if (res.success) {
        success("Thành công", "Mật khẩu của bạn đã được thay đổi an toàn.");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        error("Thất bại", res.error || "Không thể đổi mật khẩu.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Quản trị viên cấp cao",
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "technician":
        return {
          label: "Kỹ thuật viên Labo",
          color: "bg-teal-50 text-teal-700 border-teal-200",
        };
      case "staff":
      default:
        return {
          label: "Nhân viên tiếp nhận",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <AdminLayoutWrapper
      title="Hồ Sơ & Bảo Mật Cá Nhân"
      subtitle="Quản lý thông tin tài khoản đăng nhập và cập nhật mật khẩu bảo mật."
    >
      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="space-y-8 max-w-4xl">
          {/* Header Card: Thông tin tài khoản */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-950 text-white font-extrabold text-2xl shadow-lg shadow-navy-950/15">
                  {user?.full_name
                    ? user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(-2)
                        .join("")
                        .toUpperCase()
                    : "AD"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-bold text-navy-950">
                      {user?.full_name || "Quản trị viên"}
                    </h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${roleInfo.color}`}
                    >
                      {roleInfo.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 font-mono flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-xs text-slate-600">
                <ShieldCheck className="h-5 w-5 text-mint-600 shrink-0" />
                <div>
                  <p className="font-semibold text-navy-950">Tài khoản bảo vệ</p>
                  <p className="text-[11px] text-slate-400">Xác thực Supabase Auth</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái: Đổi thông tin cá nhân */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950">Thông tin cá nhân</h3>
                  <p className="text-xs text-slate-500">Cập nhật họ tên hiển thị trên hệ thống</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Email tài khoản
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Email đăng nhập được cố định theo cấu hình định danh.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Họ và tên hiển thị
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Vai trò trên hệ thống
                  </label>
                  <input
                    type="text"
                    disabled
                    value={roleInfo.label}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 cursor-not-allowed font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isUpdatingProfile ? "Đang lưu..." : "Lưu thay đổi"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Cột phải: Đổi mật khẩu */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950">Đổi mật khẩu</h3>
                  <p className="text-xs text-slate-500">Thiết lập mật khẩu mới an toàn</p>
                </div>
              </div>

              {passwordError && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Mật khẩu mới
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-10 text-sm text-navy-950 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
                  />
                </div>

                {newPassword && (
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          newPassword.length >= 6 ? "text-emerald-500" : "text-slate-300"
                        }`}
                      />
                      <span>Độ dài từ 6 ký tự trở lên</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          newPassword === confirmPassword && confirmPassword.length > 0
                            ? "text-emerald-500"
                            : "text-slate-300"
                        }`}
                      />
                      <span>Xác nhận mật khẩu trùng khớp</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-all disabled:opacity-60 cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>{isChangingPassword ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutWrapper>
  );
}

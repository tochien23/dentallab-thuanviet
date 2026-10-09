"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  UserCog,
  Plus,
  Search,
  KeyRound,
  Trash2,
  Edit2,
  ShieldAlert,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  ShieldOff,
} from "lucide-react";
import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import EmptyState from "@/components/admin/EmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/admin/ToastContext";
import { authService, AdminUser } from "@/services/authService";
import {
  userService,
  StaffUser,
  CreateStaffInput,
} from "@/services/userService";
import { UserRole } from "@/types/database.types";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [resettingUser, setResettingUser] = useState<StaffUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<StaffUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateStaffInput>({
    email: "",
    password: "",
    full_name: "",
    role: "staff",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [createShowPassword, setCreateShowPassword] = useState(false);

  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("staff");
  const [isEditing, setIsEditing] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetShowPassword, setResetShowPassword] = useState(false);

  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [userList, curUser] = await Promise.all([
        userService.getUsers(),
        authService.getCurrentUser(),
      ]);

      // --- RBAC Guard: chỉ admin mới được truy cập ---
      if (curUser && curUser.role !== "admin") {
        setAccessDenied(true);
        return;
      }

      setUsers(userList);
      if (curUser) setCurrentUser(curUser);
    } catch (err) {
      console.warn("Lỗi tải danh sách người dùng:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch, setState happens after await
    loadData();
  }, [loadData]);

  // Lọc danh sách
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        u.email.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [users, roleFilter, searchQuery]);

  // Thống kê
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const staff = users.filter((u) => u.role === "staff").length;
    const tech = users.filter((u) => u.role === "technician").length;
    return { total, admins, staff, tech };
  }, [users]);

  // Tạo tài khoản mới
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password || !createForm.full_name) {
      error("Thiếu thông tin", "Vui lòng nhập đầy đủ các trường.");
      return;
    }
    if (createForm.password.length < 6) {
      error("Mật khẩu yếu", "Mật khẩu khởi tạo phải từ 6 ký tự trở lên.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await userService.createUser(createForm);
      if (res.success) {
        success("Thành công", `Đã tạo tài khoản cho ${createForm.full_name}.`);
        setIsCreateModalOpen(false);
        setCreateForm({
          email: "",
          password: "",
          full_name: "",
          role: "staff",
        });
        loadData();
      } else {
        error("Lỗi tạo tài khoản", res.error || "Không thể tạo tài khoản.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Mở modal sửa
  const openEditModal = (u: StaffUser) => {
    setEditingUser(u);
    setEditFullName(u.full_name);
    setEditRole(u.role);
  };

  const handleConfirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFullName.trim()) {
      error("Lỗi", "Họ tên không được để trống.");
      return;
    }

    setIsEditing(true);
    try {
      const res = await userService.updateUser({
        id: editingUser.id,
        full_name: editFullName.trim(),
        role: editRole,
      });
      if (res.success) {
        success("Thành công", `Đã cập nhật thông tin cho ${editingUser.email}.`);
        setEditingUser(null);
        loadData();
      } else {
        error("Lỗi cập nhật", res.error || "Không thể cập nhật.");
      }
    } finally {
      setIsEditing(false);
    }
  };

  // Toggle trạng thái kích hoạt / khóa tài khoản
  const handleToggleActive = async (u: StaffUser) => {
    if (currentUser?.id === u.id) {
      error("Không hợp lệ", "Bạn không thể khóa tài khoản của chính mình.");
      return;
    }

    const nextState = !u.is_active;
    const actionText = nextState ? "mở khóa" : "tạm khóa";

    try {
      const res = await userService.updateUser({
        id: u.id,
        is_active: nextState,
      });
      if (res.success) {
        success("Thành công", `Đã ${actionText} tài khoản ${u.email}.`);
        loadData();
      } else {
        error("Lỗi", res.error || "Không thể đổi trạng thái.");
      }
    } catch {
      error("Lỗi", "Đã có sự cố xảy ra.");
    }
  };

  // Mở modal đặt lại mật khẩu
  const openResetModal = (u: StaffUser) => {
    setResettingUser(u);
    setNewPassword("");
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newPassword.length < 6) {
      error("Lỗi", "Mật khẩu mới phải từ 6 ký tự trở lên.");
      return;
    }

    setIsResetting(true);
    try {
      const res = await userService.resetPassword(resettingUser.id, newPassword);
      if (res.success) {
        success("Thành công", `Đã đặt lại mật khẩu cho ${resettingUser.email}.`);
        setResettingUser(null);
        setNewPassword("");
      } else {
        error("Lỗi", res.error || "Không thể đặt lại mật khẩu.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Xóa tài khoản
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    if (currentUser?.id === deletingUser.id) {
      error("Không hợp lệ", "Bạn không thể tự xóa tài khoản của chính mình.");
      setDeletingUser(null);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await userService.deleteUser(deletingUser.id, currentUser?.id);
      if (res.success) {
        success("Thành công", `Đã xóa tài khoản ${deletingUser.email}.`);
        setDeletingUser(null);
        loadData();
      } else {
        error("Lỗi xóa tài khoản", res.error || "Không thể xóa tài khoản.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Quản trị viên",
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "technician":
        return {
          label: "Kỹ thuật viên",
          color: "bg-teal-50 text-teal-700 border-teal-200",
        };
      case "staff":
      default:
        return {
          label: "Nhân viên",
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
    }
  };

  // --- UI: Từ chối truy cập cho role không phải admin ---
  if (accessDenied) {
    return (
      <AdminLayoutWrapper
        title="Truy Cập Bị Từ Chối"
        subtitle="Bạn không có quyền truy cập vào trang này."
      >
        <div className="flex flex-col items-center justify-center py-20 space-y-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 border-2 border-rose-100">
            <ShieldOff className="h-10 w-10 text-rose-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-navy-950">Không có quyền truy cập</h2>
            <p className="text-sm text-slate-500 max-w-md">
              Trang <strong>Quản lý tài khoản</strong> chỉ dành cho tài khoản có vai trò <strong>Quản trị viên (Admin)</strong>.
              Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-navy-900 transition-all cursor-pointer"
          >
            Quay về Bảng thống kê
          </button>
        </div>
      </AdminLayoutWrapper>
    );
  }

  return (
    <AdminLayoutWrapper
      title="Quản Lý Tài Khoản Nhân Sự"
      subtitle="Cấp tài khoản mới, phân quyền vai trò và quản lý bảo mật cho đội ngũ phòng khám."
    >
      <div className="space-y-6">
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Tổng tài khoản</p>
            <p className="mt-1 text-2xl font-bold text-navy-950">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-purple-700">Quản trị viên</p>
            <p className="mt-1 text-2xl font-bold text-purple-900">{stats.admins}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-blue-700">Nhân viên tiếp nhận</p>
            <p className="mt-1 text-2xl font-bold text-blue-900">{stats.staff}</p>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 shadow-xs">
            <p className="text-xs font-medium text-teal-700">Kỹ thuật viên Labo</p>
            <p className="mt-1 text-2xl font-bold text-teal-900">{stats.tech}</p>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo email, họ tên nhân viên..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-navy-950 placeholder-slate-400 focus:border-mint-500 focus:ring-2 focus:ring-mint-500/20 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              {[
                { id: "all", label: "Tất cả" },
                { id: "admin", label: "Admin" },
                { id: "staff", label: "Nhân viên" },
                { id: "technician", label: "Kỹ thuật viên" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    roleFilter === tab.id
                      ? "bg-white text-navy-950 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-navy-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            Cấp tài khoản mới
          </button>
        </div>

        {/* Bảng danh sách */}
        {loading ? (
          <LoadingSkeleton rows={4} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="Không tìm thấy tài khoản nhân sự"
            description="Chưa có tài khoản nào phù hợp với bộ lọc tìm kiếm hiện tại."
            actionLabel="Cấp tài khoản mới"
            onAction={() => setIsCreateModalOpen(true)}
            icon={<UserCog className="h-8 w-8 text-slate-400" />}
          />
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Nhân sự</th>
                    <th className="py-3.5 px-4">Vai trò</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4">Ngày tạo</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const roleInfo = getRoleBadge(u.role);
                    const isSelf = currentUser?.id === u.id;
                    const createdDate = new Date(u.created_at).toLocaleDateString("vi-VN");

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-900 to-navy-950 text-white font-bold text-xs">
                              {u.full_name
                                ? u.full_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .slice(-2)
                                    .join("")
                                    .toUpperCase()
                                : "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-navy-950 text-xs">
                                  {u.full_name}
                                </span>
                                {isSelf && (
                                  <span className="rounded-md bg-mint-50 border border-mint-200 px-1.5 py-0.2 text-[10px] font-semibold text-mint-700">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${roleInfo.color}`}
                          >
                            {roleInfo.label}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          {u.is_active ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-rose-600 font-medium">
                              <span className="h-2 w-2 rounded-full bg-rose-500" />
                              Tạm khóa
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                          {createdDate}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(u)}
                              title="Chỉnh sửa thông tin & Vai trò"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-navy-950 transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => openResetModal(u)}
                              title="Đặt lại mật khẩu"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleToggleActive(u)}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "Không thể khóa tài khoản chính mình"
                                  : u.is_active
                                  ? "Tạm khóa tài khoản"
                                  : "Mở khóa tài khoản"
                              }
                              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                                isSelf
                                  ? "opacity-30 cursor-not-allowed"
                                  : u.is_active
                                  ? "text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                  : "text-rose-600 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              {u.is_active ? (
                                <ShieldAlert className="h-4 w-4" />
                              ) : (
                                <ShieldCheck className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              onClick={() => setDeletingUser(u)}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? "Không thể xóa tài khoản chính mình"
                                  : "Xóa tài khoản"
                              }
                              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                                isSelf
                                  ? "opacity-30 cursor-not-allowed"
                                  : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              }`}
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
          </div>
        )}

        {/* Modal: Cấp tài khoản mới */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-50 text-navy-950">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Cấp Tài Khoản Nhân Sự</h3>
                    <p className="text-xs text-slate-500">Khởi tạo tài khoản và mật khẩu ban đầu</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Họ và tên nhân sự *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.full_name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, full_name: e.target.value })
                    }
                    placeholder="VD: Lê Thị Hồng"
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Email đăng nhập *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    placeholder="VD: hong.le@smilelabdental.vn"
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Vai trò phân quyền *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                  >
                    <option value="staff">Nhân viên tiếp nhận (Staff)</option>
                    <option value="technician">Kỹ thuật viên Labo (Technician)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Mật khẩu khởi tạo *
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type={createShowPassword ? "text" : "password"}
                      required
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, password: e.target.value })
                      }
                      placeholder="Tối thiểu 6 ký tự"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 pl-3.5 pr-10 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCreateShowPassword(!createShowPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {createShowPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="rounded-xl bg-navy-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-navy-900 disabled:opacity-50 cursor-pointer"
                  >
                    {isCreating ? "Đang xử lý..." : "Khởi tạo tài khoản"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Sửa thông tin & vai trò */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Edit2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Chỉnh Sửa Tài Khoản</h3>
                    <p className="font-mono text-xs text-slate-500">{editingUser.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmEdit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Họ và tên hiển thị *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Vai trò phân quyền *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                  >
                    <option value="staff">Nhân viên tiếp nhận (Staff)</option>
                    <option value="technician">Kỹ thuật viên Labo (Technician)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="rounded-xl bg-navy-950 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-navy-900 disabled:opacity-50 cursor-pointer"
                  >
                    {isEditing ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Đặt lại mật khẩu */}
        {resettingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950">Đặt Lại Mật Khẩu</h3>
                    <p className="font-mono text-xs text-slate-500">{resettingUser.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmResetPassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-navy-900">
                    Mật khẩu mới *
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type={resetShowPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="block w-full rounded-xl border border-slate-200 py-2.5 pl-3.5 pr-10 text-xs text-navy-950 focus:border-mint-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setResetShowPassword(!resetShowPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {resetShowPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setResettingUser(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                  >
                    {isResetting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dialog Xác nhận Xóa */}
        <ConfirmDialog
          isOpen={Boolean(deletingUser)}
          title="Xác nhận xóa tài khoản nhân sự"
          message={`Bạn có chắc muốn xóa vĩnh viễn tài khoản ${deletingUser?.email} (${deletingUser?.full_name})? Thao tác này không thể hoàn tác.`}
          confirmLabel="Xóa tài khoản"
          cancelLabel="Hủy"
          isDangerous={true}
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingUser(null)}
        />
      </div>
    </AdminLayoutWrapper>
  );
}

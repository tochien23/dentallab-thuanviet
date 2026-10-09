import { UserRole } from "@/types/database.types";

export interface StaffUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_sign_in_at?: string | null;
}

export interface CreateStaffInput {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface UpdateStaffInput {
  id: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export const userService = {
  /**
   * Lấy danh sách tài khoản nhân sự
   */
  async getUsers(): Promise<StaffUser[]> {
    try {
      const res = await fetch("/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        return data.users as StaffUser[];
      }
      return [];
    } catch (err) {
      console.warn("[userService] Lỗi tải danh sách người dùng:", err);
      return [];
    }
  },

  /**
   * Tạo mới tài khoản nhân sự
   */
  async createUser(
    input: CreateStaffInput
  ): Promise<{ success: boolean; user?: StaffUser; error?: string }> {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Không thể tạo tài khoản." };
      }

      return { success: true, user: data.user as StaffUser };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      return { success: false, error: message };
    }
  },

  /**
   * Cập nhật thông tin nhân sự (Họ tên, Vai trò, Kích hoạt/Khóa)
   */
  async updateUser(
    input: UpdateStaffInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Cập nhật thất bại." };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      return { success: false, error: message };
    }
  },

  /**
   * Đặt lại mật khẩu nhân viên
   */
  async resetPassword(
    id: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Đặt lại mật khẩu thất bại." };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      return { success: false, error: message };
    }
  },

  /**
   * Xóa tài khoản nhân sự
   */
  async deleteUser(
    id: string,
    currentUserId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, currentUserId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Xóa tài khoản thất bại." };
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
      return { success: false, error: message };
    }
  },
};

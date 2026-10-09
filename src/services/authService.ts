import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database.types";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "staff" | "technician";
}

const DEMO_ADMIN: AdminUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@smilelabdental.vn",
  full_name: "Quản Trị Viên SmileLab",
  role: "admin",
};

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder-project"));
}

/**
 * Service xác thực Quản trị viên
 * Hỗ trợ đồng thời Supabase Auth thực tế và chế độ Demo Auth khi chạy local/offline
 */
export const authService = {
  /**
   * Đăng nhập quản trị viên
   */
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Thử đăng nhập qua Supabase Auth nếu đã cấu hình
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data.user) {
          // Lấy profile phân quyền từ public.profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            full_name: (profile as Profile)?.full_name || "Quản trị viên",
            role: ((profile as Profile)?.role as "admin") || "admin",
          };

          if (typeof document !== "undefined") {
            document.cookie = "demo_admin_auth=true; path=/; max-age=86400; SameSite=Lax";
          }

          return { success: true, user: adminUser };
        }

        // Nếu Supabase trả về lỗi nhưng đang nhập tài khoản demo chuẩn
        if (
          cleanEmail === DEMO_ADMIN.email &&
          (password === "Admin@123456" || password === "admin123")
        ) {
          if (typeof document !== "undefined") {
            document.cookie = "demo_admin_auth=true; path=/; max-age=86400; SameSite=Lax";
          }
          return { success: true, user: DEMO_ADMIN };
        }

        return {
          success: false,
          error: error?.message || "Email hoặc mật khẩu không chính xác.",
        };
      } catch (err: unknown) {
        console.warn("[authService] Ngoại lệ khi đăng nhập Supabase:", err);
      }
    }

    // 2. Chế độ Mock / Demo Auth khi chưa kết nối Supabase
    if (
      cleanEmail === DEMO_ADMIN.email &&
      (password === "Admin@123456" || password === "admin123")
    ) {
      if (typeof document !== "undefined") {
        document.cookie = "demo_admin_auth=true; path=/; max-age=86400; SameSite=Lax";
      }
      return { success: true, user: DEMO_ADMIN };
    }

    return {
      success: false,
      error: "Tài khoản hoặc mật khẩu không đúng. Thử: admin@smilelabdental.vn / Admin@123456",
    };
  },

  /**
   * Đăng xuất quản trị viên
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("[authService] Lỗi đăng xuất Supabase:", err);
      }
    }

    // Xóa cookie demo
    if (typeof document !== "undefined") {
      document.cookie = "demo_admin_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  /**
   * Lấy thông tin user đăng nhập hiện tại
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          return {
            id: user.id,
            email: user.email || "",
            full_name: (profile as Profile)?.full_name || "Quản trị viên",
            role: ((profile as Profile)?.role as "admin") || "admin",
          };
        }
      } catch (err) {
        console.warn("[authService] Lỗi lấy current user:", err);
      }
    }

    // Kiểm tra cookie demo
    if (typeof document !== "undefined" && document.cookie.includes("demo_admin_auth=true")) {
      return DEMO_ADMIN;
    }

    return null;
  },

  /**
   * Cập nhật thông tin hồ sơ của tài khoản đang đăng nhập
   */
  async updateProfile(
    fullName: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return { success: false, error: "Chưa đăng nhập." };
        }

        const { error: profErr } = await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profErr) {
          return { success: false, error: profErr.message };
        }

        await supabase.auth.updateUser({
          data: { full_name: fullName.trim() },
        });

        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
        return { success: false, error: message };
      }
    }

    // Demo mode
    DEMO_ADMIN.full_name = fullName;
    return { success: true };
  },

  /**
   * Đổi mật khẩu tài khoản đang đăng nhập
   */
  async changePassword(
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    if (newPassword.length < 6) {
      return { success: false, error: "Mật khẩu mới phải từ 6 ký tự trở lên." };
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
        return { success: false, error: message };
      }
    }

    // Demo mode
    return { success: true };
  },
};

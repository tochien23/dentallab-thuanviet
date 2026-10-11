import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
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

/**
 * Service xác thực Quản trị viên
 * Hỗ trợ Firebase Auth và chế độ Demo khi chưa cấu hình
 */
export const authService = {
  /**
   * Đăng nhập quản trị viên bằng Email/Password
   */
  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured()) {
      try {
        const { signInWithEmailAndPassword } = await import("firebase/auth");
        const { db } = await import("@/lib/firebase/client");
        const { doc, getDoc } = await import("firebase/firestore");

        const credential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = credential.user;

        // Lấy profile từ Firestore collection "profiles"
        const profileSnap = await getDoc(doc(db, "profiles", fbUser.uid));
        const profile = profileSnap.exists() ? (profileSnap.data() as Profile) : null;

        const adminUser: AdminUser = {
          id: fbUser.uid,
          email: fbUser.email || cleanEmail,
          full_name: profile?.full_name || fbUser.displayName || "Quản trị viên",
          role: (profile?.role as AdminUser["role"]) || "admin",
        };

        if (typeof document !== "undefined") {
          document.cookie = "demo_admin_auth=true; path=/; max-age=86400; SameSite=Lax";
        }

        return { success: true, user: adminUser };
      } catch (err: unknown) {
        // Nếu Firebase lỗi nhưng đang dùng tài khoản demo
        if (
          cleanEmail === DEMO_ADMIN.email &&
          (password === "Admin@123456" || password === "admin123")
        ) {
          if (typeof document !== "undefined") {
            document.cookie = "demo_admin_auth=true; path=/; max-age=86400; SameSite=Lax";
          }
          return { success: true, user: DEMO_ADMIN };
        }

        const message =
          err instanceof Error ? err.message : "Email hoặc mật khẩu không chính xác.";
        const friendlyMsg = message.includes("invalid-credential") || message.includes("wrong-password")
          ? "Email hoặc mật khẩu không chính xác."
          : message.includes("user-not-found")
          ? "Tài khoản không tồn tại."
          : message.includes("too-many-requests")
          ? "Đăng nhập quá nhiều lần. Vui lòng thử lại sau."
          : message;

        return { success: false, error: friendlyMsg };
      }
    }

    // Chế độ Mock / Demo Auth
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
   * Đăng xuất
   */
  async logout(): Promise<void> {
    if (isFirebaseConfigured()) {
      try {
        const { signOut } = await import("firebase/auth");
        await signOut(auth);
      } catch (err) {
        console.warn("[authService] Lỗi đăng xuất Firebase:", err);
      }
    }

    if (typeof document !== "undefined") {
      document.cookie =
        "demo_admin_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  /**
   * Lấy thông tin user đang đăng nhập
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    if (isFirebaseConfigured()) {
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const { db } = await import("@/lib/firebase/client");
          const { doc, getDoc } = await import("firebase/firestore");

          const profileSnap = await getDoc(doc(db, "profiles", currentUser.uid));
          const profile = profileSnap.exists() ? (profileSnap.data() as Profile) : null;

          return {
            id: currentUser.uid,
            email: currentUser.email || "",
            full_name: profile?.full_name || currentUser.displayName || "Quản trị viên",
            role: (profile?.role as AdminUser["role"]) || "admin",
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
   * Cập nhật họ tên hồ sơ
   */
  async updateProfile(fullName: string): Promise<{ success: boolean; error?: string }> {
    if (isFirebaseConfigured()) {
      try {
        const { updateProfile: fbUpdateProfile } = await import("firebase/auth");
        const { db } = await import("@/lib/firebase/client");
        const { doc, updateDoc } = await import("firebase/firestore");

        const currentUser = auth.currentUser;
        if (!currentUser) return { success: false, error: "Chưa đăng nhập." };

        await fbUpdateProfile(currentUser, { displayName: fullName.trim() });

        await updateDoc(doc(db, "profiles", currentUser.uid), {
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        });

        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
        return { success: false, error: message };
      }
    }

    DEMO_ADMIN.full_name = fullName;
    return { success: true };
  },

  /**
   * Đổi mật khẩu
   */
  async changePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (newPassword.length < 6) {
      return { success: false, error: "Mật khẩu mới phải từ 6 ký tự trở lên." };
    }

    if (isFirebaseConfigured()) {
      try {
        const { updatePassword } = await import("firebase/auth");
        const currentUser = auth.currentUser;
        if (!currentUser) return { success: false, error: "Chưa đăng nhập." };

        await updatePassword(currentUser, newPassword);
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra";
        return { success: false, error: message };
      }
    }

    return { success: true };
  },
};

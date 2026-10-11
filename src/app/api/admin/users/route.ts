import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types/database.types";

export const dynamic = "force-dynamic";

/**
 * Xác minh người gọi có quyền admin (kiểm tra cookie demo hoặc Firebase session)
 */
async function verifyAdminRole(request: NextRequest): Promise<boolean> {
  const isDemoAuth = request.cookies.get("demo_admin_auth")?.value === "true";
  if (isDemoAuth) return true;

  const firebaseSession = request.cookies.get("firebase_session")?.value;
  if (firebaseSession) {
    try {
      const { getAdminAuth, isAdminConfigured } = await import("@/lib/firebase/admin");
      if (isAdminConfigured()) {
        const adminAuth = await getAdminAuth();
        const decoded = await adminAuth.verifySessionCookie(firebaseSession, true);

        // Kiểm tra role từ custom claims hoặc Firestore
        const { getAdminDb } = await import("@/lib/firebase/admin");
        const adminDb = await getAdminDb();
        const profileSnap = await adminDb.collection("profiles").doc(decoded.uid).get();

        if (profileSnap.exists) {
          const profile = profileSnap.data();
          return profile?.role === "admin";
        }
      }
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * GET: Lấy danh sách toàn bộ tài khoản nhân sự
 */
export async function GET(request: NextRequest) {
  const { isAdminConfigured } = await import("@/lib/firebase/admin");

  if (!isAdminConfigured()) {
    return NextResponse.json({
      success: true,
      users: [
        {
          id: "06b3a9b4-0d82-4f9b-853d-7d8474361738",
          email: "admin@smilelabdental.vn",
          full_name: "Quản Trị Viên SmileLab",
          role: "admin",
          is_active: true,
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        },
      ],
    });
  }

  try {
    const { getAdminAuth, getAdminDb } = await import("@/lib/firebase/admin");
    const [adminAuth, adminDb] = await Promise.all([getAdminAuth(), getAdminDb()]);

    // Lấy profiles từ Firestore
    const profilesSnap = await adminDb.collection("profiles").orderBy("created_at").get();

    const users = await Promise.all(
      profilesSnap.docs.map(async (profileDoc) => {
        const p = profileDoc.data();
        let lastSignInAt: string | null = null;

        try {
          const authUser = await adminAuth.getUser(profileDoc.id);
          lastSignInAt = authUser.metadata.lastSignInTime || null;
        } catch {
          // User có thể đã bị xóa khỏi Auth nhưng còn profile
        }

        return {
          id: profileDoc.id,
          email: p.email,
          full_name: p.full_name,
          role: p.role || "staff",
          is_active: p.is_active !== false,
          created_at: p.created_at,
          last_sign_in_at: lastSignInAt,
        };
      })
    );

    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST: Tạo mới tài khoản nhân sự
 */
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền thực hiện thao tác này." },
      { status: 403 }
    );
  }

  const { isAdminConfigured } = await import("@/lib/firebase/admin");
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { success: false, error: "Chưa cấu hình Firebase Admin." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, full_name, role } = body as {
      email?: string;
      password?: string;
      full_name?: string;
      role?: UserRole;
    };

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ Email, Mật khẩu và Họ tên." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu khởi tạo phải từ 6 ký tự trở lên." },
        { status: 400 }
      );
    }

    const { getAdminAuth, getAdminDb } = await import("@/lib/firebase/admin");
    const [adminAuth, adminDb] = await Promise.all([getAdminAuth(), getAdminDb()]);

    const cleanEmail = email.trim().toLowerCase();
    const userRole: UserRole = role || "staff";

    // 1. Tạo user trên Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: cleanEmail,
      password,
      displayName: full_name.trim(),
      emailVerified: true,
    });

    // 2. Thêm custom claim role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: userRole });

    // 3. Tạo profile document trong Firestore
    await adminDb.collection("profiles").doc(userRecord.uid).set({
      full_name: full_name.trim(),
      email: cleanEmail,
      role: userRole,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userRecord.uid,
        email: cleanEmail,
        full_name: full_name.trim(),
        role: userRole,
        is_active: true,
        created_at: userRecord.metadata.creationTime,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xử lý tạo người dùng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT: Cập nhật thông tin / Đổi mật khẩu / Khóa tài khoản
 */
export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền thực hiện thao tác này." },
      { status: 403 }
    );
  }

  const { isAdminConfigured } = await import("@/lib/firebase/admin");
  if (!isAdminConfigured()) {
    return NextResponse.json({ success: false, error: "Chưa cấu hình Firebase Admin." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, full_name, role, is_active, newPassword } = body as {
      id: string;
      full_name?: string;
      role?: UserRole;
      is_active?: boolean;
      newPassword?: string;
    };

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID tài khoản." }, { status: 400 });
    }

    const { getAdminAuth, getAdminDb } = await import("@/lib/firebase/admin");
    const [adminAuth, adminDb] = await Promise.all([getAdminAuth(), getAdminDb()]);

    // Cập nhật Firebase Auth
    const authUpdate: Record<string, unknown> = {};
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: "Mật khẩu mới phải từ 6 ký tự." }, { status: 400 });
      }
      authUpdate.password = newPassword;
    }
    if (full_name) authUpdate.displayName = full_name.trim();
    if (is_active !== undefined) authUpdate.disabled = !is_active;

    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(id, authUpdate);
    }

    // Cập nhật custom claims nếu đổi role
    if (role) {
      await adminAuth.setCustomUserClaims(id, { role });
    }

    // Cập nhật Firestore profile
    const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (full_name) profileUpdate.full_name = full_name.trim();
    if (role) profileUpdate.role = role;
    if (is_active !== undefined) profileUpdate.is_active = is_active;

    await adminDb.collection("profiles").doc(id).update(profileUpdate);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật người dùng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE: Xóa tài khoản nhân sự
 */
export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminRole(request);
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền thực hiện thao tác này." },
      { status: 403 }
    );
  }

  const { isAdminConfigured } = await import("@/lib/firebase/admin");
  if (!isAdminConfigured()) {
    return NextResponse.json({ success: false, error: "Chưa cấu hình Firebase Admin." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { id, currentUserId } = body as { id: string; currentUserId?: string };

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID tài khoản cần xóa." }, { status: 400 });
    }

    if (currentUserId && id === currentUserId) {
      return NextResponse.json(
        { success: false, error: "Bạn không thể tự xóa tài khoản của chính mình." },
        { status: 400 }
      );
    }

    const { getAdminAuth, getAdminDb } = await import("@/lib/firebase/admin");
    const [adminAuth, adminDb] = await Promise.all([getAdminAuth(), getAdminDb()]);

    await adminAuth.deleteUser(id);
    await adminDb.collection("profiles").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xóa người dùng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

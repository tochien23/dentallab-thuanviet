import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Profile, UserRole } from "@/types/database.types";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey || url.includes("placeholder-project")) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Xác minh người gọi API có role 'admin' hay không
 * Trả về profile nếu hợp lệ, trả về null nếu không xác thực/không có quyền
 */
async function verifyAdminRole(): Promise<{ id: string; role: string } | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile as Profile).role !== "admin") return null;

    return { id: (profile as Profile).id, role: (profile as Profile).role };
  } catch {
    return null;
  }
}

/**
 * GET: Lấy danh sách toàn bộ tài khoản nhân sự
 */
export async function GET() {
  const supabaseAdmin = getAdminClient();
  if (!supabaseAdmin) {
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
    // 1. Lấy danh sách profiles từ database
    const { data: profiles, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (profileErr) {
      return NextResponse.json({ success: false, error: profileErr.message }, { status: 500 });
    }

    // 2. Lấy danh sách auth users để lấy trạng thái đăng nhập & metadata
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 100,
    });

    const authMap = new Map((authData?.users || []).map((u) => [u.id, u]));

    const users = (profiles || []).map((p: Profile) => {
      const authUser = authMap.get(p.id);
      const isBanned = Boolean(authUser?.banned_until && new Date(authUser.banned_until) > new Date());
      const isActive = p.is_active !== undefined ? Boolean(p.is_active) : !isBanned;

      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: p.role || "staff",
        is_active: isActive,
        created_at: p.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null,
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST: Tạo mới một tài khoản nhân sự
 */
export async function POST(req: NextRequest) {
  // Kiểm tra quyền admin từ session
  const caller = await verifyAdminRole();
  if (!caller) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền Quản trị viên." },
      { status: 403 }
    );
  }

  const supabaseAdmin = getAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Chưa cấu hình Supabase Service Key." }, { status: 500 });
  }

  try {
    const body = await req.json();
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

    const cleanEmail = email.trim().toLowerCase();
    const userRole: UserRole = role || "staff";

    // 1. Tạo user trên Supabase Auth
    const { data: createData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
        role: userRole,
      },
    });

    if (createErr || !createData.user) {
      return NextResponse.json(
        { success: false, error: createErr?.message || "Không thể tạo tài khoản auth." },
        { status: 400 }
      );
    }

    const newUserId = createData.user.id;

    // 2. Thêm bản ghi vào public.profiles
    const profilePayload: Record<string, unknown> = {
      id: newUserId,
      full_name: full_name.trim(),
      email: cleanEmail,
      role: userRole,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error: insertErr } = await supabaseAdmin.from("profiles").insert(profilePayload);

    // Fallback nếu cột is_active chưa có trong Postgres schema
    if (insertErr && insertErr.message?.includes("is_active")) {
      delete profilePayload.is_active;
      await supabaseAdmin.from("profiles").insert(profilePayload);
    } else if (insertErr) {
      // Nếu insert profile lỗi, dọn dẹp auth user
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUserId,
        email: cleanEmail,
        full_name: full_name.trim(),
        role: userRole,
        is_active: true,
        created_at: createData.user.created_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xử lý tạo người dùng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT: Cập nhật thông tin tài khoản / Đặt lại mật khẩu / Khóa tài khoản
 */
export async function PUT(req: NextRequest) {
  // Kiểm tra quyền admin từ session
  const caller = await verifyAdminRole();
  if (!caller) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền Quản trị viên." },
      { status: 403 }
    );
  }

  const supabaseAdmin = getAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Chưa cấu hình Supabase Service Key." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, full_name, role, is_active, newPassword } = body as {
      id: string;
      full_name?: string;
      role?: UserRole;
      is_active?: boolean;
      newPassword?: string;
    };

    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu ID tài khoản cần cập nhật." }, { status: 400 });
    }

    // 1. Đặt lại mật khẩu nếu có
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: "Mật khẩu mới phải từ 6 ký tự trở lên." }, { status: 400 });
      }
      const { error: pwdErr } = await supabaseAdmin.auth.admin.updateUserById(id, {
        password: newPassword,
      });
      if (pwdErr) {
        return NextResponse.json({ success: false, error: pwdErr.message }, { status: 400 });
      }
    }

    // 2. Cập nhật trạng thái khóa/mở khóa qua Supabase Auth ban
    if (is_active !== undefined) {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        ban_duration: is_active ? "none" : "876000h",
        user_metadata: { is_active },
      });
    }

    // 3. Cập nhật bảng profiles
    const updateProfile: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (full_name !== undefined) updateProfile.full_name = full_name.trim();
    if (role !== undefined) updateProfile.role = role;
    if (is_active !== undefined) updateProfile.is_active = is_active;

    const { error: profErr } = await supabaseAdmin
      .from("profiles")
      .update(updateProfile)
      .eq("id", id);

    // Fallback nếu cột is_active chưa có trong Postgres
    if (profErr && profErr.message?.includes("is_active")) {
      delete updateProfile.is_active;
      await supabaseAdmin.from("profiles").update(updateProfile).eq("id", id);
    }

    // Cập nhật metadata của auth user
    if (full_name || role) {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: {
          ...(full_name ? { full_name: full_name.trim() } : {}),
          ...(role ? { role } : {}),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật người dùng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE: Xóa tài khoản nhân sự
 */
export async function DELETE(req: NextRequest) {
  // Kiểm tra quyền admin từ session
  const caller = await verifyAdminRole();
  if (!caller) {
    return NextResponse.json(
      { success: false, error: "Bạn không có quyền thực hiện thao tác này. Yêu cầu quyền Quản trị viên." },
      { status: 403 }
    );
  }

  const supabaseAdmin = getAdminClient();
  if (!supabaseAdmin) {
    return NextResponse.json({ success: false, error: "Chưa cấu hình Supabase Service Key." }, { status: 500 });
  }

  try {
    const body = await req.json();
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

    // 1. Xóa trong auth.users (profiles có ON DELETE CASCADE sẽ tự động xóa)
    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (delErr) {
      return NextResponse.json({ success: false, error: delErr.message }, { status: 400 });
    }

    // Đảm bảo profile bị xóa nếu cascade chưa kịp chạy
    await supabaseAdmin.from("profiles").delete().eq("id", id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xóa người dùng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

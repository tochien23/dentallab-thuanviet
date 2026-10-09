import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Cập nhật phiên đăng nhập (session) trong Next.js Middleware
 * Đảm bảo token luôn được làm mới trước khi truy cập các route protected
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Lấy thông tin user hiện tại từ Supabase Auth
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Không thể kết nối Supabase, fallback kiểm tra session demo
    user = null;
  }

  // Kiểm tra cookie demo admin session (cho môi trường local/demo)
  const isDemoAuth = request.cookies.get("demo_admin_auth")?.value === "true";
  const isAuthenticated = Boolean(user || isDemoAuth);

  const pathname = request.nextUrl.pathname;

  // Nếu truy cập route admin (trừ /admin/login) mà chưa đăng nhập -> chuyển hướng về /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Nếu đã đăng nhập mà truy cập /admin/login -> chuyển về /admin
  if (pathname === "/admin/login" && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

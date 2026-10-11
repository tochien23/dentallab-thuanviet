import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware xác thực phiên đăng nhập
 * Firebase Auth — verify session cookie hoặc demo cookie
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Kiểm tra Firebase session cookie hoặc demo cookie
  const firebaseSession = request.cookies.get("firebase_session")?.value;
  const isDemoAuth = request.cookies.get("demo_admin_auth")?.value === "true";

  let isAuthenticated = isDemoAuth;

  // Nếu có Firebase session cookie → verify với Admin SDK
  if (firebaseSession && !isDemoAuth) {
    try {
      const { getAdminAuth, isAdminConfigured } = await import("@/lib/firebase/admin");
      if (isAdminConfigured()) {
        const adminAuth = await getAdminAuth();
        await adminAuth.verifySessionCookie(firebaseSession, true);
        isAuthenticated = true;
      }
    } catch {
      // Token không hợp lệ hoặc hết hạn
      isAuthenticated = false;
    }
  }

  // Nếu truy cập route admin (trừ /admin/login) mà chưa đăng nhập
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Nếu đã đăng nhập mà truy cập /admin/login → chuyển về /admin
  if (pathname === "/admin/login" && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

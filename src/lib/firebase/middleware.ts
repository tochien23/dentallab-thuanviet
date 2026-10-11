import { NextResponse, type NextRequest } from "next/server";

/**
 * Giải mã JWT payload trên Edge Runtime (Web APIs chuẩn — không phụ thuộc Node.js)
 */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Middleware xác thực phiên đăng nhập cho route /admin/*
 * Tương thích 100% với Vercel Edge Runtime (không import Firebase Admin hay Node modules)
 */
export function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Kiểm tra Firebase session cookie hoặc demo cookie
  const firebaseSession = request.cookies.get("firebase_session")?.value;
  const isDemoAuth = request.cookies.get("demo_admin_auth")?.value === "true";

  let isAuthenticated = isDemoAuth;

  if (firebaseSession && !isDemoAuth) {
    // Nếu có session cookie và chưa hết hạn
    if (!isJwtExpired(firebaseSession)) {
      isAuthenticated = true;
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

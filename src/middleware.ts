import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Áp dụng middleware kiểm tra phiên đăng nhập cho tất cả route quản trị /admin/*
     * Bỏ qua các file tĩnh và API không cần bảo vệ
     */
    "/admin/:path*",
  ],
};

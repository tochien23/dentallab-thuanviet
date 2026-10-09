import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client (Service Role)
 *
 * ⚠️ QUY TẮC BẢO MẬT BẮT BUỘC:
 * 1. File này CHỈ ĐƯỢC CHẠY TRÊN SERVER (Server Actions, Route Handlers, Background jobs).
 * 2. TUYỆT ĐỐI KHÔNG import file này vào Client Component ('use client').
 * 3. SUPABASE_SERVICE_ROLE_KEY có quyền bypass toàn bộ RLS, không để lộ ra ngoài.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "[BẢO MẬT] createAdminClient() chỉ được phép thực thi ở môi trường Server. Tuyệt đối không gọi từ trình duyệt!"
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "[CẤU HÌNH] Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường server."
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

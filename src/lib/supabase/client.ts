import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Client
 * Dùng cho các Client Components ('use client') và môi trường thực thi
 * Tự động chuyển đổi giữa Browser Client (@supabase/ssr) và Node Client (@supabase/supabase-js)
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Supabase Client] Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY. Vui lòng cấu hình trong file .env.local."
      );
    }
  }

  const url = supabaseUrl || "https://placeholder-project.supabase.co";
  const key = supabaseAnonKey || "placeholder-anon-key";

  if (typeof window === "undefined") {
    return createSupabaseClient(url, key);
  }

  return createBrowserClient(url, key);
}

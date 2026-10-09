import { createClient } from "@/lib/supabase/client";

/**
 * Helper lấy Supabase Client phù hợp theo môi trường:
 * - Phía Server (Node, API routes, Server Actions, Test Runner): Dùng createAdminClient với service role key để có toàn quyền quản trị
 * - Phía Client (Trình duyệt): Dùng createClient với session của người dùng đã đăng nhập
 */
export async function getDbClient() {
  if (typeof window === "undefined" && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      return createAdminClient();
    } catch {
      return createClient();
    }
  }
  return createClient();
}

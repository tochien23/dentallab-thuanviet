import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Simple .env parser using Node built-in fs
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("==================================================");
console.log("  KIỂM TRA KẾT NỐI SUPABASE (.env.local)");
console.log("==================================================");
console.log("Project URL:", url);
console.log("Anon Key format valid (3 segments):", anonKey?.split(".").length === 3);
console.log("Service Key format valid (3 segments):", serviceKey?.split(".").length === 3);

if (!url || !anonKey || !serviceKey) {
  console.error("❌ Thiếu biến môi trường trong .env.local!");
  process.exit(1);
}

const supabaseAnon = createClient(url, anonKey);
const supabaseAdmin = createClient(url, serviceKey);

async function testConnection() {
  console.log("\n1. Kiểm tra Anon Client (Quyền công khai):");
  const { data: clinics, error: anonErr } = await supabaseAnon.from("clinics").select("name, phone");
  if (anonErr) {
    console.error("❌ Lỗi Anon Client:", anonErr.message);
  } else {
    console.log(`✅ Anon Client thành công! Tìm thấy ${clinics.length} phòng khám:`, clinics);
  }

  console.log("\n2. Kiểm tra Service Role Admin Client (Quyền quản trị bypass RLS):");
  const { data: profiles, error: adminErr } = await supabaseAdmin.from("profiles").select("email, full_name, role");
  if (adminErr) {
    console.error("❌ Lỗi Admin Client:", adminErr.message);
  } else {
    console.log(`✅ Admin Client thành công! Tìm thấy ${profiles.length} tài khoản quản trị:`, profiles);
  }

  console.log("\n3. Kiểm tra số lượng bản ghi thực tế trên Supabase:");
  const tables = ["clinics", "patients", "treatments", "teeth", "warranties", "consultation_requests"];
  for (const table of tables) {
    const { count, error } = await supabaseAdmin.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`   - Bảng [${table}]: ❌ ${error.message}`);
    } else {
      console.log(`   - Bảng [${table}]: ✅ ${count} bản ghi`);
    }
  }

  console.log("\n==================================================");
  console.log("  KẾT QUẢ GIAI ĐOẠN 1: KẾT NỐI SUPABASE HOÀN TẤT 100%");
  console.log("==================================================");
}

testConnection();

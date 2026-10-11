/**
 * Script khởi tạo tài khoản Admin và dữ liệu mẫu cho Firebase
 * Chạy lệnh: npm run init:firebase
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đọc file .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ Không tìm thấy file .env.local! Vui lòng tạo file .env.local trước.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      let val = trimmed.substring(eqIdx + 1).trim();
      // Loại bỏ dấu ngoặc kép bọc ngoài nếu có
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      env[trimmed.substring(0, eqIdx).trim()] = val;
    }
  }
}

const projectId = env.FIREBASE_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_CLIENT_EMAIL;
let privateKey = env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Thiếu thông tin Firebase Admin trong .env.local:");
  console.error("   Cần có: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
  console.error("   Hãy xem hướng dẫn trong file .env.firebase.example.");
  process.exit(1);
}

// Xử lý xuống dòng cho privateKey
privateKey = privateKey.replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

async function initAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@smilelab.vn";
  const adminPassword = process.env.ADMIN_PASSWORD || "SmileLab@2026";
  const adminName = "Quản trị viên SmileLab";

  console.log(`\n⏳ Đang khởi tạo tài khoản Admin: ${adminEmail}...`);

  let uid;
  try {
    const existingUser = await auth.getUserByEmail(adminEmail);
    uid = existingUser.uid;
    console.log(`ℹ️  Tài khoản ${adminEmail} đã tồn tại trong Auth (UID: ${uid}). Đang cập nhật mật khẩu...`);
    await auth.updateUser(uid, {
      password: adminPassword,
      displayName: adminName,
    });
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const newUser = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: adminName,
      });
      uid = newUser.uid;
      console.log(`✅ Đã tạo tài khoản Auth mới (UID: ${uid})!`);
    } else {
      throw err;
    }
  }

  // Cập nhật collection `profiles`
  console.log(`⏳ Đang cấp quyền admin trong Firestore collection 'profiles'...`);
  await db.collection("profiles").doc(uid).set(
    {
      id: uid,
      email: adminEmail,
      full_name: adminName,
      role: "admin",
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(`✅ Thành công!`);
  console.log(`\n======================================================`);
  console.log(`🎉 THÔNG TIN ĐĂNG NHẬP ADMIN ĐÃ SẴN SÀNG:`);
  console.log(`   URL:      http://localhost:3000/admin/login`);
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`======================================================\n`);
}

initAdmin().catch((err) => {
  console.error("❌ Lỗi khi khởi tạo Firebase:", err);
  process.exit(1);
});

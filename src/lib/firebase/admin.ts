/**
 * Firebase Admin SDK — Server-side only
 *
 * ⚠️ QUY TẮC BẢO MẬT:
 * 1. File này CHỈ CHẠY TRÊN SERVER (Route Handlers, Server Actions).
 * 2. TUYỆT ĐỐI KHÔNG import vào Client Components ('use client').
 * 3. FIREBASE_SERVICE_ACCOUNT_KEY có quyền bypass Security Rules.
 */
import type { App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";

let _adminApp: App | null = null;
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

async function getAdminApp(): Promise<App> {
  if (typeof window !== "undefined") {
    throw new Error(
      "[BẢO MẬT] Firebase Admin chỉ chạy trên Server. Không gọi từ trình duyệt!"
    );
  }

  if (_adminApp) return _adminApp;

  const { initializeApp, getApps, cert } = await import("firebase-admin/app");

  if (getApps().length) {
    _adminApp = getApps()[0];
    return _adminApp;
  }

  let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, "\n");

  _adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey,
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });

  return _adminApp;
}

export async function getAdminAuth(): Promise<Auth> {
  if (_adminAuth) return _adminAuth;
  await getAdminApp();
  const { getAuth } = await import("firebase-admin/auth");
  _adminAuth = getAuth(_adminApp!);
  return _adminAuth;
}

export async function getAdminDb(): Promise<Firestore> {
  if (_adminDb) return _adminDb;
  await getAdminApp();
  const { getFirestore } = await import("firebase-admin/firestore");
  _adminDb = getFirestore(_adminApp!);
  return _adminDb;
}

export { isAdminConfigured };

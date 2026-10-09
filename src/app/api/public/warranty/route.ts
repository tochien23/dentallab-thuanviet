import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { PublicWarrantyResult } from "@/types/database.types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("query");

  if (!code || !code.trim()) {
    return NextResponse.json({ data: null, error: "Thiếu mã bảo hành" }, { status: 400 });
  }

  const cleanQuery = code.trim();

  // 1. Thử gọi RPC get_public_warranty_info trước
  try {
    const supabase = await createClient();
    const { data: rpcData, error: rpcError } = await supabase.rpc("get_public_warranty_info", {
      p_search_query: cleanQuery,
    });

    if (!rpcError && rpcData && rpcData.length > 0) {
      return NextResponse.json({ data: rpcData[0] as PublicWarrantyResult });
    }
  } catch (err) {
    console.warn("[API Warranty Search] RPC ngoại lệ, chuyển sang truy vấn trực tiếp:", err);
  }

  // 2. Dự phòng an toàn qua Supabase Admin Client (khi RPC đang sửa đổi trên server Postgres)
  try {
    const admin = createAdminClient();
    const { data: w, error: dbError } = await admin
      .from("warranties")
      .select(`
        warranty_code,
        product_name,
        brand,
        activated_at,
        expires_at,
        status,
        public_note,
        patient:patients(full_name),
        tooth:teeth(tooth_number, jaw, material, shade),
        treatment:treatments(clinic:clinics(name))
      `)
      .or(`warranty_code.ilike.${cleanQuery},qr_token.ilike.${cleanQuery}`)
      .limit(1)
      .maybeSingle();

    if (dbError || !w) {
      return NextResponse.json({ data: null });
    }

    // Khử nhận dạng bệnh nhân (N*** V*** A***)
    const rawName = (w.patient as { full_name?: string } | null)?.full_name || "";
    const maskedName = rawName ? rawName.replace(/(\S)\S+/g, "$1***") : null;

    // Tính toán trạng thái hiệu lực
    const isExpired = new Date() > new Date(w.expires_at);
    let effectiveStatus: "active" | "expired" | "suspended" | "cancelled" | "pending" = "active";
    if (w.status === "suspended") effectiveStatus = "suspended";
    else if (w.status === "cancelled") effectiveStatus = "cancelled";
    else if (w.status === "pending") effectiveStatus = "pending";
    else if (isExpired) effectiveStatus = "expired";
    else effectiveStatus = "active";

    const toothInfo = w.tooth as {
      tooth_number?: string;
      jaw?: "upper" | "lower";
      material?: string;
      shade?: string;
    } | null;

    const treatmentInfo = w.treatment as {
      clinic?: { name?: string };
    } | null;

    const result: PublicWarrantyResult = {
      warranty_code: w.warranty_code,
      product_name: w.product_name,
      brand: w.brand,
      tooth_number: toothInfo?.tooth_number || null,
      jaw: toothInfo?.jaw || null,
      material: toothInfo?.material || null,
      shade: toothInfo?.shade || null,
      clinic_name: treatmentInfo?.clinic?.name || null,
      activated_at: w.activated_at,
      expires_at: w.expires_at,
      status: w.status,
      effective_status: effectiveStatus,
      public_note: w.public_note || null,
      masked_patient_name: maskedName,
    };

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[API Warranty Search] Lỗi tra cứu:", err);
    return NextResponse.json({ data: null, error: "Lỗi hệ thống khi tra cứu bảo hành" }, { status: 500 });
  }
}

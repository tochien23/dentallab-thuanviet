import { NextResponse } from "next/server";
import { PublicWarrantyResult } from "@/types/database.types";
import { warrantyService } from "@/services/warrantyService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") || searchParams.get("query");

  if (!code || !code.trim()) {
    return NextResponse.json({ data: null, error: "Thiếu mã bảo hành" }, { status: 400 });
  }

  try {
    const result: PublicWarrantyResult | null = await warrantyService.searchPublicWarranty(code.trim());

    if (!result) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[API Warranty Search] Lỗi tra cứu:", err);
    return NextResponse.json(
      { data: null, error: "Lỗi hệ thống khi tra cứu bảo hành" },
      { status: 500 }
    );
  }
}

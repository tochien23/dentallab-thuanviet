import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { warrantyService } from "@/services/warrantyService";
import PrintableWarrantyCertificate from "@/components/warranty/PrintableWarrantyCertificate";
import { CLINIC_INFO } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);

  return {
    title: `In Phiếu Bảo Hành ${decodedCode} | ${CLINIC_INFO.name}`,
    description: `Bản in phiếu bảo hành răng sứ điện tử chính hãng mã ${decodedCode} tại ${CLINIC_INFO.name}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PrintWarrantyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);

  const warranty = await warrantyService.searchPublicWarranty(decodedCode);

  if (!warranty) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-lg">
          <ShieldCheck className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy-950">Không tìm thấy thẻ bảo hành</h2>
          <p className="text-sm text-slate-500 mt-2">
            Mã thẻ <span className="font-mono font-semibold">{decodedCode}</span> không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
          </p>
          <div className="mt-6">
            <Link
              href="/bao-hanh"
              className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-navy-900 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại tra cứu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Navigation Bar (Ẩn khi in ấn) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link
          href={`/bao-hanh/${decodedCode}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chi tiết thẻ
        </Link>

        <span className="text-xs text-slate-400">
          SmileLab Dental Warranty Print Engine v2.0
        </span>
      </div>

      {/* Phiếu bảo hành in */}
      <PrintableWarrantyCertificate warranty={warranty} />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { WarrantyAutoLookup } from "@/components/warranty";
import { CLINIC_INFO } from "@/lib/constants";

/**
 * Dynamic metadata cho SEO — dựa trên mã bảo hành trong URL
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;

  return {
    title: `Bảo hành ${code} | ${CLINIC_INFO.name}`,
    description: `Xem thông tin bảo hành răng sứ mã ${code} tại ${CLINIC_INFO.name}. Kiểm tra trạng thái, thời hạn và chi tiết sản phẩm.`,
    openGraph: {
      title: `Bảo hành ${code} | ${CLINIC_INFO.name}`,
      description: `Thông tin chi tiết bảo hành mã ${code}. Kiểm tra trạng thái bảo hành nhanh chóng, minh bạch.`,
    },
  };
}

/**
 * Trang tra cứu bảo hành trực tiếp từ URL / QR code
 * Route: /bao-hanh/[code]
 */
export default async function WarrantyDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const decodedCode = decodeURIComponent(code);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="font-medium text-slate-500 hover:text-navy-800 transition-colors"
            >
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/bao-hanh"
              className="font-medium text-slate-500 hover:text-navy-800 transition-colors"
            >
              Tra cứu bảo hành
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-navy-800">{decodedCode}</span>
          </div>

          {/* Tiêu đề */}
          <div className="mt-6 mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mint-500 to-mint-600 shadow-md shadow-mint-500/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-950 sm:text-2xl">
                Thông tin Bảo hành
              </h1>
              <p className="text-sm text-slate-500">
                Mã tra cứu:{" "}
                <span className="font-mono font-semibold text-navy-800">
                  {decodedCode}
                </span>
              </p>
            </div>
          </div>

          {/* Kết quả tự động tra cứu */}
          <WarrantyAutoLookup code={decodedCode} />

          {/* Quay lại */}
          <div className="mt-8 text-center">
            <Link
              href="/bao-hanh"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tra cứu mã bảo hành khác
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

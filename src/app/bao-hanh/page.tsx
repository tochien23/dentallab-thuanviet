import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { WarrantySearchForm } from "@/components/warranty";
import { CLINIC_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Tra Cứu Bảo Hành Răng Sứ | ${CLINIC_INFO.name}`,
  description:
    "Tra cứu thông tin bảo hành răng sứ điện tử SmileLab Dental. Nhập mã bảo hành hoặc quét mã QR để kiểm tra trạng thái, thời hạn và chi tiết sản phẩm.",
  openGraph: {
    title: `Tra Cứu Bảo Hành Răng Sứ | ${CLINIC_INFO.name}`,
    description:
      "Hệ thống tra cứu bảo hành răng sứ điện tử. Kiểm tra trạng thái bảo hành nhanh chóng, minh bạch.",
  },
};

export default function BaoHanhPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>

          {/* Tiêu đề */}
          <div className="mt-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-500 to-mint-600 shadow-lg shadow-mint-500/25">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-navy-950 sm:text-3xl">
              Tra Cứu Bảo Hành Điện Tử
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Nhập mã bảo hành trên thẻ hoặc quét mã QR để kiểm tra trạng thái
              và thông tin chi tiết bảo hành sản phẩm răng sứ.
            </p>
          </div>

          {/* Form tra cứu */}
          <div className="mt-8">
            <WarrantySearchForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

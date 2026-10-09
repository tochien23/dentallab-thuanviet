"use client";

import React, { useRef } from "react";
import {
  Printer,
  ShieldCheck,
  Phone,
  MapPin,
  Sparkles,
  Award,
  CheckCircle2,
  X,
  Copy,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { PublicWarrantyResult } from "@/types/database.types";
import { CLINIC_INFO } from "@/lib/constants";

interface PrintableWarrantyCertificateProps {
  warranty: PublicWarrantyResult;
  onClose?: () => void;
  isModal?: boolean;
}

export default function PrintableWarrantyCertificate({
  warranty,
  onClose,
  isModal = false,
}: PrintableWarrantyCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://smilelabdental.vn";
  const qrUrl = `${baseUrl}/bao-hanh/${warranty.warranty_code}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(qrUrl);
      alert("Đã sao chép liên kết tra cứu thẻ bảo hành vào bộ nhớ tạm!");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isExpired = new Date(warranty.expires_at) < new Date();
  const effectiveStatus = warranty.status === "active" && isExpired ? "expired" : warranty.status;

  const content = (
    <div className="printable-certificate-wrapper w-full max-w-4xl mx-auto">
      {/* Control Action Buttons (Ẩn khi in ấn qua class .no-print) */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Printer className="h-4 w-4 text-mint-600" />
          <span>Chế độ Xem & In Phiếu Bảo Hành Răng Sứ Chính Hãng</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5" />
            Sao chép liên kết
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-navy-950 px-5 py-2 text-xs font-bold text-white shadow-md shadow-navy-950/20 hover:bg-navy-900 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4 text-mint-400" />
            In phiếu bảo hành (Print)
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Đóng cửa sổ"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── CHÍNH DIỆN PHIẾU BẢO HÀNH (PRINTABLE CERTIFICATE CONTAINER) ─── */}
      <div
        ref={certificateRef}
        className="printable-card relative overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-white p-6 sm:p-10 shadow-2xl text-navy-950 print:border-2 print:border-slate-800 print:shadow-none print:p-6 print:rounded-none"
        style={{
          backgroundImage:
            "radial-gradient(#f1f5f9 1px, transparent 1px), radial-gradient(#f8fafc 1px, #ffffff 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      >
        {/* Khung viền chỉ vàng hoàng gia & hoa văn bảo mật y tế */}
        <div className="pointer-events-none absolute inset-2.5 rounded-2xl border border-amber-300/40 print:border-slate-400" />
        <div className="pointer-events-none absolute inset-3 rounded-2xl border border-dashed border-amber-400/30 print:border-slate-300" />

        {/* ─── HEADER: Logo, Tên phiếu & Huy hiệu bảo mật ─── */}
        <div className="relative border-b-2 border-slate-100 pb-6 print:pb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-950 to-navy-900 text-white shadow-lg shadow-navy-950/20 print:bg-slate-900">
              <ShieldCheck className="h-8 w-8 text-mint-400 print:text-white" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="text-2xl font-black tracking-tight text-navy-950">
                  Smile<span className="text-mint-600 print:text-slate-900">Lab</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Dental
                </span>
              </div>
              <p className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
                Dental Clinic & Laboratory Technology
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/90 px-3 py-1 text-xs font-bold text-amber-900 print:border-slate-800 print:bg-slate-100">
              <Award className="h-3.5 w-3.5 text-amber-600 print:text-slate-800" />
              <span>CHỨNG NHẬN PHỤC HÌNH CHÍNH HÃNG</span>
            </div>
            <h1 className="mt-1 text-lg sm:text-xl font-extrabold uppercase tracking-tight text-navy-950">
              PHIẾU BẢO HÀNH ĐIỆN TỬ
            </h1>
            <p className="font-mono text-xs text-slate-500">
              Số thẻ / Serial: <span className="font-bold text-navy-950">{warranty.warranty_code}</span>
            </p>
          </div>
        </div>

        {/* ─── BODY: 2 Cột Thông Tin Kỹ Thuật & QR Code ─── */}
        <div className="relative mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-center">
          {/* Cột 1 & 2: Thông tin chi tiết */}
          <div className="md:col-span-2 space-y-4">
            {/* Grid các trường thông số */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/90 p-4 sm:p-5 rounded-2xl border border-slate-200/70 print:bg-transparent print:border-slate-300">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Khách hàng sở hữu
                </p>
                <p className="text-sm font-bold text-navy-950 mt-0.5">
                  {warranty.masked_patient_name || "Khách hàng bảo mật"}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Dòng sản phẩm răng sứ
                </p>
                <p className="text-sm font-bold text-navy-950 mt-0.5">
                  {warranty.product_name}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Thương hiệu phôi sứ
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {warranty.brand}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Vị trí răng (Chuẩn FDI)
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {warranty.tooth_number ? (
                    <span className="inline-flex h-6 px-2.5 items-center justify-center rounded-md bg-mint-100 text-mint-900 font-mono text-xs font-bold print:bg-slate-200 print:text-black">
                      Răng số {warranty.tooth_number}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600 font-medium">Toàn ca phục hình</span>
                  )}
                  {warranty.shade && (
                    <span className="text-xs font-mono font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md print:border-slate-400">
                      Màu {warranty.shade}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Ngày kích hoạt bảo hành
                </p>
                <p className="text-xs font-bold text-navy-950 mt-0.5">
                  {formatDate(warranty.activated_at)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Hạn bảo hành đến
                </p>
                <p className={`text-xs font-bold mt-0.5 ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
                  {formatDate(warranty.expires_at)}
                </p>
              </div>
            </div>

            {/* Trạng thái & Phạm vi */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 print:border-slate-300">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Tình trạng hiệu lực thẻ
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      effectiveStatus === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : effectiveStatus === "suspended"
                        ? "bg-rose-100 text-rose-800"
                        : effectiveStatus === "pending"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>
                      {effectiveStatus === "active"
                        ? "Còn hiệu lực chính hãng"
                        : effectiveStatus === "suspended"
                        ? "Đang tạm khóa"
                        : effectiveStatus === "pending"
                        ? "Chờ kích hoạt"
                        : "Đã hết hạn"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Cơ sở thực hiện
                </p>
                <p className="text-xs font-bold text-navy-950 mt-0.5">
                  {warranty.clinic_name || CLINIC_INFO.name}
                </p>
              </div>
            </div>

            {warranty.public_note && (
              <p className="text-[11px] italic text-slate-500 leading-relaxed">
                * Cam kết: {warranty.public_note}
              </p>
            )}
          </div>

          {/* Cột 3: Khối QR Code bảo mật & Tra cứu tức thì */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 print:bg-white print:border-slate-400 text-center">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100 print:shadow-none print:border-slate-300">
              <QRCodeSVG
                value={qrUrl}
                size={140}
                level="H"
                bgColor="#ffffff"
                fgColor="#0F172A"
                includeMargin={false}
              />
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-navy-950">
              Quét mã QR tra cứu
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500 max-w-[160px] leading-tight">
              Sử dụng camera điện thoại để xác thực thẻ bảo hành điện tử chính hãng.
            </p>
            <span className="mt-2 text-[10px] font-mono text-slate-400 break-all">
              {warranty.warranty_code}
            </span>
          </div>
        </div>

        {/* ─── FOOTER: Hotline, Địa chỉ & Dấu xác thực ─── */}
        <div className="relative mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 print:mt-4 print:pt-3">
          <div className="space-y-1 text-center sm:text-left">
            <p className="flex items-center justify-center sm:justify-start gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{CLINIC_INFO.address}</span>
            </p>
            <p className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-navy-950">
              <Phone className="h-3.5 w-3.5 text-mint-600 print:text-slate-800" />
              <span>Hotline hỗ trợ & tiếp nhận bảo hành 24/7: {CLINIC_INFO.phone}</span>
            </p>
          </div>

          <div className="text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-navy-900 border border-slate-200 bg-slate-50 px-3 py-1 rounded-lg print:border-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>DẤU BẢO MẬT ĐIỆN TỬ SMILELAB</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Hệ thống xác thực điện tử trực tuyến an toàn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto my-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

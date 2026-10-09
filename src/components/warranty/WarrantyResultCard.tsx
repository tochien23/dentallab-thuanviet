"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Clock,
  ShieldX,
  Calendar,
  Building2,
  Palette,
  Gem,
  Tag,
  Stethoscope,
  FileText,
  Phone,
  MapPin,
  Printer,
  ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { PublicWarrantyResult } from "@/types/database.types";
import { CLINIC_INFO } from "@/lib/constants";
import PrintableWarrantyCertificate from "./PrintableWarrantyCertificate";

/* ===========================================================
   Component hiển thị kết quả tra cứu thẻ bảo hành
   Bao gồm: badge trạng thái, thông tin sản phẩm, QR code,
   nút liên hệ phòng khám.
   =========================================================== */

/** Xác định trạng thái hiệu lực thực tế dựa trên status & expires_at */
function computeEffectiveStatus(warranty: PublicWarrantyResult): string {
  // Nếu bị khóa / hủy / chờ kích hoạt → giữ nguyên trạng thái gốc
  if (["suspended", "cancelled", "pending"].includes(warranty.status)) {
    return warranty.status;
  }
  // Nếu status = "active" nhưng đã hết hạn → expired
  if (warranty.status === "active") {
    const now = new Date();
    const expiresAt = new Date(warranty.expires_at);
    return expiresAt < now ? "expired" : "active";
  }
  return warranty.effective_status || warranty.status;
}

/** Cấu hình giao diện cho từng trạng thái */
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    description: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    Icon: typeof ShieldCheck;
  }
> = {
  active: {
    label: "Còn hiệu lực",
    description: "Thẻ bảo hành đang có hiệu lực đầy đủ",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    Icon: ShieldCheck,
  },
  expired: {
    label: "Đã hết hạn",
    description: "Thẻ bảo hành đã hết thời hạn hiệu lực",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    Icon: ShieldOff,
  },
  suspended: {
    label: "Tạm khóa",
    description: "Thẻ bảo hành đang bị tạm khóa",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    Icon: ShieldAlert,
  },
  pending: {
    label: "Chờ kích hoạt",
    description: "Thẻ bảo hành đang chờ được kích hoạt",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    Icon: Clock,
  },
  cancelled: {
    label: "Đã hủy",
    description: "Thẻ bảo hành đã bị hủy vĩnh viễn",
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
    badgeBg: "bg-slate-200",
    badgeText: "text-slate-700",
    Icon: ShieldX,
  },
};

/** Hiển thị jaw (hàm trên / dưới) */
function getJawLabel(jaw: string | null): string {
  if (jaw === "upper") return "Hàm trên";
  if (jaw === "lower") return "Hàm dưới";
  return "—";
}

/** Định dạng ngày tháng tiếng Việt */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Tính số ngày còn lại */
function getDaysRemaining(expiresAt: string): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function WarrantyResultCard({
  warranty,
  showPrint = false,
}: {
  warranty: PublicWarrantyResult;
  showPrint?: boolean;
}) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const effectiveStatus = computeEffectiveStatus(warranty);
  const config = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.expired;
  const StatusIcon = config.Icon;
  const daysRemaining = getDaysRemaining(warranty.expires_at);
  const qrUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/bao-hanh/${warranty.warranty_code}`
      : `/bao-hanh/${warranty.warranty_code}`;

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${config.borderColor} bg-white shadow-sm transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4`}
    >
      {/* ─── HEADER: Trạng thái ─── */}
      <div className={`${config.bgColor} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.badgeBg}`}
            >
              <StatusIcon className={`h-5 w-5 ${config.badgeText}`} />
            </div>
            <div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.badgeBg} ${config.badgeText}`}
              >
                {config.label}
              </span>
              <p className={`mt-1 text-xs ${config.textColor}`}>
                {config.description}
              </p>
            </div>
          </div>

          {/* Số ngày còn lại (chỉ hiện nếu đang active) */}
          {effectiveStatus === "active" && daysRemaining > 0 && (
            <div className="hidden sm:block text-right">
              <p className="text-2xl font-bold text-emerald-700">
                {daysRemaining.toLocaleString("vi-VN")}
              </p>
              <p className="text-xs text-emerald-600">ngày còn lại</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── BODY: Chi tiết bảo hành ─── */}
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {/* Cột trái: Thông tin sản phẩm */}
          <div className="sm:col-span-2 space-y-4">
            {/* Mã thẻ bảo hành */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Mã thẻ bảo hành
              </p>
              <p className="mt-1 text-lg font-bold tracking-wide text-navy-950">
                {warranty.warranty_code}
              </p>
            </div>

            {/* Grid thông tin */}
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow
                icon={Gem}
                label="Sản phẩm"
                value={warranty.product_name}
              />
              <InfoRow icon={Tag} label="Thương hiệu" value={warranty.brand} />
              <InfoRow
                icon={Stethoscope}
                label="Vị trí răng"
                value={
                  warranty.tooth_number
                    ? `Răng số ${warranty.tooth_number} — ${getJawLabel(warranty.jaw)}`
                    : "—"
                }
              />
              <InfoRow
                icon={Palette}
                label="Màu sắc (shade)"
                value={warranty.shade || "—"}
              />
              <InfoRow
                icon={Building2}
                label="Phòng khám"
                value={warranty.clinic_name || "—"}
              />
              <InfoRow
                icon={Calendar}
                label="Ngày kích hoạt"
                value={formatDate(warranty.activated_at)}
              />
              <InfoRow
                icon={Calendar}
                label="Ngày hết hạn"
                value={formatDate(warranty.expires_at)}
                highlight={effectiveStatus === "expired"}
              />
              {warranty.masked_patient_name && (
                <InfoRow
                  icon={FileText}
                  label="Khách hàng"
                  value={warranty.masked_patient_name}
                />
              )}
            </div>

            {/* Ghi chú */}
            {warranty.public_note && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Phạm vi bảo hành
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {warranty.public_note}
                </p>
              </div>
            )}
          </div>

          {/* Cột phải: QR Code */}
          <div className="flex flex-col items-center justify-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Mã QR bảo hành
            </p>
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <QRCodeSVG
                value={qrUrl}
                size={140}
                level="M"
                bgColor="#ffffff"
                fgColor="#0F172A"
                includeMargin={false}
              />
            </div>
            <p className="text-center text-[10px] text-slate-400 leading-tight">
              Quét mã để xem thông tin bảo hành trực tuyến
            </p>
            {showPrint && (
              <div className="w-full flex flex-col gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-navy-900 transition-colors cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-mint-400" />
                  In phiếu bảo hành
                </button>
                <Link
                  href={`/bao-hanh/${warranty.warranty_code}/in-the`}
                  className="text-center text-[11px] font-medium text-slate-500 hover:text-navy-950 inline-flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Mở bản in khổ A5/A4</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ─── FOOTER: Nút liên hệ & In ─── */}
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{CLINIC_INFO.address}</span>
          </div>

          <div className="flex items-center gap-2">
            {showPrint && (
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4 text-slate-600" />
                In phiếu
              </button>
            )}

            <a
              href={`tel:${CLINIC_INFO.phone.replace(/\s/g, "")}`}
              className="
                inline-flex items-center justify-center gap-2 rounded-xl
                bg-mint-600 px-5 py-2.5 text-sm font-semibold text-white
                transition-all duration-200
                hover:bg-mint-700 hover:shadow-lg hover:shadow-mint-600/20
                active:scale-[0.98]
              "
            >
              <Phone className="h-4 w-4" />
              Gọi ngay: {CLINIC_INFO.phone}
            </a>
          </div>
        </div>
      </div>

      {/* Modal In Phiếu Bảo Hành Điện Tử (chỉ mở khi showPrint bật) */}
      {showPrint && showPrintModal && (
        <PrintableWarrantyCertificate
          warranty={warranty}
          isModal={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}

/* ─── Helper: Một dòng thông tin ─── */
function InfoRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p
          className={`mt-0.5 text-sm font-medium break-words ${
            highlight ? "text-red-600" : "text-navy-950"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

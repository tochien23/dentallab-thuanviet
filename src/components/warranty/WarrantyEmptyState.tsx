import { SearchX, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CLINIC_INFO } from "@/lib/constants";

/**
 * Component hiển thị khi không tìm thấy mã bảo hành
 * Cung cấp gợi ý hỗ trợ và nút liên hệ phòng khám
 */
export default function WarrantyEmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm animate-in fade-in-0 slide-in-from-bottom-4">
      {/* Icon */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <SearchX className="h-7 w-7 text-slate-400" />
      </div>

      {/* Tiêu đề */}
      <h3 className="mt-4 text-lg font-semibold text-navy-950">
        Không tìm thấy thông tin bảo hành
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        Mã bảo hành bạn nhập không tồn tại trong hệ thống hoặc chưa được kích hoạt.
      </p>

      {/* Gợi ý */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Gợi ý xử lý
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-mint-500" />
            Kiểm tra lại mã bảo hành trên thẻ bảo hành giấy hoặc hồ sơ điều trị.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-mint-500" />
            Đảm bảo nhập đúng chữ hoa, chữ thường và dấu gạch ngang.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-mint-500" />
            Nếu vẫn không tra cứu được, hãy liên hệ phòng khám để được hỗ trợ.
          </li>
        </ul>
      </div>

      {/* Nút hành động */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={`tel:${CLINIC_INFO.phone.replace(/\s/g, "")}`}
          className="
            inline-flex items-center justify-center gap-2 rounded-xl
            bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white
            transition-all duration-200
            hover:bg-navy-900 hover:shadow-lg hover:shadow-navy-900/20
            active:scale-[0.98]
          "
        >
          <Phone className="h-4 w-4" />
          Hotline: {CLINIC_INFO.phone}
        </a>

        <Link
          href="/"
          className="
            inline-flex items-center justify-center gap-2 rounded-xl
            border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800
            transition-all duration-200
            hover:bg-slate-50 hover:shadow-sm
            active:scale-[0.98]
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Trang chủ
        </Link>
      </div>
    </div>
  );
}

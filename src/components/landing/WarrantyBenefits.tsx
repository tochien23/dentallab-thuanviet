import {
  ShieldCheck,
  QrCode,
  ClipboardList,
  HeartHandshake,
} from "lucide-react";
import { WARRANTY_BENEFITS } from "@/lib/constants";

/**
 * Map icon name từ constants sang Lucide component
 */
const iconMap = {
  ShieldCheck,
  QrCode,
  ClipboardList,
  HeartHandshake,
} as const;

/**
 * Section Lợi ích bảo hành — tại sao chọn hệ thống bảo hành SmileLab?
 * Nền gradient navy, thẻ benefit nổi bật trên nền tối
 */
export default function WarrantyBenefits() {
  return (
    <section id="warranty-benefits" className="gradient-navy py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-mint-400">
            Bảo hành
          </span>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Hệ thống bảo hành điện tử tiên tiến
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300 lg:text-lg">
            SmileLab Dental xây dựng hệ thống bảo hành minh bạch, giúp khách
            hàng yên tâm tuyệt đối với sản phẩm răng sứ đã sử dụng.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:gap-8">
          {WARRANTY_BENEFITS.map((benefit) => {
            const IconComponent = iconMap[benefit.icon];
            return (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-mint-400/30 hover:bg-white/10 lg:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-500/20 text-mint-400 transition-colors group-hover:bg-mint-500/30">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

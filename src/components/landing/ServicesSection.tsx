import Link from "next/link";
import { Crown, Sparkles, Layers, Puzzle, ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/constants";

/**
 * Map icon name từ constants sang Lucide component
 */
const iconMap = {
  Crown,
  Sparkles,
  Layers,
  Puzzle,
} as const;

/**
 * Section dịch vụ — hiển thị các dịch vụ chính của SmileLab Dental
 * Liên kết trực tiếp tới các route chi tiết /dich-vu/[slug]
 */
export default function ServicesSection() {
  return (
    <section id="services" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-mint-600">
            Dịch vụ chuyên sâu
          </span>
          <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
            Giải pháp phục hình răng sứ toàn diện
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 lg:text-lg">
            Đa dạng lựa chọn vật liệu và phương pháp phục hình sản xuất trực tiếp tại xưởng Lab CAD/CAM SmileLab, đáp ứng trọn vẹn yêu cầu thẩm mỹ và sức nhai bền bỉ.
          </p>
        </div>

        {/* Services grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:gap-8">
          {SERVICES.map((service) => {
            const IconComponent = iconMap[service.icon];
            const detailHref = `/dich-vu/${service.slug}`;

            return (
              <div
                key={service.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-navy-200 hover:shadow-lg"
              >
                <div>
                  {/* Visual header */}
                  <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 via-mint-50/20 to-slate-50 sm:h-52">
                    <div className="text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md shadow-navy-900/5 transition-transform duration-300 group-hover:scale-110">
                        <IconComponent className="h-8 w-8 text-mint-600 transition-colors group-hover:text-mint-700" />
                      </div>
                      <span className="mt-3 inline-block rounded-full bg-navy-900/5 px-3 py-1 text-xs font-medium text-navy-800">
                        SmileLab CAD/CAM
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-navy-900 sm:text-xl">
                      <Link
                        href={detailHref}
                        className="transition-colors hover:text-mint-600"
                      >
                        {service.name}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Card footer CTA */}
                <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Link
                      href={detailHref}
                      className="inline-flex items-center text-sm font-semibold text-mint-600 transition-colors hover:text-mint-700"
                    >
                      Chi tiết dịch vụ
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <a
                      href="/#contact"
                      className="text-xs font-medium text-slate-500 hover:text-navy-800"
                    >
                      Tư vấn ngay
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all hub link */}
        <div className="mt-12 text-center">
          <Link
            href="/dich-vu"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-semibold text-navy-900 shadow-sm transition-all hover:border-mint-500 hover:bg-white hover:text-mint-600 hover:shadow-md"
          >
            <span>Xem toàn bộ dịch vụ & Bảng so sánh chi tiết</span>
            <ArrowRight className="h-4 w-4 text-mint-500" />
          </Link>
        </div>
      </div>
    </section>
  );
}

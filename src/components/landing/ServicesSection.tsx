import { Crown, Sparkles, Layers, Puzzle } from "lucide-react";
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
 * Section dịch vụ — hiển thị 4 dịch vụ chính của SmileLab Dental
 * Mỗi dịch vụ có hình ảnh placeholder, tên và mô tả
 */
export default function ServicesSection() {
  return (
    <section id="services" className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-mint-600">
            Dịch vụ
          </span>
          <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
            Giải pháp phục hình răng sứ toàn diện
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 lg:text-lg">
            Đa dạng lựa chọn vật liệu và phương pháp phục hình phù hợp với
            từng nhu cầu thẩm mỹ và tài chính của khách hàng.
          </p>
        </div>

        {/* Services grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:gap-8">
          {SERVICES.map((service) => {
            const IconComponent = iconMap[service.icon];
            return (
              <div
                key={service.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-navy-200 hover:shadow-lg"
              >
                {/* Image placeholder */}
                <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50 sm:h-56">
                  <div className="text-center">
                    <IconComponent className="mx-auto h-12 w-12 text-navy-300 transition-colors group-hover:text-navy-500" />
                    <p className="mt-2 text-xs text-slate-400">
                      [Hình ảnh {service.name}]
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-navy-900 sm:text-xl">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {service.description}
                  </p>
                  <a
                    href="#contact"
                    className="mt-4 inline-flex items-center text-sm font-medium text-mint-600 transition-colors hover:text-mint-700"
                  >
                    Tìm hiểu thêm
                    <span className="ml-1 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import {
  MessageCircle,
  Stethoscope,
  ClipboardEdit,
  Wrench,
  BadgeCheck,
} from "lucide-react";
import { PROCESS_STEPS } from "@/lib/constants";

/**
 * Map step number sang Lucide icon component
 */
const stepIcons = [
  MessageCircle,
  Stethoscope,
  ClipboardEdit,
  Wrench,
  BadgeCheck,
];

/**
 * Section Quy trình — 5 bước từ tư vấn đến bàn giao & bảo hành
 * Layout: timeline dọc trên mobile, ngang trên desktop
 */
export default function ProcessSection() {
  return (
    <section id="process" className="bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-mint-600">
            Quy trình
          </span>
          <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
            5 bước phục hình răng sứ chuẩn hóa
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 lg:text-lg">
            Quy trình được thiết kế bài bản, đảm bảo mỗi sản phẩm đều đạt chất
            lượng cao nhất trước khi bàn giao đến tay khách hàng.
          </p>
        </div>

        {/* Process steps */}
        <div className="relative mt-12 lg:mt-16">
          {/* Desktop connecting line */}
          <div className="absolute left-0 right-0 top-14 hidden h-0.5 bg-gradient-to-r from-navy-200 via-mint-300 to-navy-200 lg:block" />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {PROCESS_STEPS.map((item, index) => {
              const IconComponent = stepIcons[index];
              return (
                <div
                  key={item.step}
                  className="group relative text-center"
                >
                  {/* Step number circle */}
                  <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-navy-800 shadow-lg transition-colors group-hover:bg-mint-500">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -right-1 -top-1 z-20 mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-mint-500 text-xs font-bold text-white shadow lg:left-1/2 lg:right-auto lg:-translate-x-1/2">
                    {item.step}
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-navy-900 lg:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

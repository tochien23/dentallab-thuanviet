import Link from "next/link";
import { Search, CalendarCheck } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

/**
 * Hero Section - Phần chào đón trên cùng của Landing Page
 * - Gradient background navy đậm
 * - CTA chính: Tra cứu bảo hành & Đăng ký tư vấn
 * - Placeholder minh họa phía phải (desktop)
 */
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="gradient-hero relative overflow-hidden pt-20 lg:pt-0"
    >
      {/* Decorative blurred shapes */}
      <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-mint-500/10 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 sm:px-6 lg:flex-row lg:gap-12 lg:px-8 lg:py-32">
        {/* Text content */}
        <div className="max-w-2xl text-center lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90">
            <span className="inline-block h-2 w-2 rounded-full bg-mint-400" />
            Laboratory Răng Sứ Cao Cấp
          </div>

          <h1 className="animate-fade-in-up text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Phục hình răng sứ{" "}
            <span className="bg-gradient-to-r from-mint-300 to-cyan-300 bg-clip-text text-transparent">
              chuẩn xác
            </span>{" "}
            cho nụ cười tự tin
          </h1>

          <p className="animate-fade-in-up delay-200 mt-6 text-base leading-relaxed text-slate-300 sm:text-lg lg:text-xl">
            {CLINIC_INFO.slogan}. Ứng dụng công nghệ CAD/CAM hiện đại cùng
            phôi sứ nhập khẩu chính hãng, đảm bảo thẩm mỹ tự nhiên và độ bền
            vượt trội với chế độ bảo hành minh bạch.
          </p>

          <div className="animate-fade-in-up delay-300 mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/bao-hanh"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-navy-900 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl sm:text-base"
            >
              <Search className="h-5 w-5" />
              Tra cứu bảo hành
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:text-base"
            >
              <CalendarCheck className="h-5 w-5" />
              Đăng ký tư vấn
            </a>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in-up delay-500 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400 lg:justify-start">
            <span className="flex items-center gap-1.5">
              <span className="text-mint-400">✓</span> Vật liệu nhập khẩu chính
              hãng
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-mint-400">✓</span> Bảo hành lên đến 10 năm
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-mint-400">✓</span> Tra cứu bảo hành 24/7
            </span>
          </div>
        </div>

        {/* Placeholder illustration */}
        <div className="mt-12 flex w-full max-w-md items-center justify-center lg:mt-0 lg:max-w-lg">
          <div className="animate-float relative flex aspect-square w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
            {/* Placeholder: Thay thế bằng hình ảnh thật sau */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10">
                <span className="text-4xl">🦷</span>
              </div>
              <p className="text-sm text-white/60">
                [Hình ảnh minh họa phòng khám]
              </p>
              <p className="mt-1 text-xs text-white/40">
                Thay thế bằng ảnh thật sau
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

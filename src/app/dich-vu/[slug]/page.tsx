import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  Layers,
  Puzzle,
  Crown,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  FileText,
  BadgeCheck,
  ChevronRight,
  Check,
  Phone,
  Zap,
} from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ConsultationForm from "@/components/landing/ConsultationForm";
import ServiceFaqAccordion from "@/components/services/ServiceFaqAccordion";
import { CLINIC_INFO } from "@/lib/constants";
import {
  getAllServices,
  getServiceBySlug,
  getAllServiceSlugs,
} from "@/lib/servicesData";

type Props = {
  params: Promise<{ slug: string }>;
};

const serviceIcons: Record<string, typeof Crown> = {
  zirconia: Crown,
  "rang-su-kim-loai": Sparkles,
  veneer: Layers,
  implant: Puzzle,
};

/**
 * Generate static params cho tất cả các slug dịch vụ hợp lệ
 */
export async function generateStaticParams() {
  const slugs = getAllServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Metadata SEO động theo từng dịch vụ
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return {
      title: `Không tìm thấy dịch vụ | ${CLINIC_INFO.name}`,
    };
  }

  return {
    title: `${service.name} | ${CLINIC_INFO.name}`,
    description: `${service.tagline}. Bảo hành điện tử ${service.warrantyYears}. Khám phá quy trình, thông số kỹ thuật và báo giá tại SmileLab Dental.`,
    openGraph: {
      title: `${service.name} | SmileLab Dental`,
      description: service.overview.slice(0, 160),
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const allServices = getAllServices();
  const otherServices = allServices.filter((s) => s.id !== service.id);
  const IconComponent = serviceIcons[service.id] || Crown;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* 1. Header */}
      <Header />

      <main className="flex-1 pt-20">
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 py-16 text-white sm:py-20 lg:py-24">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400 sm:text-sm">
              <Link href="/" className="hover:text-white transition-colors">
                Trang chủ
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              <Link href="/dich-vu" className="hover:text-white transition-colors">
                Dịch vụ
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-mint-400">{service.shortTitle}</span>
            </nav>

            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Title & Tagline */}
              <div className="lg:col-span-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-mint-500/30 bg-mint-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mint-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    {service.category}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                    {service.heroBadge}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  {service.name}
                </h1>

                <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                  {service.tagline}
                </p>

                {/* Key Quick Highlights Grid */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs text-slate-400">Bảo hành chính hãng</span>
                    <p className="mt-1 text-sm font-bold text-mint-400 sm:text-base">
                      {service.warrantyYears}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs text-slate-400">Độ chịu lực</span>
                    <p className="mt-1 text-sm font-bold text-white sm:text-base">
                      {service.strength.split("(")[0]}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs text-slate-400">Thời gian làm</span>
                    <p className="mt-1 text-sm font-bold text-white sm:text-base">
                      {service.estimatedTime.split("(")[0]}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <span className="text-xs text-slate-400">Chi phí dự kiến</span>
                    <p className="mt-1 text-sm font-bold text-mint-400 sm:text-base">
                      {service.priceRange.split("/")[0]}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#service-consultation"
                    className="inline-flex items-center gap-2 rounded-xl bg-mint-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-mint-500/25 transition-all hover:bg-mint-600 hover:shadow-xl"
                  >
                    Đặt lịch tư vấn dịch vụ này
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/bao-hanh"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                  >
                    <ShieldCheck className="h-4 w-4 text-mint-400" />
                    Tra cứu thẻ bảo hành
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Feature Box */}
              <div className="lg:col-span-4">
                <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 backdrop-blur-md shadow-2xl">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-mint-500/20 text-mint-400 shadow-inner">
                    <IconComponent className="h-9 w-9" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">
                    Cam kết chuẩn Lab CAD/CAM
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Sản phẩm được gia công tại Labo SmileLab với công nghệ phay tiện 5 trục, đảm bảo độ sát khít đường hoàn tất đạt chuẩn y khoa.
                  </p>

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <BadgeCheck className="h-4 w-4 text-mint-400 shrink-0" />
                      <span>Tra cứu mã QR tức thì</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <BadgeCheck className="h-4 w-4 text-mint-400 shrink-0" />
                      <span>Thử răng & cân chỉnh khớp cắn miễn phí</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-slate-200">
                      <BadgeCheck className="h-4 w-4 text-mint-400 shrink-0" />
                      <span>Tái khám chăm sóc định kỳ 6 tháng/lần</span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-white/10 p-3.5 text-center">
                    <span className="text-[11px] text-slate-400">Hotline tư vấn nhanh:</span>
                    <a
                      href={`tel:${CLINIC_INFO.phone.replace(/\s/g, "")}`}
                      className="mt-1 flex items-center justify-center gap-2 text-base font-bold text-mint-300 hover:text-white"
                    >
                      <Phone className="h-4 w-4" />
                      {CLINIC_INFO.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Section: Giới thiệu chuyên sâu & Điểm cốt lõi */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-7">
                <span className="text-xs font-semibold uppercase tracking-wider text-mint-600 sm:text-sm">
                  Tổng quan lâm sàng
                </span>
                <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
                  Bản Chất & Giá Trị Phục Hình Của {service.shortTitle}
                </h2>
                <div className="mt-6 text-base leading-relaxed text-slate-600 space-y-4">
                  <p>{service.overview}</p>
                </div>

                <div className="mt-8 rounded-2xl border border-mint-100 bg-mint-50/50 p-6">
                  <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-mint-600" />
                    Điểm nổi bật cốt lõi
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {service.highlightPoints.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-slate-700"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Technical Specs Table */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                    <FileText className="h-5 w-5 text-mint-600" />
                    <h3 className="text-lg font-bold text-navy-950">
                      Thông Số Kỹ Thuật Vật Liệu
                    </h3>
                  </div>

                  <div className="mt-4 divide-y divide-slate-100">
                    {service.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="py-3 text-sm flex justify-between gap-4">
                        <span className="font-medium text-slate-500">{spec.label}</span>
                        <span className="text-right font-semibold text-navy-900">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-navy-900">
                      <ShieldCheck className="h-4 w-4 text-mint-600" />
                      Chính sách bảo hành điện tử SmileLab
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      Lưu trữ số hóa trọn đời trên cổng portal. Khách hàng kiểm tra vật liệu, nguồn gốc phôi và thông tin bác sĩ phụ trách mọi lúc mọi nơi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Section: Chỉ định & Lưu ý phù hợp */}
        <section className="bg-white py-16 sm:py-20 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-600 sm:text-sm">
                Đối tượng phù hợp
              </span>
              <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
                Trường Hợp Chỉ Định & Khuyến Nghị
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                SmileLab Dental luôn tuân thủ nguyên tắc chỉ định đúng y khoa để đảm bảo kết quả điều trị an toàn, thẩm mỹ và bền vững dài lâu.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Chỉ định */}
              <div className="rounded-3xl border border-mint-200 bg-mint-50/40 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-500 text-white shadow-sm">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy-950">
                      Trường Hợp Nên Lựa Chọn
                    </h3>
                    <p className="text-xs text-slate-500">Chỉ định tối ưu nhất</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3.5">
                  {service.indications.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chống chỉ định / Lưu ý */}
              <div className="rounded-3xl border border-amber-200 bg-amber-50/40 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-navy-950">
                      Trường Hợp Cần Lưu Ý
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cần thăm khám & tư vấn kỹ lưỡng
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <p className="text-xs text-slate-600">
                    Các tình trạng răng miệng dưới đây cần được bác sĩ khảo sát kỹ hoặc xử lý tiền phục hình:
                  </p>
                  <ul className="space-y-3">
                    {service.contraindications.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-slate-700"
                      >
                        <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  {service.limitations.length > 0 && (
                    <div className="mt-4 rounded-xl border border-amber-200/60 bg-white p-4">
                      <span className="text-xs font-semibold text-amber-900 block mb-1">
                        Lưu ý thực tế:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {service.limitations.map((lim, lIdx) => (
                          <li key={lIdx}>• {lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Section: Ưu điểm vượt trội */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-600 sm:text-sm">
                Ưu thế nổi trội
              </span>
              <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
                Tại Sao Khách Hàng Tin Chọn {service.shortTitle}?
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Khám phá những điểm mạnh tạo nên sự khác biệt vượt trội về độ bền, cảm giác ăn nhai và thẩm mỹ nụ cười.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {service.advantages.map((adv, aIdx) => (
                <div
                  key={aIdx}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-mint-400 hover:shadow-lg sm:p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-50 text-mint-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-navy-950 sm:text-xl">
                    {adv.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {adv.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Section: Quy trình 5 bước điều trị */}
        <section className="bg-white py-16 sm:py-24 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-600 sm:text-sm">
                Quy trình chuẩn y khoa
              </span>
              <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
                Quy Trình Phục Hình {service.shortTitle}
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Quy trình đồng bộ khép kín giữa phòng khám và xưởng Lab SmileLab CAD/CAM, đảm bảo tính an toàn, nhẹ nhàng và chính xác tuyệt đối.
              </p>
            </div>

            <div className="relative">
              {/* Timeline layout */}
              <div className="grid gap-6 lg:grid-cols-5">
                {service.procedure.map((step) => (
                  <div
                    key={step.step}
                    className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all duration-300 hover:bg-white hover:border-mint-400 hover:shadow-md"
                  >
                    <div>
                      {/* Step Badge */}
                      <div className="flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-sm font-bold text-white">
                          0{step.step}
                        </span>
                        {step.duration && (
                          <span className="rounded-full bg-mint-50 px-2.5 py-1 text-[11px] font-semibold text-mint-700">
                            {step.duration}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-5 text-base font-bold text-navy-950">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {step.description}
                      </p>
                    </div>

                    {step.details && (
                      <ul className="mt-4 border-t border-slate-200/60 pt-3 space-y-1.5">
                        {step.details.map((d, dIdx) => (
                          <li
                            key={dIdx}
                            className="flex items-center gap-1.5 text-[11px] text-slate-500"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-mint-500 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. Section: Câu hỏi thường gặp FAQs */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-600 sm:text-sm">
                Giải đáp thắc mắc
              </span>
              <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
                Câu Hỏi Thường Gặp Về {service.shortTitle}
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Những băn khoăn phổ biến nhất của khách hàng đã được đội ngũ bác sĩ SmileLab Dental giải đáp chi tiết.
              </p>
            </div>

            {/* Interactive Accordion */}
            <ServiceFaqAccordion faqs={service.faqs} />
          </div>
        </section>

        {/* 8. Consultation Form Section (Pre-selected) */}
        <ConsultationForm
          id="service-consultation"
          initialService={service.matchedServiceOption}
          badge={`Tư vấn ${service.shortTitle}`}
          title={`Đăng Ký Tư Vấn & Nhận Báo Giá ${service.shortTitle}`}
          subtitle={`Để lại thông tin bên dưới, bác sĩ chuyên khoa SmileLab Dental sẽ thăm khám, kiểm tra tình trạng răng và tư vấn phác đồ ${service.shortTitle} tối ưu nhất cho bạn.`}
        />

        {/* 9. Related / Other Services Section */}
        <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-mint-600 sm:text-sm">
                  Dịch vụ liên quan
                </span>
                <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl">
                  Khám Phá Các Giải Pháp Khác
                </h2>
              </div>
              <Link
                href="/dich-vu"
                className="inline-flex items-center gap-1 text-sm font-semibold text-mint-600 hover:text-mint-700"
              >
                Xem tất cả dịch vụ
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {otherServices.map((other) => {
                const OtherIcon = serviceIcons[other.slug] || Crown;
                return (
                  <div
                    key={other.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all duration-300 hover:bg-white hover:border-mint-400 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-navy-100/60 px-2.5 py-0.5 text-xs font-medium text-navy-800">
                          {other.category}
                        </span>
                        <span className="text-xs font-semibold text-mint-600">
                          Bảo hành {other.warrantyYears}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-100 text-mint-600">
                          <OtherIcon className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-navy-950">
                          {other.shortTitle}
                        </h3>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-3">
                        {other.overview}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-900">
                        {other.priceRange.split("/")[0]}
                      </span>
                      <Link
                        href={`/dich-vu/${other.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-mint-600 hover:text-mint-700 gap-1"
                      >
                        Chi tiết
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Puzzle,
  Crown,
  CheckCircle2,
  Clock,
  Check,
  Minus,
  Award,
  Zap,
} from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ConsultationForm from "@/components/landing/ConsultationForm";
import { CLINIC_INFO } from "@/lib/constants";
import { getAllServices } from "@/lib/servicesData";

export const metadata: Metadata = {
  title: `Dịch Vụ Phục Hình Răng Sứ Chuyên Sâu | ${CLINIC_INFO.name}`,
  description:
    "Khám phá các dịch vụ răng sứ cao cấp tại SmileLab Dental: Răng sứ Zirconia, Răng sứ Kim Loại, Mặt dán sứ Veneer, Phục hình trên Implant. Chế tác bằng công nghệ CAD/CAM tại Labo riêng, bảo hành điện tử chính hãng đến 20 năm.",
  openGraph: {
    title: `Dịch Vụ Phục Hình Răng Sứ Toàn Diện | ${CLINIC_INFO.name}`,
    description:
      "Giải pháp phục hình răng sứ & thẩm mỹ nụ cười chuẩn y khoa. Minh bạch vật liệu, bảo hành điện tử QR tức thì.",
  },
};

const serviceIcons: Record<string, typeof Crown> = {
  zirconia: Crown,
  "rang-su-kim-loai": Sparkles,
  veneer: Layers,
  implant: Puzzle,
};

export default function ServicesPage() {
  const services = getAllServices();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 py-16 text-white sm:py-24">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400 sm:text-sm">
              <Link href="/" className="hover:text-white transition-colors">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-mint-400">Dịch vụ</span>
            </nav>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-mint-500/30 bg-mint-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-mint-400">
                <Sparkles className="h-3.5 w-3.5" />
                Hệ sinh thái phục hình SmileLab
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Dịch Vụ Phục Hình Răng Sứ Chuyên Sâu
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                Kết hợp giữa tay nghề bác sĩ phục hình kinh nghiệm và xưởng chế tác Labo CAD/CAM 5 trục chuẩn Micromet, mang đến nụ cười hoàn mỹ, độ khít sát tuyệt đối và sức nhai bền chắc trọn đời.
              </p>
            </div>

            {/* Trust highlights */}
            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 sm:grid-cols-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-500/20 text-mint-400">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Vật liệu chính ngạch</p>
                  <p className="text-sm font-semibold text-white">100% Phôi Sứ Đức/Mỹ</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-500/20 text-mint-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Bảo hành chính hãng</p>
                  <p className="text-sm font-semibold text-white">Từ 3 – 20 Năm Điện Tử</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-500/20 text-mint-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Công nghệ sản xuất</p>
                  <p className="text-sm font-semibold text-white">Lab CAD/CAM 5 Trục</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint-500/20 text-mint-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Thời gian hoàn thiện</p>
                  <p className="text-sm font-semibold text-white">Chỉ 2 – 4 Ngày</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Catalog Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-600 sm:text-sm">
                Danh mục dịch vụ
              </span>
              <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
                Lựa Chọn Phù Hợp Cho Nhu Cầu Của Bạn
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Mỗi tình trạng răng miệng và ngân sách đều có giải pháp phục hình tối ưu nhất. Nhấn vào từng dịch vụ để xem mô tả lâm sàng, ưu nhược điểm và thông số chi tiết.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {services.map((item) => {
                const IconComp = serviceIcons[item.slug] || Crown;
                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-mint-400 hover:shadow-xl sm:p-8"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-800">
                          {item.category}
                        </span>
                        <span className="rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-mint-700">
                          {item.heroBadge}
                        </span>
                      </div>

                      {/* Header with Icon */}
                      <div className="mt-6 flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-mint-50 to-mint-100 text-mint-600 shadow-sm transition-transform duration-300 group-hover:scale-105">
                          <IconComp className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-navy-950 transition-colors group-hover:text-mint-700 sm:text-2xl">
                            <Link href={`/dich-vu/${item.slug}`}>
                              {item.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                            {item.tagline}
                          </p>
                        </div>
                      </div>

                      {/* Quick Meta Pills */}
                      <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">
                        <div>
                          <span className="text-[11px] text-slate-500">Bảo hành</span>
                          <p className="text-xs font-bold text-navy-900 sm:text-sm">
                            {item.warrantyYears}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500">Độ chịu lực</span>
                          <p className="text-xs font-bold text-navy-900 sm:text-sm">
                            {item.strength.split("(")[0]}
                          </p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[11px] text-slate-500">Thời gian</span>
                          <p className="text-xs font-bold text-navy-900 sm:text-sm">
                            {item.estimatedTime.split("(")[0]}
                          </p>
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="mt-5 text-sm leading-relaxed text-slate-600">
                        {item.overview.slice(0, 190)}...
                      </p>

                      {/* Key highlights checklist */}
                      <ul className="mt-5 space-y-2.5">
                        {item.highlightPoints.slice(0, 3).map((point, pIdx) => (
                          <li
                            key={pIdx}
                            className="flex items-start gap-2.5 text-xs text-slate-700 sm:text-sm"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Chi phí tham khảo:</span>
                        <p className="text-sm font-bold text-mint-600 sm:text-base">
                          {item.priceRange}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dich-vu/${item.slug}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-mint-600 hover:shadow-md sm:flex-none"
                        >
                          Xem chi tiết
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Detailed Comparison Table */}
        <section className="bg-white py-16 sm:py-24 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-600 sm:text-sm">
                So sánh chuyên môn
              </span>
              <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
                Bảng So Sánh Toàn Diện Các Giải Pháp Phục Hình
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Đối chiếu trực quan giữa 4 phương pháp phục hình theo các tiêu chí quan trọng nhất: thẩm mỹ, độ chịu lực, mức độ mài răng và thời hạn bảo hành.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-4 sm:p-5">Dịch vụ</th>
                    <th className="p-4 sm:p-5">Độ chịu lực</th>
                    <th className="p-4 sm:p-5">Tính thẩm mỹ</th>
                    <th className="p-4 sm:p-5">Mức độ mài răng</th>
                    <th className="p-4 sm:p-5">Bảo hành điện tử</th>
                    <th className="p-4 sm:p-5">Chi phí tham khảo</th>
                    <th className="p-4 sm:p-5">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {services.map((item) => (
                    <tr
                      key={item.slug}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="p-4 sm:p-5">
                        <Link
                          href={`/dich-vu/${item.slug}`}
                          className="font-bold text-navy-950 hover:text-mint-600 transition-colors block"
                        >
                          {item.shortTitle}
                        </Link>
                        <span className="text-xs text-slate-500">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-1.5 font-medium text-navy-900">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < item.comparison.strengthRating
                                  ? "bg-mint-500"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="mt-1 block text-xs text-slate-500">
                          {item.strength.split("(")[0]}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-1.5 font-medium text-navy-900">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < item.comparison.aestheticRating
                                  ? "bg-amber-400"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="mt-1 block text-xs text-slate-500">
                          {item.comparison.aestheticRating === 5
                            ? "Rất tự nhiên"
                            : item.comparison.aestheticRating === 4
                            ? "Khá tự nhiên"
                            : "Tiêu chuẩn"}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 font-medium text-slate-700">
                        {item.comparison.prepInvasiveness}
                      </td>
                      <td className="p-4 sm:p-5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2.5 py-1 text-xs font-semibold text-mint-700">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {item.warrantyYears}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 font-semibold text-mint-600">
                        {item.priceRange}
                      </td>
                      <td className="p-4 sm:p-5">
                        <Link
                          href={`/dich-vu/${item.slug}`}
                          className="text-xs font-semibold text-navy-800 hover:text-mint-600 inline-flex items-center gap-1"
                        >
                          Chi tiết
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SmileLab Labo CAD/CAM Strengths */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-8 text-white shadow-xl lg:p-12">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-mint-400">
                    Lợi thế công nghệ
                  </span>
                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
                    Chế Tác Răng Sứ Trực Tiếp Tại Xưởng SmileLab CAD/CAM
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                    SmileLab Dental sở hữu hệ thống xưởng Lab chế tác kỹ thuật số riêng biệt. Chúng tôi kiểm soát 100% chất lượng từ khâu nhập khẩu phôi sứ nguyên gốc, thiết kế 3D nụ cười đến khi hoàn thiện thành phẩm gắn lên cung hàm của bạn.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-500/20 text-mint-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm text-slate-200">
                        <strong>Độ sát khít Micromet:</strong> Loại bỏ hoàn toàn hở viền nướu, không đọng thức ăn hay gây hôi miệng.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-500/20 text-mint-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm text-slate-200">
                        <strong>Rút ngắn thời gian:</strong> Nhận răng chỉ sau 24-48 giờ, chỉnh sửa dáng răng trực tiếp cùng kỹ thuật viên.
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mint-500/20 text-mint-400">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm text-slate-200">
                        <strong>Bảo hành điện tử minh bạch:</strong> Quét mã QR tra cứu lịch sử ca điều trị, vật liệu và bác sĩ phụ trách.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm lg:p-8">
                  <h3 className="text-lg font-bold text-white sm:text-xl">
                    Cam kết chất lượng SmileLab Dental
                  </h3>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h4 className="text-sm font-semibold text-mint-400">
                        1. Phôi sứ chính hãng 100%
                      </h4>
                      <p className="mt-1 text-xs text-slate-300">
                        Có mã vạch thẻ bảo hành chính ngạch từ các tập đoàn nha khoa hàng đầu thế giới (Dentsply Sirona, Noritake, Ivoclar Vivadent).
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h4 className="text-sm font-semibold text-mint-400">
                        2. Bảo tồn mô răng & tủy răng
                      </h4>
                      <p className="mt-1 text-xs text-slate-300">
                        Ứng dụng kỹ thuật mài sửa soạn xâm lấn tối thiểu, bảo tồn tối đa răng thật nguyên bản của khách hàng.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h4 className="text-sm font-semibold text-mint-400">
                        3. Đồng hành dài hạn
                      </h4>
                      <p className="mt-1 text-xs text-slate-300">
                        Chăm sóc định kỳ miễn phí 6 tháng/lần trọn đời trong suốt thời hạn bảo hành sản phẩm.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consultation Form Section */}
        <ConsultationForm
          badge="Nhận tư vấn dịch vụ"
          title="Bạn cần tư vấn giải pháp phục hình phù hợp?"
          subtitle="Hãy để lại số điện thoại hoặc tin nhắn, chuyên gia SmileLab Dental sẽ kiểm tra tình trạng răng và tư vấn miễn phí giải pháp tối ưu nhất cho bạn."
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

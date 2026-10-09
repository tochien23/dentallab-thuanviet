import { Award, Microscope, Factory, ShieldCheck } from "lucide-react";

/**
 * Section giới thiệu phòng khám / Laboratory
 * Nêu bật các điểm mạnh: vật liệu, kỹ thuật, quy trình, bảo hành
 */
export default function AboutSection() {
  const strengths = [
    {
      icon: Microscope,
      title: "Vật liệu cao cấp",
      description:
        "Sử dụng phôi sứ nhập khẩu chính hãng từ các thương hiệu hàng đầu thế giới: Ivoclar (E.max), Dentsply Sirona, 3M ESPE.",
    },
    {
      icon: Factory,
      title: "Công nghệ CAD/CAM",
      description:
        "Xưởng Lab được trang bị hệ thống thiết kế và gia công kỹ thuật số CAD/CAM, đảm bảo độ chính xác từng chi tiết.",
    },
    {
      icon: Award,
      title: "Quy trình chuẩn hóa",
      description:
        "Mỗi ca phục hình đều tuân thủ quy trình 5 bước từ tư vấn, thiết kế đến bàn giao, đảm bảo chất lượng đồng nhất.",
    },
    {
      icon: ShieldCheck,
      title: "Bảo hành minh bạch",
      description:
        "Hệ thống bảo hành điện tử tiên tiến, cho phép khách hàng tra cứu thông tin bảo hành mọi lúc qua QR code.",
    },
  ];

  return (
    <section id="about" className="bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-mint-600">
            Giới thiệu
          </span>
          <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
            Laboratory răng sứ đạt chuẩn quốc tế
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 lg:text-lg">
            SmileLab Dental kết hợp chuyên môn nha khoa lâm sàng với năng lực
            sản xuất Lab hiện đại, mang đến giải pháp phục hình răng sứ toàn
            diện — từ tư vấn, thiết kế kỹ thuật số, gia công chính xác đến bảo
            hành dài hạn.
          </p>
        </div>

        {/* Strengths grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8">
          {strengths.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-mint-200 hover:shadow-md lg:p-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-50 text-mint-600 transition-colors group-hover:bg-mint-100">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

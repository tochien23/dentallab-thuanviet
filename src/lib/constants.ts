/* ====================================
   Thông tin thương hiệu SmileLab Dental
   & Dữ liệu mẫu cho Landing Page
   ==================================== */

/** Thông tin phòng khám */
export const CLINIC_INFO = {
  name: "SmileLab Dental",
  slogan: "Chuẩn xác trong từng nụ cười",
  phone: "0901 234 567",
  email: "info@smilelabdental.vn",
  address: "Nầm - Tứ Mỹ - Hà Tĩnh",
  workingHours: {
    weekdays: "Thứ 2 – Thứ 7: 8:00 – 20:00",
    weekend: "Chủ nhật: 8:00 – 17:00",
  },
  social: {
    facebook: "https://facebook.com/smilelabdental",
    instagram: "https://instagram.com/smilelabdental",
    youtube: "https://youtube.com/@smilelabdental",
    zalo: "https://zalo.me/smilelabdental",
  },
} as const;

/** Danh sách dịch vụ */
export const SERVICES = [
  {
    id: "zirconia",
    slug: "zirconia",
    name: "Răng sứ Zirconia",
    description:
      "Phôi sứ Zirconia cao cấp, độ bền vượt trội, thẩm mỹ tự nhiên. Phù hợp cho phục hình cầu răng, mão răng toàn hàm với tuổi thọ lên đến 20 năm.",
    icon: "Crown" as const,
  },
  {
    id: "emax",
    slug: "rang-su-kim-loai",
    name: "Răng sứ Kim Loại",
    description:
      "Giải pháp phục hồi chức năng ăn nhai vững chắc và kinh tế cho các trường hợp mất răng hoặc răng hàm hư tổn nặng, cấu trúc khung sườn kim loại y tế phủ men sứ bền bỉ.",
    icon: "Sparkles" as const,
  },
  {
    id: "veneer",
    slug: "veneer",
    name: "Mặt dán sứ Veneer",
    description:
      "Lớp sứ siêu mỏng dán trực tiếp lên bề mặt răng, bảo tồn mô răng tối đa. Giải pháp thẩm mỹ nhanh chóng, nhẹ nhàng cho nụ cười hoàn hảo.",
    icon: "Layers" as const,
  },
  {
    id: "implant",
    slug: "implant",
    name: "Phục hình trên Implant",
    description:
      "Phục hình răng sứ trên trụ Implant Titanium hoặc Zirconia. Tái tạo răng mất hoàn chỉnh, ổn định lâu dài, không ảnh hưởng răng lân cận.",
    icon: "Puzzle" as const,
  },
] as const;

/** Quy trình điều trị */
export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Tư vấn",
    description:
      "Trao đổi nhu cầu, kỳ vọng thẩm mỹ và tình trạng sức khỏe răng miệng của bạn.",
  },
  {
    step: 2,
    title: "Thăm khám",
    description:
      "Chụp X-quang, khảo sát toàn diện cấu trúc răng và xương hàm để đánh giá chính xác.",
  },
  {
    step: 3,
    title: "Lên kế hoạch",
    description:
      "Thiết kế phương án phục hình chi tiết, lựa chọn vật liệu, màu sắc và hình dáng phù hợp.",
  },
  {
    step: 4,
    title: "Thực hiện",
    description:
      "Gia công răng sứ tại xưởng Lab chuẩn quốc tế CAD/CAM, bác sĩ lắp đặt chính xác.",
  },
  {
    step: 5,
    title: "Bàn giao & Bảo hành",
    description:
      "Kích hoạt thẻ bảo hành điện tử, hướng dẫn chăm sóc và lịch tái khám định kỳ.",
  },
] as const;

/** Lợi ích bảo hành */
export const WARRANTY_BENEFITS = [
  {
    title: "Minh bạch thông tin",
    description:
      "Toàn bộ thông tin vật liệu, nguồn gốc xuất xứ và thời hạn bảo hành được lưu trữ rõ ràng trên hệ thống.",
    icon: "ShieldCheck" as const,
  },
  {
    title: "Tra cứu tức thì qua QR",
    description:
      "Chỉ cần quét mã QR trên thẻ bảo hành, khách hàng kiểm tra ngay trạng thái bảo hành mọi lúc, mọi nơi.",
    icon: "QrCode" as const,
  },
  {
    title: "Quản lý lịch sử điều trị",
    description:
      "Lưu trữ đầy đủ lịch sử ca điều trị, vật liệu sử dụng và bác sĩ phụ trách cho mỗi vị trí răng.",
    icon: "ClipboardList" as const,
  },
  {
    title: "Hỗ trợ sau điều trị",
    description:
      "Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn trong suốt thời gian bảo hành sản phẩm.",
    icon: "HeartHandshake" as const,
  },
] as const;

/** Danh sách dịch vụ cho form dropdown */
export const SERVICE_OPTIONS = [
  "Răng sứ Zirconia",
  "Răng sứ Kim Loại",
  "Mặt dán sứ Veneer",
  "Phục hình trên Implant",
  "Tư vấn tổng quát",
  "Khác",
] as const;

/** Menu điều hướng */
export const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Dịch vụ", href: "/dich-vu" },
  { label: "Quy trình", href: "/#process" },
  { label: "Bảo hành", href: "/#warranty-benefits" },
  { label: "Tra cứu bảo hành", href: "/bao-hanh" },
  { label: "Liên hệ", href: "/#contact" },
] as const;

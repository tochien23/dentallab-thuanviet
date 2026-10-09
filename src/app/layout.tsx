import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SmileLab Dental — Phục Hình Răng Sứ Cao Cấp & Bảo Hành Minh Bạch",
    template: "%s | SmileLab Dental",
  },
  description:
    "SmileLab Dental — Laboratory răng sứ đạt chuẩn quốc tế. Phục hình Zirconia, E.max, Veneer, Implant với hệ thống bảo hành điện tử minh bạch. Tra cứu bảo hành 24/7 bằng mã QR.",
  keywords: [
    "răng sứ",
    "nha khoa",
    "bảo hành răng sứ",
    "zirconia",
    "emax",
    "veneer",
    "implant",
    "SmileLab Dental",
    "laboratory răng sứ",
    "phòng khám nha khoa",
  ],
  authors: [{ name: "SmileLab Dental" }],
  openGraph: {
    title: "SmileLab Dental — Phục Hình Răng Sứ Cao Cấp",
    description:
      "Chuẩn xác trong từng nụ cười. Phục hình răng sứ cao cấp với hệ thống bảo hành điện tử minh bạch.",
    type: "website",
    locale: "vi_VN",
    siteName: "SmileLab Dental",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}

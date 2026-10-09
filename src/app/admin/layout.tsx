import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/ToastContext";
import { CLINIC_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Quản Trị Hệ Thống | ${CLINIC_INFO.name}`,
  description: "Trang quản trị nội bộ hệ thống nha khoa và thẻ bảo hành điện tử SmileLab Dental.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}

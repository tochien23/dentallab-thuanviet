"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  MessageSquareHeart,
  ExternalLink,
  LogOut,
  X,
  Stethoscope,
  UserCog,
} from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";
import { authService } from "@/services/authService";
import type { UserRole } from "@/types/database.types";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  /** Nếu có, chỉ role này mới thấy mục menu */
  requiredRole?: UserRole;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Bảng thống kê",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/patients",
    label: "Khách hàng / Bệnh nhân",
    icon: Users,
  },
  {
    href: "/admin/treatments",
    label: "Hồ sơ Ca điều trị",
    icon: ClipboardList,
  },
  {
    href: "/admin/teeth",
    label: "Chi tiết răng phục hình",
    icon: Sparkles,
  },
  {
    href: "/admin/warranties",
    label: "Thẻ bảo hành điện tử",
    icon: ShieldCheck,
  },
  {
    href: "/admin/consultations",
    label: "Yêu cầu tư vấn",
    icon: MessageSquareHeart,
  },
  {
    href: "/admin/users",
    label: "Quản lý tài khoản",
    icon: UserCog,
    requiredRole: "admin",
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
  onLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) setCurrentRole(user.role as UserRole);
    });
  }, []);

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // Lọc menu theo quyền
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiredRole || item.requiredRole === currentRole
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-navy-950 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-18 items-center justify-between border-b border-navy-800/80 px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mint-500 to-mint-600 shadow-md shadow-mint-500/20">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">
                Smile<span className="text-mint-400">Lab</span>
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Admin Backoffice
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Hệ thống quản lý
          </p>

          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-mint-500 text-navy-950 font-semibold shadow-md shadow-mint-500/20"
                    : "text-slate-300 hover:bg-navy-900 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? "text-navy-950" : "text-slate-400 group-hover:text-mint-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-6 pb-2">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Khách hàng & Cổng thông tin
            </p>
            <Link
              href="/bao-hanh"
              target="_blank"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-navy-900 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-slate-400" />
                <span>Trang tra cứu bảo hành</span>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-navy-900 hover:text-white transition-all"
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 text-slate-400" />
                <span>Trang chủ phòng khám</span>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* User profile & logout footer */}
        <div className="border-t border-navy-800/80 p-4 bg-navy-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint-500/20 text-mint-400 font-bold text-xs">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  Quản Trị Viên
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {CLINIC_INFO.email}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="rounded-lg p-2 text-slate-400 hover:bg-navy-800 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Menu,
  User,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { authService, AdminUser } from "@/services/authService";

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
}

export default function AdminHeader({
  onOpenMobileMenu,
  title,
  subtitle,
  onLogout,
}: AdminHeaderProps) {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then((u) => {
      if (isMounted && u) setCurrentUser(u);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Quản trị viên",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "technician":
        return {
          label: "Kỹ thuật viên",
          bg: "bg-teal-50 text-teal-700 border-teal-200",
        };
      case "staff":
      default:
        return {
          label: "Nhân viên",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          title="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {title && (
          <div>
            <h1 className="text-lg font-bold text-navy-950 sm:text-xl">{title}</h1>
            {subtitle && (
              <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống hoạt động</span>
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative pl-2 border-l border-slate-200" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100/80 transition-colors cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-navy-900 to-navy-950 text-white font-bold text-xs shadow-xs">
              {currentUser?.full_name ? (
                currentUser.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(-2)
                  .join("")
                  .toUpperCase()
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            <div className="hidden md:block text-left text-xs">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-navy-950">
                  {currentUser?.full_name || "SmileLab Admin"}
                </p>
                <span
                  className={`rounded-full border px-1.5 py-0.2 text-[10px] font-semibold ${roleInfo.bg}`}
                >
                  {roleInfo.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentUser?.email || "admin@smilelabdental.vn"}
              </p>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform group-hover:text-slate-600 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-navy-950/10 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
              <div className="p-3 border-b border-slate-100">
                <p className="font-bold text-xs text-navy-950">
                  {currentUser?.full_name || "Quản trị viên"}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {currentUser?.email || "admin@smilelabdental.vn"}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${roleInfo.bg}`}
                  >
                    {roleInfo.label}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Đang online
                  </span>
                </div>
              </div>

              <div className="py-1 text-xs text-slate-700">
                <Link
                  href="/admin/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium hover:bg-slate-50 hover:text-navy-950 transition-colors"
                >
                  <UserCheck className="h-4 w-4 text-slate-500" />
                  <span>Hồ sơ & Đổi mật khẩu</span>
                </Link>

                <Link
                  href="/admin/users"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-medium hover:bg-slate-50 hover:text-navy-950 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <span>Quản lý tài khoản nhân sự</span>
                </Link>
              </div>

              {onLogout && (
                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất hệ thống</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

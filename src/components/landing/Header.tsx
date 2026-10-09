"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { CLINIC_INFO, NAV_ITEMS } from "@/lib/constants";

/**
 * Header chính của website SmileLab Dental
 * - Responsive: mobile hamburger drawer, desktop horizontal nav
 * - Sticky + backdrop blur khi cuộn trang
 * - Tự động hiển thị nền sáng rõ ràng trên các trang con (/dich-vu, /bao-hanh, v.v.)
 */
export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHomePage = pathname === "/";
  // Khi không ở trang chủ, hoặc khi cuộn trang, luôn hiển thị nền solid sáng rõ nét
  const isSolid = isScrolled || !isHomePage;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng menu mobile khi click vào link
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 lg:h-10 lg:w-10">
              <span className="text-sm font-bold text-white lg:text-base">SL</span>
            </div>
            <div>
              <span
                className={`text-lg font-bold transition-colors lg:text-xl ${
                  isSolid ? "text-navy-900" : "text-white"
                }`}
              >
                {CLINIC_INFO.name}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/dich-vu"
                  ? pathname.startsWith("/dich-vu")
                  : item.href === "/bao-hanh"
                  ? pathname.startsWith("/bao-hanh")
                  : false;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? isSolid
                        ? "bg-mint-50 text-mint-700 font-semibold"
                        : "bg-white/20 text-white font-semibold"
                      : isSolid
                      ? "text-slate-600 hover:bg-slate-50 hover:text-navy-800"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={`tel:${CLINIC_INFO.phone.replace(/\s/g, "")}`}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isSolid ? "text-navy-800" : "text-white/90"
              }`}
            >
              <Phone className="h-4 w-4" />
              {CLINIC_INFO.phone}
            </a>
            <a
              href="/#contact"
              className="rounded-lg bg-mint-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-mint-600 hover:shadow-md"
            >
              Đặt lịch tư vấn
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`rounded-lg p-2 transition-colors lg:hidden ${
              isSolid
                ? "text-slate-700 hover:bg-slate-100"
                : "text-white hover:bg-white/10"
            }`}
            aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="animate-fade-in border-t border-slate-100 bg-white shadow-lg lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className="block rounded-lg px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-navy-800"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <a
                href={`tel:${CLINIC_INFO.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600"
              >
                <Phone className="h-4 w-4" />
                {CLINIC_INFO.phone}
              </a>
              <a
                href="/#contact"
                onClick={handleNavClick}
                className="mt-2 block rounded-lg bg-mint-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-mint-600"
              >
                Đặt lịch tư vấn
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

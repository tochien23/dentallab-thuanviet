import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

/**
 * Footer chính — thông tin liên hệ, giờ làm việc, mạng xã hội
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint-500">
                <span className="text-sm font-bold text-white">SL</span>
              </div>
              <span className="text-lg font-bold text-white">
                {CLINIC_INFO.name}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              {CLINIC_INFO.slogan}. Phục hình răng sứ cao cấp với hệ thống bảo
              hành điện tử minh bạch.
            </p>
          </div>

          {/* Liên hệ */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Liên hệ
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" />
                {CLINIC_INFO.address}
              </li>
              <li>
                <a
                  href={`tel:${CLINIC_INFO.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-mint-500" />
                  {CLINIC_INFO.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CLINIC_INFO.email}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-mint-500" />
                  {CLINIC_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Giờ làm việc */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Giờ làm việc
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" />
                {CLINIC_INFO.workingHours.weekdays}
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" />
                {CLINIC_INFO.workingHours.weekend}
              </li>
            </ul>
          </div>

          {/* Liên kết */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
              Theo dõi chúng tôi
            </h4>
            <div className="mt-4 flex gap-3">
              <a
                href={CLINIC_INFO.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={CLINIC_INFO.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={CLINIC_INFO.social.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Zalo"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.05 0H1.95A1.95 1.95 0 0 0 0 1.95v20.1c0 1.077.873 1.95 1.95 1.95h20.1c1.077 0 1.95-.873 1.95-1.95V1.95A1.95 1.95 0 0 0 22.05 0zm-2.923 14.811a2.637 2.637 0 0 1-2.433 1.834h-6.236l-2.937 1.936a.35.35 0 0 1-.537-.293V16.63A2.836 2.836 0 0 1 4.5 13.824V9.186A2.836 2.836 0 0 1 7.336 6.38h9.355a2.637 2.637 0 0 1 2.436 1.834v6.597zM8.337 8.213H6.454v5.424h3.766v-1.353H8.337V8.213zm4.646 3.659c-.27-.478-.655-.717-1.157-.717-.492 0-.874.239-1.144.717-.271.479-.407 1.094-.407 1.847 0 .742.136 1.352.407 1.83.27.479.652.718 1.144.718.502 0 .887-.239 1.157-.718.27-.478.405-1.088.405-1.83 0-.753-.135-1.368-.405-1.847zm-1.157-.33c.31 0 .565.176.762.529.198.353.297.871.297 1.554 0 .671-.099 1.186-.297 1.545-.197.359-.452.538-.762.538s-.565-.179-.763-.538c-.197-.359-.296-.874-.296-1.545 0-.683.099-1.201.296-1.554.198-.353.453-.529.763-.529zm5.547.33a1.442 1.442 0 0 0-.688-.545 2.84 2.84 0 0 0-1.054-.184h-1.637v5.424h1.637c.394 0 .745-.06 1.054-.181.309-.121.538-.303.688-.545.15-.242.225-.542.225-.9v-2.17c0-.357-.075-.658-.225-.899zM16.14 13.91c0 .241-.122.361-.365.361h-.595v-2.527h.595c.243 0 .365.121.365.362v1.804zm2.14-5.697h-1.428V6.862h1.428v1.351zm-5.044 0h-1.428V6.862h1.428v1.351z" />
                </svg>
              </a>
            </div>

            <div className="mt-6">
              <Link
                href="/bao-hanh"
                className="inline-flex items-center gap-2 rounded-lg border border-mint-500/30 bg-mint-500/10 px-4 py-2 text-sm font-medium text-mint-400 transition-colors hover:bg-mint-500/20"
              >
                🔍 Tra cứu bảo hành
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs">
              © {currentYear} {CLINIC_INFO.name}. Bảo lưu mọi quyền.
            </p>
            <div className="flex gap-4 text-xs">
              <Link
                href="#"
                className="transition-colors hover:text-white"
              >
                Chính sách bảo mật
              </Link>
              <Link
                href="#"
                className="transition-colors hover:text-white"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

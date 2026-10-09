"use client";

import { Loader2, ShieldCheck } from "lucide-react";

/**
 * Component Loading skeleton khi trang /bao-hanh/[code] đang tải dữ liệu
 * Hiển thị shimmer animation chuyên nghiệp
 */
export default function WarrantyLoadingSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in-0 duration-300">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header skeleton */}
        <div className="bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 animate-pulse">
              <ShieldCheck className="h-5 w-5 text-slate-300" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-28 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-3 w-48 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Body skeleton */}
        <div className="p-6 space-y-5">
          {/* Mã bảo hành */}
          <div>
            <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="mt-2 h-6 w-44 rounded bg-slate-200 animate-pulse" />
          </div>

          {/* Grid skeleton */}
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-0.5 h-4 w-4 rounded bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-16 rounded bg-slate-200 animate-pulse" />
                  <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="border-t border-slate-100 px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải thông tin bảo hành...
          </div>
        </div>
      </div>
    </div>
  );
}

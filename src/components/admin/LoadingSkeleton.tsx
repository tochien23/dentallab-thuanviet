"use client";

import React from "react";

export default function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="h-9 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 mt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-36 bg-slate-200 rounded-sm" />
                <div className="h-3 w-24 bg-slate-100 rounded-sm" />
              </div>
            </div>
            <div className="hidden sm:block h-4 w-28 bg-slate-100 rounded-sm" />
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
            <div className="h-8 w-16 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

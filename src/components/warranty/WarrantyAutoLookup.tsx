"use client";

import { useEffect, useState, useCallback } from "react";
import { warrantyService } from "@/services/warrantyService";
import type { PublicWarrantyResult } from "@/types/database.types";
import WarrantyResultCard from "./WarrantyResultCard";
import WarrantyEmptyState from "./WarrantyEmptyState";
import WarrantyLoadingSkeleton from "./WarrantyLoadingSkeleton";
import { AlertCircle } from "lucide-react";

/**
 * Component tự động tra cứu bảo hành theo mã trong URL param
 * Dùng cho trang /bao-hanh/[code]
 */
export default function WarrantyAutoLookup({ code }: { code: string }) {
  const [result, setResult] = useState<PublicWarrantyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await warrantyService.searchPublicWarranty(code);
      setResult(data);
    } catch {
      setError(
        "Đã có lỗi xảy ra khi tra cứu thông tin bảo hành. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    let cancelled = false;

    const doLookup = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await warrantyService.searchPublicWarranty(code);
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled)
          setError(
            "Đã có lỗi xảy ra khi tra cứu thông tin bảo hành. Vui lòng thử lại sau."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doLookup();

    return () => {
      cancelled = true;
    };
  }, [code]);

  // Loading
  if (loading) {
    return <WarrantyLoadingSkeleton />;
  }

  // Lỗi hệ thống
  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <h3 className="mt-3 text-lg font-semibold text-red-800">
            Lỗi tra cứu
          </h3>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={lookup}
            className="
              mt-4 inline-flex items-center justify-center gap-2 rounded-xl
              bg-red-600 px-5 py-2.5 text-sm font-semibold text-white
              transition-all hover:bg-red-700
            "
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Không tìm thấy
  if (!result) {
    return <WarrantyEmptyState />;
  }

  // Hiển thị kết quả
  return (
    <div className="w-full max-w-2xl mx-auto">
      <WarrantyResultCard warranty={result} />
    </div>
  );
}

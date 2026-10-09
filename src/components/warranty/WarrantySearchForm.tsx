"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, XCircle, AlertCircle } from "lucide-react";
import {
  warrantySearchSchema,
  type WarrantySearchInput,
} from "@/lib/validations/warranty";
import { warrantyService } from "@/services/warrantyService";
import type { PublicWarrantyResult } from "@/types/database.types";
import WarrantyResultCard from "./WarrantyResultCard";
import WarrantyEmptyState from "./WarrantyEmptyState";

/**
 * Component form tra cứu bảo hành chính
 * Xử lý: nhập mã → validate → gọi service → hiển thị kết quả/lỗi/trống
 */
export default function WarrantySearchForm({
  initialQuery,
  showPrint = false,
}: {
  initialQuery?: string;
  showPrint?: boolean;
}) {
  const [result, setResult] = useState<PublicWarrantyResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WarrantySearchInput>({
    resolver: zodResolver(warrantySearchSchema),
    defaultValues: { searchQuery: initialQuery || "" },
  });

  const onSubmit = useCallback(async (data: WarrantySearchInput) => {
    setErrorMessage(null);
    setResult(null);
    setSearched(false);

    try {
      const found = await warrantyService.searchPublicWarranty(data.searchQuery);
      setResult(found);
      setSearched(true);
    } catch {
      setErrorMessage(
        "Đã có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau hoặc liên hệ phòng khám."
      );
      setSearched(true);
    }
  }, []);

  const handleClear = useCallback(() => {
    reset({ searchQuery: "" });
    setResult(null);
    setSearched(false);
    setErrorMessage(null);
  }, [reset]);

  return (
    <div className="w-full">
      {/* === FORM TRA CỨU === */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <input
            {...register("searchQuery")}
            type="text"
            placeholder="Nhập mã bảo hành (VD: SL-2026-88888)"
            disabled={isSubmitting}
            autoComplete="off"
            className={`
              w-full rounded-xl border bg-slate-50 px-4 py-3.5 pl-11 pr-10
              text-sm text-navy-950 placeholder:text-slate-400
              transition-all duration-200
              focus:border-mint-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mint-500/20
              disabled:cursor-not-allowed disabled:opacity-60
              ${errors.searchQuery ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"}
            `}
          />
          <Search className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />

          {/* Nút xóa nhanh */}
          {searched && !isSubmitting && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-3.5 rounded-full p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Xóa tìm kiếm"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Lỗi validation */}
        {errors.searchQuery && (
          <p className="flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {errors.searchQuery.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            flex w-full items-center justify-center gap-2 rounded-xl
            bg-navy-800 px-4 py-3.5 text-sm font-semibold text-white
            transition-all duration-200
            hover:bg-navy-900 hover:shadow-lg hover:shadow-navy-900/20
            active:scale-[0.98]
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tra cứu...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Tra cứu bảo hành
            </>
          )}
        </button>
      </form>

      {/* === KẾT QUẢ === */}
      <div className="mt-6">
        {/* Lỗi hệ thống */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium">Lỗi tra cứu</p>
                <p className="mt-1 text-red-600">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hiển thị kết quả bảo hành */}
        {searched && !errorMessage && result && (
          <WarrantyResultCard warranty={result} showPrint={showPrint} />
        )}

        {/* Không tìm thấy */}
        {searched && !errorMessage && !result && <WarrantyEmptyState />}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Loader2, CheckCircle, AlertCircle, MapPin, Phone, Mail } from "lucide-react";
import {
  consultationSchema,
  type ConsultationFormData,
} from "@/lib/validations/consultation";
import { CLINIC_INFO, SERVICE_OPTIONS } from "@/lib/constants";
import { consultationService } from "@/services/consultationService";

interface ConsultationFormProps {
  initialService?: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  id?: string;
}

/**
 * Form đăng ký tư vấn
 * - Validation bằng Zod + React Hook Form
 * - Trạng thái: idle → submitting → success / error
 * - Tích hợp lưu vào Supabase (hoặc mock nếu chưa cấu hình DB)
 */
export default function ConsultationForm({
  initialService = "",
  badge = "Liên hệ",
  title = "Đăng ký tư vấn miễn phí",
  subtitle = "Để lại thông tin, đội ngũ bác sĩ và kỹ thuật viên của SmileLab Dental sẽ liên hệ tư vấn chi tiết giải pháp phục hình phù hợp nhất cho bạn.",
  id = "contact",
}: ConsultationFormProps = {}) {
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      service: initialService,
      message: "",
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setSubmitStatus("submitting");
    try {
      const res = await consultationService.createConsultation(data);
      if (res.success) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    }
  };

  // Hiển thị thông báo thành công
  if (submitStatus === "success") {
    return (
      <section id={id} className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <div className="rounded-2xl border border-mint-200 bg-mint-50 p-8 lg:p-12">
            <CheckCircle className="mx-auto h-16 w-16 text-mint-500" />
            <h3 className="mt-4 text-xl font-bold text-navy-900 sm:text-2xl">
              Gửi thông tin thành công!
            </h3>
            <p className="mt-3 text-slate-600">
              Cảm ơn bạn đã quan tâm đến SmileLab Dental. Đội ngũ chăm sóc
              khách hàng sẽ liên hệ bạn trong thời gian sớm nhất.
            </p>
            <button
              type="button"
              onClick={() => setSubmitStatus("idle")}
              className="mt-6 rounded-lg bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
            >
              Gửi yêu cầu khác
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: text */}
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-mint-600">
              {badge}
            </span>
            <h2 className="mt-2 text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600 lg:text-lg">
              {subtitle}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <MapPin className="h-5 w-5 text-mint-600" />
                </div>
                <div>
                  <p className="font-medium text-navy-900">Địa chỉ</p>
                  <p className="text-sm text-slate-500">
                    {CLINIC_INFO.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <Phone className="h-5 w-5 text-mint-600" />
                </div>
                <div>
                  <p className="font-medium text-navy-900">Hotline</p>
                  <p className="text-sm text-slate-500">{CLINIC_INFO.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-600">
                  <Mail className="h-5 w-5 text-mint-600" />
                </div>
                <div>
                  <p className="font-medium text-navy-900">Email</p>
                  <p className="text-sm text-slate-500">
                    {CLINIC_INFO.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm lg:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Họ tên */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-medium text-navy-900"
                >
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Nhập họ và tên"
                  className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-500 ${errors.fullName ? "border-red-300" : "border-slate-200"
                    }`}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-navy-900"
                >
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-500 ${errors.phone ? "border-red-300" : "border-slate-200"
                    }`}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-navy-900"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Nhập email (không bắt buộc)"
                  className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-500 ${errors.email ? "border-red-300" : "border-slate-200"
                    }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Dịch vụ quan tâm */}
              <div>
                <label
                  htmlFor="service"
                  className="mb-1.5 block text-sm font-medium text-navy-900"
                >
                  Dịch vụ quan tâm <span className="text-red-500">*</span>
                </label>
                <select
                  id="service"
                  className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-mint-500 ${errors.service ? "border-red-300" : "border-slate-200"
                    }`}
                  {...register("service")}
                >
                  <option value="">-- Chọn dịch vụ --</option>
                  {SERVICE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.service && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.service.message}
                  </p>
                )}
              </div>

              {/* Nội dung */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-medium text-navy-900"
                >
                  Nội dung
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Mô tả ngắn về tình trạng hoặc nhu cầu của bạn..."
                  className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mint-500 ${errors.message ? "border-red-300" : "border-slate-200"
                    }`}
                  {...register("message")}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Error message */}
              {submitStatus === "error" && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  Đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ trực
                  tiếp qua hotline.
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitStatus === "submitting"}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-mint-500 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-mint-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitStatus === "submitting" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Gửi yêu cầu tư vấn
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

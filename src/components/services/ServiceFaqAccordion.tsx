"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { ServiceFaq } from "@/lib/servicesData";

interface ServiceFaqAccordionProps {
  faqs: ServiceFaq[];
}

export default function ServiceFaqAccordion({ faqs }: ServiceFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Mở câu đầu tiên mặc định

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
              isOpen
                ? "border-mint-300 bg-white shadow-md shadow-mint-500/5 ring-1 ring-mint-400/20"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors sm:p-6"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isOpen
                      ? "bg-mint-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <HelpCircle className="h-4 w-4" />
                </div>
                <span
                  className={`text-base font-semibold transition-colors sm:text-lg ${
                    isOpen ? "text-navy-950" : "text-navy-900"
                  }`}
                >
                  {faq.question}
                </span>
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-mint-600" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

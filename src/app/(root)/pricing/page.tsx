"use client";

import { Check, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";
import PricingCards from "@/components/PricingCards";

const TABLE_DATA = [
  { feature: "Dashboard & account tracking", free: true, pro: true, business: true },
  { feature: "Transactions & bank integrations", free: "Up to 3", pro: true, business: true },
  { feature: "Bills, subscriptions & notifications", free: false, pro: true, business: true },
  { feature: "Budgeting & monthly planning", free: false, pro: true, business: true },
  { feature: "Reports & downloads", free: "Basic", pro: true, business: true },
  { feature: "Advanced insights & unlimited history", free: false, pro: true, business: true },
  { feature: "Multiple users", free: false, pro: false, business: "Up to 5" },
  { feature: "Priority support", free: false, pro: false, business: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white pt-24 font-sans">
      {/* Background Header Area */}
      <div className="absolute top-0 inset-x-0 h-[700px] bg-gradient-to-b from-[#f2fdf7] to-white -z-10" />

      {/* Shared Pricing Section */}
      <section className="pt-12 pb-16 px-6 sm:px-8 max-w-[1400px] mx-auto">
        <PricingCards />
      </section>

      {/* Feature Comparison Table */}
      <section className="px-6 sm:px-8 max-w-[1200px] mx-auto mb-20">
        <div className="bg-[#f8fbf9] rounded-3xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200/60 bg-[#f2fdf7]/50">
            <div className="col-span-6">
              <span className="text-[13px] font-bold text-[#0f172a]">Feature</span>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-[13px] font-bold text-[#0f172a]">Free</span>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-[13px] font-bold text-brand-green">Pro</span>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-[13px] font-bold text-[#0f172a]">Business</span>
            </div>
          </div>

          <div className="divide-y divide-gray-100 bg-white">
            {TABLE_DATA.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
              >
                <div className="col-span-6">
                  <span className="text-[13px] text-gray-600 font-medium">
                    {row.feature}
                  </span>
                </div>
                {[row.free, row.pro, row.business].map((val, vIdx) => (
                  <div key={vIdx} className="col-span-2 flex justify-center">
                    {val === true ? (
                      <Check className="w-4 h-4 text-brand-green" strokeWidth={3} />
                    ) : val === false ? (
                      <span className="text-gray-300 font-bold">—</span>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {val}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] font-medium text-gray-400 mt-6">
          Secure payments &bull; Cancel your monthly plan anytime &bull; Yearly
          plans billed annually &bull; 20% savings with yearly billing
        </p>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 sm:px-8 max-w-[1200px] mx-auto pb-24">
        <div className="bg-[#f2fdf7] rounded-full p-4 pl-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-green-100">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[15px] font-extrabold text-[#0f172a] mr-2">
                Ready to Take Control?
              </span>
              <span className="text-[14px] font-medium text-gray-600 hidden sm:inline">
                Start managing your money with Moneylog today.
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="group flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white bg-brand-green hover:bg-brand-green-dark rounded-full transition-all duration-200 shadow-md shadow-brand-green/20 w-full md:w-auto shrink-0"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, DollarSign } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

/** Yearly billing is the monthly price less 20%, charged once a year. */
const YEARLY_DISCOUNT = "Save 20%";

const PLANS = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    popular: false,
    features: ["Essential features", "Connect up to 3 accounts", "Basic reports"],
    cta: "Get Started",
  },
  {
    name: "Personal Pro",
    monthly: 9.99,
    yearly: 7.99,
    popular: true,
    features: [
      "Unlimited accounts",
      "Advanced budgeting",
      "Bill pay & reminders",
      "Premium reports",
      "AI financial assistant",
    ],
    cta: "Get Personal Pro",
  },
  {
    name: "Family & Business",
    monthly: 19.99,
    yearly: 15.99,
    popular: false,
    features: [
      "Up to 5 users",
      "Invoicing & business tools",
      "Advanced reporting",
      "Priority support",
      "Tax & receipt organizer",
    ],
    cta: "Get Started",
  },
];

const money = (value: number) =>
  value === 0 ? "$0" : `$${value.toFixed(2)}`;

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="w-full scroll-mt-24 border-b border-gray-100 bg-white pt-12 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal>
          <div className="group mb-7 flex flex-col items-center gap-2 text-center sm:mb-8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-10 sm:w-10">
                <DollarSign className="h-4 w-4 text-white sm:h-5 sm:w-5" strokeWidth={2.5} />
              </span>
              <h2 className="text-lg font-bold tracking-tight text-blue-950 sm:text-xl lg:text-2xl">
                Simple, Transparent Pricing
              </h2>
            </div>
            <p className="text-xs text-slate-500 sm:text-sm">
              Choose the plan that fits your needs.
            </p>
          </div>
        </Reveal>

        {/* Billing toggle */}
        <Reveal delay={80}>
          <div className="mb-10 flex flex-col items-center gap-2.5 sm:mb-14">
            <div
              role="group"
              aria-label="Billing period"
              className="relative inline-flex items-center rounded-full bg-slate-100 p-1"
            >
              {/* Sliding indicator */}
              <span
                aria-hidden="true"
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out ${
                  yearly ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => setYearly(false)}
                aria-pressed={!yearly}
                className={`relative z-10 w-[104px] rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300 sm:text-sm ${
                  yearly ? "text-slate-500 hover:text-slate-700" : "text-blue-950"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                aria-pressed={yearly}
                className={`relative z-10 w-[104px] rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300 sm:text-sm ${
                  yearly ? "text-blue-950" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Yearly
              </button>
            </div>

            <span
              className={`rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-brand-green uppercase transition-opacity duration-300 sm:text-[11px] ${
                yearly ? "opacity-100" : "opacity-60"
              }`}
            >
              {YEARLY_DISCOUNT} with yearly billing
            </span>
          </div>
        </Reveal>

        {/* Plans */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-7">
          {PLANS.map((plan, index) => {
            const price = yearly ? plan.yearly : plan.monthly;
            const isPaid = plan.monthly > 0;

            return (
              <Reveal
                key={plan.name}
                delay={index * 110}
                variant="up"
                className={`h-full ${plan.popular ? "md:-my-3" : ""}`}
              >
                <div
                  className={`group relative flex h-full flex-col rounded-2xl p-7 transition-all duration-500 ease-out hover:-translate-y-1.5 sm:p-8 ${
                    plan.popular
                      ? "bg-gradient-to-b from-emerald-50/70 to-white ring-1 ring-brand-green/30 shadow-[0_20px_50px_-26px_rgba(26,143,76,0.45)] hover:shadow-[0_28px_60px_-26px_rgba(26,143,76,0.55)]"
                      : "bg-white ring-1 ring-gray-200/80 shadow-[0_10px_30px_-24px_rgba(16,24,40,0.4)] hover:ring-brand-green/30 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.4)]"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-green px-3.5 py-1 text-[10px] font-bold tracking-[0.14em] whitespace-nowrap text-white uppercase shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <h3 className="text-base font-semibold text-blue-950">{plan.name}</h3>

                  <div className="mt-4 flex items-end gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-blue-950 sm:text-[2.5rem]">
                      {money(price)}
                    </span>
                    <span className="mb-1.5 text-sm font-medium text-slate-400">/ month</span>
                  </div>

                  {/* Billing detail — reserved height so cards never shift */}
                  <p className="mt-2 h-4 text-[11px] text-slate-400">
                    {isPaid && yearly && (
                      <>
                        <span className="line-through">{money(plan.monthly)}</span>{" "}
                        &middot; billed annually at {money(plan.yearly * 12)}
                      </>
                    )}
                    {isPaid && !yearly && "Billed monthly, cancel anytime"}
                  </p>

                  <div className="my-6 h-px bg-gradient-to-r from-gray-200 to-transparent" />

                  <ul className="mb-8 flex-1 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                        <span
                          className={`ml-pop mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                            plan.popular ? "bg-brand-green/15" : "bg-blue-50"
                          }`}
                          style={{ animationDelay: `${index * 110 + featureIndex * 80}ms` }}
                        >
                          <Check
                            className={`h-2.5 w-2.5 ${plan.popular ? "text-brand-green" : "text-blue-600"}`}
                            strokeWidth={4}
                          />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`ml-press flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "ml-shine bg-brand-green text-white hover:bg-brand-green-dark hover:shadow-[0_14px_28px_-14px_rgba(26,143,76,0.9)]"
                        : "bg-white text-slate-700 ring-1 ring-gray-200 hover:bg-emerald-50/60 hover:text-brand-green-dark hover:ring-brand-green/40"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

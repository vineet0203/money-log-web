"use client";

import { useState } from "react";
import { Check, DollarSign } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started with the essentials at no cost.",
    monthly: 0,
    yearly: 0,
    popular: false,
    cta: "Get Started",
    listLabel: "What's included",
    features: [
      "Personal Finance Dashboard",
      "Connect up to 3 accounts",
      "Basic Transaction Tracking",
      "Basic Reports",
      "Payment Notifications",
    ],
  },
  {
    id: "personal-pro",
    name: "Personal Pro",
    tagline: "Everything you need for full financial control.",
    monthly: 9.99,
    yearly: 7.99,
    popular: true,
    cta: "Get Personal Pro",
    listLabel: "Everything in Free, plus",
    features: [
      "Unlimited Bank Accounts",
      "Income & Expense Tracking",
      "Advanced Budgeting",
      "Bill Pay & Reminders",
      "Subscription Management",
      "Premium Reports & Downloads",
      "Detailed Spending Insights",
    ],
  },
  {
    id: "family-business",
    name: "Family & Business",
    tagline: "For teams, families, and growing businesses.",
    monthly: 19.99,
    yearly: 15.99,
    popular: false,
    cta: "Get Started",
    listLabel: "Everything in Pro, plus",
    features: [
      "Up to 5 Users",
      "Invoicing & Business Tools",
      "EMI & Loan Monitoring",
      "Advanced Reporting",
      "Priority Feature Updates",
      "Tax & Receipt Organizer",
      "Priority Support",
    ],
  },
];

const money = (value: number) =>
  value === 0 ? "Free" : `$${value.toFixed(2)}`;

/**
 * Shared pricing cards section used on both the homepage and `/pricing` page.
 * Includes the heading, billing toggle, and 3-tier plan cards.
 */
export default function PricingCards() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="flex flex-col items-center">
      {/* Heading */}
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

      {/* Billing Toggle */}
      <div className="mb-10 flex justify-center sm:mb-14">
        <div className="inline-flex items-center p-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
          <button
            onClick={() => setYearly(false)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              !yearly
                ? "bg-brand-green text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              yearly
                ? "bg-brand-green text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Yearly{" "}
            <span className={yearly ? "text-green-100" : "text-brand-green"}>
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-stretch gap-8 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly;
          const isPaid = plan.monthly > 0;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 sm:p-8 ${
                plan.popular
                  ? "border-2 border-brand-green shadow-xl md:-translate-y-4 hover:md:-translate-y-5"
                  : "border border-gray-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-green px-4 py-1.5 text-[10px] font-extrabold tracking-[0.14em] whitespace-nowrap text-white uppercase shadow-md">
                  Most Popular
                </span>
              )}

              <h3 className="text-xl font-bold tracking-tight text-blue-950 sm:text-[1.375rem]">
                {plan.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {plan.tagline}
              </p>

              <div className="mt-6 flex items-baseline gap-2 sm:mt-7">
                <span className="text-[2.75rem] leading-none font-extrabold tracking-tight text-blue-950 sm:text-5xl">
                  {money(price)}
                </span>
                {isPaid && (
                  <span className="text-sm font-medium text-slate-500">
                    / month
                  </span>
                )}
              </div>

              {/* Billing detail — reserved height so cards never shift */}
              <p className="mt-2 h-4 text-[11px] text-slate-400">
                {isPaid && yearly && (
                  <>
                    <span className="line-through">
                      ${plan.monthly.toFixed(2)}
                    </span>{" "}
                    &middot; billed annually at $
                    {(plan.yearly * 12).toFixed(2)}
                  </>
                )}
                {isPaid && !yearly && "Billed monthly, cancel anytime"}
              </p>

              <Link
                href="/login"
                className={`ml-press mt-7 flex w-full items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-bold transition-all duration-300 sm:mt-8 ${
                  plan.popular
                    ? "ml-shine bg-brand-green text-white shadow-md shadow-brand-green/20 hover:bg-brand-green-dark"
                    : "bg-white text-brand-green ring-2 ring-brand-green hover:bg-brand-green hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>

              <p className="mt-8 text-[11px] font-bold tracking-[0.12em] text-blue-950 uppercase">
                {plan.listLabel}
              </p>

              <ul className="mt-4 flex flex-1 flex-col gap-3.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="group flex items-center justify-between gap-3"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                          plan.popular ? "bg-brand-green/10" : "bg-blue-50"
                        }`}
                      >
                        <Check
                          className={`h-2.5 w-2.5 ${
                            plan.popular ? "text-brand-green" : "text-blue-600"
                          }`}
                          strokeWidth={4}
                        />
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        {feature}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold tracking-wide text-blue-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Active
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

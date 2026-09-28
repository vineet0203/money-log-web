import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  ArrowRight,
  Play,
  PlayCircle,
  ArrowLeftRight,
  CalendarCheck,
  CreditCard,
  Landmark,
  User,
  Check,
  PieChart,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Personal Finance | moneylog.com",
  description:
    "Track transactions, monitor your bank balance, manage expenses and stay on top of your goals with moneylog.com.",
};

const FEATURES = [
  {
    icon: Building2,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-100",
    title: "Bank Balance Tracking",
    description: "See your real-time balance across all linked bank accounts.",
    points: ["Multiple bank accounts", "Live balance updates", "Transaction history"],
  },
  {
    icon: ArrowLeftRight,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    title: "Income & Expense Tracking",
    description: "Understand where your money comes from and where it goes.",
    points: ["Categorize income & expenses", "Track spending patterns", "Set spending limits"],
  },
  {
    icon: CalendarCheck,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-100",
    title: "Subscription Plans",
    description: "Never miss a recurring payment again.",
    points: ["View active subscriptions", "Track renewal dates", "Cancel unused plans"],
  },
  {
    icon: CreditCard,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100",
    title: "Liabilities",
    description: "Keep track of your credit cards and other financial obligations.",
    points: ["Credit card balances", "EMI details", "Due date reminders"],
  },
  {
    icon: Landmark,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-100",
    title: "Loan Details",
    description: "Stay informed about your loans and repayment schedule.",
    points: ["Loan amount & tenure", "EMI breakdown", "Outstanding balance"],
  },
  {
    icon: User,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-100",
    title: "Account-Specific View",
    description: "Choose a specific account to view detailed transactions and insights.",
    points: ["Filter by account", "View account-wise summary", "Download statements"],
  },
];

/** Floating labels around the phone — desktop only, they echo the feature list. */
const PILLS_LEFT = [
  { icon: Building2, label: "Bank Balance", tint: "bg-emerald-600", top: "10%", delay: "0s" },
  { icon: ArrowLeftRight, label: "Income", tint: "bg-blue-600", top: "34%", delay: "0.6s" },
  { icon: PieChart, label: "Expenses", tint: "bg-rose-500", top: "58%", delay: "1.2s" },
];

const PILLS_RIGHT = [
  { icon: CalendarCheck, label: "Subscriptions", tint: "bg-violet-600", top: "8%", delay: "0.3s" },
  { icon: CreditCard, label: "Liabilities", tint: "bg-orange-500", top: "32%", delay: "0.9s" },
  { icon: Landmark, label: "Loans", tint: "bg-teal-600", top: "56%", delay: "1.5s" },
];

/** Faint dashed leader line linking a floating label to the phone. */
function Connector({ side }: { side: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 28"
      fill="none"
      className={`pointer-events-none absolute top-1/2 h-7 w-10 -translate-y-1/2 text-slate-300 ${
        side === "left" ? "left-full ml-1" : "right-full mr-1 -scale-x-100"
      }`}
    >
      <path
        d="M1 14 C 12 14, 18 8, 31 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        strokeLinecap="round"
      />
      <circle cx="35" cy="8" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function PersonalFinancePage() {
  return (
    <div className="w-full bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate w-full overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pb-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-gradient-to-br from-cyan-100/50 via-white to-pink-100/50"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden select-none [mask-image:linear-gradient(to_bottom,black_70%,transparent)] xl:block"
        >
          <Image
            src="/hero_bg.png"
            alt=""
            width={1672}
            height={941}
            sizes="100vw"
            quality={70}
            className="h-auto w-full object-cover object-top"
          />
        </div>

        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-8">
            {/* Copy */}
            <div className="ml-rise flex w-full flex-col items-start lg:w-[46%] lg:shrink-0">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                <Building2 className="h-4 w-4 text-brand-green" strokeWidth={2.5} />
                <span className="text-xs font-bold text-brand-green sm:text-sm">Personal Finance</span>
              </span>

              <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-balance text-[#0f172a] sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
                Take Control of Your <span className="lg:block">Financial Life</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg lg:mt-6">
                Track your transactions, monitor your bank balance, manage expenses, and stay on top
                of your goals — all in one place. moneylog makes it easy to understand where your
                money goes and how to make it work better for you.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-5 lg:mt-10">
                <Link
                  href="/login"
                  className="ml-shine ml-press group inline-flex w-full items-center justify-center rounded-full bg-brand-green px-7 py-3.5 text-base font-bold text-white shadow-md shadow-brand-green/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-[0_16px_30px_-16px_rgba(26,143,76,0.95)] sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <button
                  type="button"
                  className="ml-press group inline-flex w-full items-center justify-center rounded-full border border-[#bfdbfe] bg-white px-6 py-3.5 text-base font-bold text-[#1e3a8a] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_16px_30px_-18px_rgba(30,58,138,0.55)] sm:w-auto"
                >
                  <PlayCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  See How It Works
                </button>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="ml-rise relative flex w-full justify-center lg:w-[54%]" style={{ animationDelay: "160ms" }}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-emerald-100/70 to-blue-100/70 blur-3xl sm:h-[420px] sm:w-[420px]"
              />

              {/* Floating labels — desktop only */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden xl:block">
                {PILLS_LEFT.map(({ icon: Icon, label, tint, top, delay }) => (
                  <span
                    key={label}
                    style={{ top, animationDelay: delay }}
                    className="ml-float absolute left-0 flex items-center gap-2 rounded-full border border-gray-50 bg-white px-3 py-2 shadow-lg 2xl:left-4"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tint}`}>
                      <Icon className="h-4 w-4 text-white" strokeWidth={2.25} />
                    </span>
                    <span className="text-[13px] font-bold whitespace-nowrap text-slate-800">{label}</span>
                    <Connector side="left" />
                  </span>
                ))}
                {PILLS_RIGHT.map(({ icon: Icon, label, tint, top, delay }) => (
                  <span
                    key={label}
                    style={{ top, animationDelay: delay }}
                    className="ml-float absolute right-0 flex items-center gap-2 rounded-full border border-gray-50 bg-white px-3 py-2 shadow-lg 2xl:right-4"
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tint}`}>
                      <Icon className="h-4 w-4 text-white" strokeWidth={2.25} />
                    </span>
                    <span className="text-[13px] font-bold whitespace-nowrap text-slate-800">{label}</span>
                    <Connector side="right" />
                  </span>
                ))}
              </div>

              <Image
                src="/mobile_app_mockup.png"
                alt="moneylog mobile app showing total balance, income, expenses and recent transactions"
                width={853}
                height={1844}
                sizes="(min-width: 1024px) 300px, (min-width: 640px) 290px, 240px"
                priority
                className="relative h-auto w-[240px] max-w-full drop-shadow-2xl sm:w-[290px] lg:w-[300px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Key features ─────────────────────────────────────────────────── */}
      <section className="w-full border-t border-gray-50 bg-white py-12 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-8 max-w-2xl sm:mb-10 lg:mb-12">
              <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand-green uppercase sm:text-sm">
                Key Features
              </p>
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
                Complete Financial Visibility
              </h2>
              <p className="text-base font-medium text-slate-600 sm:text-lg">
                Manage your money with confidence. Here&apos;s what you can do:
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={(index % 3) * 90} variant="up" className="h-full">
                <div className="group flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-gray-200/80 shadow-[0_10px_30px_-24px_rgba(16,24,40,0.4)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:ring-brand-green/30 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.4)] sm:p-7">
                  <div className="mb-6 flex items-start gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${feature.iconBg} ${feature.iconColor} transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-14 sm:w-14`}
                    >
                      <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
                    </span>
                    <div>
                      <h3 className="mb-1.5 text-base leading-tight font-bold text-blue-950 sm:text-lg">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed font-medium text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-5 h-px w-full bg-gradient-to-r from-gray-200 to-transparent" />

                  <ul className="mt-auto space-y-3">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-emerald-50">
                          <Check className="h-2.5 w-2.5 text-brand-green" strokeWidth={4} />
                        </span>
                        <span className="text-sm font-medium text-slate-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section className="w-full bg-white pb-14 sm:pb-16 lg:pb-20">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <Reveal variant="scale">
            <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-white p-6 sm:p-10 lg:p-12">
              <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:gap-10 lg:text-left">
                <Image
                  src="/per_fin_cta.png"
                  alt=""
                  width={1149}
                  height={840}
                  sizes="(min-width: 1024px) 220px, 180px"
                  className="w-[160px] shrink-0 mix-blend-multiply sm:w-[190px] lg:w-[220px]"
                />

                <div className="flex-1">
                  <p className="mb-2.5 text-[11px] font-bold tracking-[0.18em] text-brand-green uppercase sm:text-xs">
                    Smarter Money Management
                  </p>
                  <h2 className="mb-3 text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl lg:text-[1.75rem]">
                    Your Finances, All in One Place
                  </h2>
                  <p className="mx-auto max-w-xl text-sm leading-relaxed font-medium text-pretty text-slate-600 sm:text-base lg:mx-0">
                    Connect your accounts, track your spending, and build a healthier financial
                    future with moneylog.
                  </p>
                </div>

                <div className="flex w-full flex-col items-center gap-3 lg:w-auto lg:shrink-0 lg:items-end">
                  <Link
                    href="/login"
                    className="ml-shine ml-press group inline-flex w-full items-center justify-center rounded-full bg-brand-green px-7 py-3.5 text-sm font-bold whitespace-nowrap text-white shadow-lg shadow-brand-green/25 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-green-dark sm:w-auto sm:px-8 sm:py-4 sm:text-base"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <p className="text-xs font-medium text-slate-500">
                    It&apos;s free, secure, and easy to set up.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

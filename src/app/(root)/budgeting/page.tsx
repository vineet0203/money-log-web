import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  CalendarDays,
  RefreshCw,
  Wallet,
  Target,
  Settings,
  Car,
  CalendarClock,
  BarChart3,
  Bell,
  ArrowRight,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Budgeting | moneylog.com",
  description:
    "Track upcoming transactions, manage subscriptions, monitor EMIs and plan your payments — build a budget that works for you.",
};

const HIGHLIGHTS = [
  {
    icon: CalendarDays,
    tile: "bg-brand-green",
    title: "Upcoming Transactions",
    description: "Never miss a payment or due date.",
  },
  {
    icon: RefreshCw,
    tile: "bg-violet-600",
    title: "Cancel Subscriptions",
    description: "Manage your recurring plans easily.",
  },
  {
    icon: Wallet,
    tile: "bg-blue-600",
    title: "Track EMIs",
    description: "Monitor your loan installments.",
  },
  {
    icon: Target,
    tile: "bg-orange-500",
    title: "Plan Your Payments",
    description: "Set monthly budgets and stay on track.",
  },
];

const FEATURES = [
  {
    icon: CalendarDays,
    badge: "bg-emerald-100 text-emerald-600",
    card: "bg-emerald-50/60",
    title: "Track Upcoming Transactions",
    description: "View all upcoming bills, EMIs and scheduled payments with due dates.",
  },
  {
    icon: Settings,
    badge: "bg-pink-100 text-pink-600",
    card: "bg-pink-50/60",
    title: "Manage Subscriptions",
    description: "See your active subscriptions and cancel any plan for the next month.",
  },
  {
    icon: Car,
    badge: "bg-blue-100 text-blue-600",
    card: "bg-blue-50/60",
    title: "Monitor EMIs",
    description: "Keep track of your loan EMIs, due dates and remaining balance.",
  },
  {
    icon: CalendarClock,
    badge: "bg-violet-100 text-violet-600",
    card: "bg-violet-50/60",
    title: "Plan Your Payments",
    description: "Set a monthly budget and schedule payments for important expenses.",
  },
  {
    icon: BarChart3,
    badge: "bg-orange-100 text-orange-500",
    card: "bg-orange-50/60",
    title: "Get Budget Insights",
    description: "Track your spending and stay within your budget limits.",
  },
  {
    icon: Bell,
    badge: "bg-teal-100 text-teal-600",
    card: "bg-teal-50/60",
    title: "Receive Reminders & Alerts",
    description: "Get notified about upcoming payments, subscription renewals and low balance.",
  },
];

export default function BudgetPage() {
  return (
    <div className="w-full bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex w-full flex-col justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pb-24 xl:min-h-[calc(100svh-6rem)] xl:pt-36 xl:pb-28">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[#eefbf6]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.8),transparent)]"
        />

        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-center xl:gap-8">
            {/* Copy */}
            <div className="ml-rise flex w-full flex-col items-start xl:w-[46%] xl:shrink-0">
              <span className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-emerald-100 sm:mb-7">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green">
                  <FileText className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </span>
                <span className="text-xs font-bold text-brand-green sm:text-sm">Budgeting</span>
              </span>

              <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-balance text-[#0f172a] sm:text-5xl lg:text-[3rem] xl:text-[2.75rem] 2xl:text-[3rem]">
                Plan Today for a <span className="xl:block">Better Tomorrow</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg lg:mt-6 lg:text-xl">
                Stay in control of your money. Track upcoming transactions, manage subscriptions,
                monitor EMIs, and plan your payments — all in one place. Build a budget that works
                for you.
              </p>

              <ul className="mt-8 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-10 xl:grid-cols-4 xl:gap-4">
                {HIGHLIGHTS.map(({ icon: Icon, tile, title, description }) => (
                  <li key={title} className="group flex items-start gap-3 xl:flex-col xl:gap-2">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tile} shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6`}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </span>
                    <div className="flex flex-col">
                      <h2 className="mb-0.5 text-sm font-bold text-[#0f172a]">{title}</h2>
                      <p className="text-xs leading-relaxed font-medium text-slate-500">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard mockup */}
            <div className="ml-rise relative w-full xl:w-[54%]" style={{ animationDelay: "160ms" }}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-10 bottom-10 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-100/70 to-blue-100/60 blur-2xl"
              />
              <Image
                src="/budgeting_dashboard_mockup.png"
                alt="moneylog budgeting dashboard showing monthly budget, upcoming transactions, subscriptions and EMI overview"
                width={1493}
                height={895}
                sizes="(min-width: 1280px) 760px, 100vw"
                priority
                className="h-auto w-full drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Key features ─────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 sm:px-6 lg:gap-10 lg:px-8 xl:flex-row xl:gap-12">
          {/* Intro */}
          <Reveal className="xl:w-[28%] xl:shrink-0">
            <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand-green uppercase sm:text-sm">
              Key Features
            </p>
            <h2 className="mb-4 text-2xl leading-tight font-extrabold tracking-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
              Everything You Need to Plan Your Budget
            </h2>
            <p className="text-base leading-relaxed font-medium text-slate-600 sm:text-lg">
              Take charge of your finances with smart tools that help you track, manage, and plan —
              so you can achieve your financial goals.
            </p>
          </Reveal>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:w-[72%]">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={(index % 3) * 90} variant="up" className="h-full">
                <div
                  className={`group flex h-full flex-col rounded-3xl ${feature.card} p-6 ring-1 ring-white/60 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.45)] sm:p-7`}
                >
                  <span
                    className={`mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${feature.badge} transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:mb-6 sm:h-14 sm:w-14`}
                  >
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
                  </span>

                  <h3 className="mb-2.5 text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-medium text-slate-600 sm:text-[15px]">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing strip ────────────────────────────────────────────────── */}
      <section className="w-full bg-white pb-14 sm:pb-16 lg:pb-20">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <Reveal variant="scale">
            <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-emerald-100 bg-[#eefbf6] px-6 py-6 text-center md:flex-row md:gap-6 md:rounded-full md:px-8 md:py-5 md:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
                <span className="flex items-center gap-3">
                  <Target className="h-6 w-6 shrink-0 text-brand-green" strokeWidth={2.5} />
                  <span className="text-base font-extrabold text-[#0f172a] sm:text-[17px]">
                    Plan Smarter. Spend Better.
                  </span>
                </span>

                <span className="hidden h-6 w-px bg-emerald-200 sm:block" />

                <span className="text-sm font-medium text-slate-600 sm:text-[15px]">
                  Take control of your financial future with moneylog.
                </span>
              </div>

              <Link
                href="/login"
                className="ml-shine ml-press group inline-flex w-full shrink-0 items-center justify-center rounded-full bg-brand-green px-8 py-3.5 text-sm font-bold whitespace-nowrap text-white shadow-md shadow-brand-green/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-green-dark md:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

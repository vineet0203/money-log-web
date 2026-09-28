import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  FolderOpen,
  Filter,
  Lightbulb,
  CalendarDays,
  RefreshCw,
  Landmark,
  ArrowLeftRight,
  PieChart,
  LayoutGrid,
  BarChart3,
  ListChecks,
  MousePointerClick,
  SlidersHorizontal,
  Eye,
  ArrowRight,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Reports | moneylog.com",
  description:
    "View detailed reports for your bills, transactions, subscriptions and loans — filter by date range, account or category and see exactly where your money goes.",
};

const HIGHLIGHTS = [
  {
    icon: FolderOpen,
    tile: "bg-brand-green",
    title: "Multiple Report Types",
    description: "Bills, subscriptions, loans, transactions & more.",
  },
  {
    icon: Filter,
    tile: "bg-blue-600",
    title: "Flexible Filters",
    description: "Select date range, account and category.",
  },
  {
    icon: Lightbulb,
    tile: "bg-violet-600",
    title: "Clear Insights",
    description: "See exactly where your money goes.",
  },
];

const REPORTS = [
  {
    icon: CalendarDays,
    badge: "bg-blue-100 text-blue-600",
    card: "bg-blue-50/60",
    title: "Upcoming Bills Report",
    description:
      "View all upcoming bills, due dates and amounts for the selected account.",
    points: ["Track upcoming bills", "Spot due dates early"],
  },
  {
    icon: RefreshCw,
    badge: "bg-violet-100 text-violet-600",
    card: "bg-violet-50/60",
    title: "Subscription Payments Report",
    description: "Track your recurring subscriptions and the dates they renew.",
    points: ["See every active plan", "Catch renewals early"],
  },
  {
    icon: Landmark,
    badge: "bg-orange-100 text-orange-500",
    card: "bg-orange-50/60",
    title: "Loan EMI Report",
    description:
      "Monitor EMI payments, outstanding balance and upcoming due dates.",
    points: ["Track EMI status", "View the full schedule"],
  },
  {
    icon: ArrowLeftRight,
    badge: "bg-emerald-100 text-emerald-600",
    card: "bg-emerald-50/60",
    title: "Transaction Report",
    description:
      "A detailed list of all your transactions, grouped by category.",
    points: ["Filter by category", "Search any transaction"],
  },
  {
    icon: PieChart,
    badge: "bg-rose-100 text-rose-500",
    card: "bg-rose-50/60",
    title: "Spending Analysis Report",
    description:
      "Understand your spending patterns and your biggest categories.",
    points: ["Category-wise spend", "Month-on-month trend"],
  },
  {
    icon: LayoutGrid,
    badge: "bg-teal-100 text-teal-600",
    card: "bg-teal-50/60",
    title: "Custom Report",
    description:
      "Build your own view with the dates, accounts and categories you care about.",
    points: ["Choose any date range", "Pick accounts & categories"],
  },
];

const RANGES = ["Last 7 days", "Last 30 days", "Last 6 months", "Custom range"];

const TOTALS = [
  {
    label: "Total Income",
    value: "$24,350",
    delta: "+12.4%",
    tile: "bg-emerald-50",
    accent: "text-emerald-600",
  },
  {
    label: "Total Expenses",
    value: "$18,420",
    delta: "+6.2%",
    tile: "bg-rose-50",
    accent: "text-rose-500",
  },
  {
    label: "Net Savings",
    value: "$5,930",
    delta: "+18.7%",
    tile: "bg-blue-50",
    accent: "text-blue-600",
  },
];

const TRENDS = [
  { month: "Jan", income: 58, expense: 36 },
  { month: "Feb", income: 64, expense: 45 },
  { month: "Mar", income: 72, expense: 41 },
  { month: "Apr", income: 68, expense: 52 },
  { month: "May", income: 66, expense: 43 },
  { month: "Jun", income: 80, expense: 54 },
];

const CATEGORIES = [
  { label: "Bills & Utilities", percent: 35, bar: "bg-blue-500" },
  { label: "Shopping", percent: 20, bar: "bg-violet-500" },
  { label: "Food & Dining", percent: 15, bar: "bg-orange-500" },
  { label: "Transportation", percent: 10, bar: "bg-amber-400" },
];

const INSIGHTS = [
  "Your spending is 12% lower than last month.",
  "Bills & Utilities is your largest expense category.",
  "You have 2 upcoming bills worth $570.00.",
];

const STEPS = [
  {
    num: "1",
    icon: MousePointerClick,
    tile: "bg-blue-500",
    title: "Select Report Type",
    description:
      "Pick from bills, transactions, subscriptions, loans and more.",
  },
  {
    num: "2",
    icon: SlidersHorizontal,
    tile: "bg-violet-500",
    title: "Apply Filters",
    description:
      "Set the date range, account and category you want to look at.",
  },
  {
    num: "3",
    icon: Eye,
    tile: "bg-brand-green",
    title: "Read Your Insights",
    description:
      "See totals, trends and breakdowns together in one clear view.",
  },
];

export default function ReportsPage() {
  return (
    <div className="w-full bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex w-full flex-col justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pb-24 xl:min-h-[calc(100svh-6rem)] xl:pt-36 xl:pb-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[#eefaf4]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.85),transparent)]"
        />

        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-center xl:gap-8">
            {/* Copy */}
            <div className="ml-rise flex w-full flex-col items-start xl:w-[46%] xl:shrink-0">
              <span className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-emerald-100 sm:mb-7">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green">
                  <FileText
                    className="h-3.5 w-3.5 text-white"
                    strokeWidth={2.5}
                  />
                </span>
                <span className="text-xs font-bold text-brand-green sm:text-sm">
                  Reports
                </span>
              </span>

              <h1 className="text-[2rem] leading-[1.1] font-extrabold tracking-tight text-balance text-[#0f172a] sm:text-5xl lg:text-[3rem] xl:text-[2.75rem] 2xl:text-[3rem]">
                Access Your Financial{" "}
                <span className="xl:block">Reports Anytime</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg lg:mt-6 lg:text-xl">
                View detailed reports for your bills, transactions,
                subscriptions and loans. Filter by date range, account or
                category and get the insights you need to make better financial
                decisions.
              </p>

              <ul className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5 lg:mt-10">
                {HIGHLIGHTS.map(({ icon: Icon, tile, title, description }) => (
                  <li key={title} className="group flex flex-col gap-2">
                    <span
                      className={`mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tile} shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6`}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </span>
                    <h2 className="text-sm font-bold text-[#0f172a]">
                      {title}
                    </h2>
                    <p className="text-xs leading-relaxed font-medium text-slate-500">
                      {description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard mockup */}

            <div
              className="ml-rise relative w-full xl:w-[54%]"
              style={{ animationDelay: "160ms" }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-6 top-10 bottom-10 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-100/70 to-blue-100/60 blur-2xl"
              />
              <Image
                src="/reports_dashboard_mockup.png"
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

      {/* ── Available reports ────────────────────────────────────────────── */}
      <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 sm:px-6 lg:gap-10 lg:px-8 xl:flex-row xl:gap-12">
          {/* Intro */}
          <Reveal className="xl:w-[28%] xl:shrink-0">
            <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand-green uppercase sm:text-sm">
              Available Reports
            </p>
            <h2 className="mb-4 text-2xl leading-tight font-extrabold tracking-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
              Choose the Report You Need
            </h2>
            <p className="text-base leading-relaxed font-medium text-slate-600 sm:text-lg">
              Every report is built from your own activity, so the numbers you
              see are always up to date.
            </p>
          </Reveal>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:w-[72%]">
            {REPORTS.map((report, index) => (
              <Reveal
                key={report.title}
                delay={(index % 3) * 90}
                variant="up"
                className="h-full"
              >
                <div
                  className={`group flex h-full flex-col rounded-3xl ${report.card} p-6 ring-1 ring-white/60 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.45)] sm:p-7`}
                >
                  <span
                    className={`mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${report.badge} transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:mb-6 sm:h-14 sm:w-14`}
                  >
                    <report.icon
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      strokeWidth={2}
                    />
                  </span>

                  <h3 className="mb-2.5 text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl">
                    {report.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-medium text-slate-600 sm:text-[15px]">
                    {report.description}
                  </p>

                  <ul className="mt-5 flex flex-col gap-2 border-t border-white pt-4 sm:mt-auto sm:pt-5">
                    {report.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 sm:text-[13px]">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inside every report ──────────────────────────────────────────── */}
      <section className="w-full bg-[#f8fafc] py-14 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col items-center text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand-green uppercase sm:text-sm">
              Inside Every Report
            </p>
            <h2 className="mb-4 max-w-2xl text-2xl leading-tight font-extrabold tracking-tight text-balance text-[#0f172a] sm:text-3xl lg:text-4xl">
              A Complete Picture of Your Money
            </h2>
            <p className="max-w-2xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg">
              Pick a period and moneylog puts your totals, trends and breakdowns
              side by side — no spreadsheets, no manual maths.
            </p>
          </Reveal>

          {/* Date range strip — mirrors the in-app filter row */}
          <Reveal delay={90}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:mt-10 sm:gap-3">
              {RANGES.map((range, index) => (
                <span
                  key={range}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold select-none sm:text-sm ${
                    index === 2
                      ? "bg-brand-green/10 text-brand-green ring-1 ring-brand-green/30"
                      : "bg-white text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  {index === 3 && (
                    <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.5} />
                  )}
                  {range}
                </span>
              ))}
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 lg:grid-cols-3 lg:gap-6">
            {/* Summary totals — full width */}
            <Reveal variant="up" className="lg:col-span-3">
              <article className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(16,24,40,0.5)] sm:p-7 lg:flex-row lg:items-center lg:gap-10">
                <div className="mb-5 flex items-start gap-4 lg:mb-0 lg:w-[36%] lg:shrink-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <ListChecks className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3 className="mb-1 text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl">
                      Summary at a Glance
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-slate-600">
                      Total income, total expenses and net savings — with the
                      change against the previous period.
                    </p>
                  </div>
                </div>

                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex-1 lg:gap-4">
                  {TOTALS.map((stat) => (
                    <div
                      key={stat.label}
                      className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 ${stat.tile} sm:flex-col sm:items-start sm:gap-0`}
                    >
                      <dt className="text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                        {stat.label}
                      </dt>
                      <dd className="flex items-baseline gap-2 sm:mt-1 sm:flex-col sm:items-start sm:gap-0">
                        <span className="text-lg font-extrabold text-[#0f172a]">
                          {stat.value}
                        </span>
                        <span
                          className={`text-[11px] font-bold ${stat.accent}`}
                        >
                          {stat.delta}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            </Reveal>

            {/* Income vs expenses */}
            <Reveal variant="up" delay={60} className="h-full">
              <article className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(16,24,40,0.5)] sm:p-7">
                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <BarChart3 className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3 className="mb-1 text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl">
                      Income vs Expenses
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-slate-600">
                      Compare what came in against what went out, month by
                      month.
                    </p>
                  </div>
                </div>

                <div className="mt-auto" aria-hidden="true">
                  <div className="flex items-end justify-between gap-1.5 sm:gap-3">
                    {TRENDS.map((trend) => (
                      <div
                        key={trend.month}
                        className="flex w-full flex-col items-center gap-2"
                      >
                        <div className="flex h-24 w-full items-end justify-center gap-1 sm:h-[6.5rem] sm:gap-1.5">
                          <span
                            className="w-2.5 rounded-t-md bg-emerald-400 sm:w-3"
                            style={{ height: `${trend.income}%` }}
                          />
                          <span
                            className="w-2.5 rounded-t-md bg-rose-300 sm:w-3"
                            style={{ height: `${trend.expense}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {trend.month}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-5 border-t border-slate-100 pt-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />{" "}
                      Income
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-rose-300" />{" "}
                      Expenses
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Category breakdown */}
            <Reveal variant="up" delay={120} className="h-full">
              <article className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(16,24,40,0.5)] sm:p-7">
                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                    <PieChart className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3 className="mb-1 text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl">
                      Category Breakdown
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-slate-600">
                      See how much each category takes, ranked from the biggest
                      spend down.
                    </p>
                  </div>
                </div>

                <ul
                  className="mt-auto flex flex-col gap-3.5"
                  aria-hidden="true"
                >
                  {CATEGORIES.map((category) => (
                    <li key={category.label} className="flex flex-col gap-1.5">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-600 sm:text-[13px]">
                          {category.label}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {category.percent}%
                        </span>
                      </span>
                      <span className="block h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <span
                          className={`block h-full rounded-full ${category.bar}`}
                          style={{ width: `${(category.percent / 35) * 100}%` }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>

            {/* Key insights */}
            <Reveal variant="up" delay={180} className="h-full">
              <article className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(16,24,40,0.5)] sm:p-7">
                <div className="mb-5 flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-500">
                    <Lightbulb className="h-5 w-5" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3 className="mb-1 text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl">
                      Key Insights
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-slate-600">
                      Plain-language takeaways pulled from the numbers, so you
                      know what to do next.
                    </p>
                  </div>
                </div>

                <ul className="mt-auto flex flex-col gap-3 rounded-2xl bg-amber-50/70 p-4 sm:p-5">
                  {INSIGHTS.map((insight) => (
                    <li key={insight} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      <span className="text-xs leading-relaxed font-semibold text-slate-600 sm:text-[13px]">
                        {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <Reveal className="mb-8 flex flex-col items-center text-center sm:mb-10 lg:mb-12">
            <h2 className="mb-3 text-2xl leading-tight font-extrabold tracking-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
              How It Works
            </h2>
            <p className="max-w-xl text-base leading-relaxed font-medium text-slate-600 sm:text-lg">
              Get to the right report in just a few clicks.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-6">
            {STEPS.map((step, index) => (
              <Reveal
                key={step.num}
                delay={index * 90}
                variant="up"
                className="h-full"
              >
                <div className="group relative flex h-full flex-col rounded-3xl border border-slate-100 bg-[#f8fafc] p-6 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.45)] sm:p-7">
                  <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${step.tile} shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-14 sm:w-14`}
                    >
                      <step.icon
                        className="h-6 w-6 text-white sm:h-7 sm:w-7"
                        strokeWidth={2}
                      />
                    </span>
                    <span className="text-3xl leading-none font-extrabold text-slate-200 sm:text-4xl">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="mb-2.5 text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-medium text-slate-600 sm:text-base">
                    {step.description}
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
            <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-emerald-100 bg-[#eefaf4] px-6 py-6 text-center md:flex-row md:gap-6 md:rounded-full md:px-8 md:py-5 md:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
                <span className="flex items-center gap-3">
                  <BarChart3
                    className="h-6 w-6 shrink-0 text-brand-green"
                    strokeWidth={2.5}
                  />
                  <span className="text-base font-extrabold text-[#0f172a] sm:text-[17px]">
                    Know Exactly Where Your Money Goes.
                  </span>
                </span>

                <span className="hidden h-6 w-px bg-emerald-200 sm:block" />

                <span className="text-sm font-medium text-slate-600 sm:text-[15px]">
                  Turn your everyday activity into reports that actually help.
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

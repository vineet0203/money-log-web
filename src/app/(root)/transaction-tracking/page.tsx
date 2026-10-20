import Image from "next/image";
import {
  Building2,
  History,
  FolderOpen,
  Search,
  ListFilter,
  Tags,
  FileText,
  BarChart3,
  Bell,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Transactions | moneylog.com",
  description:
    "View and manage all your transactions in one place — track spending, filter by category and stay on top of your financial activity.",
};

const HIGHLIGHTS = [
  {
    icon: History,
    tile: "bg-brand-green",
    title: "Real-time updates",
    description: "Get the latest transaction details instantly.",
  },
  {
    icon: FolderOpen,
    tile: "bg-blue-600",
    title: "Smart categorization",
    description: "Transactions are auto categorized for easy tracking.",
  },
  {
    icon: Search,
    tile: "bg-violet-600",
    title: "Filter & search",
    description: "Find what you need in seconds.",
  },
];

const FEATURES = [
  {
    icon: Building2,
    badge: "bg-emerald-100 text-emerald-600",
    card: "bg-emerald-50/60",
    title: "Select Bank Account",
    description: "Choose the account you want to view transactions for.",
  },
  {
    icon: ListFilter,
    badge: "bg-blue-100 text-blue-600",
    card: "bg-blue-50/60",
    title: "Filter & Search",
    description: "Use filters and search to quickly find specific transactions.",
  },
  {
    icon: Tags,
    badge: "bg-violet-100 text-violet-600",
    card: "bg-violet-50/60",
    title: "Auto Categorization",
    description:
      "Transactions are automatically categorized (Payments, Subscriptions, Loans, etc.).",
  },
  {
    icon: FileText,
    badge: "bg-orange-100 text-orange-500",
    card: "bg-orange-50/60",
    title: "View Transaction Details",
    description: "See date, amount, description and running balance for each transaction.",
  },
  {
    icon: BarChart3,
    badge: "bg-rose-100 text-rose-500",
    card: "bg-rose-50/60",
    title: "Track Your Spending",
    description: "Understand your spending patterns and make better financial decisions.",
  },
  {
    icon: Bell,
    badge: "bg-teal-100 text-teal-600",
    card: "bg-teal-50/60",
    title: "Get Notifications",
    description: "Receive alerts for large transactions, subscription renewals and more.",
  },
];

export default function TransactionsPage() {
  return (
    <div className="w-full bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex w-full flex-col justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pb-24 xl:min-h-[calc(100svh-6rem)] xl:pt-36 xl:pb-28">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[#eefaf5]" />
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
                  <Building2 className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </span>
                <span className="text-xs font-bold text-brand-green sm:text-sm">Transactions</span>
              </span>

              <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-balance text-[#0f172a] sm:text-5xl lg:text-[3rem] xl:text-[2.75rem] 2xl:text-[3rem]">
                Track Your <span className="xl:block">Transaction Details</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg lg:mt-6 lg:text-xl">
                View and manage all your transactions in one place. Track spending, filter by
                category, and stay on top of your financial activity for the selected bank account.
              </p>

              <ul className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-5 lg:mt-10">
                {HIGHLIGHTS.map(({ icon: Icon, tile, title, description }) => (
                  <li key={title} className="group flex flex-col gap-2">
                    <span
                      className={`mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tile} shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6`}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.25} />
                    </span>
                    <h2 className="text-sm font-bold text-[#0f172a]">{title}</h2>
                    <p className="text-xs leading-relaxed font-medium text-slate-500">
                      {description}
                    </p>
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
                src="/transactions_dashboard_mockup.png"
                alt="moneylog dashboard listing transactions with categories, amounts and running balance"
                width={1486}
                height={897}
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
              Everything You Need in One Place
            </h2>
            <p className="text-base leading-relaxed font-medium text-slate-600 sm:text-lg">
              Get a clear view of your financial activity with powerful tools and smart
              categorization.
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
    </div>
  );
}

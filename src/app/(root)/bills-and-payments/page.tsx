import Image from "next/image";
import {
  Receipt,
  CheckCircle2,
  CalendarDays,
  Bell,
  Wallet,
  ShieldCheck,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Bills & Payments | moneylog.com",
  description:
    "Stay on top of your bills with easy tracking, timely payments and helpful notifications — all in one place.",
};

const HIGHLIGHTS = [
  { icon: CheckCircle2, label: "View upcoming bills", tint: "bg-teal-500" },
  { icon: CalendarDays, label: "Track payment status", tint: "bg-blue-500" },
  { icon: Bell, label: "Get timely notifications", tint: "bg-indigo-500" },
];

const STEPS = [
  {
    num: "01",
    icon: CalendarDays,
    tile: "bg-blue-500",
    card: "bg-blue-50/70",
    badge: "bg-blue-100 text-blue-600",
    title: "View Upcoming Bills",
    description:
      "See all your upcoming bills with due dates and amounts for the selected account.",
  },
  {
    num: "02",
    icon: Wallet,
    tile: "bg-emerald-600",
    card: "bg-emerald-50/70",
    badge: "bg-emerald-100 text-emerald-700",
    title: "Track Payments",
    description: "Monitor payment status in real-time and keep your finances on track.",
  },
  {
    num: "03",
    icon: Bell,
    tile: "bg-violet-600",
    card: "bg-violet-50/70",
    badge: "bg-violet-100 text-violet-600",
    title: "Get Notifications",
    description:
      "Receive timely alerts for upcoming bills, payment confirmations and due date reminders.",
  },
  {
    num: "04",
    icon: ShieldCheck,
    tile: "bg-blue-500",
    card: "bg-blue-50/70",
    badge: "bg-blue-100 text-blue-600",
    title: "Stay in Control",
    description:
      "Manage all your bills and payments for the selected account — anytime, anywhere.",
  },
];

export default function BillsAndPaymentsPage() {
  return (
    <div className="w-full bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex w-full flex-col justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pb-24 xl:min-h-[calc(100svh-6rem)] xl:pt-36 xl:pb-28">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[#ecfaf6]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.85),transparent)]"
        />

        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-center xl:gap-8">
            {/* Copy */}
            <div className="ml-rise flex w-full flex-col items-start xl:w-[46%] xl:shrink-0">
              <span className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-blue-100 sm:mb-7">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                  <Receipt className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </span>
                <span className="text-xs font-bold text-blue-600 sm:text-sm">Billing &amp; Payments</span>
              </span>

              <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-balance text-[#0f172a] sm:text-5xl lg:text-[3rem] xl:text-[2.75rem] 2xl:text-[3rem]">
                Track Your Upcoming Bills <span className="xl:block">and Payments</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg lg:mt-6 lg:text-xl">
                Stay on top of your bills with easy tracking, timely payments, and helpful
                notifications — all in one place, for your selected account.
              </p>

              <ul className="mt-8 flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center sm:gap-x-6 sm:gap-y-3 lg:mt-10">
                {HIGHLIGHTS.map(({ icon: Icon, label, tint }) => (
                  <li key={label} className="group flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tint} transition-transform duration-500 ease-out group-hover:scale-110`}
                    >
                      <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </span>
                    <span className="text-sm font-bold whitespace-nowrap text-[#0f172a]">
                      {label}
                    </span>
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
                className="pointer-events-none absolute inset-x-6 top-10 bottom-10 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-100/60 to-blue-100/60 blur-2xl"
              />
              <Image
                src="/bills_dashboard_mockup.png"
                alt="moneylog dashboard showing upcoming bills, due dates, payment status and notifications"
                width={1492}
                height={868}
                sizes="(min-width: 1280px) 780px, 100vw"
                priority
                className="h-auto w-full drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <Reveal as="h2" className="mb-8 text-2xl font-extrabold tracking-tight text-[#0f172a] sm:mb-10 sm:text-3xl lg:mb-12 lg:text-4xl">
            How It Works
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
            {STEPS.map((step, index) => (
              <Reveal key={step.num} delay={index * 90} variant="up" className="h-full">
                <div
                  className={`group flex h-full flex-col rounded-3xl ${step.card} p-6 ring-1 ring-white/60 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.45)] sm:p-7`}
                >
                  <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${step.tile} shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-14 sm:w-14`}
                    >
                      <step.icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={2} />
                    </span>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-sm font-bold ${step.badge}`}
                    >
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

          <Reveal delay={200}>
            <div className="mt-10 flex justify-center sm:mt-12">
              <span className="inline-flex items-center gap-2.5 rounded-full bg-emerald-50 px-5 py-2.5 sm:px-6 sm:py-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-green sm:h-5 sm:w-5" strokeWidth={2.5} />
                <span className="text-xs font-bold text-brand-green sm:text-sm">
                  Secure &bull; Reliable &bull; Built for You
                </span>
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

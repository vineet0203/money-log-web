import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import HowItWorksJourney from "@/components/HowItWorksJourney";

export const metadata = {
  title: "How It Works | moneylog.com",
  description:
    "A guided journey from connected accounts to clearer money decisions — every step moneylog takes you through, in order.",
};

export default function HowItWorksPage() {
  return (
    <div className="w-full bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate w-full overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pb-24 xl:pt-36 xl:pb-28">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[#eff9f4]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.85),transparent)]"
        />

        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-center xl:gap-10">
            {/* Copy */}
            <div className="ml-rise flex w-full flex-col items-start xl:w-[46%] xl:shrink-0">
              <p className="mb-5 text-xs font-extrabold tracking-[0.2em] text-brand-green uppercase sm:mb-7 sm:text-sm">
                How It Works
              </p>

              <h1 className="text-[2rem] leading-[1.1] font-extrabold tracking-tight text-balance text-[#0f172a] sm:text-5xl lg:text-[3rem] xl:text-[2.75rem] 2xl:text-[3rem]">
                Take Control of Your Money, <span className="xl:block">Step by Step</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg lg:mt-6 lg:text-xl">
                moneylog guides you from connecting your accounts and capturing transactions to
                budgeting, bills, savings, reports and ongoing financial insights — all in one
                place.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4 lg:mt-10">
                <Link
                  href="/login"
                  className="ml-shine ml-press group inline-flex items-center justify-center rounded-full bg-brand-green px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-green/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-green-dark sm:text-base"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="ml-press inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#0f172a] shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:ring-brand-green/40 sm:text-base"
                >
                  See Pricing
                </Link>
              </div>
            </div>

            {/* Product shot */}
            <div className="ml-rise relative w-full xl:w-[54%]" style={{ animationDelay: "160ms" }}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-10 bottom-10 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-100/70 to-blue-100/60 blur-2xl"
              />
              <Image
                src="/hero_image.png"
                alt="moneylog dashboard shown on a laptop alongside the mobile app on a phone"
                width={1247}
                height={784}
                sizes="(min-width: 1280px) 740px, 100vw"
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── The guided journey ───────────────────────────────────────────── */}
      <HowItWorksJourney />
    </div>
  );
}

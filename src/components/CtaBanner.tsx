import { ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function CtaBanner() {
  return (
    <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        <Reveal variant="scale">
          <div className="group relative isolate w-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-blue-50/80 p-8 text-center ring-1 ring-emerald-100 shadow-[0_26px_60px_-34px_rgba(16,24,40,0.45)] transition-shadow duration-500 hover:shadow-[0_34px_70px_-34px_rgba(16,24,40,0.55)] sm:p-12 lg:p-16">
            {/* Fine dot texture */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            {/* Soft drifting blooms */}
            <div
              aria-hidden="true"
              className="ml-blob ml-blob-a -top-24 -left-16 -z-10 h-72 w-72 bg-emerald-300/30"
            />
            <div
              aria-hidden="true"
              className="ml-blob ml-blob-b -right-12 -bottom-28 -z-10 h-80 w-80 bg-blue-300/25"
            />

            <div className="relative flex flex-col items-center gap-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green shadow-[0_12px_26px_-12px_rgba(26,143,76,0.8)] transition-all duration-500 ease-out group-hover:scale-105 sm:h-14 sm:w-14">
                <Wallet className="ml-float h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={2.25} />
              </span>

              <div className="space-y-2.5">
                <h2 className="text-2xl font-bold tracking-tight text-balance text-blue-950 sm:text-3xl lg:text-[2.25rem]">
                  Ready to Build a Better Financial Future?
                </h2>
                <p className="mx-auto max-w-xl text-sm text-pretty text-slate-500 sm:text-base">
                  Join thousands who are taking control of their money with moneylog.com
                </p>
              </div>

              <Link
                href="/login"
                className="ml-shine ml-press group/btn mt-1 inline-flex items-center justify-center rounded-full bg-brand-green px-6 py-3.5 text-sm font-bold whitespace-nowrap text-white shadow-[0_14px_30px_-12px_rgba(26,143,76,0.85)] transition-all duration-300 hover:-translate-y-1 hover:bg-brand-green-dark hover:shadow-[0_20px_38px_-14px_rgba(26,143,76,0.95)] sm:px-7 sm:py-4"
              >
                Create Your Free Account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

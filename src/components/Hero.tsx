import { ArrowRight, PlayCircle, ShieldCheck, Lock, BarChart2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Bank-Level Security" },
  { icon: Lock, label: "Encrypted Data" },
  { icon: BarChart2, label: "Real-Time Insights" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex w-full flex-col justify-center overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16 lg:pb-20 xl:min-h-[calc(100svh-4rem)] xl:pt-48 xl:pb-24">
      {/* Backdrop: gradient on every size, artwork layered over it from xl up */}
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

      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center gap-12 px-5 sm:px-6 lg:px-8 xl:flex-row xl:gap-4">
        {/* Copy */}
        <div className="ml-rise flex w-full flex-col items-start text-left xl:w-[42%] xl:shrink-0">
          <h1 className="text-[2rem] font-bold leading-[1.1] tracking-tight text-[#0f172a] sm:text-5xl lg:text-6xl xl:text-[3.75rem] 2xl:text-[4.25rem]">
            Take Control of <span className="text-blue-600 xl:block">Every Dollar</span>
          </h1>

          <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-pretty text-gray-600 sm:text-lg xl:mt-7 xl:text-xl">
            Track income, expenses, bills, transactions, savings and financial goals—all in one secure place.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4 xl:mt-10">
            <Link
              href="/login"
              className="ml-shine ml-press group inline-flex w-full items-center justify-center rounded-full bg-brand-green px-6 py-3.5 text-base font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-[0_16px_30px_-16px_rgba(26,143,76,0.95)] sm:w-auto"
            >
              Start for Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              className="ml-press group inline-flex w-full items-center justify-center rounded-full border border-[#bfdbfe] bg-white px-6 py-3.5 text-base font-bold text-[#1e3a8a] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_16px_30px_-18px_rgba(30,58,138,0.55)] sm:w-auto"
            >
              <PlayCircle className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              View Demo
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-700 sm:gap-3 sm:text-xs xl:mt-12">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center rounded-full border border-gray-100 bg-white px-3 py-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-green/30 hover:shadow-md sm:px-4"
              >
                <Icon className="mr-2 h-4 w-4 shrink-0 text-brand-green" strokeWidth={2.5} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Product mockup — bleeds to the screen edges on phones, contained from sm up */}
        <div
          className="ml-rise relative -mx-5 w-[calc(100%+2.5rem)] sm:mx-0 sm:w-full sm:max-w-[820px] lg:max-w-[900px] xl:w-auto xl:max-w-[860px] xl:flex-1"
          style={{ animationDelay: "160ms" }}
        >
          <Image
            src="/hero_image.png"
            alt="MoneyLog dashboard shown on a laptop and the mobile app on a phone"
            width={1247}
            height={784}
            sizes="(min-width: 1536px) 800px, (min-width: 1280px) 58vw, 100vw"
            priority
            className="h-auto max-h-[420px] w-full object-contain sm:max-h-[520px] xl:max-h-[620px]"
          />
        </div>
      </div>
    </section>
  );
}

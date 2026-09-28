import Image from "next/image";
import Link from "next/link";
import {
  Layers,
  Code2,
  Users,
  Landmark,
  Bell,
  Cloud,
  ShieldCheck,
  Rocket,
  ArrowRight,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "Resources | moneylog.com",
  description:
    "The teams, integrations and technology behind moneylog — dedicated developers, secure bank APIs, real-time notifications and data security.",
};

const RESOURCES = [
  {
    icon: Code2,
    badge: "bg-emerald-100 text-emerald-600",
    card: "bg-emerald-50/60",
    tag: "bg-emerald-100 text-emerald-700",
    title: "Dedicated Developer Team",
    status: "Ongoing",
    description:
      "A dedicated development team is continuously working on new features, improvements and bug fixes to deliver a better experience.",
  },
  {
    icon: Users,
    badge: "bg-blue-100 text-blue-600",
    card: "bg-blue-50/60",
    tag: "bg-blue-100 text-blue-700",
    title: "Technical Team Support",
    status: "Ongoing",
    description:
      "Our technical team ensures smooth operations, performance, and quick resolution of issues across web and mobile apps.",
  },
  {
    icon: Landmark,
    badge: "bg-violet-100 text-violet-600",
    card: "bg-violet-50/60",
    tag: "bg-violet-100 text-violet-700",
    title: "Bank Integration via External APIs",
    status: "Active",
    description:
      "We use secure external APIs to fetch and track transaction details from multiple banks, giving you accurate and real-time financial data.",
  },
  {
    icon: Bell,
    badge: "bg-orange-100 text-orange-500",
    card: "bg-orange-50/60",
    tag: "bg-orange-100 text-orange-600",
    title: "Notification API Integration",
    status: "Active",
    description:
      "We have integrated APIs to enable real-time notifications for bills, payments, and important updates — available on both web and mobile apps.",
  },
  {
    icon: Cloud,
    badge: "bg-teal-100 text-teal-600",
    card: "bg-teal-50/60",
    tag: "bg-teal-100 text-teal-700",
    title: "Web & Mobile App Feature Expansion",
    status: "Ongoing",
    description:
      "Our team is continuously working on new feature listings and enhancements for both web and mobile apps to bring you more value and convenience.",
  },
  {
    icon: ShieldCheck,
    badge: "bg-rose-100 text-rose-500",
    card: "bg-rose-50/60",
    tag: "bg-rose-100 text-rose-600",
    title: "Data Security & Compliance",
    status: "Always On",
    description:
      "We follow industry best practices to keep your data safe, secure, and compliant at all times.",
  },
];

export default function ResourcesPage() {
  return (
    <div className="w-full bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex w-full flex-col justify-center overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pb-24 xl:pt-36 xl:pb-28">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-[#eff9f4]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,255,255,0.85),transparent)]"
        />

        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-10 xl:flex-row xl:items-center xl:gap-10">
            {/* Copy */}
            <div className="ml-rise flex w-full flex-col items-start xl:w-[46%] xl:shrink-0">
              <span className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-emerald-100 sm:mb-7">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green">
                  <Layers className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </span>
                <span className="text-xs font-bold text-brand-green sm:text-sm">Resources</span>
              </span>

              <h1 className="text-[2rem] leading-[1.1] font-extrabold tracking-tight text-balance text-[#0f172a] sm:text-5xl lg:text-[3rem] xl:text-[2.75rem] 2xl:text-[3rem]">
                Powering Your Financial <span className="xl:block">Journey with the Right</span>{" "}
                Resources
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg lg:mt-6 lg:text-xl">
                We use skilled teams and secure integrations to bring you a seamless and reliable
                experience. Our resources ensure you get the best features, accurate data, and
                real-time updates across all platforms.
              </p>
            </div>

            {/* Illustration */}
            <div className="ml-rise relative w-full xl:w-[54%]" style={{ animationDelay: "160ms" }}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-12 bottom-12 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-100/70 to-blue-100/60 blur-2xl"
              />
              <Image
                src="/resources_hero_illustration.png"
                alt="moneylog connecting bank APIs, web and mobile apps with real-time notifications"
                width={1536}
                height={1024}
                sizes="(min-width: 1280px) 740px, 100vw"
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── What powers moneylog ─────────────────────────────────────────── */}
      <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <Reveal className="mb-9 max-w-2xl sm:mb-11 lg:mb-12">
            <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand-green uppercase sm:text-sm">
              Our Resources
            </p>
            <h2 className="mb-4 text-2xl leading-tight font-extrabold tracking-tight text-[#0f172a] sm:text-3xl lg:text-4xl">
              What Powers moneylog
            </h2>
            <p className="text-base leading-relaxed font-medium text-slate-600 sm:text-lg">
              From our dedicated teams to secure bank integrations, we use the best resources to
              deliver a smooth and reliable financial experience.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {RESOURCES.map((resource, index) => (
              <Reveal key={resource.title} delay={(index % 3) * 90} variant="up" className="h-full">
                <article
                  className={`group flex h-full gap-4 rounded-3xl ${resource.card} p-6 ring-1 ring-white/60 transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.45)] sm:gap-5 sm:p-7`}
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${resource.badge} transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-14 sm:w-14`}
                  >
                    <resource.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
                  </span>

                  <div className="flex min-w-0 flex-col">
                    <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3 className="text-[17px] leading-snug font-bold tracking-tight text-[#0f172a] sm:text-lg">
                        {resource.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${resource.tag}`}
                      >
                        {resource.status}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed font-medium text-slate-600 sm:text-[15px]">
                      {resource.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing strip ────────────────────────────────────────────────── */}
      <section className="w-full bg-white pb-14 sm:pb-16 lg:pb-20">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
          <Reveal variant="scale">
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-emerald-100 bg-[#eff9f4] px-6 py-7 text-center lg:flex-row lg:justify-between lg:gap-8 lg:px-9 lg:py-8 lg:text-left">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-green shadow-lg shadow-brand-green/20 sm:h-16 sm:w-16">
                  <Rocket className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={2.5} />
                </span>

                <span className="hidden h-14 w-px shrink-0 bg-emerald-200 sm:block" />

                <div className="flex flex-col">
                  <h2 className="mb-2 text-xl leading-snug font-extrabold tracking-tight text-balance text-[#0f172a] sm:text-2xl">
                    Built on the Right Resources, for Your Financial Freedom
                  </h2>
                  <p className="text-sm font-medium text-pretty text-slate-600 sm:text-[15px]">
                    Technology. Talent. Trusted Integrations. All working together to give you the
                    best.
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="ml-shine ml-press group inline-flex w-full shrink-0 items-center justify-center rounded-full bg-brand-green px-8 py-3.5 text-sm font-bold whitespace-nowrap text-white shadow-md shadow-brand-green/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-green-dark sm:w-auto sm:text-base sm:py-4"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

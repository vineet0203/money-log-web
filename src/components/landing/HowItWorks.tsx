import { Fragment } from "react";
import { Link2, Settings, BarChart3, Target, TrendingUp, ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const STEPS = [
  {
    icon: Link2,
    circle: "bg-emerald-600",
    title: "Connect Accounts",
    titleColor: "text-emerald-700",
    description: "Link your banks, cards and financial accounts securely.",
  },
  {
    icon: Settings,
    circle: "bg-blue-600",
    title: "Track Automatically",
    titleColor: "text-blue-600",
    description: "Transactions, bills and spending are updated in real time.",
  },
  {
    icon: BarChart3,
    circle: "bg-violet-700",
    title: "Understand Spending",
    titleColor: "text-violet-700",
    description: "See clear insights and helpful visualizations.",
  },
  {
    icon: Target,
    circle: "bg-orange-600",
    title: "Plan Better",
    titleColor: "text-orange-600",
    description: "Set budgets, goals and get reminders.",
  },
  {
    icon: TrendingUp,
    circle: "bg-emerald-600",
    title: "Grow Savings",
    titleColor: "text-emerald-700",
    description: "Make smarter decisions and build wealth.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-white pt-4 pb-12 sm:pb-16 lg:pb-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        <Reveal variant="scale">
          <div className="rounded-2xl bg-blue-50 p-5 sm:rounded-3xl sm:p-6 lg:p-8">
            {/* Panel heading */}
            <div className="group mb-6 flex items-center justify-center gap-3 sm:mb-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-10 sm:w-10">
                <Link2 className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </span>
              <h2 className="text-center text-lg font-bold tracking-tight text-[#0f172a] sm:text-xl lg:text-2xl">
                How moneylog.com <span className="text-blue-600">Works</span>
              </h2>
            </div>

            {/* Steps: grid below xl, single arrowed row from xl up */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:flex xl:items-stretch xl:gap-0">
              {STEPS.map(({ icon: Icon, circle, title, titleColor, description }, index) => (
                <Fragment key={title}>
                  <Reveal delay={index * 90} className="h-full xl:flex-1">
                    <div className="group flex h-full cursor-default flex-col items-center rounded-2xl bg-white px-4 py-6 text-center shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-20px_rgba(16,24,40,0.45)] sm:px-5">
                      <span
                        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${circle} shadow-sm transition-all duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6`}
                      >
                        <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                      </span>
                      <h3 className={`mb-2 text-sm font-bold leading-snug ${titleColor} sm:text-[15px]`}>
                        {title}
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-500 sm:text-[13px]">
                        {description}
                      </p>
                    </div>
                  </Reveal>

                  {index < STEPS.length - 1 && (
                    <div className="hidden shrink-0 items-center justify-center px-1 xl:flex" aria-hidden="true">
                      <ArrowRight
                        className="ml-nudge h-5 w-5 text-blue-500"
                        style={{ animationDelay: `${index * 200}ms` }}
                      />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

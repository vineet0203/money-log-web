import { ArrowRight, RefreshCw } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type Stage = {
  title: string;
  description: string;
  steps: [string, string];
};

/** The guided journey, in order. Tone alternates every three cards. */
const STAGES: Stage[] = [
  {
    title: "Create your space",
    description:
      "Choose personal, family, or business use. Add profiles, currency, and starting balances.",
    steps: ["Sign up and verify access", "Set preferences and permissions"],
  },
  {
    title: "Connect your money",
    description:
      "Link supported bank and card accounts, or import a file. Confirm the first sync before using the data.",
    steps: ["Select accounts or import CSV", "Review and map balances"],
  },
  {
    title: "Capture transactions",
    description:
      "Bring in deposits, purchases, transfers, and cash entries. Edit details and attach notes as needed.",
    steps: ["Sync or enter activity", "Label merchant and account"],
  },
  {
    title: "Organize your dashboard",
    description:
      "See balances, income, spending, bills due, and goals in one place. Filter by account or date.",
    steps: ["Review the overview", "Drill into an item"],
  },
  {
    title: "Categorize spending",
    description:
      "Assign categories and tags so every dollar has context. Use rules for repeated merchants.",
    steps: ["Confirm category and tags", "Apply rules to future items"],
  },
  {
    title: "Build a budget",
    description:
      "Set monthly limits by category, then compare planned and actual spending as transactions arrive.",
    steps: ["Set limits and period", "Adjust after reviewing variance"],
  },
  {
    title: "Manage bills and invoices",
    description:
      "Track household bills or create business invoices. Record due dates, status, and supporting details.",
    steps: ["Add a bill or invoice", "Mark sent, due, paid, or overdue"],
  },
  {
    title: "Plan payments and alerts",
    description:
      "Get reminders before due dates. Record a payment or reconcile it against an imported transaction.",
    steps: ["Set the reminder schedule", "Match payment to the bill"],
  },
  {
    title: "Watch subscriptions",
    description:
      "Keep recurring charges visible. Review renewal dates, price changes, and services you may cancel.",
    steps: ["Identify recurring charges", "Review before renewal"],
  },
  {
    title: "Grow savings goals",
    description:
      "Name a goal, set its target and date, and allocate contributions from available cash.",
    steps: ["Create target and timeline", "Track funded progress"],
  },
  {
    title: "Manage debt and credit",
    description:
      "Record balances, rates, and due dates. Compare payoff options and monitor payment progress.",
    steps: ["Add liabilities and terms", "Review payoff trajectory"],
  },
  {
    title: "Keep receipts and tax records",
    description:
      "Attach receipts to transactions, tag deductible items, and collect documents for tax time.",
    steps: ["Upload or scan receipts", "Organize records by year"],
  },
  {
    title: "Read reports and cash flow",
    description:
      "Compare income, expenses, net cash flow, trends, and categories across chosen periods.",
    steps: ["Filter dates and accounts", "Review the report"],
  },
  {
    title: "Act on smart insights",
    description:
      "Surface unusual spending, upcoming shortfalls, and budget opportunities for your review.",
    steps: ["Review suggested insight", "Decide and take action"],
  },
  {
    title: "Secure, share, and continue",
    description:
      "Use protected access and appropriate family or business permissions. Return each week to keep records current.",
    steps: ["Review access and privacy", "Reconcile and repeat cycle"],
  },
];

const TONES = [
  {
    badge: "bg-blue-600",
    topBorder: "border-t-blue-500",
    panel: "bg-blue-50/70",
    marker: "text-blue-600",
    arrow: "text-blue-500/80",
    hoverRing: "group-hover:ring-blue-200",
  },
  {
    badge: "bg-brand-green",
    topBorder: "border-t-brand-green",
    panel: "bg-emerald-50/70",
    marker: "text-brand-green",
    arrow: "text-emerald-500/80",
    hoverRing: "group-hover:ring-emerald-200",
  },
];

/**
 * Card placement and connector direction, precomputed for each breakpoint so the
 * flow snakes exactly like the printed chart:
 *
 *   1 -> 2 -> 3           (3 columns)      1 -> 2      (2 columns)     1   (1 column)
 *   6 <- 5 <- 4                            4 <- 3                      |
 *   7 -> 8 -> 9                            5 -> 6                      2
 *  12 <-11 <-10                            8 <- 7                      |
 *  13 ->14 ->15                            9 ->10                      3
 *
 * Written out in full rather than computed, so Tailwind's scanner sees every class.
 */
const FLOW = [
  {
    order: "order-1 md:order-1 lg:order-1",
    right: "hidden md:flex lg:flex",
    left: "hidden md:hidden lg:hidden",
    down: "flex md:hidden lg:hidden",
  },
  {
    order: "order-2 md:order-2 lg:order-2",
    right: "hidden md:hidden lg:flex",
    left: "hidden md:hidden lg:hidden",
    down: "flex md:flex lg:hidden",
  },
  {
    order: "order-3 md:order-4 lg:order-3",
    right: "hidden md:hidden lg:hidden",
    left: "hidden md:flex lg:hidden",
    down: "flex md:hidden lg:flex",
  },
  {
    order: "order-4 md:order-3 lg:order-6",
    right: "hidden md:hidden lg:hidden",
    left: "hidden md:hidden lg:flex",
    down: "flex md:flex lg:hidden",
  },
  {
    order: "order-5 md:order-5 lg:order-5",
    right: "hidden md:flex lg:hidden",
    left: "hidden md:hidden lg:flex",
    down: "flex md:hidden lg:hidden",
  },
  {
    order: "order-6 md:order-6 lg:order-4",
    right: "hidden md:hidden lg:hidden",
    left: "hidden md:hidden lg:hidden",
    down: "flex md:flex lg:flex",
  },
  {
    order: "order-7 md:order-8 lg:order-7",
    right: "hidden md:hidden lg:flex",
    left: "hidden md:flex lg:hidden",
    down: "flex md:hidden lg:hidden",
  },
  {
    order: "order-8 md:order-7 lg:order-8",
    right: "hidden md:hidden lg:flex",
    left: "hidden md:hidden lg:hidden",
    down: "flex md:flex lg:hidden",
  },
  {
    order: "order-9 md:order-9 lg:order-9",
    right: "hidden md:flex lg:hidden",
    left: "hidden md:hidden lg:hidden",
    down: "flex md:hidden lg:flex",
  },
  {
    order: "order-10 md:order-10 lg:order-12",
    right: "hidden md:hidden lg:hidden",
    left: "hidden md:hidden lg:flex",
    down: "flex md:flex lg:hidden",
  },
  {
    order: "order-11 md:order-12 lg:order-11",
    right: "hidden md:hidden lg:hidden",
    left: "hidden md:flex lg:flex",
    down: "flex md:hidden lg:hidden",
  },
  {
    order: "order-12 md:order-11 lg:order-10",
    right: "hidden md:hidden lg:hidden",
    left: "hidden md:hidden lg:hidden",
    down: "flex md:flex lg:flex",
  },
  {
    order: "order-13 md:order-13 lg:order-13",
    right: "hidden md:flex lg:flex",
    left: "hidden md:hidden lg:hidden",
    down: "flex md:hidden lg:hidden",
  },
  {
    order: "order-14 md:order-14 lg:order-14",
    right: "hidden md:hidden lg:flex",
    left: "hidden md:hidden lg:hidden",
    down: "flex md:flex lg:hidden",
  },
  {
    order: "order-15 md:order-15 lg:order-15",
    right: "hidden md:hidden lg:hidden",
    left: "hidden md:hidden lg:hidden",
    down: "hidden md:hidden lg:hidden",
  },
];

const CYCLE = [
  "New activity",
  "Updated budget and bills",
  "Fresh insights",
  "Better next decisions",
];

/** Arrow heads for the connectors — sized to sit flush against the next card. */
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 12" fill="none" className={className} aria-hidden="true">
      <path
        d="M1.6 1.6 L6.4 6 L1.6 10.4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 8" fill="none" className={className} aria-hidden="true">
      <path
        d="M1.6 1.6 L6 6.4 L10.4 1.6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HowItWorksJourney() {
  return (
    <section className="w-full bg-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal className="mb-10 flex flex-col items-center text-center sm:mb-12 lg:mb-14">
          <p className="mb-3 text-xs font-bold tracking-[0.18em] text-brand-green uppercase sm:text-sm">
            The Journey
          </p>
          <h2 className="mb-4 max-w-3xl text-2xl leading-tight font-extrabold tracking-tight text-balance text-[#0f172a] sm:text-3xl lg:text-4xl">
            From Connected Accounts to Clearer Money Decisions
          </h2>
          <p className="max-w-2xl text-base leading-relaxed font-medium text-pretty text-slate-600 sm:text-lg">
            Follow the arrows. Each card shows the action, the steps behind it, and why it matters.
          </p>
        </Reveal>

        {/* Stages — the arrows snake through the grid in sequence */}
        <ol className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
          {STAGES.map((stage, index) => {
            const tone = TONES[Math.floor(index / 3) % TONES.length];
            const flow = FLOW[index];

            return (
              <Reveal
                key={stage.title}
                as="li"
                delay={(index % 3) * 90}
                variant="up"
                className={`relative h-full ${flow.order}`}
              >
                {/* Connectors — each spans the whole gutter, so the wire leaves one
                    card and its head lands on the next. */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-1/2 left-full z-10 h-3 w-8 -translate-y-1/2 items-center ${tone.arrow} ${flow.right}`}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  <span className="h-[2px] flex-1 bg-current" />
                  <ChevronRight className="h-3 w-2 shrink-0" />
                </span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-1/2 right-full z-10 h-3 w-8 -translate-y-1/2 items-center ${tone.arrow} ${flow.left}`}
                >
                  <ChevronRight className="h-3 w-2 shrink-0 rotate-180" />
                  <span className="h-[2px] flex-1 bg-current" />
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                </span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-full left-1/2 z-10 h-14 w-3 -translate-x-1/2 flex-col items-center lg:h-16 ${tone.arrow} ${flow.down}`}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  <span className="w-[2px] flex-1 bg-current" />
                  <ChevronDown className="h-2 w-3 shrink-0" />
                </span>

                <article
                  className={`group flex h-full flex-col rounded-3xl border-t-4 ${tone.topBorder} bg-white p-6 ring-1 ring-slate-100 shadow-[0_14px_36px_-30px_rgba(16,24,40,0.5)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.45)] ${tone.hoverRing} sm:p-7`}
                >
                  <div className="mb-4 flex items-start gap-3.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.badge} text-sm font-extrabold text-white shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 sm:h-10 sm:w-10`}
                    >
                      {index + 1}
                    </span>
                    <h3 className="pt-1.5 text-[17px] leading-snug font-bold tracking-tight text-[#0f172a] sm:text-lg">
                      {stage.title}
                    </h3>
                  </div>

                  <p className="text-sm leading-relaxed font-medium text-slate-600 sm:text-[15px]">
                    {stage.description}
                  </p>

                  <div className={`mt-6 rounded-2xl ${tone.panel} p-4 sm:mt-auto sm:p-5`}>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                      The Steps
                    </p>
                    <ol className="mt-3 flex flex-col gap-2.5">
                      {stage.steps.map((step, stepIndex) => (
                        <li key={step} className="flex items-baseline gap-2.5">
                          <span className={`text-[11px] font-extrabold tabular-nums ${tone.marker}`}>
                            {stepIndex + 1}
                          </span>
                          <span className="text-[13px] leading-relaxed font-medium text-slate-600">
                            {step}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>

        {/* The repeat cycle */}
        <Reveal variant="scale" delay={120}>
          <div className="mt-10 overflow-hidden rounded-3xl bg-[#0f172a] px-6 py-7 sm:px-8 sm:py-8 lg:mt-12">
            <div className="flex flex-col items-center gap-5 lg:flex-row lg:gap-8">
              <div className="flex items-center gap-3.5 lg:shrink-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green">
                  <RefreshCw className="h-5 w-5 text-white" strokeWidth={2.5} />
                </span>
                <span className="text-[11px] font-bold tracking-[0.16em] text-emerald-300 uppercase sm:text-xs">
                  The Repeat Cycle
                </span>
              </div>

              <span aria-hidden="true" className="hidden h-10 w-px shrink-0 bg-white/15 lg:block" />

              <ol className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2.5 lg:justify-start">
                {CYCLE.map((item, index) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white sm:text-[13px]">
                      {item}
                    </span>
                    {index < CYCLE.length - 1 && (
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-emerald-300"
                        strokeWidth={2.5}
                      />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-5 text-center text-[11px] leading-relaxed font-medium text-pretty text-slate-400 sm:text-xs">
            Conceptual product workflow. Bank links, payments, insights and integrations depend on
            implementation and your own setup.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

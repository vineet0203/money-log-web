import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, ArrowRight, Apple, Play } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
 * EDIT HERE — company contact details.
 * Every value below is rendered in the footer's contact block.
 * ──────────────────────────────────────────────────────────────────────────── */
const CONTACT = {
  address: ["7920 Belt Line Road", "Suite 720", "Dallas, TX 75245"],
  emails: [
    { label: "support@moneylog.com", href: "mailto:support@moneylog.com" },
    { label: "info@moneylog.com", href: "mailto:info@moneylog.com" },
  ],
  phone: { label: "800 570 1492", href: "tel:+18005701492" },
};

/* ────────────────────────────────────────────────────────────────────────────
 * EDIT HERE — legal documents. Point each href at the real page or PDF.
 * These render at the top of the footer's Legal column.
 * ──────────────────────────────────────────────────────────────────────────── */
const LEGAL_DOCS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms and Conditions", href: "/terms-and-conditions" },
  { label: "Cookies Policy", href: "/cookies-policy" },
];

/* Navigation routes are intentionally left as "#" for now. */
const LINK_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Product",
    links: [
      "Dashboard",
      "Transactions",
      "Bills & Payments",
      "Budgeting",
      "Invoicing",
      "Subscriptions",
      "Savings Goals",
      "Credit & Debt",
      "Tax Control",
      "Reports",
      "Mobile Apps",
    ],
  },
  {
    title: "Personal Finance",
    links: [
      "Net Worth",
      "Cash Flow",
      "Bill Calendar",
      "Income/Expense",
      "Investment Tracking",
      "College Savings",
      "Retirement Planning",
      "Financial Tools",
      "Family Sharing",
    ],
  },
  {
    title: "Billing & Business",
    links: [
      "Create Invoices",
      "Recurring Billing",
      "Payment Links",
      "Estimates",
      "Clients",
      "Vendors",
      "Accounts Receivable",
      "Accounts Payable",
      "Mileage",
      "Expense Reimbursement",
      "Financial Statements",
    ],
  },
  {
    title: "Resources",
    links: [
      "Help Center",
      "Getting Started",
      "Video Guides",
      "Budget Templates",
      "Calculators",
      "Webinars",
      "API Documentation",
      "Integrations",
      "System Status",
      "Community",
    ],
  },
  {
    title: "Company",
    links: [
      "About moneylog",
      "Careers",
      "Press",
      "Contact",
      "Leadership",
      "Security",
      "Privacy Center",
      "Accessibility",
      "Affiliates",
    ],
  },
  {
    title: "Legal",
    links: [
      "Data Processing",
      "Security Policy",
      "Compliance",
      "Licenses",
      "Disclosures",
      "Do Not Sell or Share My Information",
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", short: "f" },
  { label: "LinkedIn", short: "in" },
  { label: "X", short: "x" },
  { label: "Instagram", short: "ig" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#0f1115] px-5 pt-16 pb-8 font-sans text-white/60 sm:px-6 lg:px-8 lg:pt-20">
      <div className="mx-auto w-full max-w-[1400px]">
        {/* Brand + navigation */}
        <div className="grid gap-12 lg:grid-cols-[minmax(260px,1fr)_3fr] lg:gap-10">
          {/* Brand & contact */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="group flex w-fit items-center gap-2">
              <Image
                src="/logo/logo.png"
                alt="MoneyLog Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain brightness-0 invert transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
              />
              <Image
                src="/logo/logo_text.png"
                alt="MoneyLog Text"
                width={120}
                height={32}
                className="h-6 w-auto object-contain brightness-0 invert transition-transform duration-500 ease-out group-hover:translate-x-0.5"
              />
            </Link>

            <p className="text-xs leading-relaxed text-white/40">Your Money. Organized.</p>
            <p className="max-w-sm text-xs leading-relaxed text-white/40">
              An all-in-one platform for managing your personal finances, bills, transactions,
              budgets, subscriptions, savings, credit, taxes and financial reports.
            </p>

            {/* Contact */}
            <ul className="flex flex-col gap-3 border-t border-white/10 pt-5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" strokeWidth={2.5} />
                <span className="leading-relaxed text-white/50">
                  {CONTACT.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" strokeWidth={2.5} />
                <span className="flex flex-col gap-1">
                  {CONTACT.emails.map((email) => (
                    <a
                      key={email.href}
                      href={email.href}
                      className="ml-link-slide text-white/50 transition-colors hover:text-white"
                    >
                      {email.label}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-brand-green" strokeWidth={2.5} />
                <a
                  href={CONTACT.phone.href}
                  className="ml-link-slide text-white/50 transition-colors hover:text-white"
                >
                  {CONTACT.phone.label}
                </a>
              </li>
            </ul>

            {/* Socials */}
            <div className="flex gap-2">
              {SOCIALS.map((social) => (
                <button
                  key={social.short}
                  type="button"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[11px] font-semibold text-white/60 ring-1 ring-white/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-brand-green hover:text-white hover:ring-brand-green"
                >
                  {social.short}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {LINK_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <h4 className="text-[11px] font-bold tracking-wider text-white uppercase">
                  {column.title}
                </h4>
                {/* Legal docs lead the Legal column */}
                {column.title === "Legal" &&
                  LEGAL_DOCS.map((doc) => (
                    <Link
                      key={doc.label}
                      href={doc.href}
                      className="ml-link-slide text-xs text-white/50 transition-colors hover:text-white"
                    >
                      {doc.label}
                    </Link>
                  ))}
                {column.links.map((label) => (
                  <Link
                    key={label}
                    href="#"
                    className="ml-link-slide text-xs text-white/50 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter + apps */}
        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <div className="flex w-full flex-col gap-3 md:w-auto">
            <h4 className="text-xs font-bold text-white">Financial tips delivered weekly</h4>
            <form className="flex w-full max-w-sm items-stretch overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10 transition-all duration-300 focus-within:bg-white/10 focus-within:ring-brand-green md:w-auto">
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-transparent px-5 py-3 text-xs text-white placeholder:text-white/35 focus:outline-none md:w-60"
              />
              <button
                type="submit"
                className="ml-shine group flex shrink-0 items-center gap-1.5 bg-brand-green px-5 text-xs font-semibold text-white transition-colors duration-300 hover:bg-brand-green-dark"
              >
                Subscribe
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="ml-shine flex items-center gap-2 rounded-full px-5 py-2.5 text-xs text-white ring-1 ring-white/15 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/5 hover:ring-white/30"
            >
              <Apple className="h-4 w-4 shrink-0" strokeWidth={2} />
              App Store
            </button>
            <button
              type="button"
              className="ml-shine flex items-center gap-2 rounded-full px-5 py-2.5 text-xs text-white ring-1 ring-white/15 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/5 hover:ring-white/30"
            >
              <Play className="h-4 w-4 shrink-0 fill-white" strokeWidth={2} />
              Google Play
            </button>
          </div>
        </div>

        {/* Legal strip */}
        <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-8 text-xs md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <span className="text-white/70">English (US)</span>
            <span className="text-white/40">© 2026 moneylog.com. All rights reserved.</span>
          </div>

          {/* A Product By */}
          <div className="flex flex-col items-start gap-1.5 md:items-end">
            <p className="text-[10px] font-medium tracking-widest text-white/40 uppercase">
              A Product By
            </p>
            <a
              href="https://www.computerlog.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit rounded bg-white px-2 py-1 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:opacity-90"
            >
              <Image
                src="/logo/computerlog.png"
                alt="Computerlog"
                width={120}
                height={30}
                style={{ width: "100px", height: "auto", objectFit: "contain" }}
              />
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] leading-relaxed text-white/30">
          moneylog is a financial technology company, not a bank. Banking services provided by our
          partner banks.
        </p>
      </div>
    </footer>
  );
}

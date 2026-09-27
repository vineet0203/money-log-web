import {
  Link2,
  Landmark,
  CreditCard,
  Wallet,
  CircleDollarSign,
  Calculator,
  Plug,
  Smartphone,
  Nfc,
} from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const SERVICES = [
  { name: "Banks", icon: Landmark },
  { name: "Credit Cards", icon: CreditCard },
  { name: "PayPal", icon: Wallet },
  { name: "Stripe", icon: CircleDollarSign },
  { name: "QuickBooks", icon: Calculator },
  { name: "Plaid", icon: Plug },
  { name: "Apple Pay", icon: Smartphone },
  { name: "Google Pay", icon: Nfc },
];

export default function FinancialServices() {
  return (
    <section className="w-full border-y border-gray-100 bg-[#f8fafc] py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        <Reveal variant="scale">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
            {/* Heading */}
            <div className="group mb-6 flex flex-col items-center gap-2 text-center sm:mb-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-10 sm:w-10">
                  <Link2 className="h-4 w-4 text-white sm:h-5 sm:w-5" strokeWidth={2.5} />
                </span>
                <h2 className="text-lg font-bold tracking-tight text-blue-950 sm:text-xl lg:text-2xl">
                  Works with Your Favorite Financial Services
                </h2>
              </div>
              <p className="text-xs text-slate-500 sm:text-sm">
                Easily connect with thousands of institutions and services.
              </p>
            </div>

            {/* Services */}
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {SERVICES.map(({ name, icon: Icon }, index) => (
                <Reveal as="li" key={name} delay={index * 60} className="h-full">
                  <div className="group flex h-full cursor-default items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-3.5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-[0_14px_26px_-16px_rgba(37,99,235,0.6)] sm:gap-3 sm:px-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white sm:h-9 sm:w-9">
                      <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2.25} />
                    </span>
                    <span className="text-[13px] font-bold whitespace-nowrap text-blue-700 sm:text-sm">
                      {name}
                    </span>
                  </div>
                </Reveal>
              ))}
            </ul>

            {/* Everything we can't list */}
            <Reveal delay={240}>
              <p className="mt-6 border-t border-dashed border-gray-200 pt-5 text-center text-[11px] leading-relaxed text-slate-400 sm:text-xs">
                <span className="font-bold text-blue-700">+ Many more</span> — banks, credit
                unions, cards and services we connect to but can&apos;t all name here.
              </p>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

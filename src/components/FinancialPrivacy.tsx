import { Lock, ShieldCheck, UserRound, Landmark, Settings, Bell, Cloud, Folder } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const SAFEGUARDS = [
  { icon: ShieldCheck, label: "256-bit Encryption" },
  { icon: UserRound, label: "Multi-Factor Authentication" },
  { icon: Landmark, label: "Read-Only Bank Connections" },
  { icon: Settings, label: "Privacy Controls" },
  { icon: Bell, label: "Fraud Alerts" },
  { icon: Cloud, label: "Automatic Backups" },
  { icon: Folder, label: "Secure Document Vault" },
];

export default function FinancialPrivacy() {
  return (
    <section className="w-full bg-white pb-12 sm:pb-16 lg:pb-20">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        <Reveal variant="scale">
          <div className="relative isolate overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6 lg:p-8">
            {/* Ambient tint */}
            <div
              aria-hidden="true"
              className="ml-blob ml-blob-a -top-20 -right-12 -z-10 h-56 w-56 bg-blue-200/30"
            />

            {/* Banner heading */}
            <div className="group mb-6 flex flex-col items-center gap-2 text-center sm:mb-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-10 sm:w-10">
                  <Lock className="h-4 w-4 text-white sm:h-5 sm:w-5" strokeWidth={2.5} />
                </span>
                <h2 className="text-lg font-bold tracking-tight text-blue-950 sm:text-xl lg:text-2xl">
                  Built for Your Financial Privacy
                </h2>
              </div>
              <p className="text-xs text-slate-500 sm:text-sm">
                Your data is always secure and under your control.
              </p>
            </div>

            {/* Safeguards */}
            <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4 lg:grid-cols-7">
              {SAFEGUARDS.map(({ icon: Icon, label }, index) => (
                <Reveal
                  as="li"
                  key={label}
                  delay={index * 70}
                  className="group flex flex-col items-center text-center"
                >
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_12px_24px_-12px_rgba(37,99,235,0.9)] sm:h-14 sm:w-14">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                  </span>
                  <span className="max-w-[9rem] text-[11px] font-semibold leading-tight text-blue-950 sm:text-xs">
                    {label}
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

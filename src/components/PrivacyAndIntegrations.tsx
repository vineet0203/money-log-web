import { Building2 } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const INTEGRATIONS = [
  { name: "Banks", className: "font-medium text-gray-700" },
  { name: "Credit Cards", className: "font-medium text-gray-700" },
  { name: "PayPal", className: "font-bold text-[#003087]" },
  { name: "stripe", className: "font-bold text-[#635BFF]" },
  { name: "QuickBooks", className: "font-bold text-[#2CA01C]" },
  { name: "PLAID", className: "font-bold text-black" },
  { name: "IRS", className: "font-bold text-gray-700" },
  { name: "Google Pay", className: "font-bold text-gray-700" },
];

export default function PrivacyAndIntegrations() {
  return (
    <section className="w-full border-y border-gray-100 bg-[#f8fafc] py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        <Reveal variant="scale">
          <div className="ml-card rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="group/head mb-2 flex items-center gap-3">
              <Building2 className="h-5 w-5 fill-blue-100 text-blue-600 transition-transform duration-500 ease-out group-hover/head:-translate-y-0.5 group-hover/head:scale-110" />
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Works with Your Favorite Financial Services
              </h2>
            </div>
            <p className="mb-8 pl-8 text-xs text-gray-500 sm:text-sm">
              Easily connect with thousands of institutions and services.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {INTEGRATIONS.map((item) => (
                <div
                  key={item.name}
                  className={`ml-sheen cursor-default rounded-full border border-gray-200 px-4 py-2.5 text-center text-sm ${item.className} transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-green/40 hover:bg-gray-50 hover:shadow-[0_10px_20px_-12px_rgba(16,24,40,0.45)]`}
                >
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

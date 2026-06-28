import { CheckCircle2 } from "lucide-react";

export default function TrustBanner() {
  const items = [
    "Bank-Level Security",
    "Sync on all Devices",
    "Privacy Focused",
  ];

  return (
    <div className="bg-brand-dark py-4 text-white">
      <div className="max-w-7xl mx-auto px-8 flex flex-wrap justify-center gap-8 md:gap-16">
        {items.map((item, index) => (
          <div key={index} className="flex items-center text-sm md:text-base font-medium">
            <CheckCircle2 className="w-5 h-5 mr-2 text-white" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

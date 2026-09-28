"use client";

import Reveal from "@/components/ui/Reveal";
import PricingCards from "@/components/PricingCards";

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="w-full scroll-mt-24 border-b border-gray-100 bg-white pt-12 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        <Reveal>
          <PricingCards />
        </Reveal>

      </div>
    </section>
  );
}

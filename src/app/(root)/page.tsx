import Hero from "@/components/Hero";
import TrustBanner from "@/components/TrustBanner";
import Features from "@/components/Features";
import BudgetTracking from "@/components/BudgetTracking";
import CtaBanner from "@/components/CtaBanner";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <TrustBanner />
      <Features />
      <BudgetTracking />
      <CtaBanner />
    </div>
  );
}

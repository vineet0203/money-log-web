import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import FinancialPrivacy from "@/components/FinancialPrivacy";
import FinancialServices from "@/components/FinancialServices";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import CtaBanner from "@/components/CtaBanner";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Features />
      <HowItWorks />
      <FinancialPrivacy />
      <FinancialServices />
      <Pricing />
      <Testimonials />
      <CtaBanner />
    </div>
  );
}

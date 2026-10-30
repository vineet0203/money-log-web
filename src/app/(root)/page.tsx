import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import FinancialPrivacy from "@/components/landing/FinancialPrivacy";
import FinancialServices from "@/components/landing/FinancialServices";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import CtaBanner from "@/components/landing/CtaBanner";

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

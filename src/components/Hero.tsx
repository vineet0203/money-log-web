import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full pt-32 lg:pt-48 pb-20 lg:pb-32 overflow-hidden flex flex-col lg:block">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-100 via-white to-pink-100 opacity-90" />

      <div className="max-w-7xl mx-auto px-8 w-full relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-gray-900">
            Track Money. <br />
            Manage Life. <br />
            Build Wealth.
          </h1>
          <p className="text-gray-600 text-lg max-w-lg leading-relaxed">
            All-in-one personal finance to track transaction, manage
            subscription, monitor P&L balance, payable & receivable and grow
            your wealth.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button className="group flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-brand-green hover:bg-brand-green-dark rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-green/30 active:scale-95 shadow-lg shadow-brand-green/20">
              Get Started Free
              <div className="ml-3 bg-white rounded-full p-1 transition-transform duration-200 group-hover:translate-x-1">
                <ArrowUpRight className="w-4 h-4 text-brand-green stroke-[3]" />
              </div>
            </button>
            <button className="group flex items-center justify-center px-6 py-3.5 text-base font-semibold text-brand-green bg-white border border-brand-green hover:bg-brand-green/5 rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95">
              Live Demo
              <div className="ml-3 bg-brand-green rounded-full p-1 transition-transform duration-200 group-hover:translate-x-1">
                <ArrowUpRight className="w-4 h-4 text-white stroke-[3]" />
              </div>
            </button>
          </div>
        </div>

        <div className="w-full lg:w-[65%] lg:absolute lg:-right-26 lg:top-1/2 lg:-translate-y-1/2 mt-16 lg:mt-0 z-0 overflow-visible">
          {/* Dashboard Image Container */}
          <div className="relative rounded-2xl overflow-hidden drop-shadow-2xl">
            <Image
              src="/hero_section.png"
              alt="MoneyLog Dashboard Mockup"
              width={1400}
              height={900}
              className="w-full h-auto object-cover object-left"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

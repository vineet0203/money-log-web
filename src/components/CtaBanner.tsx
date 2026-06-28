import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function CtaBanner() {
  return (
    <section className="py-20 px-8">
      <div className="max-w-5xl mx-auto bg-brand-green-dark rounded-3xl overflow-hidden flex flex-col md:flex-row items-center relative">
        <div className="flex-1 p-12 md:p-16 z-10 text-white space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Take Control of your Money
          </h2>
          <p className="text-green-100 max-w-sm text-sm leading-relaxed">
            Join thousand of people who are managing their finances better every day.
          </p>
          <button className="group flex items-center justify-center px-6 py-3 text-sm font-semibold text-brand-green-dark bg-white hover:bg-gray-50 rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 mt-4">
            Get Started Free
            <div className="ml-3 bg-brand-green-dark rounded-full p-1 transition-transform duration-200 group-hover:translate-x-1">
              <ArrowRight className="w-3 h-3 text-white" />
            </div>
          </button>
        </div>
        
        <div className="flex-1 relative w-full min-h-[300px] flex items-center justify-end">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-full md:w-[90%] h-[150%] md:h-[160%]">
            <Image
              src="/cta_image.png"
              alt="Take Control"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain object-right scale-110 md:scale-[1.3] origin-right"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

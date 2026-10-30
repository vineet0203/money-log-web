"use client";

import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const TESTIMONIALS = [
  {
    text: '"moneylog.com has completely changed how I manage my money. It\'s simple, powerful and actually makes budgeting easy."',
    author: "Sarah M.",
    role: "Verified User",
  },
  {
    text: '"I finally have all my accounts, bills and goals in one place. The insights help me make better decisions every day."',
    author: "James T.",
    role: "Verified User",
  },
  {
    text: '"The best personal finance app I\'ve ever used. Clean, intuitive and packed with useful features."',
    author: "Priya R.",
    role: "Verified User",
  },
  {
    text: '"The best personal finance application I\'ve ever used. Clean, intuitive and packed with useful features."',
    author: "Priya Ragu",
    role: "Verified User",
  },
];

export default function Testimonials() {
  const [perView, setPerView] = useState(3);
  const [page, setPage] = useState(0);

  // Slides are sized in CSS; this only drives how many pages the arrows step through.
  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth;
      setPerView(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const pageCount = Math.max(1, Math.ceil(TESTIMONIALS.length / perView));
  // Clamp to the last full screen so the final page never shows empty slots.
  const maxIndex = Math.max(0, TESTIMONIALS.length - perView);
  const firstVisible = Math.min(page * perView, maxIndex);
  const offset = (firstVisible * 100) / perView;

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount - 1));
  }, [pageCount]);

  const canGoBack = page > 0;
  const canGoNext = page < pageCount - 1;

  return (
    <section className="w-full bg-[#f8fafc] py-12 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:px-8">
        {/* Heading */}
        <Reveal>
          <div className="group mb-8 flex flex-col items-center gap-2 text-center sm:mb-10">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-10 sm:w-10">
                <Quote
                  className="h-4 w-4 text-white sm:h-5 sm:w-5"
                  strokeWidth={2.5}
                />
              </span>
              <h2 className="text-lg font-bold tracking-tight text-blue-950 sm:text-xl lg:text-2xl">
                What Our Users Are Saying
              </h2>
            </div>
          </div>
        </Reveal>

        {/* Carousel */}
        <Reveal variant="scale">
          <div className="-my-5 overflow-hidden py-5">
            <div
              className="flex items-stretch transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${offset}%)` }}
            >
              {TESTIMONIALS.map((testimonial, index) => (
                <div
                  key={testimonial.author}
                  className="w-full shrink-0 px-2 sm:w-1/2 sm:px-2.5 lg:w-1/3 lg:px-3"
                  aria-hidden={
                    index < firstVisible || index >= firstVisible + perView
                      ? "true"
                      : undefined
                  }
                >
                  <figure className="group flex h-full cursor-default flex-col justify-between rounded-2xl bg-white p-7 ring-1 ring-gray-200/80 shadow-[0_10px_30px_-24px_rgba(16,24,40,0.4)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:ring-brand-green/30 hover:shadow-[0_22px_46px_-26px_rgba(16,24,40,0.4)] sm:p-8">
                    <div>
                      <div className="mb-4 flex items-center gap-1">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            className="h-4 w-4 fill-amber-400 text-amber-400 transition-transform duration-300 ease-out group-hover:scale-110"
                            style={{ transitionDelay: `${starIndex * 40}ms` }}
                          />
                        ))}
                      </div>
                      <blockquote className="mb-8 text-sm leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
                        {testimonial.text}
                      </blockquote>
                    </div>
                    <figcaption>
                      <p className="text-sm font-bold text-blue-950 transition-colors duration-300 group-hover:text-brand-green">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-slate-400">
                        {testimonial.role}
                      </p>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Controls */}
        <Reveal delay={120}>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={!canGoBack}
              aria-label="Previous reviews"
              className="ml-press flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-gray-200 transition-all duration-300 hover:text-brand-green hover:ring-brand-green/40 hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                {Array.from({ length: pageCount }).map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    type="button"
                    onClick={() => setPage(dotIndex)}
                    aria-label={`Go to review page ${dotIndex + 1}`}
                    aria-current={dotIndex === page ? "true" : undefined}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      dotIndex === page
                        ? "w-6 bg-brand-green"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pageCount - 1, current + 1))
              }
              disabled={!canGoNext}
              aria-label="Next reviews"
              className="ml-press flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-gray-200 transition-all duration-300 hover:text-brand-green hover:ring-brand-green/40 hover:shadow-md disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

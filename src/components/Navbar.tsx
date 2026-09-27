"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { scrollToSection } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Personal Finance", target: "features" },
  { label: "Bills & Payments", target: "features" },
  { label: "Transactions", target: "features" },
  { label: "Budgeting", target: "features" },
  { label: "Reports", target: "features" },
  { label: "Resources", target: "features" },
  { label: "Pricing", target: "pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (y / scrollable) * 100) : 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /** Slides the hover pill behind whichever nav item the cursor is on. */
  const movePill = (event: React.MouseEvent<HTMLButtonElement>) => {
    const container = navRef.current?.getBoundingClientRect();
    if (!container) return;
    const item = event.currentTarget.getBoundingClientRect();
    setPill({ left: item.left - container.left, width: item.width, opacity: 1 });
  };

  const hidePill = () => setPill((current) => ({ ...current, opacity: 0 }));

  const go = (target: string) => {
    setMenuOpen(false);
    scrollToSection(target);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 lg:pt-5">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div
          className={`relative flex items-center justify-between gap-4 rounded-2xl border px-4 py-2.5 backdrop-blur-xl transition-all duration-500 ease-out sm:px-5 ${
            scrolled
              ? "border-gray-200/80 bg-white/85 py-2 shadow-[0_10px_34px_-18px_rgba(16,24,40,0.45)]"
              : "border-white/70 bg-white/60 shadow-[0_8px_30px_-22px_rgba(16,24,40,0.35)]"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute inset-0 rounded-lg bg-brand-green/20 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
              <Image
                src="/logo/logo.png"
                alt="MoneyLog Logo"
                width={32}
                height={32}
                className="relative h-8 w-8 rounded-lg object-contain transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
              />
            </span>
            <Image
              src="/logo/logo_text.png"
              alt="MoneyLog Text"
              width={120}
              height={32}
              className="hidden h-5 w-auto object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:translate-x-0.5 min-[360px]:block sm:h-6"
            />
          </Link>

          {/* Desktop nav with sliding hover pill */}
          <div
            ref={navRef}
            onMouseLeave={hidePill}
            className="relative hidden items-center xl:flex"
          >
            <span
              className="pointer-events-none absolute top-1/2 -z-0 h-9 -translate-y-1/2 rounded-full bg-gray-900/[0.06] transition-all duration-300 ease-out"
              style={{ left: pill.left, width: pill.width, opacity: pill.opacity }}
              aria-hidden="true"
            />
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onMouseEnter={movePill}
                onFocus={(event) => movePill(event as unknown as React.MouseEvent<HTMLButtonElement>)}
                onClick={() => go(item.target)}
                className="relative z-10 rounded-full px-3 py-2 text-[13px] font-medium whitespace-nowrap text-gray-600 transition-colors duration-300 hover:text-gray-900 focus:outline-none focus-visible:text-gray-900"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="ml-nav-link hidden px-2 text-sm font-semibold text-gray-700 transition-colors hover:text-gray-950 md:block"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="ml-shine ml-press group flex items-center justify-center gap-1.5 rounded-full bg-brand-green px-3 py-2 text-[13px] font-semibold whitespace-nowrap text-white shadow-[0_8px_20px_-10px_rgba(26,143,76,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-green-dark hover:shadow-[0_14px_28px_-12px_rgba(26,143,76,1)] sm:px-4 sm:text-sm"
            >
              Get Started Free
              <ArrowRight className="hidden h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 sm:block" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition-all duration-300 hover:bg-gray-900/5 active:scale-90 xl:hidden"
            >
              <span className="relative block h-5 w-5">
                <Menu
                  className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                    menuOpen ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                    menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Scroll progress rail */}
          <div className="pointer-events-none absolute inset-x-4 bottom-0 h-[2px] overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-green via-blue-500 to-brand-green transition-[width] duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`mt-2 origin-top overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-[0_18px_40px_-24px_rgba(16,24,40,0.55)] transition-all duration-500 ease-out xl:hidden ${
            menuOpen
              ? "max-h-[460px] scale-100 opacity-100"
              : "pointer-events-none max-h-0 scale-95 opacity-0"
          }`}
        >
          <div className="flex flex-col p-3">
            {NAV_ITEMS.map((item, index) => (
              <button
                key={item.label}
                onClick={() => go(item.target)}
                style={{ transitionDelay: menuOpen ? `${index * 45}ms` : "0ms" }}
                className={`rounded-xl px-3 py-3 text-left text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-50 hover:text-brand-green ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-xl px-3 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 md:hidden"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

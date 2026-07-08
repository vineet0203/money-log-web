"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { scrollToSection } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-sm py-4" : "bg-transparent py-6"}`}
    >
      <nav className="flex items-center justify-between px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/logo.png"
              alt="MoneyLog Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-contain"
            />
            <Image
              src="/logo/logo_text.png"
              alt="MoneyLog Text"
              width={120}
              height={32}
              className="h-6 w-auto object-contain mix-blend-multiply"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-black transition-colors">
            Home
          </button>
          <button onClick={() => scrollToSection('features')} className="hover:text-black transition-colors">
            Features
          </button>
        </div>

        <div className="flex items-center space-x-6">
          <Link
            href="/login"
            className="group flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-green hover:bg-brand-green-dark rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 shadow-sm"
          >
            Get Started
            <div className="ml-2 bg-white rounded-full p-0.5 transition-transform duration-200 group-hover:translate-x-1">
              <ArrowRight className="w-3 h-3 text-brand-green" />
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}

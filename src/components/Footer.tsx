"use client";

import Link from "next/link";
import { scrollToSection } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="bg-[#121316] py-6 px-8 text-center text-gray-400">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-6 text-base font-medium text-gray-300">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Home</button>
          <span className="text-gray-600">•</span>
          <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
        </div>
        
        <div className="text-sm text-gray-500 flex flex-wrap justify-center gap-x-4">
          <p>© 2026 MoneyLog. All Rights Reserved</p>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}

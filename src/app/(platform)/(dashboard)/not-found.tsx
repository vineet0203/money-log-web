"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import { useAppData } from '@/providers/AppDataProvider';

export default function NotFound() {
  const router = useRouter();
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("Page Not Found", "Looks like you've wandered into uncharted territory.");
  }, [setHeaderData]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 lg:py-12 px-4 lg:px-6">
      <div className="w-full max-w-4xl bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* 404 Illustration - Full Height/Width */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto min-h-[300px] bg-slate-50 shrink-0">
          <Image 
            src="/images/404-illustration.png"
            alt="Not Found Illustration"
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left p-6 md:p-8 lg:p-10 justify-center">
          <h1 className="text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-rose-400 mb-2 drop-shadow-sm tracking-tight">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
            We lost this page
          </h2>
          <p className="text-base md:text-lg font-medium text-slate-500 mb-8 max-w-md">
            The page you are looking for doesn't exist, has been moved, or you don't have permission to view it.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row w-full max-w-md gap-3">
            <button 
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            <Link 
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#159A1D] text-white text-sm font-bold shadow-sm hover:bg-[#118218] hover:shadow-md transition-all"
            >
              <Home size={18} />
              Dashboard
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}

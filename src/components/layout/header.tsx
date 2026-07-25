"use client";

import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useAppData } from '@/providers/AppDataProvider';
import { useRouter } from 'next/navigation';

export function Header() {
  const { title, description, canBack } = useAppData();
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 max-h-16">
      {/* Left side: Title & Description */}
      <div className="flex items-center gap-4">
        {canBack && (
          <button 
            onClick={() => router.back()}
            className="p-2 bg-white rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-0 text-sm md:text-base">{description}</p>
          )}
        </div>
      </div>

      {/* Right side: Actions (Desktop only) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Notification Button */}
        <button className="p-2 bg-white rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shadow-sm relative">
          <Bell size={20} />
          {/* Notification Dot */}
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#159A1D] rounded-full border-2 border-white" />
        </button>
      </div>
    </div>
  );
}

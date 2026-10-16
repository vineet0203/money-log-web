"use client";

import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useAppData } from '@/providers/AppDataProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUnreadNotificationsCount } from '@/hooks/queries/notifications';

export function Header() {
  const { title, description, canBack } = useAppData();
  const router = useRouter();
  const { data: unreadData } = useUnreadNotificationsCount();

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
        <Link 
          href="/notifications" 
          className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-xs relative flex items-center justify-center"
          title="Notifications"
        >
          <Bell size={18} />
          {unreadData?.unreadCount && unreadData.unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#159A1D] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadData.unreadCount > 9 ? '9+' : unreadData.unreadCount}
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  );
}

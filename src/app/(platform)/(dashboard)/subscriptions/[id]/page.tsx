"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { Play, Calendar, Clock, Repeat, Edit, Folder, Pencil, History } from 'lucide-react';
import { RemindersSettings } from '@/components/subscriptionpage/RemindersSettings';

export default function SubscriptionDetailsPage() {
  const { setHeaderData } = useAppData();
  const params = useParams();
  const id = params?.id as string;

  // Mock map to show the name based on the ID from the table
  const mockNames: Record<string, string> = {
    '1': 'Netflix',
    '2': 'Canva',
    '3': 'Amazon',
    '4': 'Zomato',
    '5': 'Flipkart',
    '6': 'Spotify',
  };

  const name = mockNames[id] || 'Unknown Subscription';

  useEffect(() => {
    setHeaderData(`#${id} ${name}`, "View and manage your subscription details.");
  }, [setHeaderData, id, name]);

  const OverviewRow = ({ icon: Icon, label, value, iconBg = "bg-[#EEF2F6]", iconColor = "text-[#637381]" }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 rounded-full ${iconBg} ${iconColor} flex items-center justify-center`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-slate-500 text-sm">{label}</span>
      </div>
      <span className="font-extrabold text-slate-800 text-sm">{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Header Card (Horizontal Layout) */}
      <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5 min-w-[200px]">
          <div className="w-16 h-16 rounded-2xl bg-[#E7F8F0] text-[#159A1D] flex items-center justify-center shadow-sm flex-shrink-0">
            <Play size={32} className="ml-1" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold text-slate-900">{name}</h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-extrabold text-[#159A1D]">$14.60</span>
              <span className="text-sm font-bold text-slate-400">/mo</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
          >
            <History size={16} />
            Payment History
          </button>
          <button 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#159A1D] text-white text-sm font-bold shadow-sm hover:bg-[#118218] transition-all whitespace-nowrap"
          >
            <Pencil size={16} />
            Edit Subscription
          </button>
        </div>
      </div>

      {/* Grid Layout for Overview and Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Main Details Card (Overview) */}
        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-extrabold text-slate-800 mb-2 px-1">Overview</h3>
          
          <div className="flex flex-col px-1">
            <OverviewRow 
              icon={Calendar} 
              label="Started Date" 
              value="2026-06-05" 
              iconBg="bg-blue-50" 
              iconColor="text-blue-500" 
            />
            <OverviewRow 
              icon={Clock} 
              label="Next Bill" 
              value="2026-07-05" 
              iconBg="bg-orange-50" 
              iconColor="text-orange-500" 
            />
            <OverviewRow 
              icon={Repeat} 
              label="Billing Cycle" 
              value="Monthly" 
              iconBg="bg-emerald-50" 
              iconColor="text-emerald-500" 
            />
            <OverviewRow 
              icon={Edit} 
              label="Source" 
              value="Manual" 
              iconBg="bg-purple-50" 
              iconColor="text-purple-500" 
            />
            <OverviewRow 
              icon={Folder} 
              label="Category" 
              value="Entertainment" 
              iconBg="bg-indigo-50" 
              iconColor="text-indigo-500" 
            />
          </div>
        </div>

        {/* Reminders Settings Component */}
        <div className="w-full">
          <RemindersSettings />
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface SubscriptionStatCardProps {
  title: string;
  value: string;
}

export function SubscriptionStatCard({ title, value }: SubscriptionStatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#159A1D] flex items-center justify-center flex-shrink-0">
        <div className="relative flex items-center justify-center">
          <RefreshCw className="text-white" size={28} />
          <span className="absolute text-white font-bold text-sm">$</span>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="text-4xl font-black text-[#159A1D] mt-1 leading-none">{value}</p>
      </div>
    </div>
  );
}

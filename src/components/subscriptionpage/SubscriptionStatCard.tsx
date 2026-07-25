import React from 'react';
import { RefreshCw } from 'lucide-react';

interface SubscriptionStatCardProps {
  title: string;
  value: string;
  theme?: 'green' | 'blue' | 'red' | 'orange';
}

export function SubscriptionStatCard({ title, value, theme = 'green' }: SubscriptionStatCardProps) {
  let bgClass = 'bg-[#159A1D]';
  let textClass = 'text-[#159A1D]';

  if (theme === 'blue') {
    bgClass = 'bg-blue-500';
    textClass = 'text-blue-500';
  } else if (theme === 'red') {
    bgClass = 'bg-red-500';
    textClass = 'text-red-500';
  } else if (theme === 'orange') {
    bgClass = 'bg-[#F59E0B]'; // amber-500 which is a nice yellowish-orange
    textClass = 'text-[#F59E0B]';
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <div className="relative flex items-center justify-center">
          <RefreshCw className="text-white" size={24} />
          <span className="absolute text-white font-bold text-sm">$</span>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className={`text-4xl font-black mt-1 leading-none ${textClass}`}>{value}</p>
      </div>
    </div>
  );
}

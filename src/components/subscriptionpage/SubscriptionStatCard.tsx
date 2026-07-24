import React from 'react';
import { RefreshCw } from 'lucide-react';

interface SubscriptionStatCardProps {
  title: string;
  value: string;
  theme?: 'green' | 'blue' | 'red';
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
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <div className="relative flex items-center justify-center">
          <RefreshCw className="text-white" size={28} />
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

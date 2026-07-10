import React from 'react';
import { RefreshCw } from 'lucide-react';

interface DailyExpenseStatCardProps {
  title: string;
  value: string;
  valueColor?: string; // e.g., 'text-[#159A1D]' or 'text-slate-900'
  percentChange: string;
  percentColor: string; // e.g., 'text-red-500'
  subtext: string;
  icon?: React.ReactNode;
}

export function DailyExpenseStatCard({ 
  title, 
  value, 
  valueColor = 'text-[#159A1D]', 
  percentChange, 
  percentColor, 
  subtext,
  icon
}: DailyExpenseStatCardProps) {
  return (
    <div className="bg-white rounded-[20px] p-4 xl:p-6 shadow-sm border border-slate-100 flex items-center gap-3 xl:gap-5 overflow-hidden">
      {/* Icon squircle */}
      <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-[14px] xl:rounded-[18px] bg-[#159A1D] flex items-center justify-center shrink-0">
        {icon ? icon : <RefreshCw className="w-6 h-6 xl:w-7 xl:h-7 text-white" />}
      </div>

      <div className="flex flex-col gap-1 overflow-hidden">
        <h3 className="text-slate-900 font-bold text-xs xl:text-sm tracking-tight truncate">{title}</h3>
        <p className={`text-xl lg:text-lg xl:text-2xl 2xl:text-3xl font-black tracking-tight leading-none truncate ${valueColor}`}>
          {value}
        </p>
        <div className="flex items-center gap-1 mt-1 text-[10px] xl:text-xs font-semibold truncate">
          <span className={percentColor}>{percentChange}</span>
          <span className="text-slate-500 truncate">{subtext}</span>
        </div>
      </div>
    </div>
  );
}

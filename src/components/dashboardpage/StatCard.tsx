import React from 'react';

interface StatCardProps {
  title: string;
  amount: string;
  amountColor?: string;
  metrics: {
    label: string;
    value: string;
    valueColor?: string;
  }[];
}

export function StatCard({ title, amount, amountColor = "text-[#159A1D]", metrics }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between h-full min-h-[140px]">
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{title}</p>
        <h2 className={`text-2xl font-bold mt-1 ${amountColor}`}>{amount}</h2>
      </div>
      
      <div className={`grid grid-cols-${metrics.length} gap-2 mt-4 pt-4 border-t border-slate-100`}>
        {metrics.map((metric, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${idx !== metrics.length - 1 ? 'border-r border-slate-100' : ''} ${idx !== 0 ? 'pl-2 lg:pl-4' : ''}`}
          >
            <span className="text-[10px] text-slate-400">{metric.label}</span>
            <span className={`text-sm font-semibold ${metric.valueColor || 'text-slate-800'}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

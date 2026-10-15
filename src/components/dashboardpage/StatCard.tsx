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
  const gridColsClass = metrics.length === 2 ? 'grid-cols-2' : metrics.length === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col justify-between min-w-0 h-full min-h-[140px]">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">{title}</p>
        <h2 className={`text-xl sm:text-2xl font-bold mt-1 truncate ${amountColor}`}>{amount}</h2>
      </div>
      
      <div className={`grid ${gridColsClass} gap-1 mt-4 pt-3 border-t border-slate-100`}>
        {metrics.map((metric, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col min-w-0 ${idx !== metrics.length - 1 ? 'border-r border-slate-100 pr-1.5' : ''} ${idx !== 0 ? 'px-1.5' : ''}`}
          >
            <span className="text-[10px] text-slate-400 truncate">{metric.label}</span>
            <span className={`text-xs font-semibold truncate ${metric.valueColor || 'text-slate-800'}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

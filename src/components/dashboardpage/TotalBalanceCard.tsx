import React from 'react';

export function TotalBalanceCard({ data }: { data?: { total: number, cash: number, creditDebt: number } }) {
  const format = (val: number) => Math.abs(val).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <div className="bg-[#159A1D] rounded-xl p-4 sm:p-5 text-white shadow-xs flex flex-col justify-between min-w-0 h-full min-h-[140px]">
      <div className="min-w-0">
        <p className="text-xs font-medium text-white/80 uppercase tracking-wide truncate">Total Balance</p>
        <h2 className="text-xl sm:text-2xl font-bold mt-1 truncate">
          {data ? (data.total < 0 ? '-' : '') + format(data.total) : '$0.00'}
        </h2>
      </div>
      
      <div className="grid grid-cols-2 gap-1 mt-4 pt-3 border-t border-white/20">
        <div className="flex flex-col min-w-0 border-r border-white/20 pr-1.5">
          <span className="text-[10px] text-white/80 truncate">Cash</span>
          <span className="text-xs font-semibold truncate">{data ? format(data.cash) : '$0.00'}</span>
        </div>
        
        <div className="flex flex-col min-w-0 pl-1.5">
          <span className="text-[10px] text-white/80 truncate">Credit debt</span>
          <span className="text-xs font-semibold truncate">
            {data ? (data.creditDebt > 0 ? '-' : '') + format(data.creditDebt) : '$0.00'}
          </span>
        </div>
      </div>
    </div>
  );
}

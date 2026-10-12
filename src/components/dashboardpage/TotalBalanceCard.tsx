import React from 'react';

export function TotalBalanceCard({ data }: { data?: { total: number, cash: number, creditDebt: number } }) {
  const format = (val: number) => Math.abs(val).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const isNeg = (val: number) => val < 0;
  return (
    <div className="bg-[#159A1D] rounded-xl p-5 text-white shadow-sm flex flex-col justify-between h-full min-h-[140px]">
      <div>
        <p className="text-xs font-medium text-white/80 uppercase tracking-wide">Total Balance</p>
        <h2 className="text-3xl font-bold mt-1">{data ? (data.total < 0 ? '-' : '') + format(data.total) : '$0.00'}</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/20">
        <div className="flex flex-col border-r border-white/20">
          <span className="text-[10px] text-white/80">Cash</span>
          <span className="text-sm font-semibold">{data ? format(data.cash) : '$0.00'}</span>
        </div>
        
        <div className="flex flex-col pl-2">
          <span className="text-[10px] text-white/80">Credit debt</span>
          <span className="text-sm font-semibold">{data ? (data.creditDebt > 0 ? '-' : '') + format(data.creditDebt) : '$0.00'}</span>
        </div>
      </div>
    </div>
  );
}

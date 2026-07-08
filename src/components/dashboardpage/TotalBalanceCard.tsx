import React from 'react';

export function TotalBalanceCard() {
  return (
    <div className="bg-[#159A1D] rounded-xl p-5 text-white shadow-sm flex flex-col justify-between h-full min-h-[140px]">
      <div>
        <p className="text-xs font-medium text-white/80 uppercase tracking-wide">Total Balance</p>
        <h2 className="text-3xl font-bold mt-1">$84,320.50</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
        <div className="flex flex-col border-r border-white/20">
          <span className="text-[10px] text-white/80">Cash</span>
          <span className="text-sm font-semibold">$12,450</span>
        </div>
        <div className="flex flex-col border-r border-white/20 pl-2">
          <span className="text-[10px] text-white/80">Investments</span>
          <span className="text-sm font-semibold">$76,200</span>
        </div>
        <div className="flex flex-col pl-2">
          <span className="text-[10px] text-white/80">Credit debt</span>
          <span className="text-sm font-semibold">-$4,329</span>
        </div>
      </div>
    </div>
  );
}

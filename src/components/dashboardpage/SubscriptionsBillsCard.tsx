import React from 'react';

interface SubData {
  name: string;
  next_billing_date: string;
  amount: number;
  type: string;
}

export function SubscriptionsBillsCard({ count = 0, items = [] }: { count?: number, items?: SubData[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 h-full min-h-[140px] flex flex-col justify-center items-center text-slate-400 min-w-0">
        <p className="text-xs sm:text-sm font-medium">No upcoming subscriptions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 h-full flex flex-col justify-between min-w-0">
      <div className="mb-3 min-w-0">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate">Subscriptions &amp; bills</p>
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1 truncate">
          {count} {count === 1 ? 'due this week' : 'due this week'}
        </h3>
      </div>

      <div className="flex-1 flex flex-col gap-2.5 sm:gap-3">
        {items.slice(0, 3).map((bill, idx) => (
          <div key={idx} className="flex justify-between items-center gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${bill.type === 'income' ? 'bg-[#159A1D]' : 'bg-rose-500'}`}></span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{bill.name}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {`${bill.type === 'income' ? 'Expected' : 'Due'} ${new Date(bill.next_billing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-xs font-semibold text-slate-800">
                {`${bill.type === 'income' ? '+' : '-'}$${parseFloat(bill.amount as any).toFixed(2)}`}
              </span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                bill.type === 'income' ? 'text-[#159A1D] bg-emerald-50' : 'text-amber-700 bg-amber-50'
              }`}>
                {bill.type === 'income' ? 'Expected' : 'Due soon'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

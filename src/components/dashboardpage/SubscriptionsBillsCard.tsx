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
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col justify-center items-center text-slate-500">
        <p>No upcoming subscriptions.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Subscriptions & bills</p>
        <h3 className="text-lg font-bold text-slate-800 mt-1">{count} {count === 1 ? 'due/expected this week' : 'due/expected this week'}</h3>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {items.slice(0, 3).map((bill, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <div className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-2 ${bill.type === 'income' ? 'bg-[#159A1D]' : 'bg-red-500'}`}></span>
              <div>
                <p className="text-sm font-medium text-slate-800">{bill.name}</p>
                <p className="text-xs text-slate-500">{`${bill.type === 'income' ? 'Expected' : 'Due'} ${new Date(bill.next_billing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-slate-800">{`${bill.type === 'income' ? '+' : '-'}${parseFloat(bill.amount as any).toFixed(2)}`}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${bill.type === 'income' ? 'text-[#159A1D] bg-green-50' : 'text-orange-600 bg-orange-50'}`}>
                {bill.type === 'income' ? 'Expected soon' : 'Due soon'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

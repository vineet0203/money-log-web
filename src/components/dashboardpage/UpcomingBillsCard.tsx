import React from 'react';

export function UpcomingBillsCard() {
  const bills = [
    { name: 'Netflix', date: 'Jul 1', amount: '$15.99' },
    { name: 'Electricity', date: 'Jul 2', amount: '$84.20' },
    { name: 'Internet', date: 'Jul 4', amount: '$59.99' },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full min-h-[140px]">
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Upcoming Bills</p>
        <h3 className="text-lg font-bold text-slate-800 mt-1">3 due this week</h3>
      </div>
      
      <div className="mt-4 space-y-1 flex-1 flex flex-col justify-end">
        {bills.map((bill, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <span className="text-slate-600">
              {bill.name} <span className="text-slate-400 text-xs ml-1">• {bill.date}</span>
            </span>
            <span className="font-medium text-slate-800">{bill.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

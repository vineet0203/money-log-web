import React from 'react';

const bills = [
  { name: 'Netflix', date: 'Due Jul 1', amount: '$15.99', status: 'Due soon', statusColor: 'text-orange-600 bg-orange-50', dotColor: 'bg-red-500' },
  { name: 'Electricity', date: 'Due Jul 2', amount: '$84.20', status: 'Due soon', statusColor: 'text-orange-600 bg-orange-50', dotColor: 'bg-orange-400' },
  { name: 'Internet', date: 'Due Jul 4', amount: '$59.99', status: 'Upcoming', statusColor: 'text-[#159A1D] bg-green-50', dotColor: 'bg-blue-500' },
];

export function SubscriptionsBillsCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col mt-6">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-800">Subscriptions & bills</h3>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {bills.map((bill, idx) => (
          <div key={idx} className="flex justify-between items-center">
            <div className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-2 ${bill.dotColor}`}></span>
              <div>
                <p className="text-sm font-medium text-slate-800">{bill.name}</p>
                <p className="text-xs text-slate-500">{bill.date}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-slate-800">{bill.amount}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${bill.statusColor}`}>
                {bill.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

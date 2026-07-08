import React from 'react';

const transactions = [
  { name: 'Salary deposit', subtitle: 'Income · Today', amount: '+$3,200', type: 'income', color: 'bg-green-100' },
  { name: 'Blue Bottle Coffee', subtitle: 'Food & drink · Today', amount: '-$6.80', type: 'expense', color: 'bg-orange-100' },
  { name: 'Amazon', subtitle: 'Shopping · Yesterday', amount: '-$54.99', type: 'expense', color: 'bg-blue-100' },
  { name: 'Spotify', subtitle: 'Subscription · Jun 27', amount: '-$9.99', type: 'expense', color: 'bg-pink-100' },
  { name: 'Electric bill', subtitle: 'Utilities · Jun 26', amount: '-$84.20', type: 'expense', color: 'bg-purple-100' },
];

export function RecentTransactionsCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Recent transactions</h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View all
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {transactions.map((tx, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${tx.color} flex-shrink-0`}></div>
              <div>
                <p className="text-sm font-medium text-slate-800">{tx.name}</p>
                <p className="text-xs text-slate-500">{tx.subtitle}</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-[#159A1D]' : 'text-[#EF4444]'}`}>
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

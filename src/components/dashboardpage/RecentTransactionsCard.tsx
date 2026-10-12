import React from 'react';
import { useRouter } from 'next/navigation';

export function RecentTransactionsCard({ transactions = [] }: { transactions?: any[] }) {
  const router = useRouter();
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col justify-center items-center text-slate-500">
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">Recent transactions</h3>
        <button onClick={() => router.push('/transactions')} className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View all
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {transactions.map((tx, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex-shrink-0"
                style={{ backgroundColor: tx.icon_bg_color || '#e2e8f0' }}
              ></div>
              <div>
                <p className="text-sm font-medium text-slate-800">{tx.title}</p>
                <p className="text-xs text-slate-500">{`${tx.category_name || 'Uncategorized'} • ${new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</p>
              </div>
            </div>
            <span className={`text-sm font-medium ${tx.type === 'income' ? 'text-[#159A1D]' : 'text-[#EF4444]'}`}>
              {(tx.type === 'income' ? '+' : '-') + '$' + parseFloat(tx.amount).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

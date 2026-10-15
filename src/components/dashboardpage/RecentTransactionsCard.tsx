import React from 'react';
import { useRouter } from 'next/navigation';

export function RecentTransactionsCard({ transactions = [] }: { transactions?: any[] }) {
  const router = useRouter();
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 h-full min-h-[220px] flex flex-col justify-center items-center text-slate-400 min-w-0">
        <p className="text-xs sm:text-sm font-medium">No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 h-full flex flex-col justify-between min-w-0">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">Recent transactions</h3>
          <button 
            type="button"
            onClick={() => router.push('/transactions')} 
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors shrink-0"
          >
            View all
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {transactions.map((tx, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div 
                  className="w-9 h-9 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: tx.icon_bg_color || '#e2e8f0' }}
                ></div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{tx.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{`${tx.category_name || 'Uncategorized'} • ${new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</p>
                </div>
              </div>
              <span className={`text-xs sm:text-sm font-bold shrink-0 text-right ${tx.type === 'income' ? 'text-[#159A1D]' : 'text-[#EF4444]'}`}>
                {(tx.type === 'income' ? '+' : '-') + '$' + parseFloat(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

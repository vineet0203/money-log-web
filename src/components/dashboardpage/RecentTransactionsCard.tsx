import React from 'react';
import { useRouter } from 'next/navigation';

const colorPalette = [
  { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
  { bg: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  { bg: 'bg-purple-50 text-purple-700 border-purple-200/60' },
  { bg: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  { bg: 'bg-rose-50 text-rose-700 border-rose-200/60' },
  { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' },
  { bg: 'bg-teal-50 text-teal-700 border-teal-200/60' },
  { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/60' },
];

function getBadgeProps(tx: any) {
  const initial = (tx.title || tx.category_name || '?').trim().charAt(0).toUpperCase();

  if (tx.category_color) {
    return {
      initial,
      style: {
        backgroundColor: `${tx.category_color}18`,
        color: tx.category_color,
        borderColor: `${tx.category_color}35`,
      },
      className: 'border',
    };
  }

  const text = (tx.title || tx.category_name || '?').trim();
  const charCode = text.charCodeAt(0) || 0;
  const palette = colorPalette[charCode % colorPalette.length];
  return {
    initial,
    className: `${palette.bg} border`,
  };
}

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
          {transactions.map((tx, idx) => {
            const badge = getBadgeProps(tx);
            return (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 uppercase select-none ${badge.className || ''}`}
                    style={badge.style}
                  >
                    {badge.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">{tx.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{`${tx.category_name || 'Uncategorized'} • ${new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</p>
                  </div>
                </div>
                <span className={`text-xs sm:text-sm font-bold shrink-0 text-right ${tx.type === 'income' ? 'text-[#159A1D]' : 'text-[#EF4444]'}`}>
                  {(tx.type === 'income' ? '+' : '-') + '$' + parseFloat(tx.amount).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

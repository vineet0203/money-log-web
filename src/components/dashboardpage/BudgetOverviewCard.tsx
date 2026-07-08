import React from 'react';

const budgets = [
  { category: 'Housing', spent: 1200, total: 1400, color: 'bg-[#3B82F6]' },
  { category: 'Food & drink', spent: 420, total: 600, color: 'bg-[#10B981]' },
  { category: 'Transport', spent: 310, total: 350, color: 'bg-[#F59E0B]' },
  { category: 'Entertainment', spent: 180, total: 200, color: 'bg-[#EF4444]' },
  { category: 'Subscriptions', spent: 65, total: 120, color: 'bg-[#6366F1]' },
  { category: 'Shopping', spent: 290, total: 400, color: 'bg-[#F97316]' },
];

export function BudgetOverviewCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800">Budget overview</h3>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
          June 2026
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        {budgets.map((budget, idx) => {
          const percentage = Math.min(100, Math.round((budget.spent / budget.total) * 100));
          return (
            <div key={idx}>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-700">{budget.category}</span>
                <span className="text-xs text-slate-500 font-medium">
                  ${budget.spent.toLocaleString()} / ${budget.total.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full ${budget.color} rounded-full`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';

interface BudgetData {
  category: string;
  spent: number;
  total: number;
  color: string;
}

export function BudgetOverviewCard({ budgets = [] }: { budgets?: BudgetData[] }) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 h-full flex flex-col justify-between min-w-0">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">Budget overview</h3>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-4 mt-2">
          {(!budgets || budgets.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6 min-h-[140px]">
              <p className="text-xs sm:text-sm font-medium">No spending or limits this month.</p>
            </div>
          ) : (
            budgets.map((budget, idx) => {
              const hasLimit = budget.total > 0;
              const percentage = hasLimit ? Math.min(100, Math.round((budget.spent / budget.total) * 100)) : (budget.spent > 0 ? 100 : 0);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 truncate min-w-0">{budget.category}</span>
                    <span className="text-slate-500 font-semibold shrink-0 ml-2">
                      ${parseFloat(budget.spent as any).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                      {hasLimit ? ` / $${parseFloat(budget.total as any).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ' (No limit)'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${(!budget.color || budget.color.startsWith('#')) ? '' : budget.color}`} 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: (budget.color && budget.color.startsWith('#')) ? budget.color : (!budget.color ? '#3B82F6' : undefined)
                      }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

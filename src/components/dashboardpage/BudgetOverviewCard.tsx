import React from 'react';

interface BudgetData {
  category: string;
  spent: number;
  total: number;
  color: string;
}

export interface BudgetHealthRollup {
  overLimit: number;
  nearLimit: number;
  totalBudget: number;
  totalSpent: number;
  totalTracked?: number;
}

interface BudgetOverviewCardProps {
  budgets?: BudgetData[];
  budgetHealth?: BudgetHealthRollup;
}

export function BudgetOverviewCard({ budgets = [], budgetHealth }: BudgetOverviewCardProps) {
  const hasTrackedBudgets = (budgets && budgets.length > 0) || (budgetHealth && budgetHealth.totalBudget > 0);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 h-full flex flex-col justify-between min-w-0">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">Budget Overview</h3>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg shrink-0">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Budget Health Roll-up Summary per Implementation Plan §3A.1 */}
        {budgetHealth && (budgetHealth.totalBudget > 0 || budgetHealth.totalSpent > 0) && (
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              {budgetHealth.overLimit > 0 ? (
                <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full text-[11px]">
                  {budgetHealth.overLimit} over limit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-[#159A1D] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[11px]">
                  All limits on track
                </span>
              )}
              {budgetHealth.nearLimit > 0 && (
                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full text-[11px]">
                  {budgetHealth.nearLimit} near limit
                </span>
              )}
            </div>

            <div className="text-[11px] font-semibold text-slate-500 font-mono">
              ${budgetHealth.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-slate-400 font-normal"> of </span>
              ${budgetHealth.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col gap-4 mt-2">
          {!hasTrackedBudgets ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6 min-h-[140px]">
              <p className="text-xs sm:text-sm font-medium">No spending or limits set this month.</p>
            </div>
          ) : (
            budgets.map((budget, idx) => {
              const hasLimit = budget.total > 0;
              const percentage = hasLimit
                ? Math.min(100, Math.round((budget.spent / budget.total) * 100))
                : budget.spent > 0 ? 100 : 0;
              const isOver = hasLimit && budget.spent > budget.total;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 truncate min-w-0">
                      {budget.category}
                    </span>
                    <span className={`font-mono text-xs font-semibold shrink-0 ml-2 ${isOver ? 'text-rose-600' : 'text-slate-500'}`}>
                      ${parseFloat(budget.spent as any).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      {hasLimit ? (
                        <span className="text-slate-400 font-normal"> / ${parseFloat(budget.total as any).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-normal"> (No limit)</span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? 'bg-rose-500' : (!budget.color || budget.color.startsWith('#') ? '' : budget.color)
                      }`}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: isOver
                          ? '#EF4444'
                          : budget.color && budget.color.startsWith('#')
                          ? budget.color
                          : !budget.color
                          ? '#159A1D'
                          : undefined,
                      }}
                    />
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

export default BudgetOverviewCard;

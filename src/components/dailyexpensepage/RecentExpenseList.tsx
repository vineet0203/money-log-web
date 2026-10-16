"use client";

import React from 'react';
import Link from 'next/link';
import { useGetMonthlyReport } from '@/hooks/queries/reports';
import { Skeleton } from '@/components/ui/Skeleton';

interface RecentExpenseListProps {
  year?: number | string;
  month?: number | string;
}

export function RecentExpenseList({ year, month }: RecentExpenseListProps) {
  const { data: report, isLoading } = useGetMonthlyReport({ year, month });
  const categories = report?.categoryBreakdown || [];
  const totalExpense = report?.totalExpense || 0;

  if (isLoading) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="text" width="20%" height={16} />
        </div>
        <div className="space-y-4 flex-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <Skeleton variant="text" width="35%" height={16} />
              <Skeleton variant="text" width="25%" height={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Expenses by Category</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Distribution breakdown</p>
        </div>
        <Link
          href="/settings/categories"
          className="text-[#159A1D] text-xs font-bold hover:underline"
        >
          Manage
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs font-semibold text-slate-400">No category expenses recorded</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
          {categories.map((item, index) => {
            const amount = Number(item.total_amount || 0);
            const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

            return (
              <div key={item.category_id || index} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.category_color || '#ef4444' }}
                    />
                    <span className="font-bold text-[#4F627A] text-sm">
                      {item.category_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#849AB4] font-medium text-xs">
                      ${amount.toFixed(2)}
                    </span>
                    <span className="text-slate-900 font-extrabold text-xs w-10 text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
                {index < categories.length - 1 && (
                  <div className="h-px w-full bg-slate-100 mt-3" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

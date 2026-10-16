"use client";

import React from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { useGetBreakdownReport } from '@/hooks/queries/reports';

interface BalanceSummaryListProps {
  fromDate?: string;
  toDate?: string;
  income?: number;
  expense?: number;
  balance?: number;
  highestExpense?: number;
  isLoading?: boolean;
}

export function BalanceSummaryList({
  fromDate,
  toDate,
  isLoading = false,
}: BalanceSummaryListProps) {
  const { data: breakdownData, isLoading: breakdownLoading } = useGetBreakdownReport({
    dimension: 'category',
    fromDate,
    toDate,
  });

  const loading = isLoading || breakdownLoading;

  if (loading) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px] justify-between">
        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" width="50%" height={24} />
          <Skeleton variant="text" width="20%" height={16} />
        </div>
        <div className="space-y-4 my-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <Skeleton variant="text" width="40%" height={16} />
              <Skeleton variant="text" width="30%" height={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = breakdownData?.items || [];

  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Category Breakdown</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Period spending by category</p>
        </div>
        <Link
          href="/settings/categories"
          className="text-[#159A1D] text-xs font-bold hover:underline"
        >
          Manage
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <p className="text-xs font-semibold text-slate-400">No category transactions for this period</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {items.slice(0, 6).map((item, index) => (
            <div key={item.key || index} className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || '#94a3b8' }}
                  />
                  <span className="font-semibold text-slate-700 text-xs sm:text-sm truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    ${Number(item.current || 0).toFixed(2)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 w-9 text-right">
                    {item.share}%
                  </span>
                </div>
              </div>
              {index < Math.min(items.length, 6) - 1 && (
                <div className="h-px w-full bg-slate-100 mt-3" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

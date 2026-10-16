"use client";

import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

interface BalanceSummaryListProps {
  income?: number;
  expense?: number;
  balance?: number;
  highestExpense?: number;
  isLoading?: boolean;
}

export function BalanceSummaryList({
  income = 0,
  expense = 0,
  balance = 0,
  highestExpense = 0,
  isLoading = false,
}: BalanceSummaryListProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px] justify-between">
        <Skeleton variant="text" width="50%" height={24} />
        <div className="space-y-4 my-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <Skeleton variant="text" width="40%" height={16} />
              <Skeleton variant="text" width="30%" height={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = [
    {
      label: 'Money In (Income)',
      value: `+$${Number(income).toFixed(2)}`,
      color: 'text-[#159A1D]',
    },
    {
      label: 'Money Out (Expenses)',
      value: `-$${Number(expense).toFixed(2)}`,
      color: 'text-red-500',
    },
    {
      label: 'Net Balance Flow',
      value: `${balance >= 0 ? '+' : '-'}$${Math.abs(Number(balance)).toFixed(2)}`,
      color: balance >= 0 ? 'text-[#159A1D]' : 'text-slate-900',
    },
    {
      label: 'Highest Single Expense',
      value: `-$${Number(highestExpense).toFixed(2)}`,
      color: 'text-slate-700',
    },
  ];

  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Balance Summary</h2>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Period totals</p>
      </div>

      <div className="flex flex-col flex-1 justify-between pb-2">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center justify-between py-2.5">
              <span className="font-bold text-slate-700 text-sm">{item.label}</span>
              <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
            </div>
            {index < items.length - 1 && <div className="h-px w-full bg-slate-100" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

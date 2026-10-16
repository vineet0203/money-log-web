"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useGetMonthlyReport } from '@/hooks/queries/reports';
import { Skeleton } from '@/components/ui/Skeleton';

const fallbackColors = ['#159A1D', '#14b8a6', '#0ea5e9', '#6366f1', '#ec4899', '#f59e0b', '#84cc16'];

interface IncomeBySourceChartProps {
  year?: number | string;
  month?: number | string;
}

export function IncomeBySourceChart({ year, month }: IncomeBySourceChartProps) {
  const { data: report, isLoading } = useGetMonthlyReport({ year, month });
  const categories = report?.incomeCategoryBreakdown || [];
  const totalIncome = Number(report?.totalIncome || 0);

  if (isLoading) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
        <Skeleton variant="text" width="40%" height={24} className="mb-6" />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton variant="circular" width={180} height={180} />
        </div>
      </div>
    );
  }

  const chartData = categories.map((cat, idx) => ({
    name: cat.category_name,
    value: Number(cat.total_amount || 0),
    color: cat.category_color || fallbackColors[idx % fallbackColors.length],
  }));

  const hasData = chartData.length > 0 && totalIncome > 0;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Income by Category</h2>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Inflow distribution</p>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-32 h-32 rounded-full border-4 border-slate-100 flex items-center justify-center mb-2">
            <span className="text-sm font-bold text-slate-400">$0.00</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-1">No income data for this period</p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between gap-4 min-h-0">
          {/* Donut Chart */}
          <div className="relative w-[50%] h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Total Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400">Total</span>
              <span className="text-lg font-extrabold text-slate-900">
                ${totalIncome.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-[48%] flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 max-h-[220px]">
            {chartData.map((item, index) => {
              const pct = totalIncome > 0 ? Math.round((item.value / totalIncome) * 100) : 0;
              return (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useGetSeriesReport } from '@/hooks/queries/reports';
import { SkeletonChart } from '@/components/ui/Skeleton';

interface ExpenseTrendChartProps {
  from?: string;
  to?: string;
}

export function ExpenseTrendChart({ from, to }: ExpenseTrendChartProps) {
  const now = new Date();
  let defaultFrom = from;
  let defaultTo = to;

  if (!defaultFrom || !defaultTo) {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    defaultTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  const { data: seriesData, isLoading } = useGetSeriesReport({
    metric: 'expense',
    from: defaultFrom,
    to: defaultTo,
  });

  const points = seriesData?.points || [];
  const changePct = seriesData?.change_pct ?? null;
  const isIncrease = (changePct ?? 0) > 0;
  const hasData = points.some((p) => p.amount > 0);

  if (isLoading) {
    return <SkeletonChart />;
  }

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Expense Trend</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Daily spending analysis</p>
        </div>
        <div className="text-right">
          {changePct !== null && (
            <div
              className={`flex items-center gap-1 text-sm font-bold justify-end ${
                isIncrease ? 'text-red-500' : 'text-[#159A1D]'
              }`}
            >
              {isIncrease ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(changePct).toFixed(2)}%
              <span className="text-[11px] font-medium text-slate-400">vs prev</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              No expenses recorded for this period
            </span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Expense']}
              itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
              labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 3, fill: '#ef4444' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useGetBreakdownReport } from '@/hooks/queries/reports';
import { SkeletonChart } from '@/components/ui/Skeleton';

interface ExpenseDayOfWeekChartProps {
  from?: string;
  to?: string;
}

export function ExpenseDayOfWeekChart({ from, to }: ExpenseDayOfWeekChartProps) {
  const { data, isLoading } = useGetBreakdownReport({
    dimension: 'day_of_week',
    from,
    to,
    type: 'expense',
  });

  if (isLoading) {
    return <SkeletonChart />;
  }

  const items = data?.items || [];
  const chartData = items.map((item) => ({
    name: item.label.substring(0, 3),
    fullName: item.label,
    amount: item.current,
    share: item.share,
  }));

  const hasData = chartData.some((d) => d.amount > 0);
  const maxAmount = Math.max(...chartData.map((d) => d.amount), 0);

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Spending Pattern</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Day of week distribution</p>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              No expenses recorded for this period
            </span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
              dy={8}
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
              formatter={(value: any, name: any, props: any) => [
                `$${Number(value || 0).toFixed(2)} (${props.payload.share}%)`,
                'Expenses',
              ]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.amount === maxAmount && maxAmount > 0 ? '#159A1D' : '#94a3b8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

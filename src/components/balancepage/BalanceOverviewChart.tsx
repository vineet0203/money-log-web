"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, ChevronDown } from 'lucide-react';
import { useGetSeriesReport } from '@/hooks/queries/reports';
import { SkeletonChart } from '@/components/ui/Skeleton';

interface BalanceOverviewChartProps {
  from?: string;
  to?: string;
}

export function BalanceOverviewChart({ from, to }: BalanceOverviewChartProps) {
  const [periodFilter, setPeriodFilter] = useState<'this_month' | 'last_30' | 'this_year'>('this_month');

  // Derive date bounds if custom from/to not supplied
  const now = new Date();
  let defaultFrom = from;
  let defaultTo = to;

  if (!defaultFrom || !defaultTo) {
    if (periodFilter === 'this_year') {
      defaultFrom = `${now.getFullYear()}-01-01`;
      defaultTo = `${now.getFullYear()}-12-31`;
    } else {
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      defaultTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }
  }

  const { data: seriesData, isLoading } = useGetSeriesReport({
    metric: 'net',
    from: defaultFrom,
    to: defaultTo,
  });

  const points = seriesData?.points || [];
  const changePct = seriesData?.change_pct ?? null;
  const isPositive = (changePct ?? 0) >= 0;
  const hasData = points.some((p) => p.amount !== 0);

  if (isLoading) {
    return <SkeletonChart />;
  }

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Balance Overview</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Net Cash Flow Trend</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {changePct !== null && (
            <div
              className={`flex items-center gap-1 text-sm font-bold ${
                isPositive ? 'text-[#159A1D]' : 'text-red-500'
              }`}
            >
              {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {Math.abs(changePct).toFixed(2)}%
              <span className="text-[11px] font-medium text-slate-400">vs prev</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0 mt-2 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              No transactions recorded for this period
            </span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#159A1D" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#159A1D" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Net Flow']}
              labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#159A1D"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

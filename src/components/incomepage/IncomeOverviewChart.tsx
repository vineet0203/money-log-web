"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useGetSeriesReport } from '@/hooks/queries/reports';
import { SkeletonChart } from '@/components/ui/Skeleton';

interface IncomeOverviewChartProps {
  from?: string;
  to?: string;
}

export function IncomeOverviewChart({ from, to }: IncomeOverviewChartProps) {
  const now = new Date();
  let defaultFrom = from;
  let defaultTo = to;

  if (!defaultFrom || !defaultTo) {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    defaultFrom = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    defaultTo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  }

  const { data: seriesData, isLoading } = useGetSeriesReport({
    metric: 'income',
    from: defaultFrom,
    to: defaultTo,
  });

  const points = seriesData?.points || [];
  const changePct = seriesData?.change_pct ?? null;
  const isPositive = (changePct ?? 0) >= 0;
  const hasData = points.some((p) => p.amount > 0);

  if (isLoading) {
    return <SkeletonChart />;
  }

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Income Overview</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Inflow timeline</p>
        </div>
        <div className="text-right">
          {changePct !== null && (
            <div
              className={`flex items-center gap-1 text-sm font-bold justify-end ${
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
      <div className="flex-1 w-full min-h-0 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              No income recorded for this period
            </span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValueIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#159A1D" stopOpacity={0.2} />
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
              formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Income']}
              itemStyle={{ color: '#159A1D', fontWeight: 'bold' }}
              labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#159A1D"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValueIncome)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

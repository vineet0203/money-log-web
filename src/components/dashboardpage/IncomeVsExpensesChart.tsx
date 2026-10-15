"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function IncomeVsExpensesChart({ data = [] }: { data?: any[] }) {
  const formatYAxis = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    return `$${value}`;
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col h-full min-h-[350px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Income vs expenses</h3>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]"></span>
              <span className="text-xs text-slate-500 font-medium">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#EF4444]"></span>
              <span className="text-xs text-slate-500 font-medium">Expenses</span>
            </div>
          </div>
        </div>
        <button type="button" className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors self-start sm:self-auto shrink-0">
          Last 6 months
        </button>
      </div>

      <div className="flex-1 w-full min-h-[240px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs sm:text-sm">
            No data available for the last 6 months.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                dy={6} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8' }} 
                tickFormatter={formatYAxis}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, '']}
              />
              <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={22} />
              <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

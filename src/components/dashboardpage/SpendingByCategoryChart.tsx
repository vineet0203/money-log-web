"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function SpendingByCategoryChart({ data = [] }: { data?: any[] }) {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col h-full min-h-[350px]">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">Spending by category</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="text-xs text-slate-500 font-medium truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0">
          June 2026
        </span>
      </div>

      <div className="flex-1 w-full flex items-center justify-center min-h-[200px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any) => [`$${value}`, 'Amount']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

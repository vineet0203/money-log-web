"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function SpendingByCategoryChart({ data = [] }: { data?: any[] }) {
  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => Number(b.value || 0) - Number(a.value || 0));
  }, [data]);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-100 flex flex-col h-full min-h-[350px]">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base truncate">Spending by category</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            {sortedData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-xs shrink-0" style={{ backgroundColor: entry.color }}></span>
                <span className="text-xs text-slate-500 font-medium truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg shrink-0">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="flex-1 w-full flex items-center justify-center min-h-[200px]">
        {sortedData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6 min-h-[200px]">
            <p className="text-xs sm:text-sm font-medium">No expense transactions recorded this month.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`$${value}`, 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

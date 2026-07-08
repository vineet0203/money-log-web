"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Housing', value: 1200, color: '#3B82F6' },
  { name: 'Food', value: 420, color: '#10B981' },
  { name: 'Transport', value: 310, color: '#F59E0B' },
  { name: 'Subscriptions', value: 65, color: '#6366F1' },
  { name: 'Other', value: 200, color: '#EF4444' },
];

export function SpendingByCategoryChart() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full min-h-[350px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Spending by category</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }}></span>
                <span className="text-xs text-slate-500 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
          June 2026
        </span>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`$${value}`, 'Amount']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', income: 5500, expenses: 3100 },
  { name: 'Feb', income: 6200, expenses: 3600 },
  { name: 'Mar', income: 5300, expenses: 2800 },
  { name: 'Apr', income: 6800, expenses: 3200 },
  { name: 'May', income: 5900, expenses: 2900 },
  { name: 'Jun', income: 5800, expenses: 3000 },
];

export function IncomeVsExpensesChart() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col h-full min-h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-800">Income vs expenses</h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]"></span>
              <span className="text-xs text-slate-500 font-medium">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]"></span>
              <span className="text-xs text-slate-500 font-medium">Expenses</span>
            </div>
          </div>
        </div>
        <button className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
          Last 6 months
        </button>
      </div>

      <div className="flex-1 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="income" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
            <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

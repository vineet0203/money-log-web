"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

const mockData = [
  { date: '4 Jan', value: 0 },
  { date: '5 Jan', value: 110 },
  { date: '6 Jan', value: 90 },
  { date: '7 Jan', value: 150 },
  { date: '8 Jan', value: 140 },
  { date: '9 Jan', value: 200 },
  { date: '10 Jan', value: 120 },
  { date: '11 Jan', value: 95 },
  { date: '12 Jan', value: 150 },
  { date: '13 Jan', value: 140 },
  { date: '14 Jan', value: 200 },
  { date: '15 Jan', value: 300 },
];

export function BalanceOverviewChart() {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-slate-900">Balance Overview</h2>
        <div className="flex flex-col items-end gap-1">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#849AB4] hover:bg-slate-50 transition-colors">
            This Week
            <ChevronDown size={14} className="text-[#849AB4]" />
          </button>
          <div className="flex items-center gap-1 text-[#159A1D] text-sm font-bold mt-1">
            <ArrowUpRight size={16} />
            12.25%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              domain={[0, 350]}
              ticks={[0, 50, 100, 150, 200, 250, 300, 350]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#159A1D', fontWeight: 'bold' }}
              labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)"
              activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

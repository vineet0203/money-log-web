"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Salary', value: 20, color: '#14b8a6' },
  { name: 'Freelance', value: 20, color: '#3b82f6' },
  { name: 'Business', value: 15, color: '#60a5fa' },
  { name: 'Investment', value: 15, color: '#bfdbfe' },
  { name: 'Others', value: 30, color: '#a855f7' },
];

export function IncomeBySourceChart() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Income by Source</h2>
      
      <div className="flex-1 flex items-center justify-between gap-4">
        
        {/* Donut Chart */}
        <div className="relative w-[50%] h-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="90%"
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900">$60,000</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-[45%] flex flex-col gap-4 pr-2">
          {data.map((item, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3.5 h-3.5 rounded-sm shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-500">{item.value}%</span>
              </div>
              {index < data.length - 1 && (
                <div className="h-px w-full bg-slate-100" />
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </div>
  );
}

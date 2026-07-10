"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'HDFC -> SBI', value: 36.4, color: '#14b8a6' },
  { name: 'SBI -> ICICI', value: 50.0, color: '#3b82f6' },
  { name: 'ICICI -> HDFC', value: 10.4, color: '#93c5fd' },
  { name: 'HDFC -> SBI', value: 22.6, color: '#e0e7ff' }, // It shows HDFC -> SBI again with 22.6% in mockup
  { name: 'Kotak -> ICICI', value: 22.6, color: '#a855f7' },
];

export function TopTransferRoutesChart() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Top Transfer Routes</h2>
      
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
            <span className="text-xl font-extrabold text-slate-900">$45,860</span>
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
                  {/* Handle arrow rendering specially so it matches the design `HDFC -> SBI` */}
                  <span className="font-medium text-slate-600 flex items-center gap-1">
                    {item.name.split('->').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part.trim()}
                        {i < arr.length - 1 && <span className="mx-0.5 text-slate-400">→</span>}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
                <span className="font-medium text-slate-500">{item.value.toFixed(1)}%</span>
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

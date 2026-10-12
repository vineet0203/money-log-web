"use client";

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { MOCK_CATEGORY_SALES, exportTableToCsv } from './reportsData';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CategoryWiseReport() {
  const categories = MOCK_CATEGORY_SALES;

  const totalRevenue = categories.reduce((sum, c) => sum + c.revenue, 0);

  const handleExport = () => {
    const headers = ['Category', 'Items Sold', 'Total Revenue ($)', 'Revenue Share %', 'COGS ($)', 'Gross Profit ($)', 'Margin %'];
    const rows = categories.map(c => [
      c.category,
      c.itemsSold,
      c.revenue.toFixed(2),
      `${c.revenueShare.toFixed(1)}%`,
      c.cogs.toFixed(2),
      c.grossProfit.toFixed(2),
      `${c.marginPercent.toFixed(1)}%`
    ]);
    exportTableToCsv('category-wise-sales-report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Revenue Share */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Category Revenue Distribution</h4>
            <p className="text-xs text-slate-400 mt-0.5">Percentage share of total gross sales by category.</p>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute text-center pointer-events-none">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Sales</span>
              <strong className="text-base font-bold text-slate-900">${(totalRevenue / 1000).toFixed(1)}k</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-slate-100 text-xs font-semibold">
            {categories.map(c => (
              <span key={c.category} className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                <span>{c.category} ({c.revenueShare}%)</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bar Chart: Revenue vs Profit Comparison */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Revenue vs Gross Profit by Category</h4>
              <p className="text-xs text-slate-400 mt-0.5">Evaluating volume and real cash profit return per vertical.</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#159A1D]"></span> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#3B82F6]"></span> Gross Profit</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#159A1D" radius={[6, 6, 0, 0]} name="Revenue" barSize={24} />
                <Bar dataKey="grossProfit" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Gross Profit" barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 pt-3 border-t border-slate-100">
            💡 <strong>Insight:</strong> Coffee represents 43.6% of overall revenue and delivers the strongest gross profit margin at 62.6%.
          </p>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Category Performance Matrix</h4>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit of volume, margins, and contribution</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-1.5"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Category Name</th>
                <th className="py-3 px-4 text-center">Items Sold</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-center">Revenue Share</th>
                <th className="py-3 px-4 text-right">Cost of Goods (COGS)</th>
                <th className="py-3 px-4 text-right">Gross Profit</th>
                <th className="py-3 px-5 text-center">Gross Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.category} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }}></span>
                    <span>{c.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                    {c.itemsSold.toLocaleString()} units
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    ${c.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[11px]">
                      {c.revenueShare.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                    ${c.cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#159A1D]">
                    ${c.grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      c.marginPercent >= 50
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {c.marginPercent.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

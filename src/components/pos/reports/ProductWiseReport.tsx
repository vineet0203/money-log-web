"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { exportTableToCsv } from './reportsData';
import { DateRangePreset } from './types';
import { useProductSalesReportQuery } from '@/hooks/queries/posReports';
import { Download, ArrowUpDown, Loader2 } from 'lucide-react';
import { PosSearchInput, Select } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface ProductWiseReportProps {
  dateRange?: DateRangePreset;
}

export function ProductWiseReport({ dateRange = '30days' }: ProductWiseReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'revenue' | 'units' | 'margin'>('revenue');

  const { data: rawItems = [], isLoading } = useProductSalesReportQuery(dateRange, selectedCategory);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    rawItems.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [rawItems]);

  const filteredItems = useMemo(() => {
    return rawItems.filter(p => {
      const matchesSearch = !searchTerm || 
        p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortBy === 'revenue') return b.netRevenue - a.netRevenue;
      if (sortBy === 'units') return b.unitsSold - a.unitsSold;
      return b.marginPercent - a.marginPercent;
    });
  }, [rawItems, searchTerm, selectedCategory, sortBy]);

  const top5ChartData = useMemo(() => {
    return [...rawItems]
      .sort((a, b) => b.netRevenue - a.netRevenue)
      .slice(0, 5)
      .map(p => ({
        name: p.productName.split('(')[0].trim(),
        revenue: p.netRevenue,
        profit: p.grossProfit,
      }));
  }, [rawItems]);

  const handleExport = () => {
    const headers = ['Product Name', 'SKU', 'Category', 'Units Sold', 'Gross Sales ($)', 'Discount ($)', 'Net Revenue ($)', 'COGS ($)', 'Gross Profit ($)', 'Margin %'];
    const rows = filteredItems.map(p => [
      p.productName,
      p.sku,
      p.category,
      p.unitsSold,
      p.grossSales.toFixed(2),
      p.discount.toFixed(2),
      p.netRevenue.toFixed(2),
      p.cogs.toFixed(2),
      p.grossProfit.toFixed(2),
      `${p.marginPercent.toFixed(1)}%`
    ]);
    exportTableToCsv('product-wise-sales-report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Chart: Top 5 Revenue Generators */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Top 5 Products by Net Revenue & Gross Profit</h4>
            <p className="text-xs text-slate-400 mt-0.5">Visual comparison of revenue contribution versus actual profit retained.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#159A1D]"></span> Net Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#3B82F6]"></span> Gross Profit</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top5ChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip 
                formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="revenue" fill="#159A1D" radius={[6, 6, 0, 0]} name="Net Revenue" barSize={28} />
              <Bar dataKey="profit" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Gross Profit" barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search */}
            <PosSearchInput
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="min-w-[200px] flex-1 max-w-sm"
            />

            {/* Category Filter */}
            <div className="w-48">
              <Select
                size="sm"
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                options={categories.map(c => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort by */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-white px-2.5 py-1.5 border border-slate-200 rounded-xl">
              <ArrowUpDown size={13} className="text-slate-400" />
              <span>Sort:</span>
              <button
                type="button"
                onClick={() => setSortBy('revenue')}
                className={`px-2 py-0.5 rounded-md ${sortBy === 'revenue' ? 'bg-[#159A1D] text-white' : 'hover:bg-slate-100'}`}
              >
                Revenue
              </button>
              <button
                type="button"
                onClick={() => setSortBy('units')}
                className={`px-2 py-0.5 rounded-md ${sortBy === 'units' ? 'bg-[#159A1D] text-white' : 'hover:bg-slate-100'}`}
              >
                Units
              </button>
              <button
                type="button"
                onClick={() => setSortBy('margin')}
                className={`px-2 py-0.5 rounded-md ${sortBy === 'margin' ? 'bg-[#159A1D] text-white' : 'hover:bg-slate-100'}`}
              >
                Margin
              </button>
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Gross Sales</th>
                <th className="py-3 px-4 text-right">Discounts</th>
                <th className="py-3 px-4 text-right">Net Revenue</th>
                <th className="py-3 px-4 text-right">COGS</th>
                <th className="py-3 px-4 text-right">Gross Profit</th>
                <th className="py-3 px-5 text-center">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No product sales matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-900">{item.productName}</div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5">{item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {item.unitsSold.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500">${item.grossSales.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-amber-700">-${item.discount.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">${item.netRevenue.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-500">${item.cogs.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#159A1D]">${item.grossProfit.toFixed(2)}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        item.marginPercent >= 50
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.marginPercent >= 35
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

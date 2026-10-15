"use client";

import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
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
import { useSalesSummaryReportQuery } from '@/hooks/queries/posReports';
import { Download, ShoppingBag, Receipt, DollarSign, Clock, Loader2 } from 'lucide-react';
import { PosStatCard } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface SalesSummaryReportProps {
  dateRange?: DateRangePreset;
}

export function SalesSummaryReport({ dateRange = '30days' }: SalesSummaryReportProps) {
  const [chartView, setChartView] = useState<'daily' | 'hourly'>('daily');
  const { data: reportData, isLoading } = useSalesSummaryReportQuery(dateRange);

  const data = reportData || {
    totalGrossSales: 0,
    totalDiscounts: 0,
    totalNetSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalTax: 0,
    totalItemsSold: 0,
    trend: [],
    hourlyBreakdown: []
  };

  const handleExport = () => {
    const headers = ['Date', 'Gross Sales ($)', 'Net Sales ($)', 'Orders Count', 'Avg Ticket ($)'];
    const rows = data.trend.map(t => [
      t.date,
      t.gross.toFixed(2),
      t.net.toFixed(2),
      t.orders,
      (t.net / Math.max(1, t.orders)).toFixed(2)
    ]);
    exportTableToCsv('sales-summary-report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <PosStatCard
          title="Gross Sales"
          value={`$${data.totalGrossSales.toLocaleString()}`}
          trend={{ value: "+12.4%", isPositive: true, label: "vs last period" }}
          icon={DollarSign}
          color="slate"
        />

        <PosStatCard
          title="Total Discounts"
          value={`-$${data.totalDiscounts.toLocaleString()}`}
          subtitle={`${data.totalGrossSales > 0 ? ((data.totalDiscounts / data.totalGrossSales) * 100).toFixed(1) : '0.0'}% of gross`}
          color="amber"
        />

        <PosStatCard
          title="Net Sales"
          value={`$${data.totalNetSales.toLocaleString()}`}
          subtitle="Realized revenue"
          color="green"
        />

        <PosStatCard
          title="Total Orders"
          value={data.totalOrders.toLocaleString()}
          subtitle={`${data.totalItemsSold.toLocaleString()} items sold`}
          icon={ShoppingBag}
          color="blue"
        />

        <PosStatCard
          title="Avg Order Value"
          value={`$${data.averageOrderValue.toFixed(2)}`}
          trend={{ value: "+$2.10", isPositive: true, label: "vs last week" }}
          icon={Receipt}
          color="purple"
        />

        <PosStatCard
          title="Tax Collected"
          value={`$${data.totalTax.toLocaleString()}`}
          subtitle="State & local sales tax"
          color="slate"
        />
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900">
              {chartView === 'daily' ? 'Daily Sales Performance' : 'Hourly Sales Distribution (Peak Hours)'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {chartView === 'daily' 
                ? 'Comparison of gross revenue and net sales across the selected date range.'
                : 'Customer traffic and sales volume breakdown across store hours.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartView('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Daily Trend
              </button>
              <button
                type="button"
                onClick={() => setChartView('hourly')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  chartView === 'hourly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Clock size={13} /> Peak Hours
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

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'daily' ? (
              <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="netSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#159A1D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#159A1D" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="grossSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(val: unknown, name: unknown) => [`$${Number(val || 0).toLocaleString()}`, name === 'net' ? 'Net Sales' : 'Gross Sales']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="gross" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#grossSalesGrad)" name="gross" />
                <Area type="monotone" dataKey="net" stroke="#159A1D" strokeWidth={2.5} fillOpacity={1} fill="url(#netSalesGrad)" name="net" />
              </AreaChart>
            ) : (
              <BarChart data={data.hourlyBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
                />
                <Tooltip 
                  formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, 'Sales Volume']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="sales" fill="#159A1D" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Daily Sales Breakdown</h4>
            <p className="text-xs text-slate-400 mt-0.5">Audited transaction summaries grouped by date</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Gross Sales</th>
                <th className="py-3 px-4 text-right">Discounts</th>
                <th className="py-3 px-4 text-right">Net Revenue</th>
                <th className="py-3 px-4 text-right">Tax (8%)</th>
                <th className="py-3 px-5 text-right">Avg Order Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.trend.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No sales recorded for this date range.
                  </td>
                </tr>
              ) : (
                data.trend.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{row.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold">
                        {row.orders} orders
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 font-medium">${row.gross.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-amber-700 font-medium">-${(row.gross - row.net).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#159A1D]">${row.net.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-500">${(row.net * 0.08).toFixed(2)}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-semibold text-slate-900">
                      ${row.orders > 0 ? (row.net / row.orders).toFixed(2) : '0.00'}
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

"use client";

import React from 'react';
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
import { useProfitMarginsReportQuery } from '@/hooks/queries/posReports';
import { Download, AlertTriangle, TrendingUp } from 'lucide-react';
import { PosStatCard } from '@/components/pos/common';

interface ProfitMarginsReportProps {
  dateRange?: DateRangePreset;
}

export function ProfitMarginsReport({ dateRange = '30days' }: ProfitMarginsReportProps) {
  const { data: reportData, isLoading } = useProfitMarginsReportQuery(dateRange);

  const data = reportData || {
    grossRevenue: 0,
    totalCogs: 0,
    grossProfit: 0,
    grossMarginPercent: 0,
    operatingExpenses: 0,
    netOperatingProfit: 0,
    netMarginPercent: 0,
    tierBreakdown: [
      { tier: 'High Margin', range: '≥ 50% Margin', count: 0, revenue: 0, profit: 0 },
      { tier: 'Mid Margin', range: '25% - 49% Margin', count: 0, revenue: 0, profit: 0 },
      { tier: 'Low Margin', range: '< 25% Margin', count: 0, revenue: 0, profit: 0 },
    ],
    topProfitProducts: [],
    lowMarginAlerts: [],
  };

  const handleExport = () => {
    const headers = ['Category / Item', 'Profit ($)', 'Margin %', 'Type'];
    const rows = [
      ...data.topProfitProducts.map(p => [p.name, p.profit.toFixed(2), `${p.margin.toFixed(1)}%`, 'Top Performer']),
      ...data.lowMarginAlerts.map(p => [p.name, (p.currentPrice - p.costPrice).toFixed(2), `${p.margin.toFixed(1)}%`, 'Low Margin Alert']),
    ];
    exportTableToCsv('profit-and-margins-report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PosStatCard
          title="Gross Revenue"
          value={`$${data.grossRevenue.toLocaleString()}`}
          subtitle="Total cashier intake"
          color="slate"
        />

        <PosStatCard
          title="Cost of Goods (COGS)"
          value={`-$${data.totalCogs.toLocaleString()}`}
          subtitle="Wholesale inventory costs"
          color="slate"
        />

        <PosStatCard
          title="Gross Profit"
          value={`$${data.grossProfit.toLocaleString()}`}
          subtitle={`${data.grossMarginPercent}% Margin`}
          color="green"
        />

        <PosStatCard
          title="Net Operating Profit"
          value={`$${data.netOperatingProfit.toLocaleString()}`}
          subtitle={`${data.netMarginPercent}% Net Margin after OPEX`}
          color="blue"
        />
      </div>

      {/* Margin Tiers Distribution & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Product Margin Tier Distribution</h4>
            <p className="text-xs text-slate-400 mt-0.5">Categorizing catalog profitability across revenue and unit counts.</p>
          </div>

          <div className="space-y-3">
            {data.tierBreakdown.map(tier => {
              const share = data.grossRevenue > 0 ? ((tier.revenue / data.grossRevenue) * 100).toFixed(1) : '0.0';
              return (
                <div key={tier.tier} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-bold text-slate-800">{tier.tier} ({tier.range})</span>
                    <span className="font-semibold text-slate-600">{tier.count} Products ({share}% rev)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        tier.tier === 'High Margin' ? 'bg-[#159A1D]' : tier.tier === 'Mid Margin' ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${share}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>Revenue: ${tier.revenue.toLocaleString()}</span>
                    <span className="font-semibold text-slate-700">Profit: ${tier.profit.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Profit Tier Breakdown Chart</h4>
                <p className="text-xs text-slate-400 mt-0.5">Revenue generated vs gross profit captured.</p>
              </div>
              <button
                onClick={handleExport}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tierBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tier" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
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
                <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Revenue" barSize={28} />
                <Bar dataKey="profit" fill="#159A1D" radius={[6, 6, 0, 0]} name="Profit" barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {data.lowMarginAlerts.length > 0 ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 flex items-start gap-2 text-xs text-amber-800">
              <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Strategic Action:</strong> {data.lowMarginAlerts.length} catalog items have margins under 35%. Review supplier contracts or evaluate modest price adjustments.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-start gap-2 text-xs text-emerald-800">
              <TrendingUp size={15} className="text-[#159A1D] shrink-0 mt-0.5" />
              <span>
                <strong>Catalog Healthy:</strong> All catalog items are performing above 35% margin.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Performers vs Low Margin Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Top Profit Generating Products</h4>
              <p className="text-xs text-slate-400 mt-0.5">Highest cash profit yield across the catalog</p>
            </div>
            <span className="p-1.5 bg-emerald-50 text-[#159A1D] rounded-lg">
              <TrendingUp size={16} />
            </span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Cash Profit</th>
                <th className="py-2.5 px-4 text-center">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topProfitProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No profit data available for this range.
                  </td>
                </tr>
              ) : (
                data.topProfitProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3 px-3 text-slate-500">{p.category}</td>
                    <td className="py-3 px-3 text-right font-bold text-[#159A1D]">${p.profit.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full">
                        {p.margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Low Margin Watchlist */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Low Margin Watchlist (&lt; 35%)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Items requiring pricing reviews or supplier negotiations</p>
            </div>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle size={16} />
            </span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-3 text-right">Cost</th>
                <th className="py-2.5 px-3 text-right">Selling Price</th>
                <th className="py-2.5 px-4 text-center">Current Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.lowMarginAlerts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No low-margin items under 35%. Excellent profitability!
                  </td>
                </tr>
              ) : (
                data.lowMarginAlerts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3 px-3 text-right text-slate-500">${p.costPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">${p.currentPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-full border border-amber-200">
                        {p.margin.toFixed(1)}%
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

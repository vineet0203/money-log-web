"use client";

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { MOCK_PAYMENT_SUMMARY, exportTableToCsv } from './reportsData';
import { Download } from 'lucide-react';
import { PosStatCard } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

export function PaymentSummaryReport() {
  const methods = MOCK_PAYMENT_SUMMARY;
  const totalAmount = methods.reduce((sum, m) => sum + m.totalAmount, 0);
  const totalFees = methods.reduce((sum, m) => sum + m.processingFees, 0);
  const totalNet = methods.reduce((sum, m) => sum + m.netCollected, 0);
  const totalTxns = methods.reduce((sum, m) => sum + m.transactions, 0);

  const handleExport = () => {
    const headers = ['Payment Method', 'Transactions', 'Total Collected ($)', 'Share %', 'Processing Fees ($)', 'Net Settled ($)'];
    const rows = methods.map(m => [
      m.method,
      m.transactions,
      m.totalAmount.toFixed(2),
      `${m.percentage.toFixed(1)}%`,
      m.processingFees.toFixed(2),
      m.netCollected.toFixed(2)
    ]);
    exportTableToCsv('payment-summary-report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Payment Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PosStatCard
          title="Total Payments Collected"
          value={`$${totalAmount.toLocaleString()}`}
          subtitle={`${totalTxns.toLocaleString()} successful payments`}
          color="slate"
        />

        <PosStatCard
          title="Total Card & Gateway Fees"
          value={`-$${totalFees.toLocaleString()}`}
          subtitle={`${((totalFees / totalAmount) * 100).toFixed(2)}% effective merchant rate`}
          color="amber"
        />

        <PosStatCard
          title="Net Bank Settled"
          value={`$${totalNet.toLocaleString()}`}
          subtitle="Funds deposited post-fees"
          color="green"
        />

        <PosStatCard
          title="Cash in Register Intake"
          value={`$${(methods.find(m => m.method.includes('Cash'))?.totalAmount || 0).toLocaleString()}`}
          subtitle="27.0% zero-fee cash payments"
          color="slate"
        />
      </div>

      {/* Donut Chart & Method List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Payment Gateway Distribution</h4>
            <p className="text-xs text-slate-400 mt-0.5">Tender type share across all completed sales.</p>
          </div>

          <div className="h-64 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methods}
                  dataKey="totalAmount"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {methods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, 'Amount']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Intake</span>
              <strong className="text-base font-bold text-slate-900">${(totalAmount / 1000).toFixed(1)}k</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold">
            {methods.map(m => (
              <span key={m.method} className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></span>
                <span>{m.method.split('(')[0].trim()} ({m.percentage}%)</span>
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Tender Reconciliation Table</h4>
              <p className="text-xs text-slate-400 mt-0.5">Detailed breakdown by payment provider</p>
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

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-3 text-center">Txns</th>
                  <th className="py-3 px-3 text-right">Gross Amount</th>
                  <th className="py-3 px-3 text-center">Share</th>
                  <th className="py-3 px-3 text-right">Fee</th>
                  <th className="py-3 px-4 text-right">Net Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {methods.map((m) => (
                  <tr key={m.method} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }}></span>
                      <span>{m.method}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{m.transactions}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900">${m.totalAmount.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px]">
                        {m.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-amber-700 font-medium">
                      {m.processingFees > 0 ? `-$${m.processingFees.toFixed(2)}` : '$0.00'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#159A1D]">${m.netCollected.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Average card gateway transaction fee rate: 2.0%</span>
            <span className="font-semibold text-slate-800">Total Net Settled: ${totalNet.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

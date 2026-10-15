"use client";

import { exportTableToCsv } from './reportsData';
import { DateRangePreset } from './types';
import { useReturnsRefundsReportQuery } from '@/hooks/queries/posReports';
import { Download, RotateCcw, CheckCircle } from 'lucide-react';
import { PosStatCard } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface ReturnsRefundsReportProps {
  dateRange?: DateRangePreset;
}

export function ReturnsRefundsReport({ dateRange = '30days' }: ReturnsRefundsReportProps) {
  const { data: reportData, isLoading } = useReturnsRefundsReportQuery(dateRange);

  const data = reportData || {
    totalReturns: 0,
    totalRefundAmount: 0,
    returnRatePercent: 0,
    reasons: [],
    refundMethods: [],
    returnedProducts: [],
  };

  const storeCredit = data.refundMethods.find(m => m.method.toLowerCase().includes('credit'))?.amount || 0;
  const storeCreditShare = data.totalRefundAmount > 0 ? ((storeCredit / data.totalRefundAmount) * 100).toFixed(1) : '0.0';

  const handleExport = () => {
    const headers = ['Product Name', 'SKU', 'Units Returned', 'Refund Amount ($)', 'Primary Reason'];
    const rows = data.returnedProducts.map(p => [
      p.productName,
      p.sku,
      p.unitsReturned,
      p.refundAmount.toFixed(2),
      p.primaryReason
    ]);
    exportTableToCsv('returns-and-refunds-report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Return KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PosStatCard
          title="Total Return Items"
          value={`${data.totalReturns} items`}
          subtitle="Processed across registers"
          icon={RotateCcw}
          color="amber"
        />

        <PosStatCard
          title="Total Refund Amount"
          value={`$${data.totalRefundAmount.toFixed(2)}`}
          subtitle="Funds refunded to shoppers"
          color="rose"
        />

        <PosStatCard
          title="Return Rate"
          value={`${data.returnRatePercent}%`}
          subtitle="Calculated from period sales"
          icon={CheckCircle}
          color="emerald"
        />

        <PosStatCard
          title="Store Credit Retained"
          value={`$${storeCredit.toFixed(2)}`}
          subtitle={`${storeCreditShare}% retained within store wallet`}
          color="green"
        />
      </div>

      {/* Return Reasons Breakdown & Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reasons */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Primary Return Reasons</h4>
            <p className="text-xs text-slate-400 mt-0.5">Categorization of reason codes provided during checkout return.</p>
          </div>

          <div className="space-y-3">
            {data.reasons.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No returns recorded for this period.</p>
            ) : (
              data.reasons.map((r) => (
                <div key={r.reason} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-bold text-slate-800">{r.reason}</span>
                    <span className="font-semibold text-slate-600">{r.count} cases ({r.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${r.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>Refunded: ${r.amount.toFixed(2)}</span>
                    <span className="text-amber-700 font-semibold">Avg: ${(r.amount / Math.max(1, r.count)).toFixed(2)} / item</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Refund Tender Method */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Disbursement by Refund Tender</h4>
            <p className="text-xs text-slate-400 mt-0.5">How customer refunds were distributed.</p>
          </div>

          <div className="space-y-3">
            {data.refundMethods.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No refund disbursements recorded.</p>
            ) : (
              data.refundMethods.map((m) => {
                const share = data.totalRefundAmount > 0 ? ((m.amount / data.totalRefundAmount) * 100).toFixed(1) : '0.0';
                return (
                  <div key={m.method} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs">{m.method}</h5>
                      <span className="text-[11px] text-slate-400">{m.count} refunds processed</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm font-bold text-slate-900">${m.amount.toFixed(2)}</strong>
                      <span className="text-[11px] text-slate-500 block">{share}% of refunds</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-start gap-2 text-xs text-emerald-800">
            <CheckCircle size={15} className="text-[#159A1D] shrink-0 mt-0.5" />
            <span>
              <strong>Loss Prevention:</strong> {storeCreditShare}% of refunded value was retained as in-store credit vouchers rather than cash or card chargebacks.
            </span>
          </div>
        </div>
      </div>

      {/* Top Returned Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Most Frequently Returned Products</h4>
            <p className="text-xs text-slate-400 mt-0.5">Itemized products with elevated return volumes</p>
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
                <th className="py-3 px-5">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">Units Returned</th>
                <th className="py-3 px-4 text-right">Total Refunded</th>
                <th className="py-3 px-5 text-left">Primary Customer Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.returnedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No returned product items recorded for this date range.
                  </td>
                </tr>
              ) : (
                data.returnedProducts.map((p) => (
                  <tr key={p.sku} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-5 font-semibold text-slate-900">{p.productName}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{p.sku}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-amber-700">
                      {p.unitsReturned} units
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-red-600">
                      ${p.refundAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <span className="px-2.5 py-0.5 bg-slate-100 rounded-full font-medium text-[11px]">
                        {p.primaryReason}
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

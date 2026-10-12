"use client";

import React from 'react';
import { MOCK_PURCHASE_REPORT, exportTableToCsv } from './reportsData';
import { Download, Truck, Clock, CheckCircle, FileText } from 'lucide-react';
import { PosStatCard, PosStatusBadge } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

export function PurchaseReport() {
  const data = MOCK_PURCHASE_REPORT;

  const handleExport = () => {
    const headers = ['PO Number', 'Supplier', 'Date', 'Items Count', 'Total Cost ($)', 'Delivery Status', 'Payment Status'];
    const rows = data.recentPurchases.map(p => [
      p.poNumber,
      p.supplier,
      p.date,
      p.itemsCount,
      p.totalCost.toFixed(2),
      p.status,
      p.paymentStatus
    ]);
    exportTableToCsv('purchase-report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Procurement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PosStatCard
          title="Total Purchase Spend"
          value={`$${data.totalSpend.toLocaleString()}`}
          subtitle="Inventory restocking investment"
          icon={Truck}
          color="slate"
        />

        <PosStatCard
          title="Purchase Orders"
          value={`${data.totalPurchases} POs`}
          subtitle={`${data.completedPOs} received, ${data.pendingPOs} in transit`}
          icon={FileText}
          color="blue"
        />

        <PosStatCard
          title="Avg Supplier Fulfillment"
          value="96.8%"
          subtitle="On-time and in-full delivery rate"
          icon={CheckCircle}
          color="green"
        />

        <PosStatCard
          title="Pending Payables"
          value={`$${data.supplierSpend.reduce((sum, s) => sum + s.pendingAmount, 0).toLocaleString()}`}
          subtitle="Pending supplier invoice balances"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Supplier Spend Summary Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Supplier Procurement Breakdown</h4>
          <p className="text-xs text-slate-400 mt-0.5">Purchasing spend, PO count, and fulfillment reliability per vendor.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.supplierSpend.map(sup => (
            <div key={sup.supplier} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-900 text-xs">{sup.supplier}</h5>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-700">
                  {sup.poCount} POs
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Total Spend:</span>
                <strong className="text-base font-bold text-slate-900">${sup.totalSpend.toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-500">
                <span>Fulfillment: <strong className="text-emerald-700">{sup.fulfillmentRate}%</strong></span>
                {sup.pendingAmount > 0 ? (
                  <span className="text-amber-700 font-semibold">Due: ${sup.pendingAmount.toFixed(2)}</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">Fully Paid</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Purchase Order Registry</h4>
            <p className="text-xs text-slate-400 mt-0.5">Historical log of store replenishment invoices</p>
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
                <th className="py-3 px-5">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-center">Items</th>
                <th className="py-3 px-4 text-right">Invoice Amount</th>
                <th className="py-3 px-4 text-center">Delivery Status</th>
                <th className="py-3 px-5 text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentPurchases.map((po) => (
                <tr key={po.poNumber} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{po.poNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{po.supplier}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-medium">{po.date}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-slate-700">{po.itemsCount} units</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">${po.totalCost.toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <PosStatusBadge status={po.status} />
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <PosStatusBadge status={po.paymentStatus} />
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

"use client";

import React, { useState } from 'react';
import { MOCK_CASHIER_REGISTERS, exportTableToCsv } from './reportsData';
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PosStatCard } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

export function CashierRegisterReport() {
  const [selectedRegister, setSelectedRegister] = useState('All');
  const shifts = MOCK_CASHIER_REGISTERS;

  const filteredShifts = selectedRegister === 'All'
    ? shifts
    : shifts.filter(s => s.registerId.includes(selectedRegister));

  const totalSales = shifts.reduce((sum, s) => sum + s.totalSales, 0);
  const totalOrders = shifts.reduce((sum, s) => sum + s.ordersCount, 0);
  const netDifference = shifts.reduce((sum, s) => sum + s.difference, 0);

  const handleExport = () => {
    const headers = ['Register', 'Cashier', 'Shift', 'Date', 'Opening Cash', 'Cash Sales', 'Card Sales', 'Expected Cash', 'Actual Cash', 'Over/Short', 'Orders', 'Total Sales', 'Status'];
    const rows = filteredShifts.map(s => [
      s.registerId,
      s.cashierName,
      s.shift,
      s.date,
      s.openingCash.toFixed(2),
      s.cashSales.toFixed(2),
      s.cardSales.toFixed(2),
      s.expectedCash.toFixed(2),
      s.actualCash.toFixed(2),
      s.difference.toFixed(2),
      s.ordersCount,
      s.totalSales.toFixed(2),
      s.status
    ]);
    exportTableToCsv('cashier-register-report', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Shift Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PosStatCard
          title="Total Register Sales"
          value={`$${totalSales.toLocaleString()}`}
          subtitle="Across all active cashier shifts"
          color="slate"
        />

        <PosStatCard
          title="Total Orders Processed"
          value={totalOrders}
          subtitle={`~${(totalOrders / shifts.length).toFixed(0)} orders per shift average`}
          color="slate"
        />

        <PosStatCard
          title="Net Cash Drawer Discrepancy"
          value={netDifference >= 0 ? `+$${netDifference.toFixed(2)}` : `-$${Math.abs(netDifference).toFixed(2)}`}
          subtitle={netDifference === 0 ? 'Exact drawer match' : 'Over/Short variance across registers'}
          color={netDifference === 0 ? 'green' : netDifference > 0 ? 'blue' : 'rose'}
        />

        <PosStatCard
          title="Active Cash Registers"
          value="2 Terminals"
          subtitle="Both terminals operational & audited"
          color="green"
        />
      </div>

      {/* Register Shifts Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Shift End-of-Day (Z-Report) Audits</h4>
            <p className="text-xs text-slate-400 mt-0.5">Register drawer float, cash drops, and cashier balance checks</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRegister}
              onChange={(e) => setSelectedRegister(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#159A1D]"
            >
              <option value="All">All Registers</option>
              <option value="#01">Terminal #01 (Main Counter)</option>
              <option value="#02">Terminal #02 (Express / Drive-thru)</option>
            </select>

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
                <th className="py-3 px-5">Register Terminal</th>
                <th className="py-3 px-4">Cashier & Shift</th>
                <th className="py-3 px-3 text-right">Opening Float</th>
                <th className="py-3 px-3 text-right">Cash Sales</th>
                <th className="py-3 px-3 text-right">Expected Drawer</th>
                <th className="py-3 px-3 text-right">Actual Count</th>
                <th className="py-3 px-3 text-center">Over / Short</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Total Shift Volume</th>
                <th className="py-3 px-5 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShifts.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">{s.registerId}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{s.cashierName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.shift}</div>
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-500 font-mono">${s.openingCash.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right text-slate-700 font-semibold">${s.cashSales.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-600">${s.expectedCash.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">${s.actualCash.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-center font-bold">
                    {s.difference === 0 ? (
                      <span className="text-emerald-700">$0.00</span>
                    ) : s.difference > 0 ? (
                      <span className="text-blue-700 font-mono">+$ {s.difference.toFixed(2)}</span>
                    ) : (
                      <span className="text-red-700 font-mono">-$ {Math.abs(s.difference).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">{s.ordersCount}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#159A1D]">${s.totalSales.toFixed(2)}</td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      s.status === 'Balanced'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : s.status === 'Over'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {s.status === 'Balanced' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      <span>{s.status}</span>
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

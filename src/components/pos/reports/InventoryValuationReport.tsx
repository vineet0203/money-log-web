"use client";

import React, { useState } from 'react';
import { MOCK_INVENTORY_VALUATION, exportTableToCsv } from './reportsData';
import { Download, Package, Layers, Award } from 'lucide-react';
import { PosStatCard } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

export function InventoryValuationReport() {
  const [groupBy, setGroupBy] = useState<'category' | 'brand'>('category');
  const data = MOCK_INVENTORY_VALUATION;

  const handleExport = () => {
    if (groupBy === 'category') {
      const headers = ['Category', 'Stock Units', 'Valuation at Cost ($)', 'Valuation at Retail ($)', 'Gross Margin %'];
      const rows = data.categoryValuations.map(c => [
        c.category,
        c.units,
        c.costValue.toFixed(2),
        c.retailValue.toFixed(2),
        `${c.margin.toFixed(1)}%`
      ]);
      exportTableToCsv('inventory-valuation-by-category', headers, rows);
    } else {
      const headers = ['Brand', 'Stock Units', 'Valuation at Cost ($)', 'Valuation at Retail ($)'];
      const rows = data.brandValuations.map(b => [
        b.brand,
        b.units,
        b.costValue.toFixed(2),
        b.retailValue.toFixed(2)
      ]);
      exportTableToCsv('inventory-valuation-by-brand', headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Asset Valuation KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PosStatCard
          title="Total Inventory Asset (Cost)"
          value={`$${data.valuationAtCost.toLocaleString()}`}
          subtitle="Capital invested in store stock"
          icon={Package}
          color="slate"
        />

        <PosStatCard
          title="Retail Sales Potential"
          value={`$${data.valuationAtRetail.toLocaleString()}`}
          subtitle="Expected return at current prices"
          color="slate"
        />

        <PosStatCard
          title="Unrealized Gross Profit"
          value={`$${data.potentialProfit.toLocaleString()}`}
          subtitle={`${(((data.potentialProfit) / data.valuationAtRetail) * 100).toFixed(1)}% projected margin`}
          color="green"
        />

        <PosStatCard
          title="Stock Units on Hand"
          value={data.totalStockUnits.toLocaleString()}
          subtitle={`${data.healthyStockCount} healthy • ${data.lowStockCount} low • ${data.outOfStockCount} out`}
          icon={Layers}
          color="blue"
        />
      </div>

      {/* Valuation Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Inventory Asset Valuation Breakdown</h4>
            <p className="text-xs text-slate-400 mt-0.5">Asset balance comparison grouped by merchandise vertical</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white border border-slate-200 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setGroupBy('category')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  groupBy === 'category' ? 'bg-[#159A1D] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Layers size={13} /> By Category
              </button>
              <button
                type="button"
                onClick={() => setGroupBy('brand')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  groupBy === 'brand' ? 'bg-[#159A1D] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Award size={13} /> By Brand
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
          {groupBy === 'category' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-4 text-center">Stock Units</th>
                  <th className="py-3 px-4 text-right">Valuation at Cost (Asset)</th>
                  <th className="py-3 px-4 text-right">Valuation at Retail</th>
                  <th className="py-3 px-4 text-right">Potential Profit</th>
                  <th className="py-3 px-5 text-center">Projected Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.categoryValuations.map((c) => {
                  const potProfit = c.retailValue - c.costValue;
                  return (
                    <tr key={c.category} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900">{c.category}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {c.units.toLocaleString()} units
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                        ${c.costValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ${c.retailValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#159A1D]">
                        +${potProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[11px]">
                          {c.margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Brand Partner</th>
                  <th className="py-3 px-4 text-center">Stock Units</th>
                  <th className="py-3 px-4 text-right">Valuation at Cost</th>
                  <th className="py-3 px-4 text-right">Valuation at Retail</th>
                  <th className="py-3 px-5 text-right">Potential Unrealized Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.brandValuations.map((b) => (
                  <tr key={b.brand} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2">
                      <Award size={14} className="text-slate-400" />
                      <span>{b.brand}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {b.units.toLocaleString()} units
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                      ${b.costValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ${b.retailValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-[#159A1D]">
                      +${(b.retailValue - b.costValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

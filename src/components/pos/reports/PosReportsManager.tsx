"use client";

import React, { useState, useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { ReportTab, DateRangePreset } from './types';
import { SalesSummaryReport } from './SalesSummaryReport';
import { ProductWiseReport } from './ProductWiseReport';
import { CategoryWiseReport } from './CategoryWiseReport';
import { ProfitMarginsReport } from './ProfitMarginsReport';
import { InventoryValuationReport } from './InventoryValuationReport';
import { PaymentSummaryReport } from './PaymentSummaryReport';
import { ReturnsRefundsReport } from './ReturnsRefundsReport';
import { PurchaseReport } from './PurchaseReport';
import { 
  BarChart3, 
  Package, 
  Tag, 
  DollarSign, 
  Layers, 
  CreditCard, 
  RotateCcw, 
  Truck,
  Calendar,
  Printer
} from 'lucide-react';
import { PosTabs } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

const DATE_PRESETS: Array<{ id: DateRangePreset; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'quarter', label: 'This Quarter' },
];

export default function PosReportsManager() {
  const { setHeaderData } = useAppData();
  const [activeTab, setActiveTab] = useState<ReportTab>('sales_summary');
  const [dateRange, setDateRange] = useState<DateRangePreset>('30days');

  useEffect(() => {
    setHeaderData(
      "POS Reports", 
      "Executive insights on sales, profit margins, product velocity, inventory valuation, and purchases.", 
      false
    );
  }, [setHeaderData]);

  const reportTabs: Array<{ id: ReportTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { id: 'sales_summary', label: 'Sales Summary', icon: BarChart3 },
    { id: 'product_sales', label: 'Product-wise Sales', icon: Package },
    { id: 'category_sales', label: 'Category-wise Sales', icon: Tag },
    { id: 'profit_margins', label: 'Profit & Margins', icon: DollarSign },
    { id: 'inventory_valuation', label: 'Inventory Valuation', icon: Layers },
    { id: 'payment_summary', label: 'Payment Summary', icon: CreditCard },
    { id: 'returns_refunds', label: 'Returns & Refunds', icon: RotateCcw },
    { id: 'purchase_report', label: 'Purchase Report', icon: Truck },
  ];

  return (
    <div className="mx-auto space-y-6 pb-12">
      {/* Global Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Date Presets */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Calendar size={14} className="text-slate-400" />
            <span>Date Range:</span>
          </div>
          <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 text-xs font-semibold">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDateRange(preset.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  dateRange === preset.id
                    ? 'bg-[#159A1D] text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Print Action */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            title="Print executive report summary"
            className="gap-1.5"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* Reports Horizontal Tab Navigation */}
      <PosTabs
        tabs={reportTabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as ReportTab)}
      />

      {/* Tab Panels */}
      <div>
        {activeTab === 'sales_summary' && <SalesSummaryReport dateRange={dateRange} />}
        {activeTab === 'product_sales' && <ProductWiseReport dateRange={dateRange} />}
        {activeTab === 'category_sales' && <CategoryWiseReport dateRange={dateRange} />}
        {activeTab === 'profit_margins' && <ProfitMarginsReport dateRange={dateRange} />}
        {activeTab === 'inventory_valuation' && <InventoryValuationReport />}
        {activeTab === 'payment_summary' && <PaymentSummaryReport dateRange={dateRange} />}
        {activeTab === 'returns_refunds' && <ReturnsRefundsReport dateRange={dateRange} />}
        {activeTab === 'purchase_report' && <PurchaseReport dateRange={dateRange} />}
      </div>
    </div>
  );
}

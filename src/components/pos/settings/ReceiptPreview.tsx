"use client";

import React, { useState } from 'react';
import { PosReceiptSettings } from './types';
import { Printer } from 'lucide-react';
import { PosReceipt, PosReceiptData } from '@/components/pos/common/PosReceipt';
import { printThermalReceipt } from '@/lib/posPrint';

interface ReceiptPreviewProps {
  settings: PosReceiptSettings;
  className?: string;
  sampleItems?: Array<{ name: string; qty: number; price: number }>;
  customerName?: string;
  receiptNumber?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  date?: string;
  mode?: 'interactive' | 'static';
}

export function ReceiptPreview({
  settings,
  className = '',
  sampleItems = [
    { name: 'Sample Item A', qty: 1, price: 15.00 },
    { name: 'Sample Item B', qty: 2, price: 5.00 },
  ],
  customerName = 'Sample Customer',
  receiptNumber = '#SAMPLE-001',
  subtotal,
  tax,
  total,
  date,
  mode = 'interactive',
}: ReceiptPreviewProps) {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>(
    settings.paperSize === '58mm' ? '58mm' : '80mm'
  );

  const calculatedSubtotal = subtotal !== undefined 
    ? subtotal 
    : sampleItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  const taxes = settings.taxes && settings.taxes.length > 0
    ? settings.taxes
    : [{ id: '1', name: 'Sales Tax', percentage: 8.0 }];
  const totalTaxRate = taxes.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);

  const calculatedTax = tax !== undefined 
    ? tax 
    : (calculatedSubtotal * totalTaxRate) / 100;
    
  const calculatedTotal = total !== undefined 
    ? total 
    : calculatedSubtotal + calculatedTax;

  const receiptData: PosReceiptData = {
    orderNumber: receiptNumber,
    date: date || new Date(),
    registerLabel: 'Terminal #01 (Active)',
    cashierName: 'Register Lead (POS-01)',
    customerName,
    items: sampleItems.map((item, idx) => ({
      id: idx,
      name: item.name,
      qty: item.qty,
      price: item.price,
      total: item.price * item.qty,
    })),
    subtotal: calculatedSubtotal,
    taxTotal: calculatedTax,
    grandTotal: calculatedTotal,
    paymentMode: 'Cash',
    cashTendered: Math.ceil(calculatedTotal / 10) * 10,
    changeDue: Math.max(0, Math.ceil(calculatedTotal / 10) * 10 - calculatedTotal),
  };

  const handlePrint = () => {
    printThermalReceipt('pos-thermal-receipt');
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Controls Bar for Preview Mode */}
      {mode === 'interactive' && (
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs no-print">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setPaperWidth('80mm')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                paperWidth === '80mm'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Standard 80mm
            </button>
            <button
              type="button"
              onClick={() => setPaperWidth('58mm')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                paperWidth === '58mm'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Compact 58mm
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 font-medium shadow-2xs"
          >
            <Printer size={13} />
            Test Print
          </button>
        </div>
      )}

      {/* Render the unified PosReceipt */}
      <PosReceipt
        data={receiptData}
        settings={settings}
        paperWidth={paperWidth}
        mode="static"
        id="pos-thermal-receipt"
      />
    </div>
  );
}

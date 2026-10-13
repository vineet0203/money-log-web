"use client";

import React, { useState } from 'react';
import { PosReceiptSettings } from './types';
import { 
  Printer, 
  QrCode
} from 'lucide-react';

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
    { name: 'Ethiopian Yirgacheffe (250g)', qty: 1, price: 18.50 },
    { name: 'Oat Milk Barista Edition (1L)', qty: 2, price: 5.50 },
    { name: 'Ceramic Pour-Over Dripper', qty: 1, price: 24.00 },
  ],
  customerName = 'Walk-in Customer',
  receiptNumber = '#INV-10048',
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
  const currencySymbol = settings.currencySymbol || '$';

  const calculatedTax = tax !== undefined 
    ? tax 
    : (calculatedSubtotal * totalTaxRate) / 100;
    
  const calculatedTotal = total !== undefined 
    ? total 
    : calculatedSubtotal + calculatedTax;

  const displayDate = date || new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  const handlePrint = () => {
    window.print();
  };

  const fullAddress = [
    settings.addressLine1,
    settings.addressLine2,
    [settings.city, settings.state, settings.postalCode].filter(Boolean).join(', ')
  ].filter(Boolean).join(', ');

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Controls Bar for Preview Mode */}
      {mode === 'interactive' && (
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs">
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
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
          >
            <Printer size={13} />
            Test Print
          </button>
        </div>
      )}

      {/* The Printable Thermal Receipt Container */}
      <div 
        id="pos-thermal-receipt"
        className={`bg-white border border-slate-200/90 shadow-md font-mono text-[#001c38] transition-all p-5 sm:p-6 rounded-lg ${
          paperWidth === '58mm' ? 'w-[290px] text-[10px]' : 'w-full max-w-[390px] text-[11px]'
        }`}
        style={{
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header Section */}
        <div className="text-center mb-4">
          {/* Logo Rendering */}
          <div className="flex justify-center items-center mb-2">
            {settings.storeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={settings.storeLogoUrl} 
                alt="Store Logo" 
                className="max-h-12 max-w-[160px] object-contain rounded"
              />
            ) : (
              <div className="w-10 h-10 border-t-2 border-b-2 border-amber-500 relative flex justify-center items-center bg-amber-50/30">
                <span className="text-2xl font-serif text-[#001c38] font-bold">
                  {settings.storeLogoInitial || 'M'}
                </span>
              </div>
            )}
          </div>

          {/* Store Name & Tagline */}
          <h1 className="text-base sm:text-lg leading-tight font-bold tracking-wider text-[#001c38] uppercase">
            {settings.storeName || 'MONEY LOG POS'}
          </h1>
          {settings.storeTagline && (
            <p className="text-[10px] tracking-widest text-amber-600 uppercase font-semibold mt-0.5">
              {settings.storeTagline}
            </p>
          )}

          {/* Location & Contact Info */}
          <div className="mt-2 text-[10px] text-slate-600 space-y-0.5 leading-snug">
            {fullAddress && <p>{fullAddress}</p>}
            <div className="flex justify-center items-center flex-wrap gap-2 text-[9.5px]">
              {settings.phone && <span>Tel: {settings.phone}</span>}
              {settings.email && <span>• {settings.email}</span>}
            </div>
            {settings.gstTaxNumber && (
              <p className="font-semibold text-slate-700">Tax / GST: {settings.gstTaxNumber}</p>
            )}
          </div>

          {/* Decorative Tagline Banner */}
          {settings.receiptHeaderNote && (
            <div className="flex items-center justify-center gap-2 text-[9.5px] text-amber-600 my-2.5">
              <div className="w-8 h-px bg-amber-200"></div>
              <span className="italic font-medium">{settings.receiptHeaderNote}</span>
              <div className="w-8 h-px bg-amber-200"></div>
            </div>
          )}

          <div className="text-center my-1.5">
            <span className="inline-block px-3 py-0.5 border border-slate-300 font-bold uppercase tracking-widest text-[11px]">
              Tax Invoice / Receipt
            </span>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="border-t border-b border-dashed border-slate-300 py-2 mb-3 text-[10px] space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Receipt No:</span>
            <span className="font-bold text-slate-800">{receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date & Time:</span>
            <span>{displayDate} 14:32</span>
          </div>
          {settings.showCashierName && (
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span>Register Lead (POS-01)</span>
            </div>
          )}
          {settings.showCustomerInfo && (
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-medium text-slate-800">{customerName}</span>
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="mb-3">
          <div className="grid grid-cols-12 bg-slate-100 py-1.5 px-2 font-bold text-[10px] uppercase text-slate-700 mb-1.5">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="space-y-1.5 px-1 text-[10.5px]">
            {sampleItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 items-start py-0.5 border-b border-slate-100 last:border-b-0">
                <div className="col-span-1 text-slate-400">{idx + 1}</div>
                <div className="col-span-6">
                  <p className="font-medium leading-tight text-slate-800">{item.name}</p>
                  <p className="text-[9px] text-slate-400">@ {currencySymbol}{item.price.toFixed(2)}</p>
                </div>
                <div className="col-span-2 text-center text-slate-700">{item.qty}</div>
                <div className="col-span-3 text-right font-semibold text-slate-900">
                  {currencySymbol}{(item.price * item.qty).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Totals */}
        <div className="border-t border-dashed border-slate-300 pt-2 mb-3 space-y-1 text-[10.5px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{currencySymbol}{calculatedSubtotal.toFixed(2)}</span>
          </div>
          {settings.showTaxBreakdown && (
            <>
              {taxes.map((t) => {
                const taxAmount = (calculatedSubtotal * (Number(t.percentage) || 0)) / 100;
                return (
                  <div key={t.id} className="flex justify-between text-slate-600">
                    <span>{t.name || 'Tax'} ({t.percentage}%):</span>
                    <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                  </div>
                );
              })}
            </>
          )}
          <div className="flex justify-between text-[13px] font-bold text-slate-900 pt-1 border-t border-slate-300">
            <span>TOTAL AMOUNT:</span>
            <span className="text-[14px] text-[#001c38] font-bold">
              {currencySymbol}{calculatedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* UPI Payments & Dynamic QR Code Box */}
        {settings.showUpiQrOnReceipt && settings.upiId && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 my-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="italic font-bold text-slate-900 text-xs">UPI</span>
                <div className="flex">
                  <div className="w-1.5 h-2.5 bg-green-500 skew-x-[-15deg]"></div>
                  <div className="w-1.5 h-2.5 bg-orange-500 skew-x-[-15deg] -ml-0.5"></div>
                </div>
                <span className="text-[10px] font-semibold text-slate-700 ml-1">Scan & Pay</span>
              </div>
              <span className="text-[9px] text-slate-400 uppercase">Instant Payment</span>
            </div>

            <div className="flex items-center gap-3">
              {/* QR Image or Vector QR */}
              <div className="bg-white p-1 border border-slate-200 rounded shrink-0 shadow-2xs">
                {settings.upiQrType === 'custom' && settings.upiQrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.upiQrImageUrl}
                    alt="UPI QR Code"
                    className="w-18 h-18 object-contain"
                  />
                ) : (
                  <div className="relative flex items-center justify-center p-0.5">
                    <QrCode size={70} strokeWidth={1.5} className="text-slate-900" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-[9.5px] leading-tight space-y-1">
                <p className="font-semibold text-slate-800">
                  {settings.upiPayeeName || settings.storeName}
                </p>
                <div className="bg-white border border-slate-200 py-1 px-2 rounded font-mono font-medium text-slate-700 text-center break-all">
                  {settings.upiId}
                </div>
                <p className="text-[8.5px] text-slate-500 text-center">
                  GPay • PhonePe • Paytm • BHIM
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Gratitude & Return Policy */}
        <div className="text-center pt-2 border-t border-dashed border-slate-300 space-y-1 text-[10px]">
          <div className="text-amber-500 text-base leading-none">❦</div>
          <p className="font-bold text-slate-800 leading-snug">
            {settings.receiptFooterNote || 'Thank you for your purchase!'}
          </p>
          {settings.returnPolicy && (
            <p className="text-[8.5px] text-slate-500 italic leading-snug px-2">
              {settings.returnPolicy}
            </p>
          )}
          
          {/* Decorative Barcode / Footer stamp */}
          <div className="pt-2 flex flex-col items-center">
            <div className="flex gap-[2px] h-6 items-center">
              {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 3].map((w, i) => (
                <div 
                  key={i} 
                  className="bg-slate-800 h-full" 
                  style={{ width: `${w}px` }} 
                />
              ))}
            </div>
            <span className="text-[8px] font-mono tracking-widest text-slate-400 mt-0.5">
              * INV-10048-2026 *
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

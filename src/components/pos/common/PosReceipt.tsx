"use client";

import React from 'react';
import { 
  Printer, 
  QrCode, 
  User, 
  Phone, 
  Clock, 
  Terminal, 
  Plus, 
  Minus, 
  Trash2,
  Edit2
} from 'lucide-react';
import { usePosSettings } from '@/components/pos/settings/PosSettingsContext';
import { PosReceiptSettings } from '@/components/pos/settings/types';
import { printThermalReceipt } from '@/lib/posPrint';

export interface PosReceiptLineItem {
  id?: string | number;
  name: string;
  variantTitle?: string;
  sku?: string;
  barcode?: string | null;
  qty: number;
  price: number;
  total?: number;
}

export interface PosReceiptData {
  orderNumber?: string;
  title?: string;
  date?: string | Date;
  registerLabel?: string;
  cashierName?: string;
  customerName?: string;
  customerPhone?: string | null;
  items: PosReceiptLineItem[];
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  taxes?: Array<{ id?: string; name: string; percentage: number | string; amount?: number }>;
  grandTotal: number;
  paymentMode?: string;
  cashTendered?: number | string;
  changeDue?: number;
  paymentReference?: string;
  notes?: string;
}

export interface PosReceiptProps {
  data: PosReceiptData;
  settings?: PosReceiptSettings;
  paperWidth?: '80mm' | '58mm';
  mode?: 'interactive' | 'static' | 'print-only';
  id?: string;
  className?: string;
  showPrintAction?: boolean;
  onEditCustomer?: () => void;
  onUpdateQty?: (index: number, newQty: number) => void;
  onRemoveItem?: (index: number) => void;
}

export function PosReceipt({
  data,
  settings: propSettings,
  paperWidth: propPaperWidth,
  mode = 'static',
  id = 'pos-thermal-receipt',
  className = '',
  showPrintAction = false,
  onEditCustomer,
  onUpdateQty,
  onRemoveItem,
}: PosReceiptProps) {
  const { receiptSettings: contextSettings } = usePosSettings();
  const settings = propSettings || contextSettings;

  const paperWidth = propPaperWidth || (settings.paperSize === '58mm' ? '58mm' : '80mm');
  const currencySymbol = settings.currencySymbol || '$';

  // Address
  const fullAddress = [
    settings.addressLine1,
    settings.addressLine2,
    [settings.city, settings.state, settings.postalCode].filter(Boolean).join(', ')
  ].filter(Boolean).join(', ');

  // Formatted date
  const displayDate = React.useMemo(() => {
    if (!data.date) {
      return new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    const d = typeof data.date === 'string' ? new Date(data.date) : data.date;
    return isNaN(d.getTime())
      ? String(data.date)
      : d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [data.date]);

  // Taxes
  const taxesList = React.useMemo(() => {
    if (data.taxes && data.taxes.length > 0) {
      return data.taxes;
    }
    if (settings.taxes && settings.taxes.length > 0) {
      return settings.taxes;
    }
    return [{ id: 'tax-1', name: 'Sales Tax', percentage: 8.0 }];
  }, [data.taxes, settings.taxes]);

  const handlePrint = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    printThermalReceipt(id);
  };

  const isInteractive = mode === 'interactive';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Optional Top Action Bar */}
      {showPrintAction && (
        <div className="w-full flex justify-end pb-3 mb-2 border-b border-slate-100 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5 font-medium text-xs shadow-2xs"
          >
            <Printer size={13} />
            <span>Print Receipt</span>
          </button>
        </div>
      )}

      {/* The Thermal Printable Receipt Container */}
      <div
        id={id}
        className={`pos-receipt-printable bg-white border border-slate-200/90 shadow-md font-mono text-[#001c38] transition-all p-5 sm:p-6 rounded-2xl flex flex-col w-full ${
          paperWidth === '58mm' ? 'max-w-[300px] text-[10px]' : 'max-w-[420px] text-[11px]'
        }`}
        style={{
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Header Section: Logo, Branding & Store Details */}
        <div className="text-center mb-3">
          {/* Logo */}
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
            <div className="flex items-center justify-center gap-2 text-[9.5px] text-amber-600 my-2">
              <div className="w-8 h-px bg-amber-200" />
              <span className="italic font-medium">{settings.receiptHeaderNote}</span>
              <div className="w-8 h-px bg-amber-200" />
            </div>
          )}

          {/* Receipt Document Title Badge */}
          <div className="text-center my-1.5">
            <span className="inline-block px-3 py-0.5 border border-slate-300 font-bold uppercase tracking-widest text-[11px] bg-slate-50/80">
              {data.title || 'Tax Invoice / Receipt'}
            </span>
          </div>
        </div>

        {/* Invoice Metadata (Receipt No, Time, Cashier, Customer) */}
        <div className="border-t border-b border-dashed border-slate-300 py-2 mb-3 text-[10px] space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Invoice #:</span>
            <span className="font-bold text-slate-800 font-mono">
              {data.orderNumber || '#DRAFT-SALE'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Register:</span>
            <span className="flex items-center gap-1 text-slate-800 font-medium">
              <Terminal size={10} className="text-slate-400 no-print" />
              <span>{data.registerLabel || 'Terminal #01'}</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Date & Time:</span>
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <Clock size={10} className="text-slate-400 no-print" />
              <span>{displayDate}</span>
            </span>
          </div>

          {settings.showCashierName && (
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Cashier:</span>
              <span className="text-slate-800">{data.cashierName || settings.cashierName || 'Store Staff'}</span>
            </div>
          )}

          {settings.showCustomerInfo && (
            <div className="pt-0.5 border-t border-slate-100/80 space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Customer:</span>
                {isInteractive && onEditCustomer ? (
                  <button
                    type="button"
                    onClick={onEditCustomer}
                    className="font-medium text-[#159A1D] hover:underline flex items-center gap-1 group no-print"
                    title="Click to edit customer details"
                  >
                    <User size={10} />
                    <span>{data.customerName || 'Walk-in Customer'}</span>
                    <Edit2 size={9} className="opacity-70 group-hover:opacity-100" />
                  </button>
                ) : (
                  <span className="font-semibold text-slate-800">
                    {data.customerName || 'Walk-in Customer'}
                  </span>
                )}
              </div>

              {/* Customer Number / Phone Display */}
              {data.customerPhone && (
                <div className="flex justify-between items-center text-[9.5px]">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-700 flex items-center gap-1">
                    <Phone size={9} className="text-slate-400 no-print" />
                    <span>{data.customerPhone}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="mb-3">
          <div className="grid grid-cols-12 bg-slate-100/90 py-1.5 px-2 font-bold text-[10px] uppercase text-slate-700 mb-1.5 rounded-sm">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {data.items.length === 0 ? (
            <div className="py-6 text-center text-slate-400 italic text-[11px]">
              No items in current ticket
            </div>
          ) : (
            <div className="space-y-1.5 px-0.5 text-[10.5px]">
              {data.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="grid grid-cols-12 items-start py-1 border-b border-slate-100 last:border-b-0"
                >
                  <div className="col-span-1 text-slate-400 text-[10px]">{idx + 1}</div>
                  <div className="col-span-6 pr-1">
                    <p className="font-medium leading-tight text-slate-800">
                      {item.name}
                      {item.variantTitle && item.variantTitle !== 'Default' && item.variantTitle !== 'Standard' && (
                        <span className="text-slate-500 font-normal"> ({item.variantTitle})</span>
                      )}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      @ {currencySymbol}{Number(item.price).toFixed(2)}
                      {item.barcode && <span className="no-print"> • {item.barcode}</span>}
                    </p>
                  </div>

                  <div className="col-span-2 text-center">
                    {isInteractive && (onUpdateQty || onRemoveItem) ? (
                      <div className="flex items-center justify-center gap-1 no-print">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.qty <= 1 && onRemoveItem) onRemoveItem(idx);
                            else if (onUpdateQty) onUpdateQty(idx, item.qty - 1);
                          }}
                          className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                        >
                          {item.qty <= 1 ? <Trash2 size={9} /> : <Minus size={9} />}
                        </button>
                        <span className="font-bold text-slate-800 text-[11px] min-w-[14px]">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty && onUpdateQty(idx, item.qty + 1)}
                          className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                        >
                          <Plus size={9} />
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-700">{item.qty}</span>
                    )}
                  </div>

                  <div className="col-span-3 text-right font-bold text-slate-900 font-mono">
                    {currencySymbol}{Number(item.total !== undefined ? item.total : item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculation Totals */}
        <div className="border-t border-dashed border-slate-300 pt-2 mb-3 space-y-1 text-[10.5px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono">{currencySymbol}{Number(data.subtotal || 0).toFixed(2)}</span>
          </div>

          {/* Discount if present */}
          {Number(data.discountTotal) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount Total:</span>
              <span className="font-mono">-{currencySymbol}{Number(data.discountTotal).toFixed(2)}</span>
            </div>
          )}

          {/* Tax Breakdown */}
          {settings.showTaxBreakdown && (
            <>
              {taxesList.map((t, i) => {
                const taxRate = Number(t.percentage) || 0;
                const lineAmount = 'amount' in t && (t as any).amount !== undefined 
                  ? Number((t as any).amount) 
                  : (Number(data.subtotal || 0) * taxRate) / 100;
                return (
                  <div key={t.id || i} className="flex justify-between text-slate-500 text-[10px]">
                    <span>{t.name || 'Tax'} ({taxRate}%):</span>
                    <span className="font-mono">{currencySymbol}{lineAmount.toFixed(2)}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Grand Total */}
          <div className="flex justify-between text-[13px] font-bold text-slate-900 pt-1.5 border-t border-slate-300">
            <span>TOTAL AMOUNT:</span>
            <span className="text-[14px] text-[#001c38] font-bold font-mono">
              {currencySymbol}{Number(data.grandTotal || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Tender Breakdown */}
        {data.paymentMode && (
          <div className="border-t border-dashed border-slate-300 py-2 mb-3 text-[10px] space-y-1 bg-slate-50/70 p-2 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Tender Mode:</span>
              <span className="font-bold text-slate-800">{data.paymentMode}</span>
            </div>

            {data.cashTendered !== undefined && Number(data.cashTendered) > 0 && (
              <>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Cash Tendered:</span>
                  <span className="font-mono font-semibold">
                    {currencySymbol}{Number(data.cashTendered).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-700 font-bold pt-0.5 border-t border-slate-200">
                  <span>Change Due:</span>
                  <span className="font-mono">
                    {currencySymbol}{Number(data.changeDue || 0).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {data.paymentReference && (
              <div className="flex justify-between items-center text-slate-500 text-[9px] pt-0.5">
                <span>Reference:</span>
                <span className="font-mono truncate max-w-[140px]">{data.paymentReference}</span>
              </div>
            )}
          </div>
        )}

        {/* UPI Payments & Dynamic QR Code Box */}
        {settings.showUpiQrOnReceipt && settings.upiId && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 my-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <span className="italic font-bold text-slate-900 text-xs">UPI</span>
                <span className="text-[10px] font-semibold text-slate-700 ml-1">Scan & Pay</span>
              </div>
              <span className="text-[8.5px] text-slate-400 uppercase">Instant Payment</span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="bg-white p-1 border border-slate-200 rounded shrink-0 shadow-2xs">
                {settings.upiQrType === 'custom' && settings.upiQrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.upiQrImageUrl}
                    alt="UPI QR Code"
                    className="w-16 h-16 object-contain"
                  />
                ) : (
                  <div className="relative flex items-center justify-center p-0.5">
                    <QrCode size={56} strokeWidth={1.5} className="text-slate-900" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-[9px] leading-tight space-y-1">
                <p className="font-semibold text-slate-800 truncate">
                  {settings.upiPayeeName || settings.storeName}
                </p>
                <div className="bg-white border border-slate-200 py-0.5 px-1.5 rounded font-mono font-medium text-slate-700 text-center break-all">
                  {settings.upiId}
                </div>
                <p className="text-[8px] text-slate-500 text-center">
                  GPay • PhonePe • Paytm • BHIM
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Gratitude & Return Policy */}
        <div className="text-center pt-2 border-t border-dashed border-slate-300 space-y-1 text-[10px]">
          <div className="text-amber-500 text-sm leading-none">❦</div>
          <p className="font-bold text-slate-800 leading-snug">
            {settings.receiptFooterNote || 'Thank you for your purchase!'}
          </p>
          {settings.returnPolicy && (
            <p className="text-[8.5px] text-slate-500 italic leading-snug px-1">
              {settings.returnPolicy}
            </p>
          )}

          {/* Decorative Barcode / Order Identifier */}
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
              * {data.orderNumber || 'INV-10001'} *
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

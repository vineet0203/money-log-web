"use client";

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { PurchaseBill } from './types';
import { 
  CreditCard, 
  Printer, 
  FileSpreadsheet
} from 'lucide-react';

interface PurchaseBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: PurchaseBill | null;
  onRecordPayment?: (bill: PurchaseBill) => void;
}

export function PurchaseBillModal({
  isOpen,
  onClose,
  bill,
  onRecordPayment,
}: PurchaseBillModalProps) {
  if (!isOpen || !bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase Bill #${bill.billNumber}`}
      description={`Vendor Invoice Reference: ${bill.supplierInvoiceNo}`}
      maxWidth="max-w-3xl"
      cancelText="Close"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2 print:p-0">
        {/* Header Ribbon */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Vendor</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{bill.supplierName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Terms: <span className="font-medium text-slate-700">{bill.paymentTerms}</span>
              {bill.poNumber && <> • Linked PO: <span className="font-mono text-slate-700">{bill.poNumber}</span></>}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between">
            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
              bill.paymentStatus === 'Paid'
                ? 'bg-emerald-100 text-emerald-800'
                : bill.paymentStatus === 'Partial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
            }`}>
              {bill.paymentStatus.toUpperCase()}
            </span>
            <div className="text-xs text-slate-500 mt-1 sm:text-right">
              Due Date: <span className="font-semibold text-slate-800">{bill.dueDate}</span>
            </div>
          </div>
        </div>

        {/* Date and Bill Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-400 block text-[11px]">Bill Date</span>
            <span className="font-semibold text-slate-800">{bill.billDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Due Date</span>
            <span className="font-semibold text-slate-800">{bill.dueDate}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Supplier Inv #</span>
            <span className="font-mono font-semibold text-slate-800">{bill.supplierInvoiceNo}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Payment Status</span>
            <span className="font-semibold text-slate-800">{bill.paymentStatus}</span>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3">Item & SKU</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Cost</th>
                <th className="p-3 text-right">Tax (%)</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bill.items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <p className="font-semibold text-slate-900">{item.itemName}</p>
                    <p className="font-mono text-[11px] text-slate-400">{item.sku}</p>
                  </td>
                  <td className="p-3 text-center font-medium text-slate-800">
                    {item.orderedQty} {item.unit}
                  </td>
                  <td className="p-3 text-right text-slate-700">${item.unitCost.toFixed(2)}</td>
                  <td className="p-3 text-right text-slate-600">{item.taxPercent}%</td>
                  <td className="p-3 text-right font-semibold text-slate-900">${item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <FileSpreadsheet size={13} className="text-[#159A1D]" />
              Procurement & Freight Notes
            </h4>
            <p className="text-slate-600 italic">
              {bill.notes || 'No special instructions recorded on this purchase invoice.'}
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900">${bill.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax:</span>
              <span className="font-medium text-slate-900">${bill.taxTotal.toFixed(2)}</span>
            </div>
            {bill.shippingFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Freight:</span>
                <span className="font-medium text-slate-900">${bill.shippingFee.toFixed(2)}</span>
              </div>
            )}
            {bill.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount / Rebate:</span>
                <span className="font-medium">-${bill.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Grand Total:</span>
              <span>${bill.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1 text-emerald-700 font-semibold">
              <span>Amount Paid:</span>
              <span>${bill.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1 text-rose-600 font-bold border-t border-dashed border-slate-200">
              <span>Balance Due:</span>
              <span>${bill.balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer size={14} />
            Print Invoice
          </button>

          {bill.balanceDue > 0 && onRecordPayment && (
            <button
              onClick={() => {
                onClose();
                onRecordPayment(bill);
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#159A1D] hover:bg-[#128318] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CreditCard size={14} />
              Record Payment (${bill.balanceDue.toFixed(2)})
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

"use client";

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { PurchaseOrder } from './types';
import { 
  Printer, 
  Truck
} from 'lucide-react';

interface PurchaseOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
  onReceiveGoods?: (po: PurchaseOrder) => void;
}

export function PurchaseOrderDetailModal({
  isOpen,
  onClose,
  po,
  onReceiveGoods,
}: PurchaseOrderDetailModalProps) {
  if (!isOpen || !po) return null;

  const handlePrint = () => {
    window.print();
  };

  const allReceived = po.items.every(i => i.receivedQty >= i.orderedQty);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Purchase Order #${po.poNumber}`}
      description={`Vendor: ${po.supplierName}`}
      maxWidth="max-w-3xl"
      cancelText="Close"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2 print:p-0">
        {/* Ribbon Header */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Vendor</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{po.supplierName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Order Date: <span className="font-medium text-slate-700">{po.orderDate}</span> • Expected: <span className="font-semibold text-slate-800">{po.expectedDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              po.status === 'Received'
                ? 'bg-emerald-100 text-emerald-800'
                : po.status === 'Partial'
                  ? 'bg-amber-100 text-amber-800'
                  : po.status === 'Ordered'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-700'
            }`}>
              {po.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Line Items & Receiving Progress */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3">Item & SKU</th>
                <th className="p-3 text-center">Ordered</th>
                <th className="p-3 text-center">Received</th>
                <th className="p-3 text-center">Pending</th>
                <th className="p-3 text-right">Unit Cost</th>
                <th className="p-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {po.items.map(item => {
                const pending = Math.max(0, item.orderedQty - item.receivedQty);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{item.itemName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{item.sku}</p>
                    </td>
                    <td className="p-3 text-center font-medium text-slate-800">
                      {item.orderedQty} {item.unit}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-semibold ${item.receivedQty > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {item.receivedQty} {item.unit}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-semibold ${pending > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {pending} {item.unit}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-700 font-mono">${item.unitCost.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">${item.lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Truck size={13} className="text-[#159A1D]" />
              Shipping Notes & Terms
            </h4>
            <p className="text-slate-600 italic">
              {po.notes || 'Standard delivery terms apply.'}
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900">${po.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax:</span>
              <span className="font-medium text-slate-900">${po.taxTotal.toFixed(2)}</span>
            </div>
            {po.shippingFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Freight:</span>
                <span className="font-medium text-slate-900">${po.shippingFee.toFixed(2)}</span>
              </div>
            )}
            {po.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount / Rebate:</span>
                <span className="font-medium">-${po.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Grand Total:</span>
              <span className="text-emerald-700 font-mono">${po.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer size={14} />
            Print Purchase Order
          </button>

          {!allReceived && po.status !== 'Cancelled' && onReceiveGoods && (
            <button
              onClick={() => {
                onClose();
                onReceiveGoods(po);
              }}
              className="px-4 py-2 text-xs font-semibold bg-[#159A1D] hover:bg-[#128318] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Truck size={14} />
              Receive Consignment (GRN)
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

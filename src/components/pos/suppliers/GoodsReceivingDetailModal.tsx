"use client";

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { GoodsReceivingRecord } from './types';
import { Printer } from 'lucide-react';

interface GoodsReceivingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  grn: GoodsReceivingRecord | null;
}

export function GoodsReceivingDetailModal({
  isOpen,
  onClose,
  grn,
}: GoodsReceivingDetailModalProps) {
  if (!isOpen || !grn) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Goods Received Note (GRN) #${grn.grnNumber}`}
      description={`Purchase Order Reference: ${grn.poNumber}`}
      maxWidth="max-w-4xl"
      cancelText="Close"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2 print:p-0">
        {/* Top Summary Banner */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Supplier</span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{grn.supplierName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Received By: <span className="font-semibold text-slate-800">{grn.receivedBy}</span> • Date: <span className="font-medium text-slate-700">{grn.receivedDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              grn.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : grn.status === 'Partial Discrepancy'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
            }`}>
              {grn.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Quantities Overview Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total Ordered</span>
            <span className="text-xl font-bold text-slate-800 mt-1 block">{grn.totalOrdered} units</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase block">Accepted to Stock</span>
            <span className="text-xl font-bold text-emerald-700 mt-1 block">{grn.totalAccepted} units</span>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-[11px] font-semibold text-rose-500 uppercase block">Damaged / Rejected</span>
            <span className="text-xl font-bold text-rose-600 mt-1 block">{grn.totalDamaged} units</span>
          </div>
        </div>

        {/* Received Items Detail */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3">Item & SKU</th>
                <th className="p-3 text-center">Ordered</th>
                <th className="p-3 text-center font-bold text-emerald-700">Accepted</th>
                <th className="p-3 text-center font-bold text-rose-600">Damaged</th>
                <th className="p-3">Batch / Lot #</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3">Dock Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grn.items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <p className="font-semibold text-slate-900">{item.itemName}</p>
                    <p className="font-mono text-[11px] text-slate-400">{item.sku}</p>
                  </td>
                  <td className="p-3 text-center font-medium text-slate-700">
                    {item.orderedQty} {item.unit}
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-700">
                    {item.acceptedQty} {item.unit}
                  </td>
                  <td className="p-3 text-center font-bold text-rose-600">
                    {item.damagedQty}
                  </td>
                  <td className="p-3 font-mono font-medium text-slate-800">
                    {item.batchNumber}
                  </td>
                  <td className="p-3 text-slate-600">
                    {item.expiryDate}
                  </td>
                  <td className="p-3 text-slate-500 italic">
                    {item.remarks || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {grn.notes && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">Dock Intake Notes:</span>
            <p className="text-slate-600 italic">{grn.notes}</p>
          </div>
        )}

        {/* Print Slip Button */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer size={14} />
            Print Goods Received Note (GRN)
          </button>
        </div>
      </div>
    </Modal>
  );
}

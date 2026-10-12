"use client";

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useSuppliers } from './SuppliersContext';
import { PurchaseOrder } from './types';
import { goodsReceivingFormSchema } from './schema';
import { 
  AlertCircle, 
  FileText
} from 'lucide-react';

interface GoodsReceivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPoNumber?: string;
}

interface EditableReceivingItem {
  sku: string;
  itemName: string;
  unit: string;
  orderedQty: number;
  previouslyReceived: number;
  receivedQty: number;
  damagedQty: number;
  unitCost: number;
  batchNumber: string;
  expiryDate: string;
  remarks: string;
}

export function GoodsReceivingModal({
  isOpen,
  onClose,
  preSelectedPoNumber,
}: GoodsReceivingModalProps) {
  if (!isOpen) return null;

  return (
    <GoodsReceivingFormDialog
      isOpen={isOpen}
      onClose={onClose}
      preSelectedPoNumber={preSelectedPoNumber}
      key={preSelectedPoNumber || 'new-grn'}
    />
  );
}

function computeInitialItems(po?: PurchaseOrder): EditableReceivingItem[] {
  if (!po) return [];
  return po.items.map((item, idx) => {
    const remaining = Math.max(0, item.orderedQty - item.receivedQty);
    return {
      sku: item.sku,
      itemName: item.itemName,
      unit: item.unit,
      orderedQty: item.orderedQty,
      previouslyReceived: item.receivedQty,
      receivedQty: remaining,
      damagedQty: 0,
      unitCost: item.unitCost,
      batchNumber: `LOT-${item.sku.slice(0, 3)}-${new Date().getFullYear()}-${idx + 10}`,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      remarks: 'Packaging intact',
    };
  });
}

function GoodsReceivingFormDialog({
  isOpen,
  onClose,
  preSelectedPoNumber,
}: {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPoNumber?: string;
}) {
  const { purchaseOrders, processGoodsReceiving } = useSuppliers();

  // Eligible POs: Ordered or Partial
  const eligiblePOs = useMemo(() => {
    return purchaseOrders.filter(p => p.status === 'Ordered' || p.status === 'Partial');
  }, [purchaseOrders]);

  const [selectedPoNumber, setSelectedPoNumber] = useState<string>(() => {
    if (preSelectedPoNumber) return preSelectedPoNumber;
    return eligiblePOs[0]?.poNumber || '';
  });

  const selectedPO = useMemo(() => {
    return purchaseOrders.find(p => p.poNumber === selectedPoNumber);
  }, [purchaseOrders, selectedPoNumber]);

  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [receivedBy, setReceivedBy] = useState('Elena Rostova (Store Manager)');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<EditableReceivingItem[]>(() => {
    const po = purchaseOrders.find(p => p.poNumber === (preSelectedPoNumber || eligiblePOs[0]?.poNumber || ''));
    return computeInitialItems(po);
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePoChange = (newPoNum: string) => {
    setSelectedPoNumber(newPoNum);
    const newPo = purchaseOrders.find(p => p.poNumber === newPoNum);
    setItems(computeInitialItems(newPo));
  };

  const handleUpdateItem = (sku: string, updates: Partial<EditableReceivingItem>) => {
    setItems(prev => prev.map(i => i.sku === sku ? { ...i, ...updates } : i));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      poNumber: selectedPoNumber,
      receivedDate,
      receivedBy,
      notes,
      items,
    };

    const validation = goodsReceivingFormSchema.safeParse(formData);

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        if (!errMap[path]) errMap[path] = issue.message;
      });
      setErrors(errMap);
      return;
    }

    setIsSubmitting(true);
    try {
      processGoodsReceiving(validation.data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => {
        const form = document.getElementById('grn-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }}
      title="Goods Receiving Note (GRN)"
      description="Inspect delivery, verify batch codes and damaged units, and replenish inventory stock."
      submitText={isSubmitting ? 'Receiving...' : 'Confirm Goods Intake'}
      maxWidth="max-w-4xl"
    >
      <form id="grn-form" onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Please resolve errors before continuing:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-600">
                {Object.values(errors).slice(0, 3).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* PO Selector & Logistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Select Purchase Order <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedPoNumber}
              onChange={e => handlePoChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
            >
              {eligiblePOs.map(po => (
                <option key={po.id} value={po.poNumber}>
                  {po.poNumber} — {po.supplierName} ({po.status})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Received Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={receivedDate}
              onChange={e => setReceivedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Received & Inspected By <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={receivedBy}
              onChange={e => setReceivedBy(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
            />
          </div>
        </div>

        {/* Selected PO Details Card */}
        {selectedPO && (
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/70 rounded-xl flex items-center justify-between text-xs text-slate-700">
            <div>
              <span className="font-bold text-slate-900">{selectedPO.supplierName}</span>
              <span className="text-slate-500 ml-2">Ordered on {selectedPO.orderDate}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-600">Total PO Value: <strong className="text-slate-900">${selectedPO.grandTotal.toFixed(2)}</strong></span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">{selectedPO.status}</span>
            </div>
          </div>
        )}

        {/* Verification & Inspection Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3 w-1/4">Item & SKU</th>
                <th className="p-3 text-center">Ordered</th>
                <th className="p-3 text-center">Prior Recv</th>
                <th className="p-3 text-center w-24">Receiving Now</th>
                <th className="p-3 text-center w-24 text-rose-600">Damaged</th>
                <th className="p-3 text-center font-bold text-emerald-700">Net Accepted</th>
                <th className="p-3 w-28">Batch / Lot #</th>
                <th className="p-3 w-28">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => {
                const netAccepted = Math.max(0, item.receivedQty - item.damagedQty);
                return (
                  <tr key={item.sku} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{item.itemName}</p>
                      <p className="font-mono text-[11px] text-slate-400">{item.sku}</p>
                    </td>

                    <td className="p-3 text-center text-slate-700 font-medium">
                      {item.orderedQty} {item.unit}
                    </td>

                    <td className="p-3 text-center text-slate-500">
                      {item.previouslyReceived}
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.receivedQty}
                        onChange={e => handleUpdateItem(item.sku, { receivedQty: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-18 px-2 py-1 text-center font-bold border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={item.damagedQty}
                        onChange={e => handleUpdateItem(item.sku, { damagedQty: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-18 px-2 py-1 text-center font-semibold text-rose-600 border border-rose-200 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-400 bg-rose-50/30"
                      />
                    </td>

                    <td className="p-3 text-center font-bold text-emerald-700 text-sm">
                      {netAccepted}
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="LOT-2026"
                        value={item.batchNumber}
                        onChange={e => handleUpdateItem(item.sku, { batchNumber: e.target.value })}
                        className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>

                    <td className="p-3">
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={e => handleUpdateItem(item.sku, { expiryDate: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dock Receiving Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <FileText size={14} className="text-[#159A1D]" />
            Dock Inspection Remarks & QA Sign-Off
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Record seals, temperature logs, packaging integrity, or credit note requests for damaged units..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
          />
        </div>
      </form>
    </Modal>
  );
}

"use client";

import React, { useState, useMemo } from 'react';
import { useSuppliers } from './SuppliersContext';
import { CATALOG_ITEMS, CatalogItemOption, PaymentTerm } from './types';
import { createPurchaseSchema } from './schema';
import { 
  ShoppingBag, 
  Receipt, 
  Building2, 
  Plus, 
  Trash2, 
  DollarSign, 
  Tag, 
  Percent, 
  Truck, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreatePurchaseTabProps {
  initialSupplierId?: string;
  onSuccessNavigate?: (tabName: string) => void;
}

interface EditableLineItem {
  id: string;
  productId?: number;
  variantId?: string;
  sku: string;
  itemName: string;
  unit: string;
  orderedQty: number;
  unitCost: number;
  taxPercent: number;
}

export function CreatePurchaseTab({
  initialSupplierId,
  onSuccessNavigate,
}: CreatePurchaseTabProps) {
  const { suppliers, createPurchaseOrder, createPurchaseBill } = useSuppliers();

  // Document Type: PO vs Direct Bill
  const [purchaseType, setPurchaseType] = useState<'PurchaseOrder' | 'DirectBill'>('PurchaseOrder');

  // Supplier Selection
  const [supplierId, setSupplierId] = useState<string>(
    initialSupplierId || (suppliers[0]?.id || '')
  );

  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.id === supplierId);
  }, [suppliers, supplierId]);

  // Dates
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDateOrExpectedDate, setDueDateOrExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm>(
    selectedSupplier?.paymentTerms || 'Net 30'
  );

  // Line Items
  const [items, setItems] = useState<EditableLineItem[]>([
    {
      id: 'item-1',
      productId: CATALOG_ITEMS[0].productId,
      sku: CATALOG_ITEMS[0].sku,
      itemName: CATALOG_ITEMS[0].name,
      unit: CATALOG_ITEMS[0].unit,
      orderedQty: 25,
      unitCost: CATALOG_ITEMS[0].costPrice,
      taxPercent: 5,
    },
    {
      id: 'item-2',
      productId: CATALOG_ITEMS[4].productId,
      sku: CATALOG_ITEMS[4].sku,
      itemName: CATALOG_ITEMS[4].name,
      unit: CATALOG_ITEMS[4].unit,
      orderedQty: 100,
      unitCost: CATALOG_ITEMS[4].costPrice,
      taxPercent: 5,
    }
  ]);

  // Charges
  const [shippingFee, setShippingFee] = useState<number>(35);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Form Feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // When supplier changes, update payment terms
  const handleSupplierChange = (newSupId: string) => {
    setSupplierId(newSupId);
    const sup = suppliers.find(s => s.id === newSupId);
    if (sup) {
      setPaymentTerms(sup.paymentTerms);
    }
  };

  // Add Item Row
  const handleAddItemRow = (catalogItem?: CatalogItemOption) => {
    const nextItem: EditableLineItem = catalogItem ? {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: catalogItem.productId,
      sku: catalogItem.sku,
      itemName: catalogItem.name,
      unit: catalogItem.unit,
      orderedQty: 10,
      unitCost: catalogItem.costPrice,
      taxPercent: 5,
    } : {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: '',
      itemName: '',
      unit: 'pcs',
      orderedQty: 1,
      unitCost: 0,
      taxPercent: 5,
    };

    setItems([...items, nextItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<EditableLineItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleSelectCatalogItem = (rowId: string, sku: string) => {
    const found = CATALOG_ITEMS.find(c => c.sku === sku);
    if (found) {
      handleUpdateItem(rowId, {
        productId: found.productId,
        sku: found.sku,
        itemName: found.name,
        unit: found.unit,
        unitCost: found.costPrice,
      });
    }
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.orderedQty * item.unitCost), 0);
  }, [items]);

  const taxTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const lineCost = item.orderedQty * item.unitCost;
      return sum + ((lineCost * item.taxPercent) / 100);
    }, 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + taxTotal + shippingFee - discount);
  }, [subtotal, taxTotal, shippingFee, discount]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    const formData = {
      type: purchaseType,
      supplierId,
      date,
      dueDateOrExpectedDate,
      supplierInvoiceNo: purchaseType === 'DirectBill' ? supplierInvoiceNo : '',
      paymentTerms,
      shippingFee,
      discount,
      items,
      notes,
    };

    const validation = createPurchaseSchema.safeParse(formData);

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        if (!errMap[path]) {
          errMap[path] = issue.message;
        }
      });
      setErrors(errMap);
      return;
    }

    if (purchaseType === 'PurchaseOrder') {
      const newPO = createPurchaseOrder(validation.data);
      setSuccessMessage(`Purchase Order #${newPO.poNumber} successfully issued to ${newPO.supplierName}!`);
      setTimeout(() => {
        if (onSuccessNavigate) onSuccessNavigate('Purchase Orders');
      }, 1200);
    } else {
      const newBill = createPurchaseBill(validation.data);
      setSuccessMessage(`Purchase Bill #${newBill.billNumber} successfully recorded with balance due of $${newBill.balanceDue.toFixed(2)}.`);
      setTimeout(() => {
        if (onSuccessNavigate) onSuccessNavigate('All Purchases');
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#159A1D]" />
            Procurement & Purchase Generator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue vendor purchase orders or log incoming direct vendor supplier invoices.
          </p>
        </div>

        {/* Type Toggle Pills */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setPurchaseType('PurchaseOrder')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              purchaseType === 'PurchaseOrder'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag size={14} className={purchaseType === 'PurchaseOrder' ? 'text-[#159A1D]' : 'text-slate-400'} />
            Issue Purchase Order (PO)
          </button>
          <button
            type="button"
            onClick={() => setPurchaseType('DirectBill')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              purchaseType === 'DirectBill'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt size={14} className={purchaseType === 'DirectBill' ? 'text-[#159A1D]' : 'text-slate-400'} />
            Record Direct Purchase Bill
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in duration-300">
          <CheckCircle2 size={18} className="text-[#159A1D] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Errors Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs">
          <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Please correct the following fields:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-600">
              {Object.values(errors).slice(0, 4).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier & Header Metadata */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Building2 size={14} className="text-[#159A1D]" />
            Vendor & Order Logistics
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Supplier / Vendor <span className="text-rose-500">*</span>
              </label>
              <select
                value={supplierId}
                onChange={e => handleSupplierChange(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {purchaseType === 'PurchaseOrder' ? 'Order Date' : 'Bill Date'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {purchaseType === 'PurchaseOrder' ? 'Expected Delivery' : 'Payment Due Date'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDateOrExpectedDate}
                onChange={e => setDueDateOrExpectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
              />
            </div>

            {purchaseType === 'DirectBill' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Supplier Invoice #
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-OR-908"
                  value={supplierInvoiceNo}
                  onChange={e => setSupplierInvoiceNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value as PaymentTerm)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Supplier Info Banner */}
          {selectedSupplier && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-4">
                <span>Contact: <strong className="text-slate-800">{selectedSupplier.contactPerson}</strong> ({selectedSupplier.phone})</span>
                <span>City: <strong className="text-slate-800">{selectedSupplier.city}</strong></span>
                <span>Tax ID: <strong className="text-slate-800">{selectedSupplier.gstTaxNumber}</strong></span>
              </div>
              <div>
                <span>Balance Payable: </span>
                <strong className={selectedSupplier.balancePayable > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                  ${selectedSupplier.balancePayable.toFixed(2)}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Tag size={14} className="text-[#159A1D]" />
                Line Items & Quantities
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Pick from inventory catalog or key in custom materials.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddItemRow()}
                className="gap-1.5"
              >
                <Plus size={14} />
                Add Custom Row
              </Button>
            </div>
          </div>

          {/* Catalog Quick Add Chips */}
          <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2 flex items-center gap-1">
              <Sparkles size={12} className="text-[#159A1D]" />
              Quick Pick From Store Catalog:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATALOG_ITEMS.slice(0, 7).map(catItem => (
                <button
                  type="button"
                  key={catItem.sku}
                  onClick={() => handleAddItemRow(catItem)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#159A1D] border border-slate-200 hover:border-[#159A1D]/40 rounded-md transition-all shadow-2xs"
                >
                  + {catItem.name} (${catItem.costPrice.toFixed(2)})
                </button>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-1/3">Item Description</th>
                  <th className="p-3 w-28">SKU</th>
                  <th className="p-3 w-24 text-center">Qty</th>
                  <th className="p-3 w-24">Unit</th>
                  <th className="p-3 w-28 text-right">Cost Price ($)</th>
                  <th className="p-3 w-24 text-right">Tax (%)</th>
                  <th className="p-3 w-28 text-right">Line Total</th>
                  <th className="p-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="space-y-1">
                        <select
                          value={item.sku}
                          onChange={e => handleSelectCatalogItem(item.id, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                        >
                          <option value="">Custom Item / Select from catalog</option>
                          {CATALOG_ITEMS.map(c => (
                            <option key={c.sku} value={c.sku}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Item Name (e.g. Colombian Supremo)"
                          value={item.itemName}
                          onChange={e => handleUpdateItem(item.id, { itemName: e.target.value })}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                        />
                      </div>
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="SKU"
                        value={item.sku}
                        onChange={e => handleUpdateItem(item.id, { sku: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs font-mono border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.orderedQty}
                        onChange={e => handleUpdateItem(item.id, { orderedQty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-20 px-2 py-1.5 text-xs text-center border border-slate-200 rounded-md font-semibold focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>

                    <td className="p-3">
                      <select
                        value={item.unit}
                        onChange={e => handleUpdateItem(item.id, { unit: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      >
                        <option value="pack">pack</option>
                        <option value="box">box</option>
                        <option value="bottle">bottle</option>
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </td>

                    <td className="p-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={e => handleUpdateItem(item.id, { unitCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-24 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>

                    <td className="p-3 text-right">
                      <select
                        value={item.taxPercent}
                        onChange={e => handleUpdateItem(item.id, { taxPercent: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="8">8%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                      </select>
                    </td>

                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      ${((item.orderedQty * item.unitCost) * (1 + item.taxPercent / 100)).toFixed(2)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="p-1 text-slate-300 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-300 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation Summary & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileText size={14} className="text-[#159A1D]" />
              Procurement & Delivery Remarks
            </h4>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Deliver to rear loading bay between 8:00 AM - 11:00 AM. Pallet jack required. Inspection by lead barista."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
            />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <DollarSign size={14} className="text-[#159A1D]" />
              Financial Calculation
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.reduce((s, i) => s + i.orderedQty, 0)} units):</span>
                <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax:</span>
                <span className="font-semibold text-slate-800">${taxTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between gap-4 text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <Truck size={13} className="text-slate-400" />
                  Freight & Shipping:
                </span>
                <div className="flex items-center gap-1">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={shippingFee}
                    onChange={e => setShippingFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-1 text-xs text-right border border-slate-200 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <Percent size={13} className="text-slate-400" />
                  Trade Discount / Rebate:
                </span>
                <div className="flex items-center gap-1">
                  <span>-$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={discount}
                    onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-20 px-2 py-1 text-xs text-right border border-slate-200 rounded-md font-mono text-emerald-700 focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-lg text-emerald-700 font-mono">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full gap-2"
              >
                {purchaseType === 'PurchaseOrder' ? (
                  <>
                    <ShoppingBag size={16} />
                    Submit & Issue Purchase Order
                  </>
                ) : (
                  <>
                    <Receipt size={16} />
                    Post & Record Purchase Bill
                  </>
                )}
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

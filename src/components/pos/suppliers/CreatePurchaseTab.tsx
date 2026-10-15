"use client";

import React, { useState, useMemo } from 'react';
import { useSuppliers } from './SuppliersContext';
import { CatalogItemOption, PaymentTerm } from './types';
import { useGetPosProducts } from '@/hooks/queries/posProducts';
import { createPurchaseSchema } from './schema';
import { 
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
import { Select } from '@/components/pos/common';

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
  const { suppliers, createPurchaseBill } = useSuppliers();
  const { data: productsData } = useGetPosProducts({ limit: 100 });

  // Map live catalog products & variants into selectable catalog items
  const catalogOptions: CatalogItemOption[] = useMemo(() => {
    if (!productsData?.data || productsData.data.length === 0) {
      return [];
    }
    const list: CatalogItemOption[] = [];
    productsData.data.forEach(p => {
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach(v => {
          list.push({
            productId: p.id,
            variantId: v.id ? String(v.id) : undefined,
            sku: v.sku || `SKU-${v.id}`,
            name: `${p.name} (${v.title})`,
            unit: p.base_unit || 'pcs',
            costPrice: Number(v.cost_price || 0),
            category: p.category_name || 'General'
          });
        });
      } else {
        list.push({
          productId: p.id,
          sku: `PROD-${p.id}`,
          name: p.name,
          unit: p.base_unit || 'pcs',
          costPrice: 0,
          category: p.category_name || 'General'
        });
      }
    });
    return list;
  }, [productsData]);

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
      sku: '',
      itemName: '',
      unit: 'pcs',
      orderedQty: 1,
      unitCost: 0,
      taxPercent: 0,
    }
  ]);

  // Charges
  const [shippingFee, setShippingFee] = useState<number>(0);
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
      variantId: catalogItem.variantId,
      sku: catalogItem.sku,
      itemName: catalogItem.name,
      unit: catalogItem.unit,
      orderedQty: 1,
      unitCost: catalogItem.costPrice,
      taxPercent: 0,
    } : {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sku: '',
      itemName: '',
      unit: 'pcs',
      orderedQty: 1,
      unitCost: 0,
      taxPercent: 0,
    };

    setItems([...items, nextItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<EditableLineItem>) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleSelectCatalogItem = (rowId: string, sku: string) => {
    const found = catalogOptions.find(c => c.sku === sku);
    if (found) {
      handleUpdateItem(rowId, {
        productId: found.productId,
        variantId: found.variantId,
        sku: found.sku,
        itemName: found.name,
        unit: found.unit,
        unitCost: found.costPrice,
      });
    } else {
      handleUpdateItem(rowId, { sku });
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

  // Submit Handler - Direct Purchase Only
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    const formData = {
      type: 'DirectBill' as const,
      supplierId,
      date,
      dueDateOrExpectedDate,
      supplierInvoiceNo,
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

    const newBill = createPurchaseBill(validation.data);
    setSuccessMessage(`Purchase Bill #${newBill.billNumber} successfully recorded with balance due of $${newBill.balanceDue.toFixed(2)}. Inventory stock updated.`);
    setTimeout(() => {
      if (onSuccessNavigate) onSuccessNavigate('All Purchases');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt size={18} className="text-[#159A1D]" />
            Direct Purchase Bill Entry
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Record incoming vendor purchase bills, replenish store inventory in real-time, and update trade payables.
          </p>
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
            Vendor & Invoice Logistics
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Select
                label="Supplier / Vendor"
                required
                value={supplierId}
                onChange={handleSupplierChange}
                options={suppliers.map(s => ({
                  value: s.id,
                  label: `${s.name} (${s.code})`
                }))}
                placeholder={suppliers.length === 0 ? "No suppliers registered" : "Select supplier..."}
              />
              {errors.supplierId && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.supplierId}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                Payment Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDateOrExpectedDate}
                onChange={e => setDueDateOrExpectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
              />
            </div>

            <div>
              <Select
                label="Payment Terms"
                value={paymentTerms}
                onChange={val => setPaymentTerms(val as PaymentTerm)}
                options={[
                  { value: 'Due on Receipt', label: 'Due on Receipt' },
                  { value: 'Net 15', label: 'Net 15' },
                  { value: 'Net 30', label: 'Net 30' },
                  { value: 'Net 60', label: 'Net 60' },
                  { value: 'Cash on Delivery', label: 'Cash on Delivery' },
                ]}
              />
            </div>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supplier Invoice #
            </label>
            <input
              type="text"
              placeholder="e.g. INV-OR-908"
              value={supplierInvoiceNo}
              onChange={e => setSupplierInvoiceNo(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
            />
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
                Add Item Row
              </Button>
            </div>
          </div>

          {/* Catalog Quick Add Chips */}
          {catalogOptions.length > 0 && (
            <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-[#159A1D]" />
                Quick Pick From Store Catalog:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {catalogOptions.slice(0, 8).map(catItem => (
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
          )}

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-visible">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-3 w-1/3">Item / Catalog Selection</th>
                  <th className="p-3 w-28">SKU</th>
                  <th className="p-3 w-24 text-center">Qty</th>
                  <th className="p-3 w-28">Unit</th>
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
                      <div className="space-y-1.5">
                        {catalogOptions.length > 0 && (
                          <Select
                            size="sm"
                            value={item.sku}
                            onChange={val => handleSelectCatalogItem(item.id, val)}
                            options={[
                              { value: '', label: 'Custom Item (or select catalog)' },
                              ...catalogOptions.map(c => ({
                                value: c.sku,
                                label: `${c.name} (${c.sku})`
                              }))
                            ]}
                            placeholder="Select from catalog..."
                          />
                        )}
                        <input
                          type="text"
                          placeholder="Item Name (e.g. Colombian Supremo)"
                          value={item.itemName}
                          onChange={e => handleUpdateItem(item.id, { itemName: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                        />
                      </div>
                    </td>

                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="SKU"
                        value={item.sku}
                        onChange={e => handleUpdateItem(item.id, { sku: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.orderedQty}
                        onChange={e => handleUpdateItem(item.id, { orderedQty: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-20 px-2 py-1.5 text-xs text-center border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>

                    <td className="p-3">
                      <Select
                        size="sm"
                        value={item.unit}
                        onChange={val => handleUpdateItem(item.id, { unit: val })}
                        options={[
                          { value: 'pack', label: 'pack' },
                          { value: 'box', label: 'box' },
                          { value: 'bottle', label: 'bottle' },
                          { value: 'kg', label: 'kg' },
                          { value: 'pcs', label: 'pcs' },
                        ]}
                      />
                    </td>

                    <td className="p-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitCost}
                        onChange={e => handleUpdateItem(item.id, { unitCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-24 px-2 py-1.5 text-xs text-right border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
                      />
                    </td>

                    <td className="p-3 text-right">
                      <Select
                        size="sm"
                        value={String(item.taxPercent)}
                        onChange={val => handleUpdateItem(item.id, { taxPercent: parseFloat(val) || 0 })}
                        options={[
                          { value: '0', label: '0%' },
                          { value: '5', label: '5%' },
                          { value: '8', label: '8%' },
                          { value: '12', label: '12%' },
                          { value: '18', label: '18%' },
                        ]}
                      />
                    </td>

                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      ${((item.orderedQty * item.unitCost) * (1 + item.taxPercent / 100)).toFixed(2)}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                        className="p-1.5 text-slate-300 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-300 rounded-lg transition-colors"
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
              Purchase & Consignment Remarks
            </h4>
            <textarea
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Received at rear bay. Invoice verified by store manager."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
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
                    className="w-20 px-2 py-1 text-xs text-right border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
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
                    className="w-20 px-2 py-1 text-xs text-right border border-slate-200 rounded-lg font-mono text-emerald-700 focus:outline-none focus:ring-1 focus:ring-[#159A1D]"
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
                <Receipt size={16} />
                Record Direct Purchase & Restock
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

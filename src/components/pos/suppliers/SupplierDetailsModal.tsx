"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Supplier } from './types';
import { useSuppliers } from './SuppliersContext';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  DollarSign, 
  ShoppingBag, 
  FileSpreadsheet
} from 'lucide-react';

interface SupplierDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onEdit: (supplier: Supplier) => void;
  onCreatePO: (supplierId: string) => void;
  onRecordPayment: (supplierId: string) => void;
}

export function SupplierDetailsModal({
  isOpen,
  onClose,
  supplier,
  onEdit,
  onCreatePO,
  onRecordPayment,
}: SupplierDetailsModalProps) {
  const { purchaseOrders, purchases, payments } = useSuppliers();
  const [activeLedgerTab, setActiveLedgerTab] = useState<'bills' | 'pos' | 'payments'>('bills');

  if (!isOpen || !supplier) return null;

  const supplierBills = purchases.filter(b => b.supplierId === supplier.id);
  const supplierPOs = purchaseOrders.filter(p => p.supplierId === supplier.id);
  const supplierPayments = payments.filter(p => p.supplierId === supplier.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${supplier.name} (${supplier.code})`}
      description="Supplier credentials, banking profile, and full procurement transaction ledger."
      maxWidth="max-w-4xl"
      cancelText="Close"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {/* Top Summary Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50/40 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
              <Building2 size={24} className="text-[#159A1D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{supplier.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  supplier.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {supplier.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Contact: <span className="font-medium text-slate-700">{supplier.contactPerson}</span> • Code: {supplier.code}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {supplier.email}</span>
                <span className="flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {supplier.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={12} className="text-slate-400" /> {supplier.city}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500 uppercase">Outstanding Balance</p>
              <p className={`text-xl font-bold ${supplier.balancePayable > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                ${supplier.balancePayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              onClose();
              onCreatePO(supplier.id);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#159A1D] hover:bg-[#128318] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ShoppingBag size={14} />
            Create Purchase Order
          </button>
          {supplier.balancePayable > 0 && (
            <button
              onClick={() => {
                onClose();
                onRecordPayment(supplier.id);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <DollarSign size={14} />
              Record Payment
            </button>
          )}
          <button
            onClick={() => {
              onClose();
              onEdit(supplier);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors ml-auto"
          >
            Edit Supplier Info
          </button>
        </div>

        {/* Vendor Profile & Banking Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet size={14} className="text-[#159A1D]" />
              Account & Settlement Terms
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Payment Terms</span>
                <span className="font-semibold text-slate-800">{supplier.paymentTerms}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tax / GST Number</span>
                <span className="font-semibold text-slate-800">{supplier.gstTaxNumber || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Physical Address</span>
                <span className="text-slate-700">{supplier.address}, {supplier.city}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Catalog Categories</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {supplier.categoriesSupplied.map(cat => (
                    <span key={cat} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={14} className="text-[#159A1D]" />
              Bank Wire & UPI Remittance
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Bank Name</span>
                <span className="font-semibold text-slate-800">{supplier.bankDetails.bankName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Account Number</span>
                <span className="font-mono font-medium text-slate-800">{supplier.bankDetails.accountNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">IFSC / SWIFT</span>
                <span className="font-mono font-medium text-slate-800">{supplier.bankDetails.ifscOrSwift}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">UPI ID</span>
                <span className="text-slate-700">{supplier.bankDetails.upiId || 'Not provided'}</span>
              </div>
            </div>
            {supplier.notes && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px]">Internal Notes</span>
                <p className="text-slate-600 italic text-[11px] mt-0.5">{supplier.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-[#159A1D]" />
              Procurement & Ledger Activity
            </h4>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveLedgerTab('bills')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeLedgerTab === 'bills' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Invoices ({supplierBills.length})
              </button>
              <button
                onClick={() => setActiveLedgerTab('pos')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeLedgerTab === 'pos' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Purchase Orders ({supplierPOs.length})
              </button>
              <button
                onClick={() => setActiveLedgerTab('payments')}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  activeLedgerTab === 'payments' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Payments ({supplierPayments.length})
              </button>
            </div>
          </div>

          {/* Bills Ledger Panel */}
          {activeLedgerTab === 'bills' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {supplierBills.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No purchase invoices on record for this vendor.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Bill Number</th>
                      <th className="p-3">Supplier Inv #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Grand Total</th>
                      <th className="p-3 text-right">Balance Due</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplierBills.map(bill => (
                      <tr key={bill.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900">{bill.billNumber}</td>
                        <td className="p-3 text-slate-600 font-mono">{bill.supplierInvoiceNo}</td>
                        <td className="p-3 text-slate-500">{bill.billDate}</td>
                        <td className="p-3 text-right font-medium text-slate-900">${bill.grandTotal.toFixed(2)}</td>
                        <td className={`p-3 text-right font-semibold ${bill.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          ${bill.balanceDue.toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            bill.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : bill.paymentStatus === 'Partial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                          }`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* POs Ledger Panel */}
          {activeLedgerTab === 'pos' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {supplierPOs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No purchase orders placed yet with this vendor.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Order Date</th>
                      <th className="p-3">Expected Date</th>
                      <th className="p-3">Items</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Order Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplierPOs.map(po => (
                      <tr key={po.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900">{po.poNumber}</td>
                        <td className="p-3 text-slate-500">{po.orderDate}</td>
                        <td className="p-3 text-slate-500">{po.expectedDate}</td>
                        <td className="p-3 text-slate-600">{po.items.length} product(s)</td>
                        <td className="p-3 text-right font-medium text-slate-900">${po.grandTotal.toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            po.status === 'Received'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.status === 'Partial'
                                ? 'bg-amber-100 text-amber-800'
                                : po.status === 'Ordered'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Payments Ledger Panel */}
          {activeLedgerTab === 'payments' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {supplierPayments.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">No payment records found for this vendor.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Payment #</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3">Reference / UTR</th>
                      <th className="p-3 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supplierPayments.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900">{pay.paymentNumber}</td>
                        <td className="p-3 text-slate-500">{pay.paymentDate}</td>
                        <td className="p-3 text-slate-700 font-medium">{pay.paymentMode}</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">{pay.referenceNumber}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">${pay.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

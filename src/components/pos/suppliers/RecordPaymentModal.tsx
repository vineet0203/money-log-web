"use client";

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useSuppliers } from './SuppliersContext';
import { PaymentMethod } from './types';
import { supplierPaymentFormSchema } from './schema';
import { 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedSupplierId?: string;
  preSelectedBillNumber?: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  preSelectedSupplierId,
  preSelectedBillNumber,
}: RecordPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <RecordPaymentFormDialog
      isOpen={isOpen}
      onClose={onClose}
      preSelectedSupplierId={preSelectedSupplierId}
      preSelectedBillNumber={preSelectedBillNumber}
      key={`${preSelectedSupplierId || 'sup'}-${preSelectedBillNumber || 'bill'}`}
    />
  );
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Transfer',
  'UPI',
  'Cheque',
  'Cash',
  'Card'
];

function RecordPaymentFormDialog({
  isOpen,
  onClose,
  preSelectedSupplierId,
  preSelectedBillNumber,
}: {
  isOpen: boolean;
  onClose: () => void;
  preSelectedSupplierId?: string;
  preSelectedBillNumber?: string;
}) {
  const { suppliers, purchases, recordSupplierPayment } = useSuppliers();

  // Suppliers with positive balance or pre-selected
  const eligibleSuppliers = useMemo(() => {
    return suppliers.filter(s => s.balancePayable > 0 || s.id === preSelectedSupplierId);
  }, [suppliers, preSelectedSupplierId]);

  const [supplierId, setSupplierId] = useState<string>(() => {
    if (preSelectedSupplierId) return preSelectedSupplierId;
    return eligibleSuppliers[0]?.id || suppliers[0]?.id || '';
  });

  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.id === supplierId);
  }, [suppliers, supplierId]);

  // Open bills for selected supplier
  const supplierOpenBills = useMemo(() => {
    return purchases.filter(b => b.supplierId === supplierId && b.paymentStatus !== 'Paid');
  }, [purchases, supplierId]);

  const [billNumber, setBillNumber] = useState<string>(preSelectedBillNumber || '');
  const [amount, setAmount] = useState<number>(() => {
    if (preSelectedBillNumber) {
      const b = purchases.find(p => p.billNumber === preSelectedBillNumber);
      return b ? b.balanceDue : 0;
    }
    const sup = suppliers.find(s => s.id === (preSelectedSupplierId || eligibleSuppliers[0]?.id || suppliers[0]?.id || ''));
    return sup?.balancePayable || 0;
  });

  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSupplierSelect = (newSupplierId: string) => {
    setSupplierId(newSupplierId);
    setBillNumber('');
    const sup = suppliers.find(s => s.id === newSupplierId);
    if (sup) setAmount(sup.balancePayable);
  };

  const handleBillSelect = (newBillNumber: string) => {
    setBillNumber(newBillNumber);
    if (newBillNumber) {
      const b = purchases.find(p => p.billNumber === newBillNumber);
      if (b) setAmount(b.balanceDue);
    } else if (selectedSupplier) {
      setAmount(selectedSupplier.balancePayable);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      supplierId,
      billNumber: billNumber || undefined,
      amount,
      paymentDate,
      paymentMode,
      referenceNumber: referenceNumber.trim() || `REF-${Date.now().toString().slice(-6)}`,
      notes,
    };

    const validation = supplierPaymentFormSchema.safeParse(formData);

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
      recordSupplierPayment(validation.data);
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
        const form = document.getElementById('payment-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }}
      title="Record Supplier Payment"
      description="Disburse accounts payable, enter transaction UTR or cheque reference, and settle open bills."
      submitText={isSubmitting ? 'Recording...' : `Disburse $${amount.toFixed(2)}`}
      maxWidth="max-w-2xl"
    >
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-5 max-h-[72vh] overflow-y-auto px-1 pr-2">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Please correct the following fields:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-600">
                {Object.values(errors).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Supplier Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Supplier / Payee <span className="text-rose-500">*</span>
          </label>
          <select
            value={supplierId}
            onChange={e => handleSupplierSelect(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} — Outstanding: ${s.balancePayable.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Supplier Banking Info Card */}
        {selectedSupplier && (
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1 text-slate-600">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">
                {selectedSupplier.bankDetails.bankName} (A/C: {selectedSupplier.bankDetails.accountNumber})
              </span>
              <span className="font-bold text-rose-600">
                Total Balance: ${selectedSupplier.balancePayable.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              IFSC/Routing: {selectedSupplier.bankDetails.ifscOrSwift}
              {selectedSupplier.bankDetails.upiId && <> • UPI: {selectedSupplier.bankDetails.upiId}</>}
            </p>
          </div>
        )}

        {/* Allocate to Bill (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Allocate Payment to Bill (Optional)
          </label>
          <select
            value={billNumber}
            onChange={e => handleBillSelect(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
          >
            <option value="">General On-Account Payment (Reduces total balance)</option>
            {supplierOpenBills.map(b => (
              <option key={b.id} value={b.billNumber}>
                {b.billNumber} ({b.supplierInvoiceNo}) — Due: ${b.balanceDue.toFixed(2)} [Due Date: {b.dueDate}]
              </option>
            ))}
          </select>
        </div>

        {/* Payment Amount & Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Disbursement Amount ($) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={e => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm font-mono font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
            />
          </div>
        </div>

        {/* Payment Mode & Reference Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 bg-white"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              UTR / Cheque / Transaction Ref <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. UTR-CHAS-992010"
              value={referenceNumber}
              onChange={e => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
            />
          </div>
        </div>

        {/* Remittance Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Remittance Notes</label>
          <input
            type="text"
            placeholder="e.g. Advance paid against October delivery invoice"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20"
          />
        </div>
      </form>
    </Modal>
  );
}

"use client";

import React, { useState, useMemo } from 'react';
import { PaymentMethod } from './types';
import { useSuppliers } from './SuppliersContext';
import { RecordPaymentModal } from './RecordPaymentModal';
import { 
  CreditCard, 
  DollarSign, 
  Filter, 
  CheckCircle2,
  Building2,
  ArrowUpRight, 
  AlertCircle
} from 'lucide-react';
import { PosStatCard, PosSearchInput } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface SupplierPaymentsTabProps {
  initialSupplierId?: string;
  initialBillNumber?: string;
}

export function SupplierPaymentsTab({
  initialSupplierId,
  initialBillNumber,
}: SupplierPaymentsTabProps) {
  const { payments, suppliers } = useSuppliers();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'All' | PaymentMethod>('All');
  
  // Payment Modal state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(!!initialSupplierId || !!initialBillNumber);
  const [targetSupplierId, setTargetSupplierId] = useState<string | undefined>(initialSupplierId);
  const [targetBillNumber, setTargetBillNumber] = useState<string | undefined>(initialBillNumber);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter(pay => {
      const matchesSearch = 
        pay.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pay.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pay.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pay.billNumber && pay.billNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMethod = methodFilter === 'All' || pay.paymentMode === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, searchQuery, methodFilter]);

  // Aggregate metrics
  const totalPaidOut = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = suppliers.reduce((sum, s) => sum + s.balancePayable, 0);
  const suppliersWithBalance = suppliers.filter(s => s.balancePayable > 0);

  return (
    <div className="space-y-6">
      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PosStatCard
          label="Total Outstanding Payables"
          value={`$${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${suppliersWithBalance.length} suppliers awaiting settlement`}
          icon={DollarSign}
          colorScheme="rose"
        />

        <PosStatCard
          label="Total Disbursements Made"
          value={`$${totalPaidOut.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${payments.length} transactions completed`}
          icon={CheckCircle2}
          colorScheme="emerald"
        />

        <PosStatCard
          label="Primary Payment Mode"
          value="Bank Wire"
          subtitle="ACH / SWIFT / UTR"
          icon={CreditCard}
          colorScheme="slate"
        />

        <PosStatCard
          label="Vendors in Good Standing"
          value={`${suppliers.length - suppliersWithBalance.length} / ${suppliers.length}`}
          subtitle="Zero overdue balances"
          icon={Building2}
          colorScheme="green"
        />
      </div>

      {/* Outstanding Payables by Vendor Quick Strip */}
      {suppliersWithBalance.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-rose-500" />
                Suppliers with Outstanding Payables Due
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Directly disburse funds to maintain trade credit line health.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suppliersWithBalance.map(sup => (
              <div 
                key={sup.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all flex items-center justify-between"
              >
                <div>
                  <h5 className="font-bold text-xs text-slate-900">{sup.name}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                    Terms: {sup.paymentTerms} • {sup.bankDetails.bankName}
                  </p>
                  <p className="text-sm font-bold text-rose-600 mt-1">
                    ${sup.balancePayable.toFixed(2)}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setTargetSupplierId(sup.id);
                    setTargetBillNumber(undefined);
                    setIsRecordModalOpen(true);
                  }}
                  className="text-xs shrink-0"
                >
                  Pay Now
                  <ArrowUpRight size={13} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Bar: Search, Filters, Record Payment */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <PosSearchInput
            placeholder="Search by Payment #, supplier, UTR/ref #, or bill..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="flex-1 min-w-[220px]"
          />

          <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-200 p-1 rounded-lg overflow-x-auto">
            <Filter size={14} className="text-slate-400 ml-1.5" />
            {(['All', 'Bank Transfer', 'UPI', 'Cheque', 'Cash', 'Card'] as const).map(method => (
              <button
                key={method}
                onClick={() => setMethodFilter(method)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  methodFilter === method
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            setTargetSupplierId(undefined);
            setTargetBillNumber(undefined);
            setIsRecordModalOpen(true);
          }}
          className="shrink-0"
        >
          <CreditCard size={16} />
          Record Payment
        </Button>
      </div>

      {/* Payments History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Payment #</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Disbursement Date</th>
                <th className="p-4">Applied Reference</th>
                <th className="p-4 text-center">Payment Mode</th>
                <th className="p-4">Transaction / UTR #</th>
                <th className="p-4 text-right">Amount Paid</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <CreditCard size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No payment disbursements found</p>
                    <p className="text-slate-400 mt-1">Record a vendor settlement payment.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      {pay.paymentNumber}
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{pay.supplierName}</span>
                    </td>

                    <td className="p-4 text-slate-600">{pay.paymentDate}</td>

                    <td className="p-4">
                      {pay.billNumber ? (
                        <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {pay.billNumber}
                        </span>
                      ) : pay.poNumber ? (
                        <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {pay.poNumber}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">On-Account</span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {pay.paymentMode}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-600">
                      {pay.referenceNumber}
                    </td>

                    <td className="p-4 text-right font-bold text-emerald-700 text-sm">
                      ${pay.amount.toFixed(2)}
                    </td>

                    <td className="p-4 text-slate-500 italic max-w-xs truncate">
                      {pay.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setTargetSupplierId(undefined);
          setTargetBillNumber(undefined);
        }}
        preSelectedSupplierId={targetSupplierId}
        preSelectedBillNumber={targetBillNumber}
      />
    </div>
  );
}

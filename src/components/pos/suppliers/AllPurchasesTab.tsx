"use client";

import React, { useState, useMemo } from 'react';
import { PurchaseBill } from './types';
import { useSuppliers } from './SuppliersContext';
import { PurchaseBillModal } from './PurchaseBillModal';
import { 
  Receipt, 
  Filter, 
  Download, 
  Eye, 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Plus
} from 'lucide-react';
import { PosStatCard, PosStatusBadge, PosSearchInput, Select } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface AllPurchasesTabProps {
  onNavigateToCreatePurchase?: () => void;
  onNavigateToRecordPayment?: (supplierId?: string, billNumber?: string) => void;
}

export function AllPurchasesTab({
  onNavigateToCreatePurchase,
  onNavigateToRecordPayment,
}: AllPurchasesTabProps) {
  const { purchases, suppliers } = useSuppliers();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Unpaid'>('All');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('All');
  const [selectedBillForDetails, setSelectedBillForDetails] = useState<PurchaseBill | null>(null);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(bill => {
      const matchesSearch = 
        bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.supplierInvoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || bill.paymentStatus === statusFilter;
      const matchesSupplier = selectedSupplierId === 'All' || bill.supplierId === selectedSupplierId;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [purchases, searchQuery, statusFilter, selectedSupplierId]);

  // Aggregate metrics
  const totalBilled = purchases.reduce((sum, b) => sum + b.grandTotal, 0);
  const totalPaid = purchases.reduce((sum, b) => sum + b.amountPaid, 0);
  const totalDue = purchases.reduce((sum, b) => sum + b.balanceDue, 0);
  const unpaidCount = purchases.filter(b => b.paymentStatus !== 'Paid').length;

  const exportCSV = () => {
    const headers = ['Bill Number', 'Supplier Invoice #', 'Supplier', 'Bill Date', 'Due Date', 'Total Items', 'Grand Total', 'Amount Paid', 'Balance Due', 'Payment Status'];
    const rows = filteredPurchases.map(b => [
      b.billNumber,
      b.supplierInvoiceNo,
      `"${b.supplierName}"`,
      b.billDate,
      b.dueDate,
      b.items.length,
      b.grandTotal.toFixed(2),
      b.amountPaid.toFixed(2),
      b.balanceDue.toFixed(2),
      b.paymentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchases_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PosStatCard
          title="Total Billed Purchases"
          value={`$${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${purchases.length} invoices on record`}
          icon={Receipt}
          color="green"
        />
        <PosStatCard
          title="Disbursed / Paid"
          value={`$${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Settled via wire & card"
          icon={CheckCircle2}
          color="emerald"
        />
        <PosStatCard
          title="Outstanding Payables"
          value={`$${totalDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${unpaidCount} unpaid/partial bills`}
          icon={DollarSign}
          color="rose"
        />
        <PosStatCard
          title="Unsettled Bills"
          value={unpaidCount}
          subtitle="Pending disbursement"
          icon={AlertCircle}
          color="amber"
        />
      </div>

      {/* Control Bar: Search, Filters, CSV Export, Create Purchase */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <PosSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Bill #, Supplier Inv #, or vendor name..."
            className="min-w-[220px]"
          />

          {/* Supplier dropdown filter */}
          <div className="w-48">
            <Select
              size="sm"
              value={selectedSupplierId}
              onChange={setSelectedSupplierId}
              options={[
                { value: 'All', label: 'All Suppliers' },
                ...suppliers.map(s => ({ value: s.id, label: s.name }))
              ]}
            />
          </div>

          {/* Payment Status Segmented Control */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 p-1 rounded-lg">
            <Filter size={14} className="text-slate-400 ml-1.5" />
            {(['All', 'Paid', 'Partial', 'Unpaid'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="text-xs"
          >
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>

          {onNavigateToCreatePurchase && (
            <Button
              variant="primary"
              size="sm"
              onClick={onNavigateToCreatePurchase}
              className="text-xs"
            >
              <Plus size={15} className="mr-1" /> Create Purchase
            </Button>
          )}
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Bill & Supplier Inv #</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Bill Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Items</th>
                <th className="p-4 text-right">Grand Total</th>
                <th className="p-4 text-right">Balance Due</th>
                <th className="p-4 text-center">Payment Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Receipt size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No purchase bills found</p>
                    <p className="text-slate-400 mt-1">Try modifying your filters or create a new purchase bill.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedBillForDetails(bill)}
                        className="font-bold text-slate-900 hover:text-[#159A1D] text-left block"
                      >
                        {bill.billNumber}
                      </button>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {bill.supplierInvoiceNo}
                        </span>
                        {bill.poNumber && (
                          <span className="text-[10px] text-slate-400">({bill.poNumber})</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{bill.supplierName}</span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">{bill.paymentTerms}</span>
                    </td>

                    <td className="p-4 text-slate-600">{bill.billDate}</td>

                    <td className="p-4 text-slate-600">
                      <span className="font-medium">{bill.dueDate}</span>
                    </td>

                    <td className="p-4 text-slate-600">
                      {bill.items.length} line item(s)
                    </td>

                    <td className="p-4 text-right font-bold text-slate-900">
                      ${bill.grandTotal.toFixed(2)}
                    </td>

                    <td className="p-4 text-right">
                      <span className={`font-bold ${bill.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        ${bill.balanceDue.toFixed(2)}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <PosStatusBadge status={bill.paymentStatus} />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedBillForDetails(bill)}
                          title="View Bill Details"
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </button>

                        {bill.balanceDue > 0 && onNavigateToRecordPayment && (
                          <button
                            onClick={() => onNavigateToRecordPayment(bill.supplierId, bill.billNumber)}
                            title="Record Payment"
                            className="p-1.5 text-slate-400 hover:text-[#159A1D] hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CreditCard size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Details Modal */}
      <PurchaseBillModal
        isOpen={!!selectedBillForDetails}
        onClose={() => setSelectedBillForDetails(null)}
        bill={selectedBillForDetails}
        onRecordPayment={bill => {
          if (onNavigateToRecordPayment) {
            onNavigateToRecordPayment(bill.supplierId, bill.billNumber);
          }
        }}
      />
    </div>
  );
}

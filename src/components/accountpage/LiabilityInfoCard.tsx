"use client";

import React from 'react';
import { useGetLiabilityByAccountId } from '@/hooks/queries/accounts';
import { DataTable, Column } from '@/components/ui/DataTable';

export function LiabilityInfoCard({ accountId, currencyCode = 'USD' }: { accountId: string, currencyCode?: string }) {
  const { data: liability, isLoading } = useGetLiabilityByAccountId(accountId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-center h-32 mt-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!liability) return null;

  const formatCurrency = (val?: number | null) => {
    if (val == null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(val);
  };

  let parsedAprs = [];
  if (liability.aprs) {
    parsedAprs = typeof liability.aprs === 'string' ? JSON.parse(liability.aprs) : liability.aprs;
  }

  const formatAprType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const columns: Column<any>[] = [
    {
      key: 'apr_type',
      header: 'APR Type',
      render: (row) => <span className="font-medium text-slate-800">{formatAprType(row.apr_type)}</span>,
    },
    {
      key: 'apr_percentage',
      header: 'Rate',
      render: (row) => <span className="font-bold text-slate-800">{row.apr_percentage != null ? `${row.apr_percentage}%` : 'N/A'}</span>,
      className: 'text-right'
    },
    {
      key: 'balance_subject_to_apr',
      header: 'Balance',
      render: (row) => <span className="font-medium text-slate-600">{formatCurrency(row.balance_subject_to_apr)}</span>,
      className: 'text-right'
    },
    {
      key: 'interest_charge_amount',
      header: 'Int. Charged',
      render: (row) => <span className="font-medium text-slate-600">{formatCurrency(row.interest_charge_amount)}</span>,
      className: 'text-right'
    }
  ];

  const rows = [
    { label: 'Total Balance', value: formatCurrency(liability.balance) },
    ...(parsedAprs.length > 0 ? [] : [
      { label: 'APR / Rate', value: liability.apr != null ? `${liability.apr}%` : 'N/A' },
      { label: 'Rate Type', value: liability.rate_type || 'N/A' }
    ]),
    { label: 'Min Payment', value: liability.minimum_payment != null ? formatCurrency(liability.minimum_payment) : 'N/A' },
    { label: 'Last Payment', value: liability.last_payment_amount != null ? formatCurrency(liability.last_payment_amount) : 'N/A' },
    { label: 'Next Due', value: liability.next_payment_date ? new Date(liability.next_payment_date).toLocaleDateString() : 'N/A' },
    { label: 'Loan Term', value: liability.loan_term || 'N/A' },
    { label: 'Expected Payoff', value: liability.expected_payoff_date ? new Date(liability.expected_payoff_date).toLocaleDateString() : 'N/A' },
    { label: 'Origination Principal', value: liability.origination_principal != null ? formatCurrency(liability.origination_principal) : 'N/A' },
    { label: 'YTD Interest Paid', value: liability.ytd_interest_paid != null ? formatCurrency(liability.ytd_interest_paid) : 'N/A' }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mt-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Current balance</p>
          <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(liability.balance)}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Minimum due</p>
          <p className="text-3xl font-extrabold text-slate-900">{liability.minimum_payment != null ? formatCurrency(liability.minimum_payment) : 'N/A'}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Next due</p>
          <p className="text-3xl font-extrabold text-slate-900">{liability.next_payment_date ? new Date(liability.next_payment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
        </div>
      </div>

      {/* Credit Utilization Bar */}
      {liability.credit_limit && liability.credit_limit > 0 && (
        <div className="mb-8 bg-[#E6F4EA] rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#137333]">Credit utilization</span>
          <span className="text-sm font-bold text-[#137333]">
            {((liability.balance / liability.credit_limit) * 100).toFixed(1)}% of {formatCurrency(liability.credit_limit)} limit
          </span>
        </div>
      )}

      {/* APR Breakdown */}
      {parsedAprs.length > 0 && (
        <div className="mb-8">
          <h4 className="text-base font-bold text-slate-900 mb-1">APR breakdown</h4>
          <p className="text-sm text-slate-500 mb-4">Balance shows the portion of your total owed at each rate, not a separate charge.</p>
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <DataTable data={parsedAprs} columns={columns} />
          </div>
        </div>
      )}

      {/* Other Details List */}
      <div className="border-t border-slate-100 pt-2 space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-slate-500">{row.label}</span>
            <span className="text-sm font-bold text-slate-900 text-right max-w-[55%]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetAccount, useGetAccountTransactions } from '@/hooks/queries/accounts';
import { TransactionRow } from '@/components/accountpage/AccountDetailComponents';
import { DataTable, Column } from '@/components/ui/DataTable';
import { ShoppingCart, Clock, Receipt } from 'lucide-react';

const LIMIT = 15;

export default function AccountTransactionsPage() {
  const { setHeaderData } = useAppData();
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);

  const { data: account } = useGetAccount(id);

  const { data: txnRes, isLoading } = useGetAccountTransactions(id, page, LIMIT);
  const transactions = txnRes?.data || [];
  const pagination = txnRes?.pagination;

  useEffect(() => {
    setHeaderData(
      account ? `${account.name} — Transactions` : 'Transactions',
      'Full transaction history for this account.',
      true
    );
  }, [setHeaderData, account]);

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Merchant',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
            {row.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.logo_url} alt={row.merchant_name || row.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <ShoppingCart size={16} className="text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{row.merchant_name || row.name}</p>
            {row.primary_category && (
              <p className="text-xs text-slate-400 capitalize">{row.primary_category.replace(/_/g, ' ')}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <div>
          <p className="text-sm text-slate-700 font-medium">
            {new Date(row.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          {row.pending && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-0.5">
              <Clock size={10} /> Pending
            </span>
          )}
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => {
        const isDebit = row.amount > 0;
        return (
          <span className={`text-sm font-extrabold ${isDebit ? 'text-red-500' : 'text-emerald-600'}`}>
            {isDebit ? '-' : '+'}
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: row.currency || 'USD' }).format(Math.abs(row.amount))}
          </span>
        );
      }
    },
    {
      key: 'payment_channel',
      header: 'Channel',
      render: (row) => (
        <span className="text-xs font-medium text-slate-400 capitalize">{row.payment_channel || '—'}</span>
      )
    },
  ];

  return (
    <div className="mx-auto pb-12 space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] w-full overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-800">All Transactions</h2>
          {pagination && (
            <p className="text-sm text-slate-400 mt-0.5">{pagination.totalItems} total transactions</p>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <DataTable
            data={transactions}
            columns={columns}
            isLoading={isLoading}
            emptyMessage={
              <div className="flex flex-col items-center py-8 text-slate-400">
                <Receipt size={40} className="mb-3 text-slate-300" />
                <p className="font-medium text-sm">No transactions found.</p>
                <p className="text-xs mt-1">Sync transactions from the accounts list.</p>
              </div>
            }
            pagination={pagination ? {
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              totalItems: pagination.totalItems,
              itemsPerPage: pagination.itemsPerPage,
              itemName: 'transactions',
              onPageChange: (newPage) => setPage(newPage),
            } : undefined}
          />
        </div>
      </div>
    </div>
  );
}

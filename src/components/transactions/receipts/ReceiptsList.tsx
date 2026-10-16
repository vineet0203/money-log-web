"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Paperclip, ExternalLink } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetTransactions } from '@/hooks/queries/transactions';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { TransactionActionMenu } from '@/components/transactions/TransactionActionMenu';

export default function ReceiptsList() {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setHeaderData("Receipts Tracker", "Review and manage transactions with attached receipts.", false);
  }, [setHeaderData]);

  const { data: txResponse, isLoading } = useGetTransactions({
    has_receipt: true,
    page,
    limit: itemsPerPage,
  });

  const receipts = txResponse?.data || [];
  const totalItems = txResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Tx ID',
      render: (row) => <span className="font-mono text-slate-500 text-xs">#{row.id}</span>,
    },
    {
      key: 'title',
      header: 'Title / Merchant',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-slate-900 font-semibold text-sm">{row.title}</span>
          {row.description && (
            <span className="text-xs text-slate-400 font-normal truncate max-w-xs">
              {row.description}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => {
        const d = new Date(row.date);
        return (
          <span className="text-[#849AB4] font-medium text-sm">
            {d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
          {row.category_name || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span
          className={`font-bold text-sm ${
            row.type === 'income' ? 'text-[#159A1D]' : 'text-slate-900'
          }`}
        >
          {row.type === 'income' ? '+' : '-'}${Number(row.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'receipt',
      header: 'Receipt File',
      render: (row) => {
        if (!row.receipt_url) return <span className="text-slate-400 text-xs">None</span>;
        return (
          <a
            href={row.receipt_url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#159A1D] border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
          >
            <Paperclip size={12} />
            View
            <ExternalLink size={11} />
          </a>
        );
      },
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => <TransactionActionMenu transaction={row} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Receipts</h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {totalItems} total receipts on file
          </p>
        </div>
        <Button
          onClick={() => router.push('/transactions/new')}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Transaction with Receipt
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={5} columns={7} />
          </div>
        ) : receipts.length === 0 ? (
          <EmptyState
            icon={<Paperclip size={32} className="text-slate-400" />}
            title="No receipts attached yet"
            description="When you create transactions and attach receipt files or images, they will appear here."
            actionText="Upload Transaction Receipt"
            actionHref="/transactions/new"
          />
        ) : (
          <DataTable
            columns={columns}
            data={receipts}
            pagination={{
              currentPage: page,
              totalPages,
              totalItems,
              itemsPerPage,
              itemName: 'receipts',
              onPageChange: setPage,
            }}
          />
        )}
      </div>
    </div>
  );
}

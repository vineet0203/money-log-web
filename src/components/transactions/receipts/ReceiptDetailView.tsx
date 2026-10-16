"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Paperclip, FileText, ExternalLink, Calendar, Tag, DollarSign, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetTransactionById } from '@/hooks/queries/transactions';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function ReceiptDetailView({ receiptId }: { receiptId: string }) {
  const router = useRouter();
  const { setHeaderData } = useAppData();

  const { data: transaction, isLoading, error, refetch } = useGetTransactionById(receiptId);

  useEffect(() => {
    setHeaderData("Receipt Details", `Transaction #${receiptId}`, true);
  }, [receiptId, setHeaderData]);

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto space-y-6">
        <Skeleton variant="text" width="40%" height={28} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="rectangular" height={320} />
          <div className="space-y-4">
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-md mx-auto py-12">
        <ErrorState
          title="Receipt Not Found"
          message="The transaction or receipt you are looking for does not exist."
          onRetry={() => refetch()}
        />
        <div className="text-center mt-4">
          <Button variant="secondary" onClick={() => router.push('/transactions')}>
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  const isPdf = transaction.receipt_url?.toLowerCase().includes('.pdf');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => router.push('/transactions')}
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Back to List
        </Button>

        <Button
          onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
          className="gap-2"
        >
          <Edit size={16} />
          Edit Transaction
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Receipt Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[350px]">
            {transaction.receipt_url ? (
              isPdf ? (
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <FileText className="text-[#159A1D] mb-3" size={54} />
                  <p className="text-sm font-bold text-slate-800 mb-1">PDF Receipt Document</p>
                  <a
                    href={transaction.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-white bg-[#159A1D] hover:bg-green-700 px-4 py-2 rounded-xl font-bold transition-colors"
                  >
                    Open Document
                    <ExternalLink size={13} />
                  </a>
                </div>
              ) : (
                <div className="relative w-full h-full flex flex-col items-center">
                  <img
                    src={transaction.receipt_url}
                    alt="Receipt"
                    className="max-h-[380px] object-contain rounded-xl shadow-xs"
                  />
                  <a
                    href={transaction.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 text-xs text-[#159A1D] font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    View Full Size <ExternalLink size={12} />
                  </a>
                </div>
              )
            ) : (
              <div className="text-center p-6">
                <Paperclip className="mx-auto text-slate-300 mb-2" size={40} />
                <p className="text-xs font-semibold text-slate-400">No receipt file uploaded</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono text-slate-400">TX #{transaction.id}</span>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">{transaction.title}</h1>
              {transaction.description && (
                <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                  {transaction.description}
                </p>
              )}
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <DollarSign size={16} /> Amount
                </span>
                <span
                  className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-[#159A1D]' : 'text-slate-900'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {Number(transaction.amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar size={16} /> Date
                </span>
                <span className="font-semibold text-slate-800">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Tag size={16} /> Category
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                  {transaction.category_name || 'Uncategorized'}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <Button
                onClick={() => router.push(`/transactions/${transaction.id}/edit`)}
                className="w-full"
              >
                Edit Receipt & Transaction
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

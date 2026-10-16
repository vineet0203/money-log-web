"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AddTransactionForm from '@/components/balance/AddTransactionForm';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetTransactionById } from '@/hooks/queries/transactions';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const { setHeaderData } = useAppData();

  const id = params?.id as string;
  const { data: transaction, isLoading, error } = useGetTransactionById(id);

  useEffect(() => {
    setHeaderData("Edit Transaction", "Update transaction details.", true);
  }, [setHeaderData]);

  if (isLoading) {
    return (
      <div className="mx-auto pb-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#159A1D] mb-3" size={36} />
        <p className="text-sm font-semibold text-slate-500">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="mx-auto pb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Transaction Not Found</h2>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            The transaction you are trying to edit does not exist or has already been removed.
          </p>
          <Button
            variant="secondary"
            onClick={() => router.push('/transactions')}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto pb-12">
      <AddTransactionForm
        transaction={transaction}
        onCancel={() => router.push('/transactions')}
        onSuccess={() => router.push('/transactions')}
      />
    </div>
  );
}

"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetAccount, useGetAccountTransactions } from '@/hooks/queries/accounts';
import { AccountHeroBanner, AccountInfoCard, TransactionRow } from '@/components/accountpage/AccountDetailComponents';
import { Receipt, ArrowRight } from 'lucide-react';

export default function AccountDetailPage() {
  const { setHeaderData } = useAppData();
  const { id } = useParams<{ id: string }>();

  const { data: account, isLoading: isLoadingAccount } = useGetAccount(id);

  // Only fetch first page (5 items) as preview
  const { data: txnRes, isLoading: isLoadingTxns } = useGetAccountTransactions(id, 1, 5);
  const transactions = txnRes?.data || [];
  const totalTxns = txnRes?.pagination?.totalItems ?? 0;

  useEffect(() => {
    setHeaderData(
      account?.name || 'Account Details',
      'View your account balance, details, and recent transactions.',
      true
    );
  }, [setHeaderData, account?.name]);

  if (isLoadingAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#159A1D]" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Receipt size={48} className="mb-3 text-slate-300" />
        <p className="font-medium">Account not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto pb-12 space-y-6 max-w-3xl">
      {/* Hero Banner */}
      <AccountHeroBanner account={account} />

      {/* Account Info */}
      <AccountInfoCard account={account} />

      {/* Recent Transactions (preview) */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-800">Recent Transactions</h3>
            {totalTxns > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">{totalTxns} total transactions</p>
            )}
          </div>
          {totalTxns > 5 && (
            <Link
              href={`/acc-manage/accounts/${id}/transactions`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#159A1D] hover:text-green-700 transition-colors"
            >
              See All <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {isLoadingTxns ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#159A1D]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-100 m-4 rounded-2xl text-slate-400">
            <Receipt size={40} className="mb-3 text-slate-300" />
            <p className="font-medium text-sm text-center">No transactions synced yet.</p>
            <p className="text-xs text-center mt-1">Go to Accounts list to sync transactions.</p>
          </div>
        ) : (
          <>
            <div>
              {transactions.map((txn, i) => (
                <TransactionRow key={txn.id} txn={txn} isLast={i === transactions.length - 1} />
              ))}
            </div>

            {totalTxns > 5 && (
              <div className="border-t border-slate-100">
                <Link
                  href={`/acc-manage/accounts/${id}/transactions`}
                  className="flex items-center justify-center gap-2 py-4 text-sm font-semibold text-[#159A1D] hover:text-green-700 hover:bg-green-50 transition-colors"
                >
                  View all {totalTxns} transactions <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

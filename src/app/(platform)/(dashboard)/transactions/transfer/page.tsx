"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { ArrowLeftRight, Landmark } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function TransferMoneyTrackingPage() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("Transfer Money Tracking", "Bank-to-bank account transfers.", false);
  }, [setHeaderData]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-12">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <EmptyState
          icon={<ArrowLeftRight size={36} className="text-slate-400" />}
          title="Transfers Tracking is Parked"
          description="Internal bank-to-bank transfers require automated account linking and Plaid settlement, which will be released in an upcoming update."
          actionText="View Linked Accounts"
          actionHref="/acc-manage/accounts"
          actionIcon={<Landmark size={16} />}
        />
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { AccountsList } from '@/components/accountpage/AccountsList';

export default function AccountsPage() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("Accounts Management", "Manage your bank accounts, credit cards, and cash wallets securely.");
  }, [setHeaderData]);

  return (
    <div className="mx-auto pb-12 space-y-6">
      <AccountsList />
    </div>
  );
}

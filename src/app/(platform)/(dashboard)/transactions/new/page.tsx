"use client";

import React, { useEffect } from 'react';
import AddTransactionForm from '@/components/balance/AddTransactionForm';
import { useAppData } from '@/providers/AppDataProvider';

export default function AddTransactionPage() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("Add Transaction", "Create a new income or expense record.", true);
  }, [setHeaderData]);

  return (
    <div className="mx-auto pb-12">
      <AddTransactionForm />
    </div>
  );
}

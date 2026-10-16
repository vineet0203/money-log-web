"use client";

import React, { useEffect } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { AnalyticsDashboard } from '@/components/categories/AnalyticsDashboard';

export default function CategorizedTransactionsPage() {
  const { setHeaderData } = useAppData();

  useEffect(() => {
    setHeaderData("Income vs Expense", "Analyze your spending and income across all connected accounts.");
  }, [setHeaderData]);

  return (
    <div className="mx-auto pb-12 space-y-6">
      <AnalyticsDashboard />
    </div>
  );
}

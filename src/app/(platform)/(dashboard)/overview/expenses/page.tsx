"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { DailyExpenseStatCard } from '@/components/dailyexpensepage/DailyExpenseStatCard';
import { ExpenseTrendChart } from '@/components/dailyexpensepage/ExpenseTrendChart';
import { RecentExpenseList } from '@/components/dailyexpensepage/RecentExpenseList';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';
import { Plus, ArrowUpCircle } from 'lucide-react';
import { useGetTransactions, useGetTransactionStats } from '@/hooks/queries/transactions';
import { TransactionActionMenu } from '@/components/transactions/TransactionActionMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';

export default function DailyExpenseTrackingPage() {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected date defaults to today YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    setHeaderData("Daily Expense Tracking", "Track and manage your daily spending effectively.");
  }, [setHeaderData]);

  // Derived month range
  const { year, month, fromMonthDate, toMonthDate } = useMemo(() => {
    const d = new Date(selectedDate || todayStr);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const lastDay = new Date(y, m, 0).getDate();
    return {
      year: y,
      month: m,
      fromMonthDate: `${y}-${String(m).padStart(2, '0')}-01`,
      toMonthDate: `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    };
  }, [selectedDate, todayStr]);

  // Stats for the month
  const { data: monthStats, isLoading: monthStatsLoading } = useGetTransactionStats({
    fromDate: fromMonthDate,
    toDate: toMonthDate,
    type: 'expense',
  });

  // Stats for the selected day
  const { data: dayStats } = useGetTransactionStats({
    fromDate: selectedDate,
    toDate: selectedDate,
    type: 'expense',
  });

  // Transactions for the selected month
  const { data: txResponse, isLoading: txLoading } = useGetTransactions({
    type: 'expense',
    fromDate: fromMonthDate,
    toDate: toMonthDate,
    page: currentPage,
    limit: itemsPerPage,
  });

  const transactions = txResponse?.data || [];
  const totalItems = txResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const totalExpenseToday = Number(dayStats?.expense || 0);
  const totalExpenseMonth = Number(monthStats?.expense || 0);
  const highestExpense = Number(monthStats?.highestExpense || 0);

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.title}</span>
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
          <span className="font-medium text-[#849AB4] text-sm">
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
        <span className="font-bold text-red-500 text-sm">
          -${Number(row.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => <TransactionActionMenu transaction={row} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Stats Row */}
      {monthStatsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DailyExpenseStatCard
            title="Expenses on Selected Day"
            value={`$${totalExpenseToday.toFixed(2)}`}
            percentColor="text-red-500"
            subtext={selectedDate}
          />
          <DailyExpenseStatCard
            title="Total Expenses Month"
            value={`$${totalExpenseMonth.toFixed(2)}`}
            percentColor="text-red-500"
            subtext={`for ${year}-${String(month).padStart(2, '0')}`}
          />
          <DailyExpenseStatCard
            title="Highest Single Expense"
            value={`$${highestExpense.toFixed(2)}`}
            percentColor="text-red-500"
            subtext="in this month"
          />
        </div>
      )}

      {/* Middle Section: Chart & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseTrendChart from={fromMonthDate} to={toMonthDate} />
        </div>
        <div className="lg:col-span-1">
          <RecentExpenseList year={year} month={month} />
        </div>
      </div>

      {/* Bottom Section: Table */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-10">
        {/* Table Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">Expenses for Selected Period</h2>
            <SingleDatePicker date={selectedDate} onChange={setSelectedDate} />
          </div>

          <button
            onClick={() => router.push('/transactions/new')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#159A1D] text-white text-sm font-bold shadow-sm hover:bg-green-700 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Expense
          </button>
        </div>

        {/* Data Table */}
        <div className="p-0">
          {txLoading ? (
            <div className="p-6">
              <SkeletonTable rows={5} columns={5} />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No expenses found"
              description="No expense transactions have been recorded for this period."
              actionText="Log an Expense"
              actionHref="/transactions/new"
            />
          ) : (
            <DataTable
              columns={columns}
              data={transactions}
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                itemName: 'expenses',
                onPageChange: setCurrentPage,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { ExpenseTrendChart } from '@/components/dailyexpensepage/ExpenseTrendChart';
import { RecentExpenseList } from '@/components/dailyexpensepage/RecentExpenseList';
import { ExpenseDayOfWeekChart } from '@/components/dailyexpensepage/ExpenseDayOfWeekChart';
import {
  DataTable,
  Column,
  StatCard,
  SearchInput,
  Button,
  StatusBadge,
  SkeletonCard,
  SingleDatePicker,
} from '@/components/ui';
import { Plus, ArrowUpCircle, AlertCircle, Calendar, Paperclip, BarChart3 } from 'lucide-react';
import { useGetTransactions, useGetTransactionStats } from '@/hooks/queries/transactions';
import { useGetMonthlyReport } from '@/hooks/queries/reports';
import { TransactionActionMenu } from '@/components/transactions/TransactionActionMenu';

export default function DailyExpenseTrackingPage() {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const itemsPerPage = 10;

  // Selected date defaults to today YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setHeaderData("Daily Expense Tracking", "Track and manage your daily spending effectively.");
  }, [setHeaderData]);

  // Derived month range
  const { year, month, fromMonthDate, toMonthDate, daysElapsed, lastDay } = useMemo(() => {
    const d = new Date(selectedDate || todayStr);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const daysInM = new Date(y, m, 0).getDate();

    const now = new Date();
    const isCurrentMonth = now.getFullYear() === y && (now.getMonth() + 1) === m;
    const elapsed = isCurrentMonth ? Math.min(now.getDate(), daysInM) : daysInM;

    return {
      year: y,
      month: m,
      fromMonthDate: `${y}-${String(m).padStart(2, '0')}-01`,
      toMonthDate: `${y}-${String(m).padStart(2, '0')}-${String(daysInM).padStart(2, '0')}`,
      daysElapsed: Math.max(1, elapsed),
      lastDay: daysInM,
    };
  }, [selectedDate, todayStr]);

  // Stats for the month with period-over-period comparison
  const { data: monthStats, isLoading: monthStatsLoading } = useGetTransactionStats({
    fromDate: fromMonthDate,
    toDate: toMonthDate,
    type: 'expense',
    search: debouncedSearch.trim() || undefined,
    compare: 'previous',
  });

  // Monthly budget & category breakdown
  const { data: monthlyReport } = useGetMonthlyReport({ year, month });

  // Transactions for the selected month
  const { data: txResponse, isLoading: txLoading } = useGetTransactions({
    type: 'expense',
    fromDate: fromMonthDate,
    toDate: toMonthDate,
    search: debouncedSearch.trim() || undefined,
    page: currentPage,
    limit: itemsPerPage,
  });

  const transactions = txResponse?.data || [];
  const totalItems = txResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const totalExpenseMonth = Number(monthStats?.expense || 0);
  const averageDailySpend = daysElapsed > 0 ? totalExpenseMonth / daysElapsed : 0;
  const largestExpense = monthStats?.largest;

  // Over-budget categories count
  const budgetCategories = (monthlyReport?.categoryBreakdown || []).filter(
    (c) => c.budget_limit !== null && c.budget_limit > 0
  );
  const overBudgetCount = budgetCategories.filter(
    (c) => c.total_amount > (c.budget_limit || 0)
  ).length;

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Title & Description',
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-xs sm:text-sm">{row.title}</span>
            {row.subscription_id && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70"
                title="Linked to subscription"
              >
                Subscription
              </span>
            )}
            {row.receipt_url && (
              <a
                href={row.receipt_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#159A1D] hover:text-[#118218] p-0.5 inline-flex items-center transition-colors"
                title="View receipt"
              >
                <Paperclip size={13} />
              </a>
            )}
          </div>
          {row.description && (
            <span className="text-xs text-slate-400 font-normal truncate max-w-xs mt-0.5">
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
          <div className="flex flex-col text-xs text-slate-700">
            <span className="font-semibold text-slate-800">
              {d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-[10.5px] text-slate-400 font-medium">
              {d.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
          {row.category_name || 'Expense'}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <StatusBadge status={row.type || 'expense'} />,
    },
    {
      key: 'amount',
      header: 'Amount',
      className: 'text-right',
      render: (row) => (
        <span className="font-mono font-bold text-sm text-slate-900 text-right block">
          -${Number(row.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end">
          <TransactionActionMenu transaction={row} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-6 max-w-[1600px] w-full pb-12">
      {/* Top Stats Row */}
      {monthStatsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Expenses Month"
            value={`-$${totalExpenseMonth.toFixed(2)}`}
            subtitle={`Period: ${year}-${String(month).padStart(2, '0')}`}
            icon={ArrowUpCircle}
            color="rose"
            delta={
              monthStats?.delta?.expense !== null && monthStats?.delta?.expense !== undefined
                ? {
                    value: monthStats.delta.expense,
                    isGood: monthStats.delta.expense <= 0,
                    label: 'vs previous period',
                  }
                : undefined
            }
          />
          <StatCard
            title="Average Daily Spend"
            value={`$${averageDailySpend.toFixed(2)}`}
            subtitle={`${daysElapsed} of ${lastDay} days elapsed`}
            icon={Calendar}
            color="amber"
          />
          <StatCard
            title="Largest Expense"
            value={largestExpense ? `-$${Number(largestExpense.amount).toFixed(2)}` : '$0.00'}
            subtitle={largestExpense ? `${largestExpense.title} (${largestExpense.category_name})` : 'No expenses recorded'}
            icon={AlertCircle}
            color="rose"
          />
          <StatCard
            title="Over-Budget Categories"
            value={overBudgetCount.toString()}
            subtitle={`${overBudgetCount} of ${budgetCategories.length} categories exceeded`}
            icon={AlertCircle}
            color={overBudgetCount > 0 ? 'rose' : 'emerald'}
          />
        </div>
      )}

      {/* Middle Section: Trend Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseTrendChart from={fromMonthDate} to={toMonthDate} />
        </div>
        <div className="lg:col-span-1">
          <RecentExpenseList year={year} month={month} />
        </div>
      </div>

      {/* Day of Week Spending Pattern */}
      <div className="w-full">
        <ExpenseDayOfWeekChart from={fromMonthDate} to={toMonthDate} />
      </div>

      {/* Bottom Section: Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">All Expense Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter expenses by month, date, or search keywords.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SingleDatePicker date={selectedDate} onChange={setSelectedDate} />

            <SearchInput
              placeholder="Search expenses..."
              value={search}
              onChange={setSearch}
              className="w-56"
            />

            <Button
              size="sm"
              onClick={() => router.push('/transactions/new')}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Expense
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-0">
          <DataTable
            columns={columns}
            data={transactions}
            isLoading={txLoading}
            emptyMessage="No expense transactions found for this period."
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              itemsPerPage,
              itemName: 'expenses',
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>
    </div>
  );
}

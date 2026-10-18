"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Paperclip,
  Scale,
  AlertCircle,
  ListFilter
} from 'lucide-react';
import {
  DataTable,
  Column,
  StatCard,
  SearchInput,
  Tabs,
  StatusBadge,
  Button,
  DateRangePicker,
  SkeletonCard,
} from '@/components/ui';
import { format, subDays } from 'date-fns';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetTransactions, useGetTransactionStats } from '@/hooks/queries/transactions';
import { TransactionActionMenu } from '@/components/transactions/TransactionActionMenu';
import { useQueryTab } from '@/hooks/useQueryTab';

export default function BalanceTrackerList() {
  const router = useRouter();
  const { setHeaderData } = useAppData();

  // Default date range: last 30 days (today - 29 days to today)
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    return {
      startDate: format(subDays(today, 29), 'yyyy-MM-dd'),
      endDate: format(today, 'yyyy-MM-dd'),
    };
  });

  const [activeTab, setActiveTab] = useQueryTab<string>('tab', 'All', ['All', 'Income', 'Expense']);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDateRangeChange = (start: string, end: string) => {
    setPage(1);
    setDateRange({ startDate: start, endDate: end });
  };

  useEffect(() => {
    setHeaderData("Income & Expenses", "Track your balance, incomes, and expenses.", false);
  }, [setHeaderData]);

  // Construct fromDate and toDate bounds for the API
  const fromDate = dateRange.startDate || undefined;
  const toDate = dateRange.endDate || undefined;

  const typeFilter = activeTab === 'All' ? undefined : (activeTab === 'Income' ? 'income' : 'expense');

  const { data: txResponse, isLoading } = useGetTransactions({
    type: typeFilter,
    fromDate,
    toDate,
    search: debouncedSearch.trim() || undefined,
    page,
    limit: itemsPerPage,
  });

  const transactions = txResponse?.data || [];
  const totalItems = txResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const { data: stats, isLoading: statsLoading } = useGetTransactionStats({
    fromDate,
    toDate,
    type: typeFilter,
    search: debouncedSearch.trim() || undefined,
    compare: 'previous',
  });

  const netCashFlow = Number(stats?.balance || 0);
  const totalIncome = Number(stats?.income || 0);
  const totalExpense = Number(stats?.expense || 0);
  const highestExpense = Number(stats?.highestExpense || 0);
  const largestTransaction = stats?.largest;

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Title & Notes',
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-semibold text-xs sm:text-sm">{row.title}</span>
            {row.subscription_id && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200/70"
                title="Linked to recurring payment"
              >
                Recurring
              </span>
            )}
            {row.receipt_url && (
              <a
                href={row.receipt_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#159A1D] hover:text-[#118218] p-0.5 inline-flex items-center transition-colors"
                title="View attached receipt"
              >
                <Paperclip size={13} />
              </a>
            )}
          </div>
          {row.description && (
            <span className="text-xs text-slate-400 font-normal truncate max-w-xs mt-0.5">{row.description}</span>
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
          {row.category_name || 'Uncategorized'}
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
        <span
          className={`font-mono font-bold text-sm text-right block ${
            row.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
          }`}
        >
          {row.type === 'income' ? '+' : '-'}${Number(row.amount).toFixed(2)}
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

  const tabs = [
    { id: 'All', label: 'All Transactions', icon: ListFilter, count: totalItems },
    { id: 'Income', label: 'Income', icon: ArrowDownCircle },
    { id: 'Expenses', label: 'Expenses', icon: ArrowUpCircle },
  ];

  return (
    <div className="mx-auto pb-12 space-y-6">
      {/* 4 Standardized KPI Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Net Cash Flow"
            value={`${netCashFlow >= 0 ? '+' : '-'}$${Math.abs(netCashFlow).toFixed(2)}`}
            subtitle="Net balance for period"
            icon={Scale}
            color={netCashFlow >= 0 ? 'green' : 'rose'}
            delta={
              stats?.delta?.balance !== null && stats?.delta?.balance !== undefined
                ? {
                    value: stats.delta.balance,
                    isGood: stats.delta.balance >= 0,
                    label: 'vs previous period',
                  }
                : undefined
            }
          />
          <StatCard
            title="Total Income"
            value={`+$${totalIncome.toFixed(2)}`}
            subtitle="Recorded cash inflows"
            icon={ArrowDownCircle}
            color="emerald"
            delta={
              stats?.delta?.income !== null && stats?.delta?.income !== undefined
                ? {
                    value: stats.delta.income,
                    isGood: stats.delta.income >= 0,
                    label: 'vs previous period',
                  }
                : undefined
            }
          />
          <StatCard
            title="Total Expenses"
            value={`-$${totalExpense.toFixed(2)}`}
            subtitle="Recorded cash outflows"
            icon={ArrowUpCircle}
            color="rose"
            delta={
              stats?.delta?.expense !== null && stats?.delta?.expense !== undefined
                ? {
                    value: stats.delta.expense,
                    isGood: stats.delta.expense <= 0,
                    label: 'vs previous period',
                  }
                : undefined
            }
          />
          <StatCard
            title="Highest Expense"
            value={highestExpense > 0 ? `-$${highestExpense.toFixed(2)}` : '$0.00'}
            subtitle={largestTransaction ? `${largestTransaction.title} (${largestTransaction.category_name})` : 'Peak expense transaction'}
            icon={AlertCircle}
            color="amber"
          />
        </div>
      )}

      {/* Main Table Container matching POS specifications */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Card Tabs Header */}
        <Tabs
          variant="card"
          standalone={false}
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setPage(1);
          }}
        />

        {/* Integrated Controls & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by title, description..."
              className="min-w-[200px] max-w-xs"
            />

            <DateRangePicker
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onChange={handleDateRangeChange}
              disableFutureDates
              size="sm"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              onClick={() => router.push('/transactions/new')}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Transaction
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="p-0">
          <DataTable
            columns={columns}
            data={transactions}
            isLoading={isLoading}
            pagination={{
              currentPage: page,
              totalPages,
              totalItems,
              itemsPerPage,
              onPageChange: setPage,
              itemName: 'transactions',
            }}
          />
        </div>
      </div>
    </div>
  );
}

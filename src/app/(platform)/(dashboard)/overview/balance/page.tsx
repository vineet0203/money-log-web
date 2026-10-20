"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { BalanceOverviewChart } from '@/components/balancepage/BalanceOverviewChart';
import { BalanceSummaryList } from '@/components/balancepage/BalanceSummaryList';
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
import { Scale, ArrowDownCircle, ArrowUpCircle, Plus, Paperclip } from 'lucide-react';
import { useGetTransactions, useGetTransactionStats } from '@/hooks/queries/transactions';
import { TransactionActionMenu } from '@/components/transactions/TransactionActionMenu';

export default function TotalBalanceTrackingPage() {
  const router = useRouter();
  const { setHeaderData } = useAppData();

  // Default to current month YYYY-MM
  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const [selectedDate, setSelectedDate] = useState(currentMonthStr);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setHeaderData("Total Balance Tracking", "Review your balance, cash flow, and recent activity.");
  }, [setHeaderData]);

  // Compute fromDate and toDate
  const { fromDate, toDate } = useMemo(() => {
    if (!selectedDate) {
      return { fromDate: undefined, toDate: undefined };
    }
    const [year, month] = selectedDate.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    return {
      fromDate: `${selectedDate}-01`,
      toDate: `${selectedDate}-${String(lastDay).padStart(2, '0')}`,
    };
  }, [selectedDate]);

  // Query real stats with previous period comparison
  const { data: stats, isLoading: statsLoading } = useGetTransactionStats({
    fromDate,
    toDate,
    search: debouncedSearch.trim() || undefined,
    compare: 'previous',
  });

  // Query real transactions
  const { data: txData, isLoading: txLoading } = useGetTransactions({
    fromDate,
    toDate,
    search: debouncedSearch.trim() || undefined,
    page,
    limit: itemsPerPage,
  });

  const transactions = txData?.data || [];
  const totalItems = txData?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const netBalance = Number(stats?.balance || 0);
  const totalIncome = Number(stats?.income || 0);
  const totalExpense = Number(stats?.expense || 0);
  const highestExpense = Number(stats?.highestExpense || 0);
  const largestTransaction = stats?.largest;

  const columns: Column<any>[] = [
    {
      header: "Title & Notes",
      key: "title",
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
      header: "Date",
      key: "date",
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
      header: "Category",
      key: "category",
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
          {row.category_name || 'Uncategorized'}
        </span>
      ),
    },
    {
      header: "Type",
      key: "type",
      render: (row) => <StatusBadge status={row.type || 'expense'} />,
    },
    {
      header: "Amount",
      key: "amount",
      className: "text-right",
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
      header: "Action",
      key: "action",
      className: "text-right",
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
            value={`${netBalance >= 0 ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}`}
            subtitle="Period net cash movement"
            icon={Scale}
            color={netBalance >= 0 ? 'green' : 'rose'}
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
            title="Total Inflows"
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
            title="Total Outflows"
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
            title="Highest Outflow"
            value={highestExpense > 0 ? `-$${highestExpense.toFixed(2)}` : '$0.00'}
            subtitle={largestTransaction ? `${largestTransaction.title} (${largestTransaction.category_name})` : 'Peak expense transaction'}
            icon={Scale}
            color="amber"
          />
        </div>
      )}

      {/* Middle Section: Chart & Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BalanceOverviewChart from={fromDate} to={toDate} />
        </div>
        <div className="xl:col-span-1">
          <BalanceSummaryList
            fromDate={fromDate}
            toDate={toDate}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Bottom Section: Recent Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Recent Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit log of cash movements and categorizations.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SingleDatePicker
              type="month"
              date={selectedDate}
              onChange={(d) => {
                if (d) {
                  setSelectedDate(d);
                  setPage(1);
                }
              }}
            />

            <SearchInput
              placeholder="Search transactions..."
              value={search}
              onChange={setSearch}
              className="w-56"
            />

            <Button
              size="sm"
              onClick={() => router.push('/transactions/new')}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Transaction
            </Button>
          </div>
        </div>

        {/* Table Body */}
        <div className="p-0">
          <DataTable
            data={transactions}
            columns={columns}
            isLoading={txLoading}
            emptyMessage="No transactions found for the selected period."
            pagination={{
              currentPage: page,
              totalPages,
              totalItems,
              itemsPerPage,
              itemName: 'transactions',
              onPageChange: setPage,
            }}
          />
        </div>
      </div>
    </div>
  );
}

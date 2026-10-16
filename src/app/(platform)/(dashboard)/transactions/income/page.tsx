"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { IncomeOverviewChart } from '@/components/incomepage/IncomeOverviewChart';
import { IncomeBySourceChart } from '@/components/incomepage/IncomeBySourceChart';
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
import { Plus, ArrowDownCircle, ListFilter, TrendingUp, Paperclip } from 'lucide-react';
import { useGetTransactions, useGetTransactionStats } from '@/hooks/queries/transactions';
import { TransactionActionMenu } from '@/components/transactions/TransactionActionMenu';

export default function IncomeTransactionsPage() {
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
    setHeaderData("Income Transactions", "Monitor and manage your recurring and one-off income streams.");
  }, [setHeaderData]);

  // Derived month bounds
  const { year, month, fromDate, toDate } = useMemo(() => {
    if (!selectedDate) {
      return { year: undefined, month: undefined, fromDate: undefined, toDate: undefined };
    }
    const [y, m] = selectedDate.split('-');
    const parsedY = parseInt(y);
    const parsedM = parseInt(m);
    const lastDay = new Date(parsedY, parsedM, 0).getDate();
    return {
      year: parsedY,
      month: parsedM,
      fromDate: `${selectedDate}-01`,
      toDate: `${selectedDate}-${String(lastDay).padStart(2, '0')}`,
    };
  }, [selectedDate]);

  // Real stats with previous period comparison
  const { data: stats, isLoading: statsLoading } = useGetTransactionStats({
    type: 'income',
    fromDate,
    toDate,
    search: debouncedSearch.trim() || undefined,
    compare: 'previous',
  });

  // Real transactions
  const { data: txResponse, isLoading: txLoading } = useGetTransactions({
    type: 'income',
    fromDate,
    toDate,
    search: debouncedSearch.trim() || undefined,
    page,
    limit: itemsPerPage,
  });

  const transactions = txResponse?.data || [];
  const totalItems = txResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const totalIncome = Number(stats?.income || 0);
  const averageIncome = Number(stats?.average || (totalItems > 0 ? totalIncome / totalItems : 0));
  const largestIncome = stats?.largest;

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
                title="Linked to recurring schedule"
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
                title="View attached document"
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
          {row.category_name || 'Income'}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: () => <StatusBadge status="paid" />,
    },
    {
      header: "Amount",
      key: "amount",
      className: "text-right",
      render: (row) => (
        <span className="font-mono font-bold text-sm text-emerald-600 text-right block">
          +${Number(row.amount).toFixed(2)}
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
            title="Total Income"
            value={`+$${totalIncome.toFixed(2)}`}
            subtitle="Recorded inflows for period"
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
            title="Average Inflow"
            value={`+$${averageIncome.toFixed(2)}`}
            subtitle="Average per deposit"
            icon={TrendingUp}
            color="green"
            delta={
              stats?.delta?.average !== null && stats?.delta?.average !== undefined
                ? {
                    value: stats.delta.average,
                    isGood: stats.delta.average >= 0,
                    label: 'vs previous period',
                  }
                : undefined
            }
          />
          <StatCard
            title="Largest Inflow"
            value={largestIncome ? `+$${Number(largestIncome.amount).toFixed(2)}` : '$0.00'}
            subtitle={largestIncome ? `${largestIncome.title} (${largestIncome.category_name})` : 'No deposits recorded'}
            icon={ArrowDownCircle}
            color="blue"
          />
          <StatCard
            title="Transactions Count"
            value={totalItems.toString()}
            subtitle="Income entries logged"
            icon={ListFilter}
            color="purple"
            delta={
              stats?.delta?.count !== null && stats?.delta?.count !== undefined
                ? {
                    value: stats.delta.count,
                    isGood: stats.delta.count >= 0,
                    label: 'vs previous period',
                  }
                : undefined
            }
          />
        </div>
      )}

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <IncomeOverviewChart from={fromDate} to={toDate} />
        </div>
        <div className="xl:col-span-1">
          <IncomeBySourceChart year={year} month={month} />
        </div>
      </div>

      {/* Bottom Section: All Income Transactions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">All Income Transactions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter income deposits and receipts by month or search.</p>
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
              placeholder="Search income..."
              value={search}
              onChange={setSearch}
              className="w-56"
            />

            <Button
              size="sm"
              onClick={() => router.push('/transactions/new')}
              className="flex items-center gap-2"
            >
              <Plus size={16} /> Add Income
            </Button>
          </div>
        </div>

        {/* Table Body */}
        <div className="p-0">
          <DataTable
            data={transactions}
            columns={columns}
            isLoading={txLoading}
            emptyMessage="No income transactions found for this period."
            pagination={{
              currentPage: page,
              totalPages,
              totalItems,
              itemsPerPage,
              itemName: 'income entries',
              onPageChange: setPage,
            }}
          />
        </div>
      </div>
    </div>
  );
}

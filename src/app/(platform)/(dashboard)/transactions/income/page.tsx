"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/providers/AppDataProvider';
import { DailyExpenseStatCard } from '@/components/dailyexpensepage/DailyExpenseStatCard';
import { IncomeOverviewChart } from '@/components/incomepage/IncomeOverviewChart';
import { IncomeBySourceChart } from '@/components/incomepage/IncomeBySourceChart';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';
import { Search, Plus } from 'lucide-react';
import { useGetTransactions, useGetTransactionStats } from '@/hooks/queries/transactions';
import { TransactionActionMenu } from '@/components/transactions/TransactionActionMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';

export default function IncomeTransactionsPage() {
  const router = useRouter();
  const { setHeaderData } = useAppData();

  // Default to current month YYYY-MM
  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const [selectedDate, setSelectedDate] = useState(currentMonthStr);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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

  // Real stats
  const { data: stats, isLoading: statsLoading } = useGetTransactionStats({
    type: 'income',
    fromDate,
    toDate,
    search: search.trim() || undefined,
  });

  // Real transactions
  const { data: txResponse, isLoading: txLoading } = useGetTransactions({
    type: 'income',
    fromDate,
    toDate,
    search: search.trim() || undefined,
    page,
    limit: itemsPerPage,
  });

  const transactions = txResponse?.data || [];
  const totalItems = txResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const totalIncome = Number(stats?.income || 0);
  const averageIncome = totalItems > 0 ? totalIncome / totalItems : 0;

  const columns: Column<any>[] = [
    {
      header: "Title",
      key: "title",
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
      header: "Date",
      key: "date",
      render: (row) => {
        const d = new Date(row.date);
        return (
          <span className="text-[#849AB4] font-medium text-sm">
            {d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      header: "Category",
      key: "category",
      render: (row) => (
        <span className="inline-flex items-center px-3 py-1 rounded-md border border-[#159A1D] text-[#159A1D] text-xs font-bold bg-[#E7F8F0]">
          {row.category_name || 'Income'}
        </span>
      ),
    },
    {
      header: "Amount",
      key: "amount",
      render: (row) => (
        <span className="text-[#159A1D] font-bold text-sm">
          +${Number(row.amount).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Action",
      key: "id",
      render: (row) => <TransactionActionMenu transaction={row} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] w-full pb-12">
      {/* Top Stats Row */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DailyExpenseStatCard
            title="Total Income"
            value={`+$${totalIncome.toFixed(2)}`}
            valueColor="text-[#159A1D]"
            subtext="for selected period"
          />
          <DailyExpenseStatCard
            title="Transactions Count"
            value={totalItems.toString()}
            valueColor="text-slate-900"
            subtext="income entries"
          />
          <DailyExpenseStatCard
            title="Average Income"
            value={`$${averageIncome.toFixed(2)}`}
            valueColor="text-[#159A1D]"
            subtext="per transaction"
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
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">All Income Transactions</h2>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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

            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search income..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => router.push('/transactions/new')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#159A1D] hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto cursor-pointer"
            >
              <Plus size={16} />
              Add Income
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="p-0">
          {txLoading ? (
            <div className="p-6">
              <SkeletonTable rows={5} columns={5} />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No income transactions found"
              description="No income entries have been logged for this period."
              actionText="Log Income"
              actionHref="/transactions/new"
            />
          ) : (
            <DataTable
              data={transactions}
              columns={columns}
              pagination={{
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage,
                itemName: 'income entries',
                onPageChange: setPage,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

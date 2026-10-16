"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { DailyExpenseStatCard } from '@/components/dailyexpensepage/DailyExpenseStatCard';
import { BalanceOverviewChart } from '@/components/balancepage/BalanceOverviewChart';
import { BalanceSummaryList } from '@/components/balancepage/BalanceSummaryList';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';
import { Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useGetTransactions, useGetTransactionStats } from '@/hooks/queries/transactions';
import { TransactionActionMenu } from '@/components/transactions/TransactionActionMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';

export default function TotalBalanceTrackingPage() {
  const { setHeaderData } = useAppData();
  
  // Default to current month YYYY-MM
  const currentMonthStr = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const [selectedDate, setSelectedDate] = useState(currentMonthStr);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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

  // Query real stats
  const { data: stats, isLoading: statsLoading } = useGetTransactionStats({
    fromDate,
    toDate,
    search: search.trim() || undefined,
  });

  // Query real transactions
  const { data: txData, isLoading: txLoading } = useGetTransactions({
    fromDate,
    toDate,
    search: search.trim() || undefined,
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
        <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
          {row.category_name || 'Uncategorized'}
        </span>
      ),
    },
    {
      header: "Type",
      key: "type",
      render: (row) =>
        row.type === 'income' ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#159A1D]">
            <ArrowDownCircle size={14} /> Income
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500">
            <ArrowUpCircle size={14} /> Expense
          </span>
        ),
    },
    {
      header: "Amount",
      key: "amount",
      render: (row) => (
        <span
          className={`font-bold text-sm ${
            row.type === 'income' ? 'text-[#159A1D]' : 'text-slate-900'
          }`}
        >
          {row.type === 'income' ? '+' : '-'}${Number(row.amount).toFixed(2)}
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
            title="Net Cash Flow"
            value={`${netBalance >= 0 ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}`}
            valueColor={netBalance >= 0 ? 'text-[#159A1D]' : 'text-slate-900'}
            subtext="for selected period"
          />
          <DailyExpenseStatCard
            title="Total Income"
            value={`+$${totalIncome.toFixed(2)}`}
            valueColor="text-[#159A1D]"
            subtext="for selected period"
          />
          <DailyExpenseStatCard
            title="Total Expenses"
            value={`-$${totalExpense.toFixed(2)}`}
            valueColor="text-red-500"
            subtext="for selected period"
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
            income={totalIncome}
            expense={totalExpense}
            balance={netBalance}
            highestExpense={highestExpense}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* Bottom Section: Recent Transactions */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Recent Transactions</h2>

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
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] transition-all font-medium placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="p-0">
          {txLoading ? (
            <div className="p-6">
              <SkeletonTable rows={5} columns={6} />
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="There are no income or expense transactions recorded for the selected period."
              actionText="Log Transaction"
              actionHref="/transactions/new"
              compact={false}
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
                onPageChange: setPage,
                itemName: 'transactions',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

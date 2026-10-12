"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { useAppData } from '@/providers/AppDataProvider';
import { useGetTransactions, useGetTransactionStats } from '@/hooks/queries/transactions';

export default function BalanceTrackerList() {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  
  // Default to current month
  const currentMonth = new Date().toISOString().substring(0, 7);
  const [fromMonth, setFromMonth] = useState(currentMonth);
  const [toMonth, setToMonth] = useState(currentMonth);
  
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Enforce fromDate <= toDate
  const handleFromMonthChange = (val: string) => {
    setPage(1);
    setFromMonth(val);
    if (val > toMonth) setToMonth(val);
  };

  const handleToMonthChange = (val: string) => {
    setPage(1);
    setToMonth(val);
    if (val < fromMonth) setFromMonth(val);
  };

  useEffect(() => {
    setHeaderData("Income & Expenses", "Track your balance, incomes, and expenses.", false);
  }, [setHeaderData]);

  // Construct fromDate and toDate bounds for the API
  const fromDate = fromMonth ? `${fromMonth}-01` : undefined;
  let toDate = undefined;
  if (toMonth) {
    // Get last day of the selected toMonth
    const [year, month] = toMonth.split('-');
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    toDate = `${toMonth}-${lastDay}`;
  }
  
  const typeFilter = activeTab === 'All' ? undefined : (activeTab === 'Income' ? 'income' : 'expense');

  const { data: txResponse, isLoading } = useGetTransactions({ 
    type: typeFilter, 
    fromDate, 
    toDate,
    page,
    limit: itemsPerPage
  });
  const transactions = txResponse?.data || [];
  const totalItems = txResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const { data: stats } = useGetTransactionStats({ fromDate, toDate });

  // Month options: current month + past 24 months
  const monthOptions = useMemo(() => {
    const opts = [];
    const d = new Date();
    d.setDate(1); // Set to 1st to avoid overflow issues
    for (let i = 0; i < 24; i++) {
      const val = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      opts.push({ value: val, label });
      d.setMonth(d.getMonth() - 1);
    }
    return opts;
  }, []);

  const netCashFlow = Number(stats?.balance || 0);
  const totalIncome = Number(stats?.income || 0);
  const totalExpense = Number(stats?.expense || 0);
  const highestExpense = Number(stats?.highestExpense || 0);

  const columns: Column<any>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (row) => <span className="text-slate-900 font-semibold">{row.title}</span>
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => {
        const d = new Date(row.date);
        return <span className="text-[#849AB4] font-medium">{d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>;
      }
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
          {row.category_name || 'Uncategorized'}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        if (row.type === 'income') {
          return (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#159A1D]">
              <ArrowDownCircle size={14} /> Income
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-500">
            <ArrowUpCircle size={14} /> Expense
          </span>
        );
      }
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className={`font-bold ${row.type === 'income' ? 'text-[#159A1D]' : 'text-slate-900'}`}>
          {row.type === 'income' ? '+' : '-'}${Number(row.amount).toFixed(2)}
        </span>
      )
    }
  ];

  return (
    <div className="mx-auto pb-12 space-y-6">
      
      {/* Top Filter */}
      <div className="flex justify-end items-center gap-3">
        <span className="text-sm font-semibold text-slate-500">From</span>
        <div className="w-40">
          <Select 
            value={fromMonth}
            onChange={handleFromMonthChange}
            options={monthOptions}
            className="!py-2 !px-3 !bg-white shadow-sm border-slate-200"
          />
        </div>
        <span className="text-sm font-semibold text-slate-500">To</span>
        <div className="w-40">
          <Select 
            value={toMonth}
            onChange={handleToMonthChange}
            options={monthOptions}
            className="!py-2 !px-3 !bg-white shadow-sm border-slate-200"
          />
        </div>
        <div className="w-px h-8 bg-slate-200 mx-2"></div>
        <Button 
          onClick={() => router.push('/transactions/new')}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Transaction
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-[#849AB4] mb-2">Net Cash Flow</p>
          <h2 className={`text-3xl font-bold ${netCashFlow >= 0 ? 'text-[#159A1D]' : 'text-slate-900'}`}>
            {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toFixed(2)}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-[#849AB4] mb-2">Total Income</p>
          <h2 className="text-3xl font-bold text-[#159A1D]">+${totalIncome.toFixed(2)}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-[#849AB4] mb-2">Total Expenses</p>
          <h2 className="text-3xl font-bold text-slate-900">-${totalExpense.toFixed(2)}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-bold text-[#849AB4] mb-2">Highest Expense</p>
          <h2 className="text-3xl font-bold text-red-500">-${highestExpense.toFixed(2)}</h2>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tabs */}
        <div className="px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            {['All', 'Income', 'Expenses'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-8 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-[3px] ${
                  activeTab === tab 
                    ? 'bg-slate-100 text-slate-900 border-[#159A1D]' 
                    : 'text-[#849AB4] border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-0 relative min-h-[300px]">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="w-6 h-6 border-2 border-[#159A1D] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <DataTable 
            columns={columns} 
            data={transactions}
            pagination={{
              currentPage: page,
              totalPages,
              totalItems,
              itemsPerPage,
              onPageChange: setPage,
              itemName: 'transactions'
            }}
          />
        </div>
      </div>
    </div>
  );
}

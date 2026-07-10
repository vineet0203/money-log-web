"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { DailyExpenseStatCard } from '@/components/dailyexpensepage/DailyExpenseStatCard';
import { IncomeOverviewChart } from '@/components/incomepage/IncomeOverviewChart';
import { IncomeBySourceChart } from '@/components/incomepage/IncomeBySourceChart';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';
import { Search, Plus, Building2, Smartphone, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface IncomeTransaction {
  id: string;
  date: string;
  time: string;
  source: string;
  category: string;
  description: string;
  paymentMethodText: string;
  paymentMethodIcon: React.ReactNode;
  amount: number;
}

const mockTransactions: IncomeTransaction[] = [
  { id: '1', date: 'May 19,2025', time: '10:00 AM', source: 'Salary', category: 'Salary', description: 'May 2025 Salary', paymentMethodText: 'HDFC Bank', paymentMethodIcon: <Building2 size={16} className="text-white" />, amount: 32.20 },
  { id: '2', date: 'May 18,2025', time: '10:00 AM', source: 'Freelance', category: 'Salary', description: 'Website Design Project', paymentMethodText: 'UPI', paymentMethodIcon: <Smartphone size={16} className="text-white" />, amount: 32.20 },
  { id: '3', date: 'May 17,2025', time: '10:00 AM', source: 'Business', category: 'Salary', description: 'Website Design Project', paymentMethodText: 'UPI', paymentMethodIcon: <Smartphone size={16} className="text-white" />, amount: 32.20 },
  { id: '4', date: 'May 16,2025', time: '10:00 AM', source: 'Investment', category: 'Salary', description: 'Website Design Project', paymentMethodText: 'UPI', paymentMethodIcon: <Building2 size={16} className="text-white" />, amount: 32.20 },
  { id: '5', date: 'May 15,2025', time: '10:00 AM', source: 'Others', category: 'Salary', description: 'Website Design Project', paymentMethodText: 'UPI', paymentMethodIcon: <Smartphone size={16} className="text-white" />, amount: 32.20 },
];

export default function IncomeTransactionsPage() {
  const { setHeaderData } = useAppData();
  const [selectedDate, setSelectedDate] = useState('2023-03');

  useEffect(() => {
    setHeaderData("Income Transactions");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<IncomeTransaction>[] = [
    {
      header: "Date",
      key: "date",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-slate-600 font-medium">{row.date}</span>
          <span className="text-[#849AB4] text-xs">{row.time}</span>
        </div>
      ),
    },
    {
      header: "Source",
      key: "source",
      render: (row) => <span className="text-[#849AB4] font-medium">{row.source}</span>,
    },
    {
      header: "Category",
      key: "category",
      render: (row) => (
        <span className="inline-flex items-center px-3 py-1 rounded-md border border-[#159A1D] text-[#159A1D] text-xs font-bold">
          {row.category}
        </span>
      ),
    },
    {
      header: "Description",
      key: "description",
      render: (row) => <span className="text-[#849AB4]">{row.description}</span>,
    },
    {
      header: "Payment Method",
      key: "paymentMethodText",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#159A1D] flex items-center justify-center shrink-0">
            {row.paymentMethodIcon}
          </div>
          <span className="text-[#849AB4] font-medium">{row.paymentMethodText}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      key: "amount",
      render: (row) => <span className="text-[#849AB4] font-medium">-{row.amount.toFixed(2)}</span>,
    },
    {
      header: "Action",
      key: "id", // Dummy accessor for action column
      render: () => (
        <button className="text-[#159A1D] font-bold text-sm hover:underline">
          View
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-[1600px] w-full">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DailyExpenseStatCard 
          title="Total Income"
          value="$60,000"
          valueColor="text-[#159A1D]"
          percentChange="18.45%"
          percentColor="text-[#159A1D]"
          subtext="vs last month"
        />
        <DailyExpenseStatCard 
          title="Transitions"
          value="12"
          valueColor="text-[#159A1D]"
          percentChange="2%"
          percentColor="text-[#159A1D]"
          subtext="vs last week"
          icon={<DollarSign className="w-6 h-6 xl:w-7 xl:h-7 text-white" />}
        />
        <DailyExpenseStatCard 
          title="Average Income"
          value="$5204"
          valueColor="text-[#159A1D]"
          percentChange="12.30%"
          percentColor="text-blue-500"
          subtext="vs last week"
        />
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <IncomeOverviewChart />
        </div>
        <div className="xl:col-span-1">
          <IncomeBySourceChart />
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
              onChange={(d) => d && setSelectedDate(d)} 
            />
            
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-slate-700"
              />
            </div>

            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#159A1D] hover:bg-[#118218] text-white text-sm font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap w-full sm:w-auto">
              <Plus size={16} />
              Add Income
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-2 md:p-4">
          <DataTable 
            data={mockTransactions}
            columns={columns}
          />
        </div>
      </div>

    </div>
  );
}

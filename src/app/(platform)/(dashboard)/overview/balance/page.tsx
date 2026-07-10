"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { DailyExpenseStatCard } from '@/components/dailyexpensepage/DailyExpenseStatCard';
import { BalanceOverviewChart } from '@/components/balancepage/BalanceOverviewChart';
import { BalanceSummaryList } from '@/components/balancepage/BalanceSummaryList';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';
import { Scissors, FileText, Car, GraduationCap, Gamepad2, Search } from 'lucide-react';

interface Transaction {
  id: string;
  category: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  date: string;
  description: string;
  amount: number;
}

const recentTransactions: Transaction[] = [
  { id: '1', category: 'Beauty', icon: <Scissors size={18} />, iconColor: 'text-white', iconBgColor: 'bg-[#159A1D]', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', amount: -32.20 },
  { id: '2', category: 'Bills & Fees', icon: <FileText size={18} />, iconColor: 'text-white', iconBgColor: 'bg-[#14b8a6]', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', amount: -32.20 },
  { id: '3', category: 'Car', icon: <Car size={18} />, iconColor: 'text-white', iconBgColor: 'bg-[#0ea5e9]', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', amount: -32.20 },
  { id: '4', category: 'Education', icon: <GraduationCap size={18} />, iconColor: 'text-white', iconBgColor: 'bg-[#3b82f6]', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', amount: -32.20 },
  { id: '5', category: 'Entertainment', icon: <Gamepad2 size={18} />, iconColor: 'text-white', iconBgColor: 'bg-[#6366f1]', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', amount: -32.20 },
  { id: '6', category: 'Beauty', icon: <Scissors size={18} />, iconColor: 'text-white', iconBgColor: 'bg-[#159A1D]', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', amount: -32.20 },
];

export default function TotalBalanceTrackingPage() {
  const { setHeaderData } = useAppData();
  const [selectedDate, setSelectedDate] = useState('2023-03');

  useEffect(() => {
    setHeaderData("Total Balance Tracking");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<Transaction>[] = [
    {
      header: "Category",
      key: "category",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${row.iconBgColor} flex items-center justify-center shrink-0`}>
            {row.icon}
          </div>
          <span className="font-medium text-[#849AB4]">{row.category}</span>
        </div>
      ),
    },
    {
      header: "Date",
      key: "date",
      render: (row) => <span className="text-[#849AB4]">{row.date}</span>,
    },
    {
      header: "Description",
      key: "description",
      render: (row) => <span className="text-[#849AB4]">{row.description}</span>,
    },
    {
      header: "Amount",
      key: "amount",
      render: (row) => <span className="text-[#849AB4] font-medium">{row.amount < 0 ? `${row.amount}` : `+${row.amount}`}</span>,
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
          title="Total Balance"
          value="$50,000"
          valueColor="text-[#159A1D]"
          percentChange="8.35%"
          percentColor="text-[#159A1D]"
          subtext="vs last month"
        />
        <DailyExpenseStatCard 
          title="Total Assests"
          value="$150,000"
          valueColor="text-[#159A1D]"
          percentChange="6.72%"
          percentColor="text-[#159A1D]"
          subtext="vs last month"
        />
        <DailyExpenseStatCard 
          title="Total Liabilities"
          value="$10,000"
          valueColor="text-[#159A1D]"
          percentChange="2.15%"
          percentColor="text-red-500"
          subtext="vs last month"
        />
      </div>

      {/* Middle Section: Chart & Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <BalanceOverviewChart />
        </div>
        <div className="xl:col-span-1">
          <BalanceSummaryList />
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
              onChange={(d) => d && setSelectedDate(d)} 
            />
            
            <div className="relative w-full sm:w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-2 md:p-4">
          <DataTable 
            data={recentTransactions}
            columns={columns}
          />
        </div>
      </div>

    </div>
  );
}

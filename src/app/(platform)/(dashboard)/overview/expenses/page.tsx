"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { DailyExpenseStatCard } from '@/components/dailyexpensepage/DailyExpenseStatCard';
import { ExpenseTrendChart } from '@/components/dailyexpensepage/ExpenseTrendChart';
import { RecentExpenseList } from '@/components/dailyexpensepage/RecentExpenseList';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';
import { Plus, Scissors, FileText, Car, GraduationCap, CalendarDays } from 'lucide-react';

// Mock Data for the table
interface DailyExpenseData {
  id: string;
  category: string;
  icon: React.ElementType;
  iconBg: string;
  date: string;
  description: string;
  paymentMethod: string;
  account: string;
  amount: number;
}

const mockExpenseData: DailyExpenseData[] = [
  { id: '1', category: 'Beauty', icon: Scissors, iconBg: 'bg-[#159A1D]', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', paymentMethod: 'Card', account: '**** 1234', amount: -32.20 },
  { id: '2', category: 'Bills & Fees', icon: FileText, iconBg: 'bg-teal-400', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', paymentMethod: 'Bank Transfer', account: 'Chase Checking', amount: -32.20 },
  { id: '3', category: 'Car', icon: Car, iconBg: 'bg-blue-400', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', paymentMethod: 'Cash', account: 'Wallet', amount: -32.20 },
  { id: '4', category: 'Education', icon: GraduationCap, iconBg: 'bg-blue-500', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', paymentMethod: 'Card', account: '**** 9988', amount: -32.20 },
  { id: '5', category: 'Entertainment', icon: CalendarDays, iconBg: 'bg-indigo-400', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', paymentMethod: 'Card', account: '**** 1234', amount: -32.20 },
  { id: '6', category: 'Beauty', icon: Scissors, iconBg: 'bg-[#159A1D]', date: '12.12.2023', description: 'Grocery Items and Beverage soft drinks', paymentMethod: 'Cash', account: 'Wallet', amount: -32.20 },
];

export default function DailyExpenseTrackingPage() {
  const { setHeaderData } = useAppData();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setHeaderData("Daily Expense Tracking", "Track and manage your daily spending effectively.");
  }, [setHeaderData]);

  const columns: Column<DailyExpenseData>[] = [
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${row.iconBg}`}>
            <row.icon size={18} />
          </div>
          <span className="font-bold text-[#849AB4]">{row.category}</span>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="font-bold text-[#849AB4]">{row.date}</span>
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => <span className="font-bold text-[#849AB4]">{row.description}</span>
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (row) => <span className="font-bold text-[#849AB4]">{row.paymentMethod}</span>
    },
    {
      key: 'account',
      header: 'Account/Card',
      render: (row) => <span className="font-bold text-[#849AB4]">{row.account}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className="font-bold text-[#849AB4]">
          {row.amount.toFixed(2)}
        </span>
      )
    },
    {
      key: 'action',
      header: 'Action',
      render: () => (
        <button className="text-[#159A1D] font-extrabold text-sm hover:underline">
          View
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DailyExpenseStatCard 
          title="Transactions Today"
          value="10"
          valueColor="text-[#159A1D]"
          percentChange="2%"
          percentColor="text-[#159A1D]"
          subtext="vs yesterday"
        />
        <DailyExpenseStatCard 
          title="Total Expenses Today"
          value="$2,450.75"
          percentChange="12.45%"
          percentColor="text-red-500"
          subtext="vs yesterday"
        />
        <DailyExpenseStatCard 
          title="Total Expenses Week"
          value="$8,240.50"
          percentChange="5.2%"
          percentColor="text-red-500"
          subtext="vs last week"
        />
        <DailyExpenseStatCard 
          title="Total Expenses Month"
          value="$34,120.00"
          percentChange="8.1%"
          percentColor="text-red-500"
          subtext="vs last month"
        />
      </div>

      {/* Middle Section: Chart & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseTrendChart />
        </div>
        <div className="lg:col-span-1">
          <RecentExpenseList />
        </div>
      </div>

      {/* Bottom Section: Table */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col mb-10">
        
        {/* Table Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 border-b border-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">Today's Expense</h2>
            
            <SingleDatePicker 
              date={selectedDate}
              onChange={setSelectedDate}
            />
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#159A1D] text-white text-sm font-bold shadow-sm hover:bg-[#118218] transition-all">
            <Plus size={16} strokeWidth={3} />
            Add Expense
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={mockExpenseData}
          pagination={{
            currentPage,
            totalPages: 1,
            totalItems: mockExpenseData.length,
            itemsPerPage: 6,
            itemName: 'expenses',
            onPageChange: setCurrentPage
          }}
        />

      </div>
    </div>
  );
}

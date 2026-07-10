"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { DailyExpenseStatCard } from '@/components/dailyexpensepage/DailyExpenseStatCard';
import { TransferOverviewChart } from '@/components/transferpage/TransferOverviewChart';
import { TopTransferRoutesChart } from '@/components/transferpage/TopTransferRoutesChart';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SingleDatePicker } from '@/components/ui/SingleDatePicker';
import { Search, Plus, Building2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface TransferTransaction {
  id: string;
  date: string;
  time: string;
  fromBank: string;
  fromAccount: string;
  toBank: string;
  toAccount: string;
  type: 'Sent' | 'Recieved';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

const mockTransactions: TransferTransaction[] = [
  { id: '1', date: 'May 19,2025', time: '10:00 AM', fromBank: 'HDFC Bank', fromAccount: '****4567', toBank: 'ICICI Bank', toAccount: '****2378', type: 'Sent', amount: -5000.00, status: 'Completed' },
  { id: '2', date: 'May 19,2025', time: '10:00 AM', fromBank: 'HDFC Bank', fromAccount: '****4567', toBank: 'ICICI Bank', toAccount: '****2378', type: 'Recieved', amount: 8500.00, status: 'Completed' },
  { id: '3', date: 'May 19,2025', time: '10:00 AM', fromBank: 'HDFC Bank', fromAccount: '****4567', toBank: 'ICICI Bank', toAccount: '****2378', type: 'Sent', amount: -3200.00, status: 'Completed' },
  { id: '4', date: 'May 19,2025', time: '10:00 AM', fromBank: 'HDFC Bank', fromAccount: '****4567', toBank: 'ICICI Bank', toAccount: '****2378', type: 'Recieved', amount: -5000.00, status: 'Completed' }, // Follow mockup exactly: Recieved -$5000.00
  { id: '5', date: 'May 19,2025', time: '10:00 AM', fromBank: 'HDFC Bank', fromAccount: '****4567', toBank: 'ICICI Bank', toAccount: '****2378', type: 'Sent', amount: -1000.00, status: 'Completed' },
];

export default function TransferMoneyTrackingPage() {
  const { setHeaderData } = useAppData();
  const [selectedDate, setSelectedDate] = useState('2023-03');

  useEffect(() => {
    setHeaderData("Transfer Money Tracking");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: Column<TransferTransaction>[] = [
    {
      header: "Date & Time",
      key: "date",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-slate-600 font-medium">{row.date}</span>
          <span className="text-[#849AB4] text-xs">{row.time}</span>
        </div>
      ),
    },
    {
      header: "From Account",
      key: "fromBank",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#159A1D] flex items-center justify-center shrink-0">
             <Building2 size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#849AB4] font-medium text-sm">{row.fromBank}</span>
            <span className="text-slate-400 text-xs">{row.fromAccount}</span>
          </div>
        </div>
      ),
    },
    {
      header: "",
      key: "arrow",
      className: "w-8 px-0 text-center",
      render: () => (
        <ArrowRight size={16} className="text-slate-400 mx-auto" />
      ),
    },
    {
      header: "To Account",
      key: "toBank",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#159A1D] flex items-center justify-center shrink-0">
             <Building2 size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#849AB4] font-medium text-sm">{row.toBank}</span>
            <span className="text-slate-400 text-xs">{row.toAccount}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      key: "type",
      render: (row) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-md border text-xs font-bold ${
          row.type === 'Sent' 
            ? 'border-[#159A1D] text-[#159A1D]' 
            : 'border-red-500 text-red-500'
        }`}>
          {row.type}
        </span>
      ),
    },
    {
      header: "Amount",
      key: "amount",
      render: (row) => (
        <span className={`font-medium ${row.amount < 0 ? 'text-red-500' : 'text-[#159A1D]'}`}>
          {row.amount < 0 ? `-$${Math.abs(row.amount).toFixed(2)}` : `+$${row.amount.toFixed(2)}`}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      render: (row) => (
        <span className="inline-flex items-center px-3 py-1 rounded-md border border-[#159A1D] text-[#159A1D] text-xs font-bold">
          {row.status}
        </span>
      ),
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
          title="Total Transfered"
          value="$45,860"
          valueColor="text-[#159A1D]"
          percentChange="12.45%"
          percentColor="text-[#159A1D]"
          subtext="vs last month"
        />
        <DailyExpenseStatCard 
          title="Total Transfers"
          value="14"
          valueColor="text-[#159A1D]"
          percentChange="2%"
          percentColor="text-[#159A1D]"
          subtext="vs last week"
        />
        <DailyExpenseStatCard 
          title="Outgoing Transfer"
          value="$17510"
          valueColor="text-[#159A1D]"
          percentChange="12.30%"
          percentColor="text-blue-500"
          subtext="vs last week"
        />
      </div>

      {/* Middle Section: Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TransferOverviewChart />
        </div>
        <div className="xl:col-span-1">
          <TopTransferRoutesChart />
        </div>
      </div>

      {/* Bottom Section: All Transfer Transaction */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-6 md:px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">All Transfer Transaction</h2>
          
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
              Transfer Money
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

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';

interface Subscription {
  id: string;
  name: string;
  dueDate: string;
  daysLeft: number;
  amount: string;
  status: string;
}

const mockData: Subscription[] = [
  { id: '1', name: 'Netflix', dueDate: '10-03-2026', daysLeft: 5, amount: '$100.00', status: 'Ongoing' },
  { id: '2', name: 'Canva', dueDate: '12-03-2026', daysLeft: 1, amount: '$100.00', status: 'Ongoing' },
  { id: '3', name: 'Amazon', dueDate: '12-03-2026', daysLeft: 10, amount: '$100.00', status: 'Ongoing' },
  { id: '4', name: 'Zomato', dueDate: '12-03-2026', daysLeft: 1, amount: '$100.00', status: 'Ongoing' },
  { id: '5', name: 'Flipkart', dueDate: '12-03-2026', daysLeft: 1, amount: '$100.00', status: 'Ongoing' },
  { id: '6', name: 'Spotify', dueDate: '12-03-2026', daysLeft: 1, amount: '$100.00', status: 'Ongoing' },
];

export function SubscriptionDetailsTable() {
  const [activeTab, setActiveTab] = useState('On going');

  const columns: Column<Subscription>[] = [
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1CD491] text-white flex items-center justify-center font-bold text-sm">
            {row.name.charAt(0)}
          </div>
          <span className="text-[#849AB4] font-medium">{row.name}</span>
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-[#849AB4] text-sm">{row.dueDate}</span>
          <span className={`text-xs font-bold mt-1 ${row.daysLeft <= 1 ? 'text-[#EF4444]' : 'text-[#159A1D]'}`}>
            In {row.daysLeft} {row.daysLeft === 1 ? 'Days' : 'Days'}
          </span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => <span className="text-[#849AB4]">{row.amount}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className="bg-[#E7F8F0] text-[#159A1D] px-3 py-1 rounded-md text-xs font-bold border border-[#C5ECD9]">
          {row.status}
        </span>
      )
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <Link href={`/subscriptions/${row.id}`} className="text-[#159A1D] font-bold text-sm hover:underline">
          View
        </Link>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Subscriptions</h2>
        <div className="relative">
          <button className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar size={16} className="text-slate-400" />
            <span className="font-medium">Today, 31 March</span>
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-slate-100 flex gap-2">
        {['On going', 'Upcoming', 'Inactive'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-[3px] ${
              activeTab === tab 
                ? 'bg-slate-100 text-slate-900 border-[#159A1D]' 
                : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="p-0">
        <DataTable 
          columns={columns} 
          data={mockData} 
          pagination={{ 
            currentPage: 1, 
            totalPages: 4, 
            totalItems: 32,
            itemsPerPage: 8,
            itemName: 'subscriptions',
            onPageChange: () => {} 
          }}
        />
      </div>
    </div>
  );
}

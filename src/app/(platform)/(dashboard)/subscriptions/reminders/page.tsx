"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { RemindersStatCard } from '@/components/subscriptionpage/RemindersStatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Calendar, RefreshCw, ChevronDown, Download, Bell, BellOff, MoreVertical } from 'lucide-react';

// Custom icons based on the screenshot
const LogoPlaceholder = ({ letter, color }: { letter: string; color: string }) => (
  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 ${color}`}>
    {letter}
  </div>
);

// Mock Data Type
interface ReminderData {
  id: string;
  name: string;
  category: string;
  logo: React.ReactNode;
  plan: string;
  amount: number;
  frequency: string;
  renewalDate: string;
  renewalDay: string;
  daysLeft: number;
  reminderOn: boolean;
  status: 'Due Soon' | 'Upcoming' | 'Overdue';
}

const mockData: ReminderData[] = [
  { id: '1', name: 'Netflix', category: 'Entertainment', logo: <LogoPlaceholder letter="N" color="bg-red-600" />, plan: 'Premium', amount: 15.49, frequency: 'Monthly', renewalDate: 'May 25, 2025', renewalDay: 'Sunday', daysLeft: 5, reminderOn: true, status: 'Due Soon' },
  { id: '2', name: 'Slack', category: 'Productivity', logo: <LogoPlaceholder letter="S" color="bg-blue-500" />, plan: 'Pro', amount: 8.75, frequency: 'Monthly', renewalDate: 'May 28, 2025', renewalDay: 'Wednesday', daysLeft: 8, reminderOn: true, status: 'Due Soon' },
  { id: '3', name: 'Adobe Creative Cloud', category: 'Design', logo: <LogoPlaceholder letter="A" color="bg-red-500" />, plan: 'All Apps', amount: 52.99, frequency: 'Monthly', renewalDate: 'Jun 05, 2025', renewalDay: 'Thursday', daysLeft: 16, reminderOn: true, status: 'Upcoming' },
  { id: '4', name: 'Microsoft 365', category: 'Productivity', logo: <LogoPlaceholder letter="M" color="bg-orange-500" />, plan: 'Personal', amount: 6.99, frequency: 'Monthly', renewalDate: 'Jun 12, 2025', renewalDay: 'Thursday', daysLeft: 23, reminderOn: true, status: 'Upcoming' },
  { id: '5', name: 'Dropbox', category: 'Storage', logo: <LogoPlaceholder letter="D" color="bg-blue-600" />, plan: 'Plus 2TB', amount: 11.99, frequency: 'Monthly', renewalDate: 'Jun 20, 2025', renewalDay: 'Friday', daysLeft: 31, reminderOn: false, status: 'Upcoming' },
  { id: '6', name: 'AWS', category: 'Cloud Services', logo: <LogoPlaceholder letter="A" color="bg-orange-400" />, plan: 'Basic', amount: 24.50, frequency: 'Monthly', renewalDate: 'Jul 02, 2025', renewalDay: 'Wednesday', daysLeft: 43, reminderOn: true, status: 'Upcoming' },
  { id: '7', name: 'Domain.com', category: 'Domain', logo: <LogoPlaceholder letter="D" color="bg-red-600" />, plan: 'Domain +Privacy', amount: 13.99, frequency: 'Yearly', renewalDate: 'May 10, 2025', renewalDay: 'Saturday', daysLeft: -9, reminderOn: true, status: 'Overdue' },
  { id: '8', name: 'Gym Membership', category: 'Health Fitness', logo: <LogoPlaceholder letter="G" color="bg-black" />, plan: 'Gold', amount: 29.99, frequency: 'Monthly', renewalDate: 'May 05, 2025', renewalDay: 'Monday', daysLeft: -14, reminderOn: false, status: 'Overdue' },
];

export default function RenewalRemindersPage() {
  const { setHeaderData } = useAppData();
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('2025-05-19');
  const [endDate, setEndDate] = useState('2025-07-19');

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'design', label: 'Design' },
    { value: 'storage', label: 'Storage' },
  ];

  useEffect(() => {
    setHeaderData("Renewal Reminders", "Stay ahead of your renewal and avoid service interruptions");
  }, [setHeaderData]);

  const columns: Column<ReminderData>[] = [
    {
      key: 'subscription',
      header: 'Subscription',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.logo}
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{row.name}</span>
            <span className="text-xs font-semibold text-blue-500">{row.category}</span>
          </div>
        </div>
      )
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (row) => <span className="font-medium text-slate-700">{row.plan}</span>
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">${row.amount.toFixed(2)}</span>
          <span className="text-xs font-semibold text-blue-500">{row.frequency}</span>
        </div>
      )
    },
    {
      key: 'renewalDate',
      header: 'Renewal Date ↑',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.renewalDate}</span>
          <span className="text-xs font-semibold text-blue-500">{row.renewalDay}</span>
        </div>
      )
    },
    {
      key: 'daysLeft',
      header: 'Days Left',
      render: (row) => {
        let colorClass = 'bg-green-100 text-green-700'; // Default Upcoming
        if (row.daysLeft < 0) colorClass = 'bg-red-100 text-red-700'; // Overdue
        else if (row.daysLeft <= 10) colorClass = 'bg-orange-100 text-orange-700'; // Due soon
        else if (row.daysLeft <= 30) colorClass = 'bg-yellow-100 text-yellow-700'; // Medium

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${colorClass}`}>
            {row.daysLeft} days
          </span>
        );
      }
    },
    {
      key: 'reminder',
      header: 'Reminder',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.reminderOn ? (
            <>
              <Bell size={14} className="text-blue-500" fill="currentColor" />
              <span className="font-bold text-blue-500 text-xs">On</span>
            </>
          ) : (
            <>
              <BellOff size={14} className="text-slate-400" />
              <span className="font-bold text-slate-500 text-xs">Off</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        let colorClass = 'bg-orange-50 text-orange-500 border-orange-100'; // Upcoming
        if (row.status === 'Overdue') colorClass = 'bg-red-50 text-red-500 border-red-100';
        if (row.status === 'Due Soon') colorClass = 'bg-rose-50 text-rose-500 border-rose-100';

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${colorClass}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button className="text-blue-400 hover:text-blue-600 p-1">
          <MoreVertical size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <RemindersStatCard 
          icon={RefreshCw} theme="purple" 
          title="Total subscriptions" value={32} subLabel="Next 60 days"
        />
        <RemindersStatCard 
          icon={Calendar} theme="red" 
          title="Overdue" value={3} subLabel="Subscriptions" 
        />
        <RemindersStatCard 
          icon={Calendar} theme="blue" 
          title="Within 7 days" value={6} subLabel="Subscriptions" 
        />
        <RemindersStatCard 
          icon={Calendar} theme="green" 
          title="Within 8-30 days" value={14} subLabel="Subscriptions" 
        />
        <RemindersStatCard 
          icon={Calendar} theme="orange" 
          title="Yearly 30-45 days" value={0} subLabel="yearly subscription" 
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Header & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-4 border-b border-slate-100">
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold text-slate-900">Upcoming Renewals</h2>
            <span className="text-sm font-semibold text-blue-500">View and manage your upcoming subscription renewals.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <Select 
                options={categoryOptions} 
                value={category} 
                onChange={setCategory} 
                className="!py-2.5" 
              />
            </div>
            
            <DateRangePicker 
              startDate={startDate} 
              endDate={endDate} 
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }} 
            />

            <button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#159A1D] text-white text-sm font-bold shadow-sm hover:bg-[#118218] transition-all ml-auto lg:ml-0">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={mockData}
          pagination={{
            currentPage,
            totalPages: 4,
            totalItems: 32,
            itemsPerPage: 10,
            itemName: 'renewals',
            onPageChange: setCurrentPage
          }}
        />
      </div>
    </div>
  );
}

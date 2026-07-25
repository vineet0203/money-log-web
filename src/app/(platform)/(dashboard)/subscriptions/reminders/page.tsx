"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { RemindersStatCard } from '@/components/subscriptionpage/RemindersStatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Calendar, RefreshCw, Mail, MessageSquareText, BellOff } from 'lucide-react';
import { useGetSubscriptions, useGetSubscriptionStats, SubscriptionData } from '@/hooks/queries/subscriptions';
import { useGetCategories } from '@/hooks/queries/categories';
import { SubscriptionActionMenu } from '@/components/subscriptionpage/SubscriptionActionMenu';
import { SubscriptionLogo } from '@/components/ui/SubscriptionLogo';
import { useRouter } from 'next/navigation';

export default function RenewalRemindersPage() {
  const { setHeaderData } = useAppData();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('2025-05-19');
  const [endDate, setEndDate] = useState('2025-07-19');

  const { data: subscriptionsData, isLoading } = useGetSubscriptions(currentPage, 10, 'All', category);
  const { data: statsData } = useGetSubscriptionStats();
  const { data: categories = [] } = useGetCategories();

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
  ];

  useEffect(() => {
    setHeaderData("Renewal Reminders", "Stay ahead of your renewal and avoid service interruptions");
  }, [setHeaderData]);

  const columns: Column<SubscriptionData>[] = [
    {
      key: 'subscription',
      header: 'Subscription',
      render: (row) => (
        <div className="flex items-center gap-3">
          <SubscriptionLogo name={row.name} />
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{row.name}</span>
            <span className="text-xs font-semibold text-blue-500">{row.category_name || 'Uncategorized'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">${parseFloat(row.amount).toFixed(2)}</span>
          <span className="text-xs font-semibold text-blue-500 capitalize">{row.billing_cycle}</span>
        </div>
      )
    },
    {
      key: 'renewalDate',
      header: 'Renewal Date ↑',
      render: (row) => {
        const d = new Date(row.next_billing_date);
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">
              {d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-xs font-semibold text-blue-500">
              {d.toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
        );
      }
    },
    {
      key: 'daysLeft',
      header: 'Days Left',
      render: (row) => {
        let colorClass = 'bg-green-100 text-green-700'; // Default Upcoming
        if (row.days_left < 0) colorClass = 'bg-red-100 text-red-700'; // Overdue
        else if (row.days_left <= 10) colorClass = 'bg-orange-100 text-orange-700'; // Due soon
        else if (row.days_left <= 30) colorClass = 'bg-yellow-100 text-yellow-700'; // Medium

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${colorClass}`}>
            {row.days_left < 0 ? `${Math.abs(row.days_left)} days ago` : `${row.days_left} days`}
          </span>
        );
      }
    },
    {
      key: 'reminder',
      header: 'Reminder',
      render: (row) => {
        if (!row.is_reminder_on) {
          return (
            <div className="flex items-center gap-1.5">
              <BellOff size={14} className="text-slate-400" />
              <span className="font-bold text-slate-500 text-xs">Off</span>
            </div>
          );
        }
        
        return (
          <div className="flex items-center gap-2">
            {row.is_email_enabled ? <Mail size={14} className="text-blue-500" /> : null}
            {row.is_sms_enabled ? <MessageSquareText size={14} className="text-blue-500" /> : null}
            <span className="font-bold text-blue-500 text-xs">
              {row.reminder_days} days before
            </span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        let displayStatus = 'Upcoming';
        let colorClass = 'bg-orange-50 text-orange-500 border-orange-100'; 
        
        if (row.status === 'cancelled') {
          displayStatus = 'Inactive';
          colorClass = 'bg-slate-50 text-slate-500 border-slate-200';
        } else if (row.days_left < 0) {
          displayStatus = 'Overdue';
          colorClass = 'bg-red-50 text-red-500 border-red-100';
        } else if (row.days_left <= 10) {
          displayStatus = 'Due Soon';
          colorClass = 'bg-rose-50 text-rose-500 border-rose-100';
        }

        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${colorClass}`}>
            {displayStatus}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <SubscriptionActionMenu 
          subscriptionId={row.id.toString()} 
          status={row.status} 
          nextBillingDate={row.next_billing_date}
          billingCycle={row.billing_cycle}
        />
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <RemindersStatCard 
          icon={RefreshCw} theme="purple" 
          title="Total subscriptions" 
          value={statsData?.total_count || 0} 
          subLabel={`${statsData?.total_monthly_count || 0} Monthly • ${statsData?.total_yearly_count || 0} Yearly`}
        />
        <RemindersStatCard 
          icon={Calendar} theme="red" 
          title="Overdue" 
          value={statsData?.overdue_count || 0} 
          subLabel="Subscriptions" 
        />
        <RemindersStatCard 
          icon={Calendar} theme="blue" 
          title="Renew Within 7 days" 
          value={statsData?.within_7_days_count || 0} 
          subLabel="Subscriptions" 
        />
        <RemindersStatCard 
          icon={Calendar} theme="green" 
          title="Within 8-30 days" 
          value={statsData?.within_8_30_days_count || 0} 
          subLabel="Subscriptions" 
        />
        <RemindersStatCard 
          icon={Calendar} theme="orange" 
          title="Yearly 30-45 days" 
          value={statsData?.yearly_30_45_days_count || 0} 
          subLabel="Subscriptions" 
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
        
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
                onChange={(val) => {
                  setCategory(val);
                  setCurrentPage(1);
                }} 
                className="!py-2.5 !bg-slate-50 !border-slate-200" 
              />
            </div>
            
            {/* Temporarily disabled date filter
            <DateRangePicker 
              startDate={startDate} 
              endDate={endDate} 
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }} 
            />
            */}
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={subscriptionsData?.data || []}
          onRowClick={(row: any) => router.push(`/subscriptions/${row.id}`)}
          pagination={{
            currentPage,
            totalPages: subscriptionsData?.pagination.totalPages || 1,
            totalItems: subscriptionsData?.pagination.totalItems || 0,
            itemsPerPage: 10,
            itemName: 'renewals',
            onPageChange: setCurrentPage
          }}
        />
      </div>
    </div>
  );
}

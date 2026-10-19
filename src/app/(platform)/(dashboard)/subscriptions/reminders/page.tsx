"use client";

import React, { useEffect, useState } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { StatCard } from '@/components/ui/StatCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { Calendar, RefreshCw, Mail, MessageSquareText, BellOff, AlertCircle, Clock } from 'lucide-react';
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
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: subscriptionsData, isLoading } = useGetSubscriptions(
    currentPage,
    10,
    'All',
    category,
    debouncedSearch
  );
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
      header: 'Recurring Payment',
      render: (row) => (
        <div className="flex items-center gap-3">
          <SubscriptionLogo name={row.name} />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 text-sm truncate">{row.name}</span>
            <span className="text-xs font-medium text-slate-400 mt-0.5">{row.category_name || 'Uncategorized'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 font-mono text-sm">${parseFloat(row.amount).toFixed(2)}</span>
          <span className="text-[11px] text-slate-400 capitalize">{row.billing_cycle}</span>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <StatusBadge
          status={row.type === 'income' ? 'success' : 'danger'}
          label={row.type || 'expense'}
          size="sm"
        />
      )
    },
    {
      key: 'renewalDate',
      header: 'Renewal Date',
      render: (row) => {
        const d = new Date(row.next_billing_date);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-800 text-xs font-semibold">
              {d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
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
        const isOverdue = row.days_left < 0;
        const isUrgent = row.days_left <= 7;
        const variant = isOverdue ? 'danger' : isUrgent ? 'warning' : 'success';
        const text = isOverdue ? `${Math.abs(row.days_left)} days ago` : `${row.days_left} days`;

        return (
          <StatusBadge
            status={variant}
            label={text}
            size="sm"
            showDot={false}
          />
        );
      }
    },
    {
      key: 'reminder',
      header: 'Reminder',
      render: (row) => {
        if (!row.is_reminder_on) {
          return (
            <div className="flex items-center gap-1.5 text-slate-400">
              <BellOff size={13} />
              <span className="font-medium text-xs">Off</span>
            </div>
          );
        }
        
        return (
          <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50/70 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            {row.is_email_enabled ? <Mail size={12} className="text-emerald-600" /> : null}
            {row.is_sms_enabled ? <MessageSquareText size={12} className="text-emerald-600" /> : null}
            <span>{row.reminder_days}d before</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        let displayStatus = 'Upcoming';
        let variant: 'warning' | 'neutral' | 'danger' = 'warning';
        
        if (row.status === 'cancelled') {
          displayStatus = 'Inactive';
          variant = 'neutral';
        } else if (row.days_left < 0) {
          displayStatus = 'Overdue';
          variant = 'danger';
        } else if (row.days_left <= 7) {
          displayStatus = 'Due Soon';
          variant = 'warning';
        }

        return (
          <StatusBadge
            status={variant}
            label={displayStatus}
            size="sm"
          />
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
          type={row.type || 'expense'}
          subscription={row}
        />
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full pb-12">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard 
          icon={RefreshCw} 
          color="purple" 
          title="Total Recurring" 
          value={statsData?.total_count || 0} 
          subtitle={`${statsData?.total_monthly_count || 0} Monthly • ${statsData?.total_yearly_count || 0} Yearly`}
        />
        <StatCard 
          icon={AlertCircle} 
          color="rose" 
          title="Overdue" 
          value={statsData?.overdue_count || 0} 
          subtitle="Requires attention" 
        />
        <StatCard 
          icon={Calendar} 
          color="amber" 
          title="Within 7 Days" 
          value={statsData?.within_7_days_count || 0} 
          subtitle="Renewing soon" 
        />
        <StatCard 
          icon={Calendar} 
          color="green" 
          title="Within 8-30 Days" 
          value={statsData?.within_8_30_days_count || 0} 
          subtitle="Standard renewal window" 
        />
        <StatCard 
          icon={Clock} 
          color="slate" 
          title="Yearly 30-45 Days" 
          value={statsData?.yearly_30_45_days_count || 0} 
          subtitle="Long-term renewals" 
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col overflow-hidden">
        
        {/* Table Header */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Upcoming Renewals</h2>
            <p className="text-xs text-slate-400 mt-0.5">Stay ahead of upcoming renewals and avoid unexpected charges</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 border-b border-slate-100">
          <div className="w-full sm:w-72">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              onClear={() => setSearchInput('')}
              placeholder="Search renewals..."
              sizeVariant="sm"
            />
          </div>
          <div className="w-full sm:w-52">
            <Select 
              size="sm"
              options={categoryOptions} 
              value={category} 
              onChange={(val) => {
                setCategory(val);
                setCurrentPage(1);
              }} 
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="p-0">
          <DataTable
            columns={columns}
            data={subscriptionsData?.data || []}
            isLoading={isLoading}
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
    </div>
  );
}


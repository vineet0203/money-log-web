import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Tabs } from '@/components/ui/Tabs';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useGetSubscriptions, useGetSubscriptionStats } from '@/hooks/queries/subscriptions';
import { useGetCategories } from '@/hooks/queries/categories';
import { SubscriptionActionMenu } from './SubscriptionActionMenu';
import { SubscriptionLogo } from '@/components/ui/SubscriptionLogo';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import { formatRecurrenceFrequency } from '@/lib/recurrenceFormatters';
import { Zap, AlertCircle, Plus, ListFilter, PlayCircle, Clock, PauseCircle } from 'lucide-react';
import { useQueryTab } from '@/hooks/useQueryTab';

interface SubscriptionDetailsTableProps {
  onAddSubscription?: () => void;
}

export function SubscriptionDetailsTable({ onAddSubscription }: SubscriptionDetailsTableProps) {
  const [activeTab, setActiveTab] = useQueryTab<string>('tab', 'All', ['All', 'Ongoing', 'Upcoming', 'Inactive']);
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const itemsPerPage = 8;
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset page when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const { data: response, isLoading } = useGetSubscriptions(
    page,
    itemsPerPage,
    activeTab,
    categoryId,
    debouncedSearch
  );
  const { data: stats } = useGetSubscriptionStats();
  const { data: categories = [] } = useGetCategories();

  const tabs = [
    { id: 'All', label: 'All Payments', icon: ListFilter, count: stats?.total_count ? Number(stats.total_count) : undefined },
    { id: 'Ongoing', label: 'Active', icon: PlayCircle, count: stats?.ongoing_count ? Number(stats.ongoing_count) : undefined },
    { id: 'Upcoming', label: 'Due Soon', icon: Clock, count: stats?.upcoming_count ? Number(stats.upcoming_count) : undefined },
    { id: 'Inactive', label: 'Inactive', icon: PauseCircle, count: stats?.inactive_count ? Number(stats.inactive_count) : undefined },
  ];

  // Transform backend data for the DataTable
  const tableData = (response?.data || []).map(sub => {
    const d = new Date(sub.next_billing_date);
    const dueDate = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
    const lastPaidDate = sub.last_paid_date
      ? new Date(sub.last_paid_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
      : null;

    return {
      id: sub.id.toString(),
      name: sub.name,
      type: sub.type || 'expense',
      category: sub.category_name || 'Uncategorized',
      dueDate,
      lastPaidDate,
      daysLeft: sub.days_left,
      amount: `$${Number(sub.amount).toFixed(2)}`,
      billingCycle: sub.billing_cycle,
      frequencyLabel: formatRecurrenceFrequency(sub),
      autoPost: !!sub.auto_post,
      missedCount: sub.missed_count || 0,
      status: sub.computed_status,
      dbStatus: sub.status,
      nextBillingDate: sub.next_billing_date,
      rawSubscription: sub,
    };
  });

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Payment',
      render: (row) => (
        <div className="flex items-center gap-3">
          <SubscriptionLogo name={row.name} />
          <div className="flex flex-col min-w-0">
            <span className="text-slate-900 font-semibold text-sm truncate">{row.name}</span>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {row.autoPost && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                  <Zap className="w-2.5 h-2.5" /> Auto-post
                </span>
              )}
              {row.missedCount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  <AlertCircle className="w-2.5 h-2.5" /> {row.missedCount} missed
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="text-slate-600 font-medium text-xs">{row.category}</span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <StatusBadge
          status={row.type === 'income' ? 'success' : 'danger'}
          label={row.type}
          size="sm"
        />
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => {
        const isIncome = row.type === 'income';
        return (
          <div className="flex flex-col gap-1 min-w-[130px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-800 text-xs font-bold leading-none">{row.dueDate}</span>
              <span className={`text-[10.5px] font-bold leading-none ${row.daysLeft < 0 ? 'text-rose-600' : row.daysLeft <= 7 ? 'text-amber-600' : 'text-[#159A1D]'}`}>
                {row.daysLeft < 0 ? `${Math.abs(row.daysLeft)}d overdue` : `In ${row.daysLeft}d`}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium leading-tight">
              {row.lastPaidDate ? (
                <span>
                  {isIncome ? 'Last received:' : 'Last paid:'}{' '}
                  <span className="text-slate-600 font-semibold">{row.lastPaidDate}</span>
                </span>
              ) : (
                <span className="text-slate-400/90 italic">
                  {isIncome ? 'No income received yet' : 'No prior payment'}
                </span>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'amount',
      header: 'Amount / Cadence',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-slate-900 font-bold font-mono text-sm leading-none">{row.amount}</span>
          <span className="text-[11px] text-slate-400 leading-none">{row.frequencyLabel}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variant =
          row.status === 'Inactive' ? 'neutral' :
          row.status === 'Upcoming' ? 'warning' : 'success';
        return (
          <StatusBadge
            status={variant}
            label={row.status}
            size="sm"
          />
        );
      }
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <SubscriptionActionMenu 
          subscriptionId={row.id} 
          status={row.dbStatus} 
          nextBillingDate={row.nextBillingDate}
          billingCycle={row.billingCycle}
          type={row.type}
          subscription={row.rawSubscription}
        />
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 flex flex-col overflow-hidden">
      {/* Card Tabs Header */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="card"
        standalone={false}
      />

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 border-b border-slate-100">
        <div className="w-full sm:w-72">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            onClear={() => setSearchInput('')}
            placeholder="Search payments by name..."
            sizeVariant="sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Select 
            size="sm"
            value={categoryId}
            onChange={(val) => {
              setCategoryId(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
            ]}
            className="w-full sm:w-48"
          />
          {onAddSubscription && (
            <Button
              size="sm"
              onClick={onAddSubscription}
              className="shrink-0"
              leftIcon={<Plus size={15} />}
            >
              Add Recurring Payment
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="p-0">
        <DataTable 
          columns={columns} 
          data={tableData} 
          isLoading={isLoading}
          onRowClick={(row: any) => router.push(`/subscriptions/${row.id}`)}
          pagination={{ 
            currentPage: response?.pagination?.currentPage || 1, 
            totalPages: response?.pagination?.totalPages || 1, 
            totalItems: response?.pagination?.totalItems || 0,
            itemsPerPage: response?.pagination?.itemsPerPage || itemsPerPage,
            itemName: 'recurring payments',
            onPageChange: (newPage) => setPage(newPage)
          }}
        />
      </div>
    </div>
  );
}

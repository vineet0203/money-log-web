import React, { useState } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useGetSubscriptions } from '@/hooks/queries/subscriptions';
import { useGetCategories } from '@/hooks/queries/categories';
import { SubscriptionActionMenu } from './SubscriptionActionMenu';
import { SubscriptionLogo } from '@/components/ui/SubscriptionLogo';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import { formatRecurrenceFrequency } from '@/lib/recurrenceFormatters';
import { Zap, AlertCircle } from 'lucide-react';

export function SubscriptionDetailsTable() {
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('all');
  const itemsPerPage = 8;
  const router = useRouter();

  // Reset page when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const { data: response, isLoading } = useGetSubscriptions(page, itemsPerPage, activeTab, categoryId);
  const { data: categories = [] } = useGetCategories();

  // Transform backend data for the DataTable
  const tableData = (response?.data || []).map(sub => {
    const d = new Date(sub.next_billing_date);
    const dueDate = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
    return {
      id: sub.id.toString(),
      name: sub.name,
      type: sub.type || 'expense',
      category: sub.category_name || 'Uncategorized',
      dueDate,
      daysLeft: sub.days_left,
      amount: `$${Number(sub.amount).toFixed(2)}`,
      billingCycle: sub.billing_cycle,
      frequencyLabel: formatRecurrenceFrequency(sub),
      autoPost: !!sub.auto_post,
      missedCount: sub.missed_count || 0,
      status: sub.computed_status,
      dbStatus: sub.status,
      nextBillingDate: sub.next_billing_date
    };
  });

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Payment',
      render: (row) => (
        <div className="flex items-center gap-3">
          <SubscriptionLogo name={row.name} />
          <div className="flex flex-col">
            <span className="text-slate-900 font-semibold">{row.name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {row.autoPost && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                  <Zap className="w-2.5 h-2.5" /> Auto-post
                </span>
              )}
              {row.missedCount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
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
        <span className="text-[#849AB4] font-medium">{row.category}</span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${row.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {row.type}
        </span>
      )
    },
    {
      key: 'dueDate',
      header: 'Next Due Date',
      render: (row) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-[#849AB4] text-sm leading-none">{row.dueDate}</span>
          <span className={`text-xs font-bold leading-none ${row.daysLeft <= 1 ? 'text-[#EF4444]' : 'text-[#159A1D]'}`}>
            {row.daysLeft < 0 ? `${Math.abs(row.daysLeft)} days overdue` : `In ${row.daysLeft} ${row.daysLeft === 1 ? 'Day' : 'Days'}`}
          </span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount / Cadence',
      render: (row) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-900 font-bold leading-none">{row.amount}</span>
          <span className="text-xs text-[#849AB4] leading-none">{row.frequencyLabel}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        let colorClasses = 'bg-[#E7F8F0] text-[#159A1D] border-[#C5ECD9]'; // Ongoing/Default
        
        if (row.status === 'Inactive') {
          colorClasses = 'bg-red-50 text-red-600 border-red-200';
        } else if (row.status === 'Upcoming') {
          colorClasses = 'bg-orange-50 text-orange-600 border-orange-200';
        }

        return (
          <span className={`px-3 py-1 rounded-md text-xs font-bold border ${colorClasses}`}>
            {row.status}
          </span>
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
        />
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">All Recurring Payments</h2>
      </div>

      {/* Tabs and Filter */}
      <div className="px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex gap-2">
          {['All', 'Ongoing', 'Upcoming', 'Inactive'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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
        
        <div className="py-2 w-48">
          <Select 
            value={categoryId}
            onChange={(val) => {
              setCategoryId(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
            ]}
            className="!py-2 !px-3 !rounded-lg !bg-slate-50 border-slate-200"
          />
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

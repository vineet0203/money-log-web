import React, { useState } from 'react';
import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useGetSubscriptions } from '@/hooks/queries/subscriptions';
import { useGetCategories } from '@/hooks/queries/categories';
import { SubscriptionActionMenu } from './SubscriptionActionMenu';
import { SubscriptionLogo } from '@/components/ui/SubscriptionLogo';
import { Select } from '@/components/ui/Select';
import { useRouter } from 'next/navigation';

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
      category: sub.category_name || 'Uncategorized',
      dueDate,
      daysLeft: sub.days_left,
      amount: `$${Number(sub.amount).toFixed(2)}`,
      billingCycle: sub.billing_cycle,
      status: sub.computed_status,
      dbStatus: sub.status,
      nextBillingDate: sub.next_billing_date
    };
  });

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Subscription',
      render: (row) => (
        <div className="flex items-center gap-3">
          <SubscriptionLogo name={row.name} />
          <span className="text-slate-900 font-semibold">{row.name}</span>
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
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-[#849AB4] text-sm leading-none">{row.dueDate}</span>
          <span className={`text-xs font-bold leading-none ${row.daysLeft <= 1 ? 'text-[#EF4444]' : 'text-[#159A1D]'}`}>
            In {row.daysLeft} {row.daysLeft === 1 ? 'Days' : 'Days'}
          </span>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-slate-900 font-bold leading-none">{row.amount}</span>
          <span className="text-xs text-[#849AB4] capitalize leading-none">{row.billingCycle}</span>
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
        />
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Subscriptions</h2>
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
            itemName: 'subscriptions',
            onPageChange: (newPage) => setPage(newPage)
          }}
        />
      </div>
    </div>
  );
}

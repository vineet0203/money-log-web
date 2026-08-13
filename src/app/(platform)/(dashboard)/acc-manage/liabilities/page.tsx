"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from '@/providers/AppDataProvider';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { 
  CreditCard, 
  GraduationCap, 
  Home, 
  Building2,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetLiabilities, useSyncLiabilities } from '@/hooks/queries/liabilities';

const formatCurrency = (amount: number | null | undefined) => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDateString = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
};

const mapBackendTypeToUI = (type: string) => {
  if (type === 'credit') return 'Credit Card';
  if (type === 'student') return 'Student Loan';
  if (type === 'mortgage') return 'Mortgage';
  return type;
};

const getCardIcon = (type: string) => {
  const uiType = mapBackendTypeToUI(type);
  switch (uiType) {
    case 'Credit Card': return <CreditCard className="w-5 h-5 text-indigo-500" />;
    case 'Student Loan': return <GraduationCap className="w-5 h-5 text-emerald-500" />;
    case 'Mortgage': return <Home className="w-5 h-5 text-amber-500" />;
    default: return <Building2 className="w-5 h-5 text-slate-500" />;
  }
};

export default function LiabilitiesPage() {
  const { setHeaderData } = useAppData();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('All');
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setHeaderData('Liabilities & Debt', 'Track and manage your credit cards, loans, and mortgages.');
  }, [setHeaderData]);

  const { data: dbLiabilitiesResponse, isLoading } = useGetLiabilities();
  const syncMutation = useSyncLiabilities();

  const liabilities = dbLiabilitiesResponse?.data || [];

  const handleSync = () => {
    syncMutation.mutate();
  };

  // Extract unique accounts for the filter dropdown
  const uniqueAccounts = useMemo(() => {
    const map = new Map();
    liabilities.forEach(l => {
      if (!map.has(l.account_id)) {
        map.set(l.account_id, { id: l.account_id.toString(), name: l.name });
      }
    });
    return Array.from(map.values());
  }, [liabilities]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Filter Data
  const filteredData = liabilities.filter(l => {
    const uiType = mapBackendTypeToUI(l.liability_type);
    const matchTab = activeTab === 'All' || uiType === activeTab;
    const matchAccount = selectedAccountId === 'all' || l.account_id.toString() === selectedAccountId;
    return matchTab && matchAccount;
  });

  // Calculate stats
  const totalDebt = filteredData.reduce((sum, l) => sum + Number(l.balance || 0), 0);
  const totalUpcomingPayments = filteredData.reduce((sum, l) => sum + Number(l.minimum_payment || 0), 0);

  // Table Columns Setup
  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Type',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-black/5 flex-shrink-0">
            {getCardIcon(row.liability_type)}
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 font-semibold truncate max-w-[150px]" title={row.name}>{row.name}</span>
            <span className="text-xs text-[#849AB4] font-medium">{mapBackendTypeToUI(row.liability_type)}</span>
          </div>
        </div>
      )
    },
    {
      key: 'accountName',
      header: 'Account',
      render: (row) => (
        <span className="text-[#849AB4] font-medium">{row.name}</span>
      )
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row) => (
        <span className="text-slate-900 font-bold">{formatCurrency(row.balance)}</span>
      )
    },
    {
      key: 'apr',
      header: 'APR / Rate',
      render: (row) => (
        <span className="text-[#849AB4] font-medium">{row.apr != null ? `${row.apr}%` : 'N/A'}</span>
      )
    },
    {
      key: 'rateType',
      header: 'Rate Type',
      render: (row) => (
        <span className="text-[#849AB4] font-medium">{row.rate_type || 'N/A'}</span>
      )
    },
    {
      key: 'minimumPayment',
      header: 'Min Payment',
      render: (row) => (
        <span className="text-slate-900 font-bold leading-none">{formatCurrency(row.minimum_payment)}</span>
      )
    },
    {
      key: 'lastPayment',
      header: 'Last Payment',
      render: (row) => (
        <span className="text-slate-900 font-medium leading-none">{formatCurrency(row.last_payment_amount)}</span>
      )
    },
    {
      key: 'nextPaymentDate',
      header: 'Next Due',
      render: (row) => (
        <span className="text-[#849AB4] font-medium leading-none">{formatDateString(row.next_payment_date)}</span>
      )
    },
    {
      key: 'loanTerm',
      header: 'Loan Term',
      render: (row) => (
        <span className="text-[#849AB4] font-medium">{row.loan_term || 'N/A'}</span>
      )
    },
    {
      key: 'expectedPayoff',
      header: 'Expected Payoff',
      render: (row) => (
        <span className="text-[#849AB4] font-medium leading-none">{formatDateString(row.expected_payoff_date)}</span>
      )
    }
  ];

  return (
    <div className="mx-auto pb-12 space-y-6">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-sm font-semibold text-[#849AB4] mb-2">Total Debt</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-sm font-semibold text-[#849AB4] mb-2">Upcoming Payments</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalUpcomingPayments)}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Liabilities Overview</h2>
          <button 
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Liabilities'}
          </button>
        </div>

        {/* Tabs and Filter */}
        <div className="px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            {['All', 'Credit Card', 'Student Loan', 'Mortgage'].map((tab) => (
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
          
          <div className="py-2 w-64">
            <Select 
              value={selectedAccountId}
              onChange={(val) => {
                setSelectedAccountId(val);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Accounts' },
                ...uniqueAccounts.map(acc => ({ value: acc.id, label: acc.name }))
              ]}
              className="!py-2 !px-3 !rounded-lg !bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="p-0">
          <DataTable 
            columns={columns} 
            data={filteredData} 
            isLoading={isLoading}
            onRowClick={(row: any) => console.log('Clicked liability:', row.liability_id)}
            pagination={{ 
              currentPage: page, 
              totalPages: Math.ceil(filteredData.length / itemsPerPage) || 1, 
              totalItems: filteredData.length,
              itemsPerPage: itemsPerPage,
              itemName: 'liabilities',
              onPageChange: (newPage) => setPage(newPage)
            }}
          />
        </div>
      </div>
    </div>
  );
}

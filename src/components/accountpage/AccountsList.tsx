"use client";

import React, { useState } from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Landmark, CreditCard, Wallet, Eye, EyeOff } from 'lucide-react';
import { LinkAccountButton } from './LinkAccountButton';
import { SyncAccountsButton } from './SyncAccountsButton';
import { AccountActionMenu } from './AccountActionMenu';
import { useGetAccounts } from '@/hooks/queries/accounts';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';

const BalanceCell = ({ balance }: { balance: number | undefined }) => {
  const [isVisible, setIsVisible] = useState(false);
  const displayVal = balance !== undefined && balance !== null ? Number(balance).toFixed(2) : '0.00';
  
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-slate-900 w-20">
        {isVisible ? `$${displayVal}` : '$***.**'}
      </span>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }}
        className="text-slate-400 hover:text-slate-600 transition-colors"
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

export function AccountsList() {
  const [page, setPage] = useState(1);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const limit = 10;
  const router = useRouter();
  
  const { data: response, isLoading } = useGetAccounts(page, limit);
  
  const accounts = response?.data || [];
  const pagination = response?.pagination;

  const getIcon = (type?: string) => {
    switch(type?.toLowerCase()) {
      case 'credit': return <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white"><CreditCard size={16} /></div>;
      case 'depository': return <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white"><Landmark size={16} /></div>;
      default: return <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><Wallet size={16} /></div>;
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Account Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          {getIcon(row.type)}
          <span className="font-semibold text-slate-900">{row.name}</span>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span className="text-[#849AB4] font-medium capitalize">{row.type || 'Bank Account'}</span>
    },
    {
      key: 'account_number',
      header: 'Account Number',
      render: (row) => <span className="text-[#849AB4] font-medium">{row.account_number ? `***${row.account_number.slice(-4)}` : 'N/A'}</span>
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (row) => <BalanceCell balance={row.balance} />
    },
    {
      key: 'provider',
      header: 'Status',
      render: (row) => row.provider === 'plaid' ? (
        <span className="text-[10px] font-bold px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-200 uppercase tracking-wider">Linked</span>
      ) : (
        <span className="text-[10px] font-bold px-3 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-200 uppercase tracking-wider">Manual</span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <AccountActionMenu accountId={row.id} provider={row.provider} />
        </div>
      )
    }
  ];

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] w-full overflow-hidden">
        <div className="p-4 sm:p-6 pb-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-extrabold text-slate-800">Your Accounts</h2>
          <div className="flex gap-3">
            <SyncAccountsButton />
            <button 
              onClick={() => setIsLinkModalOpen(true)}
              className="flex items-center gap-2 bg-[#159A1D] hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Landmark size={18} />
              <span>Link Account</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <DataTable 
            data={accounts}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(row: any) => router.push(`/acc-manage/accounts/${row.id}`)}
            pagination={pagination ? {
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              totalItems: pagination.totalItems,
              itemsPerPage: pagination.itemsPerPage,
              itemName: 'accounts',
              onPageChange: (newPage) => setPage(newPage),
            } : undefined}
          />
        </div>
      </div>

      <Modal 
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Select Account Type"
        description="What kind of account would you like to link?"
      >
        <div className="flex flex-col gap-4 py-4">
           <LinkAccountButton type="bank" className="w-full py-4 text-base shadow-sm" onClick={() => setIsLinkModalOpen(false)} />
           <LinkAccountButton type="liabilities" className="w-full py-4 text-base shadow-sm" onClick={() => setIsLinkModalOpen(false)} />
        </div>
      </Modal>
    </>
  );
}

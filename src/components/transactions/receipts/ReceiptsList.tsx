"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, Clock } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/providers/AppDataProvider';

// Mock data (Normally this would be fetched via a hook)
export const mockReceipts = [
  {
    id: 'RCP-1001',
    merchant: 'Walmart',
    date: '2023-10-25',
    total: 145.20,
    tax: 10.50,
    status: 'needs_review',
    category: 'Groceries',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
    items: [
      { id: '1', description: 'Milk', quantity: 1, price: 4.50 },
      { id: '2', description: 'Eggs', quantity: 2, price: 3.20 },
    ],
    tip: 0.00,
    receiptNumber: 'WMT-4921',
    paymentAccount: 'bofa',
    returnDeadline: '2023-11-25',
    warrantyDate: '',
    isReimbursable: false,
    notes: 'Weekly groceries.'
  },
  {
    id: 'RCP-1002',
    merchant: 'Home Depot',
    date: '2023-10-22',
    total: 89.99,
    tax: 6.75,
    status: 'verified',
    category: 'Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
    items: [
      { id: '1', description: 'Hammer', quantity: 1, price: 15.00 },
      { id: '2', description: 'Nails', quantity: 1, price: 5.00 },
    ],
    tip: 0.00,
    receiptNumber: 'HD-99234',
    paymentAccount: 'chase',
    returnDeadline: '2023-11-22',
    warrantyDate: '2024-10-22',
    isReimbursable: true,
    notes: 'Bought tools for the office repair.'
  }
];

export default function ReceiptsList() {
  const router = useRouter();
  const { setHeaderData } = useAppData();
  
  const [receipts] = useState(mockReceipts);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    setHeaderData("Receipts Tracker", "Manage and verify your scanned receipts.", false);
  }, [setHeaderData]);

  const filteredReceipts = receipts.filter(r => {
    if (activeTab === 'Needs Review') return r.status === 'needs_review';
    if (activeTab === 'Verified') return r.status === 'verified';
    return true;
  });

  const columns: Column<any>[] = [
    {
      key: 'id',
      header: 'Receipt ID',
      render: (row) => <span className="font-mono text-slate-600">{row.id}</span>
    },
    {
      key: 'merchant',
      header: 'Merchant',
      render: (row) => <span className="text-slate-900 font-semibold">{row.merchant}</span>
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-[#849AB4] font-medium">{row.date}</span>
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <span className="text-[#849AB4] font-medium">{row.category}</span>
    },
    {
      key: 'total',
      header: 'Total',
      render: (row) => <span className="text-slate-900 font-bold">${row.total.toFixed(2)}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        if (row.status === 'verified') {
          return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#E7F8F0] text-[#159A1D] border border-[#C5ECD9]">
              <CheckCircle size={12} /> Verified
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock size={12} /> Needs Review
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => router.push('/transactions/receipts/new')}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add New Receipt
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        {/* Tabs */}
        <div className="px-6 border-b border-slate-100 flex items-center gap-2 pt-2">
          {['All', 'Needs Review', 'Verified'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-semibold rounded-t-lg transition-colors border-b-[3px] ${
                activeTab === tab 
                  ? 'bg-slate-100 text-slate-900 border-[#159A1D]' 
                  : 'text-[#849AB4] border-transparent hover:text-slate-900 hover:bg-slate-50'
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
            data={filteredReceipts} 
            onRowClick={(row: any) => router.push(`/transactions/receipts/${row.id}`)}
          />
        </div>
      </div>
    </div>
  );
}

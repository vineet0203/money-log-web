"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PosStatusBadge } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

const MOCK_EXCHANGES = [
  { id: 'EXC-005', originalInv: 'INV-10020', date: '2026-10-05', customer: 'John Doe', returned: 'Digital Coffee Scale', replacement: 'Premium Espresso Blend (x2)', difference: 2.00, status: 'Completed' },
];

export default function ExchangesTab() {
  const columns: Column<typeof MOCK_EXCHANGES[0]>[] = [
    { header: 'Exchange ID', key: 'id', cell: (row) => <span className="font-medium text-slate-800">{row.id}</span> },
    { header: 'Original Invoice', key: 'originalInv', cell: (row) => <span className="text-blue-600 hover:underline cursor-pointer">{row.originalInv}</span> },
    { header: 'Date', key: 'date' },
    { header: 'Customer', key: 'customer' },
    { header: 'Returned', key: 'returned', cell: (row) => <span className="text-sm text-red-500 truncate max-w-[150px] block">{row.returned}</span> },
    { header: 'Replacement', key: 'replacement', cell: (row) => <span className="text-sm text-green-600 truncate max-w-[150px] block">{row.replacement}</span> },
    { header: 'Difference', key: 'difference', cell: (row) => <span className="font-bold text-slate-800">${row.difference.toFixed(2)}</span> },
    { 
      header: 'Status', 
      key: 'status',
      cell: (row) => <PosStatusBadge status={row.status} />
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">Exchanges</h3>
        <Button size="sm" className="gap-2">
          <RefreshCw size={16} /> New Exchange
        </Button>
      </div>
      <DataTable data={MOCK_EXCHANGES} columns={columns} />
    </div>
  );
}

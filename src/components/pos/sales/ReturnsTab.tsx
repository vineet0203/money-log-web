"use client";

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PosStatusBadge } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

const MOCK_RETURNS = [
  { id: 'RET-0012', originalInv: 'INV-10042', date: '2026-10-09', customer: 'Walk-in Customer', items: 'Oat Milk Barista Edition (x2)', refund: 11.00, status: 'Processed' },
  { id: 'RET-0011', originalInv: 'INV-09988', date: '2026-10-08', customer: 'Alice Smith', items: 'Ceramic Pour-Over Dripper', refund: 24.00, status: 'Pending' },
];

export default function ReturnsTab() {
  const columns: Column<typeof MOCK_RETURNS[0]>[] = [
    { header: 'Return ID', key: 'id', cell: (row) => <span className="font-medium text-slate-800">{row.id}</span> },
    { header: 'Original Invoice', key: 'originalInv', cell: (row) => <span className="text-blue-600 hover:underline cursor-pointer">{row.originalInv}</span> },
    { header: 'Date', key: 'date' },
    { header: 'Customer', key: 'customer' },
    { header: 'Returned Items', key: 'items', cell: (row) => <span className="text-sm text-slate-600 truncate max-w-[200px] block">{row.items}</span> },
    { header: 'Refund Amount', key: 'refund', cell: (row) => <span className="font-bold text-red-500">-${row.refund.toFixed(2)}</span> },
    { 
      header: 'Status', 
      key: 'status',
      cell: (row) => <PosStatusBadge status={row.status} />
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">Returns & Refunds</h3>
        <Button size="sm" className="gap-2">
          <RotateCcw size={16} /> Process Return
        </Button>
      </div>
      <DataTable data={MOCK_RETURNS} columns={columns} />
    </div>
  );
}

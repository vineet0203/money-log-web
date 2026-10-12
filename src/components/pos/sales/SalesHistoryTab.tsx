"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Filter, Download, Printer, Mail } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { PosSearchInput, PosStatusBadge } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

const MOCK_SALES = [
  { id: 'INV-10045', date: '2026-10-10T14:32:00Z', customer: 'Walk-in Customer', items: 3, total: 42.50, status: 'Completed', payment: 'Card' },
  { id: 'INV-10044', date: '2026-10-10T13:15:00Z', customer: 'Alice Smith', items: 1, total: 18.50, status: 'Completed', payment: 'Cash' },
  { id: 'INV-10043', date: '2026-10-10T11:45:00Z', customer: 'Bob Johnson', items: 5, total: 112.00, status: 'Completed', payment: 'Card' },
  { id: 'INV-10042', date: '2026-10-09T16:20:00Z', customer: 'Walk-in Customer', items: 2, total: 29.50, status: 'Refunded', payment: 'Card' },
  { id: 'INV-10041', date: '2026-10-09T14:10:00Z', customer: 'Sarah Connor', items: 4, total: 85.00, status: 'Completed', payment: 'Card' },
];

export default function SalesHistoryTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<typeof MOCK_SALES[0] | null>(null);

  const columns: Column<typeof MOCK_SALES[0]>[] = [
    {
      header: 'Invoice ID',
      key: 'id',
      cell: (row) => <span className="font-medium text-slate-800">{row.id}</span>
    },
    {
      header: 'Date & Time',
      key: 'date',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-slate-800">{new Date(row.date).toLocaleDateString()}</span>
          <span className="text-xs text-slate-500">{new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      header: 'Customer',
      key: 'customer',
    },
    {
      header: 'Items',
      key: 'items',
      cell: (row) => <span className="text-slate-600">{row.items} items</span>
    },
    {
      header: 'Total',
      key: 'total',
      cell: (row) => <span className="font-bold text-slate-800">${row.total.toFixed(2)}</span>
    },
    {
      header: 'Payment',
      key: 'payment',
      cell: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.payment === 'Card' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
        }`}>
          {row.payment}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      cell: (row) => <PosStatusBadge status={row.status} />
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">Sales History</h3>
        <div className="flex items-center gap-3">
          <PosSearchInput 
            placeholder="Search sales..." 
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-64"
          />
          <Button variant="outline" size="sm" className="gap-2">
            <Filter size={16} /> Filter
          </Button>
        </div>
      </div>
      <DataTable 
        data={MOCK_SALES} 
        columns={columns} 
        onRowClick={(row) => setSelectedSale(row)}
      />
    

      <Modal
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title="Sale Details"
        cancelText="Close"
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-slate-800">{selectedSale.id}</h4>
                <p className="text-sm text-slate-500">{new Date(selectedSale.date).toLocaleString()}</p>
              </div>
              <PosStatusBadge status={selectedSale.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Customer</p>
                <p className="font-medium text-slate-800">{selectedSale.customer}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                <p className="font-medium text-slate-800">{selectedSale.payment}</p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-slate-800 mb-3">Order Items</h5>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 flex justify-between text-xs font-medium text-slate-500 border-b border-slate-200">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="px-4 py-3 flex justify-between text-sm text-slate-700 border-b border-slate-100">
                  <span>Mock Item 1 (x1)</span>
                  <span>${(selectedSale.total * 0.6).toFixed(2)}</span>
                </div>
                {selectedSale.items > 1 && (
                  <div className="px-4 py-3 flex justify-between text-sm text-slate-700 border-b border-slate-100">
                    <span>Mock Item 2 (x{selectedSale.items - 1})</span>
                    <span>${(selectedSale.total * 0.4).toFixed(2)}</span>
                  </div>
                )}
                <div className="bg-slate-50 px-4 py-3 flex justify-between font-bold text-slate-800">
                  <span>Total Paid</span>
                  <span>${selectedSale.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 mt-4 pt-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Printer size={16} /> Print
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Mail size={16} /> Email
              </Button>
              <Button size="sm" className="gap-2">
                <Download size={16} /> Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

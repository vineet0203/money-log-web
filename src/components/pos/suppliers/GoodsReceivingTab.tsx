"use client";

import React, { useState, useMemo } from 'react';
import { GoodsReceivingRecord } from './types';
import { useSuppliers } from './SuppliersContext';
import { GoodsReceivingModal } from './GoodsReceivingModal';
import { GoodsReceivingDetailModal } from './GoodsReceivingDetailModal';
import { 
  Truck, 
  Filter, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Box
} from 'lucide-react';
import { PosStatCard, PosStatusBadge, PosSearchInput } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface GoodsReceivingTabProps {
  initialPoNumber?: string;
}

export function GoodsReceivingTab({ initialPoNumber }: GoodsReceivingTabProps) {
  const { goodsReceivingRecords, purchaseOrders } = useSuppliers();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Partial Discrepancy'>('All');
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(!!initialPoNumber);
  const [selectedPoForReceiving, setSelectedPoForReceiving] = useState<string | undefined>(initialPoNumber);
  const [selectedGRNForDetails, setSelectedGRNForDetails] = useState<GoodsReceivingRecord | null>(null);

  // Filtered list
  const filteredGRNs = useMemo(() => {
    return goodsReceivingRecords.filter(grn => {
      const matchesSearch = 
        grn.grnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grn.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grn.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        grn.receivedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || grn.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [goodsReceivingRecords, searchQuery, statusFilter]);

  // Aggregate stats
  const totalAcceptedUnits = goodsReceivingRecords.reduce((sum, g) => sum + g.totalAccepted, 0);
  const totalDamagedUnits = goodsReceivingRecords.reduce((sum, g) => sum + g.totalDamaged, 0);
  const completedCount = goodsReceivingRecords.filter(g => g.status === 'Completed').length;
  const pendingOrdersCount = purchaseOrders.filter(p => p.status === 'Ordered' || p.status === 'Partial').length;

  return (
    <div className="space-y-6">
      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PosStatCard
          title="Units Restocked to Store"
          value={`${totalAcceptedUnits.toLocaleString()} units`}
          subtitle="Verified into POS inventory"
          icon={Box}
          color="emerald"
        />
        <PosStatCard
          title="Completed GRN Notes"
          value={completedCount}
          subtitle={`${goodsReceivingRecords.length} total receipts logged`}
          icon={CheckCircle2}
          color="green"
        />
        <PosStatCard
          title="Damaged / Discrepancies"
          value={`${totalDamagedUnits} units`}
          subtitle="Claims & credit notes flagged"
          icon={AlertTriangle}
          color="rose"
        />
        <PosStatCard
          title="POs Awaiting Delivery"
          value={pendingOrdersCount}
          subtitle="Pending dock intake"
          icon={Truck}
          color="blue"
        />
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <PosSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by GRN #, PO #, vendor, or receiver..."
            className="min-w-[200px]"
          />

          <div className="h-[38px] flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-200 p-1 rounded-xl overflow-x-auto">
            <Filter size={14} className="text-slate-400 ml-1.5 mr-0.5 shrink-0" />
            {(['All', 'Completed', 'Partial Discrepancy'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`h-full px-3 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex items-center justify-center cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelectedPoForReceiving(undefined);
            setIsReceivingModalOpen(true);
          }}
          className="text-xs shrink-0"
        >
          <Truck size={15} className="mr-1" /> Receive New Consignment (GRN)
        </Button>
      </div>

      {/* GRN History Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">GRN & PO Ref</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Intake Date</th>
                <th className="p-4">Received & Verified By</th>
                <th className="p-4 text-center">Ordered</th>
                <th className="p-4 text-center text-emerald-700">Accepted</th>
                <th className="p-4 text-center text-rose-600">Damaged</th>
                <th className="p-4 text-center">QA Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Truck size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No goods receiving records found</p>
                    <p className="text-slate-400 mt-1">Receive an incoming consignment to replenish stock.</p>
                  </td>
                </tr>
              ) : (
                filteredGRNs.map(grn => (
                  <tr key={grn.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedGRNForDetails(grn)}
                        className="font-bold text-slate-900 hover:text-[#159A1D] block"
                      >
                        {grn.grnNumber}
                      </button>
                      <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                        {grn.poNumber}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{grn.supplierName}</span>
                    </td>

                    <td className="p-4 text-slate-600">{grn.receivedDate}</td>

                    <td className="p-4 text-slate-700 font-medium">
                      {grn.receivedBy}
                    </td>

                    <td className="p-4 text-center font-medium text-slate-700">
                      {grn.totalOrdered}
                    </td>

                    <td className="p-4 text-center font-bold text-emerald-700">
                      {grn.totalAccepted}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`font-bold ${grn.totalDamaged > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {grn.totalDamaged}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <PosStatusBadge status={grn.status} />
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedGRNForDetails(grn)}
                        title="View GRN Receiving Slip"
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <GoodsReceivingModal
        isOpen={isReceivingModalOpen}
        onClose={() => {
          setIsReceivingModalOpen(false);
          setSelectedPoForReceiving(undefined);
        }}
        preSelectedPoNumber={selectedPoForReceiving}
      />

      <GoodsReceivingDetailModal
        isOpen={!!selectedGRNForDetails}
        onClose={() => setSelectedGRNForDetails(null)}
        grn={selectedGRNForDetails}
      />
    </div>
  );
}

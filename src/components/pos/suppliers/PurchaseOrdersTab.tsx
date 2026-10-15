"use client";

import React, { useState, useMemo } from 'react';
import { PurchaseOrder, PurchaseOrderStatus } from './types';
import { useSuppliers } from './SuppliersContext';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import { 
  ShoppingBag, 
  Plus, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock,
  XCircle, 
  DollarSign
} from 'lucide-react';
import { PosStatCard, PosStatusBadge, PosSearchInput, Select } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface PurchaseOrdersTabProps {
  onNavigateToCreatePurchase?: () => void;
  onNavigateToReceiveGoods?: (poNumber: string) => void;
}

export function PurchaseOrdersTab({
  onNavigateToCreatePurchase,
  onNavigateToReceiveGoods,
}: PurchaseOrdersTabProps) {
  const { purchaseOrders, updatePOStatus, suppliers } = useSuppliers();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PurchaseOrderStatus>('All');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('All');
  const [selectedPOForDetails, setSelectedPOForDetails] = useState<PurchaseOrder | null>(null);

  // Filtered list
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesSearch = 
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
      const matchesSupplier = selectedSupplierId === 'All' || po.supplierId === selectedSupplierId;

      return matchesSearch && matchesStatus && matchesSupplier;
    });
  }, [purchaseOrders, searchQuery, statusFilter, selectedSupplierId]);

  // Aggregate stats
  const activeOrders = purchaseOrders.filter(p => p.status === 'Ordered' || p.status === 'Partial').length;
  const receivedOrders = purchaseOrders.filter(p => p.status === 'Received').length;
  const totalPipelineValue = purchaseOrders.reduce((sum, p) => sum + p.grandTotal, 0);

  const handleCancelPO = (po: PurchaseOrder) => {
    if (confirm(`Are you sure you want to cancel Purchase Order ${po.poNumber}?`)) {
      updatePOStatus(po.id, 'Cancelled');
    }
  };

  const handleMarkAsOrdered = (po: PurchaseOrder) => {
    updatePOStatus(po.id, 'Ordered');
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PosStatCard
          title="Active In-Flight POs"
          value={activeOrders}
          subtitle="Awaiting warehouse dock intake"
          icon={Truck}
          color="blue"
        />
        <PosStatCard
          title="Completed Deliveries"
          value={receivedOrders}
          subtitle="Fully verified & stocked"
          icon={CheckCircle2}
          color="emerald"
        />
        <PosStatCard
          title="Total Orders Value"
          value={`$${totalPipelineValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${purchaseOrders.length} orders total`}
          icon={DollarSign}
          color="green"
        />
        <PosStatCard
          title="Partial Consignments"
          value={purchaseOrders.filter(p => p.status === 'Partial').length}
          subtitle="Split shipments pending"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <PosSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by PO # or supplier name..."
            className="min-w-[200px]"
          />

          <div className="w-48">
            <Select
              size="sm"
              value={selectedSupplierId}
              onChange={setSelectedSupplierId}
              options={[
                { value: 'All', label: 'All Suppliers' },
                ...suppliers.map(s => ({ value: s.id, label: s.name }))
              ]}
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-200 p-1 rounded-lg overflow-x-auto">
            {(['All', 'Draft', 'Ordered', 'Partial', 'Received', 'Cancelled'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {onNavigateToCreatePurchase && (
          <Button
            variant="primary"
            size="sm"
            onClick={onNavigateToCreatePurchase}
            className="text-xs shrink-0"
          >
            <Plus size={15} className="mr-1" /> Create Purchase Order
          </Button>
        )}
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">PO Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Order Date</th>
                <th className="p-4">Expected Delivery</th>
                <th className="p-4">Fulfillment Progress</th>
                <th className="p-4 text-right">Grand Total</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <ShoppingBag size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No purchase orders found</p>
                    <p className="text-slate-400 mt-1">Try modifying your filter or issue a new PO.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const totalOrdered = po.items.reduce((s, i) => s + i.orderedQty, 0);
                  const totalReceived = po.items.reduce((s, i) => s + i.receivedQty, 0);
                  const progressPct = totalOrdered > 0 ? Math.min(100, Math.round((totalReceived / totalOrdered) * 100)) : 0;

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedPOForDetails(po)}
                          className="font-bold text-slate-900 hover:text-[#159A1D] block"
                        >
                          {po.poNumber}
                        </button>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">
                          {po.items.length} line item(s)
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800">{po.supplierName}</span>
                      </td>

                      <td className="p-4 text-slate-600">{po.orderDate}</td>

                      <td className="p-4 text-slate-600">
                        <span className="font-medium">{po.expectedDate}</span>
                      </td>

                      <td className="p-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>{totalReceived} / {totalOrdered} items</span>
                            <span className="font-semibold">{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                progressPct === 100 
                                  ? 'bg-[#159A1D]' 
                                  : progressPct > 0 
                                    ? 'bg-amber-500' 
                                    : 'bg-slate-300'
                              }`} 
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-right font-bold text-slate-900">
                        ${po.grandTotal.toFixed(2)}
                      </td>

                      <td className="p-4 text-center">
                        <PosStatusBadge status={po.status} />
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedPOForDetails(po)}
                            title="View PO Details"
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye size={15} />
                          </button>

                          {po.status === 'Draft' && (
                            <button
                              onClick={() => handleMarkAsOrdered(po)}
                              title="Send & Mark as Ordered"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Truck size={15} />
                            </button>
                          )}

                          {(po.status === 'Ordered' || po.status === 'Partial') && onNavigateToReceiveGoods && (
                            <button
                              onClick={() => onNavigateToReceiveGoods(po.poNumber)}
                              title="Receive Goods (GRN)"
                              className="p-1.5 text-slate-400 hover:text-[#159A1D] hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Truck size={15} />
                            </button>
                          )}

                          {po.status !== 'Received' && po.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancelPO(po)}
                              title="Cancel PO"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Details Modal */}
      <PurchaseOrderDetailModal
        isOpen={!!selectedPOForDetails}
        onClose={() => setSelectedPOForDetails(null)}
        po={selectedPOForDetails}
        onReceiveGoods={po => {
          if (onNavigateToReceiveGoods) {
            onNavigateToReceiveGoods(po.poNumber);
          }
        }}
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo } from 'react';
import { Supplier } from './types';
import { useSuppliers } from './SuppliersContext';
import { AddSupplierModal } from './AddSupplierModal';
import { SupplierDetailsModal } from './SupplierDetailsModal';
import { 
  Building2, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  ShoppingBag, 
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { PosStatCard, PosStatusBadge, PosSearchInput } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface SuppliersTabProps {
  onNavigateToCreatePurchase?: (supplierId?: string) => void;
  onNavigateToRecordPayment?: (supplierId?: string) => void;
}

export function SuppliersTab({
  onNavigateToCreatePurchase,
  onNavigateToRecordPayment,
}: SuppliersTabProps) {
  const { suppliers, deleteSupplier } = useSuppliers();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [selectedSupplierForDetails, setSelectedSupplierForDetails] = useState<Supplier | null>(null);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = 
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  // Aggregate metrics
  const activeCount = suppliers.filter(s => s.status === 'Active').length;
  const totalPayable = suppliers.reduce((sum, s) => sum + s.balancePayable, 0);
  const suppliersWithBalance = suppliers.filter(s => s.balancePayable > 0).length;

  const handleDelete = (supplier: Supplier) => {
    if (confirm(`Are you sure you want to remove supplier "${supplier.name}"?`)) {
      deleteSupplier(supplier.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PosStatCard
          title="Total Suppliers"
          value={suppliers.length}
          subtitle={`${activeCount} active partners`}
          icon={Users}
          color="green"
        />
        <PosStatCard
          title="Total Payables Due"
          value={`$${totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${suppliersWithBalance} vendors with open balances`}
          icon={DollarSign}
          color="rose"
        />
        <PosStatCard
          title="Active Supply Channels"
          value={activeCount}
          subtitle="100% fulfillable catalog lines"
          icon={CheckCircle2}
          color="emerald"
        />
        <PosStatCard
          title="Pending Settlement"
          value={suppliersWithBalance}
          subtitle="Awaiting disbursement"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Control Bar: Search, Filters, Add Supplier */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <PosSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by vendor name, code, contact person, or city..."
            className="max-w-md"
          />

          <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border border-slate-200 p-1 rounded-lg">
            {(['All', 'Active', 'Inactive'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
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

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSupplierToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="text-xs shrink-0"
        >
          <Plus size={16} className="mr-1" /> Add Supplier
        </Button>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Supplier & Code</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Supplied Categories</th>
                <th className="p-4">Payment Terms</th>
                <th className="p-4 text-right">Balance Payable</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">No suppliers found</p>
                    <p className="text-slate-400 mt-1">Try adjusting your search criteria or add a new vendor.</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#159A1D] flex items-center justify-center shrink-0 border border-emerald-100/50 mt-0.5">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedSupplierForDetails(supplier)}
                            className="font-bold text-slate-900 hover:text-[#159A1D] text-left text-xs sm:text-sm line-clamp-1"
                          >
                            {supplier.name}
                          </button>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {supplier.code}
                            </span>
                            <span className="text-[11px] text-slate-400">{supplier.city}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600">
                      <div className="font-medium text-slate-800">{supplier.contactPerson}</div>
                      <div className="flex flex-col gap-0.5 mt-0.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><Mail size={11} className="text-slate-400" /> {supplier.email}</span>
                        <span className="flex items-center gap-1"><Phone size={11} className="text-slate-400" /> {supplier.phone}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {supplier.categoriesSupplied.map(cat => (
                          <span key={cat} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px] border border-slate-200">
                        {supplier.paymentTerms}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className={`text-sm font-bold ${
                        supplier.balancePayable > 0 ? 'text-rose-600' : 'text-slate-700'
                      }`}>
                        ${supplier.balancePayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {supplier.balancePayable > 0 && (
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-rose-500 uppercase tracking-tight">
                          Payable Pending
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <PosStatusBadge status={supplier.status} />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedSupplierForDetails(supplier)}
                          title="View Profile & Transactions"
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (onNavigateToCreatePurchase) {
                              onNavigateToCreatePurchase(supplier.id);
                            }
                          }}
                          title="Create Purchase Order"
                          className="p-1.5 text-slate-400 hover:text-[#159A1D] hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <ShoppingBag size={15} />
                        </button>
                        {supplier.balancePayable > 0 && (
                          <button
                            onClick={() => {
                              if (onNavigateToRecordPayment) {
                                onNavigateToRecordPayment(supplier.id);
                              }
                            }}
                            title="Record Payment"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <DollarSign size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSupplierToEdit(supplier);
                            setIsAddModalOpen(true);
                          }}
                          title="Edit Supplier"
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier)}
                          title="Delete Supplier"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSupplierToEdit(null);
        }}
        supplierToEdit={supplierToEdit}
      />

      <SupplierDetailsModal
        isOpen={!!selectedSupplierForDetails}
        onClose={() => setSelectedSupplierForDetails(null)}
        supplier={selectedSupplierForDetails}
        onEdit={supplier => {
          setSupplierToEdit(supplier);
          setIsAddModalOpen(true);
        }}
        onCreatePO={supplierId => {
          if (onNavigateToCreatePurchase) {
            onNavigateToCreatePurchase(supplierId);
          }
        }}
        onRecordPayment={supplierId => {
          if (onNavigateToRecordPayment) {
            onNavigateToRecordPayment(supplierId);
          }
        }}
      />
    </div>
  );
}

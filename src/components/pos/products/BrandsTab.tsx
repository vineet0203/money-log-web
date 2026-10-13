"use client";

import React, { useState } from 'react';
import { useProducts } from './ProductsContext';
import { Brand } from './types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { PosSearchInput, PosStatusBadge, Select } from '@/components/pos/common';
import { Plus, Edit, Trash2, Award } from 'lucide-react';

export function BrandsTab() {
  const { brands, addBrand, updateBrand, deleteBrand } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const filteredBrands = brands.filter(b => 
    !searchTerm.trim() || 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setBrandToEdit(null);
    setName('');
    setDescription('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setBrandToEdit(brand);
    setName(brand.name);
    setDescription(brand.description);
    setStatus(brand.status);
    setIsModalOpen(true);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (brandToEdit) {
        updateBrand(brandToEdit.id, { name: name.trim(), description: description.trim(), status });
      } else {
        await addBrand({ name: name.trim(), description: description.trim(), status });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Award size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Store Brands</h3>
            <p className="text-xs text-slate-400">Manage manufacturers, roasteries, and partner brands ({brands.length} total)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PosSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search brands..."
            className="w-56"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="text-xs shrink-0"
          >
            <Plus size={15} className="mr-1" /> Add Brand
          </Button>
        </div>
      </div>

      {/* Brands Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBrands.map(brand => (
          <div
            key={brand.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <PosStatusBadge status={brand.status} />
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {brand.productCount} {brand.productCount === 1 ? 'Product' : 'Products'}
                </span>
              </div>

              <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-[#159A1D] transition-colors">
                {brand.name}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {brand.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-1 pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => handleOpenEdit(brand)}
                title="Edit Brand"
                className="p-1.5 text-slate-400 hover:text-[#159A1D] hover:bg-green-50 rounded-lg transition-colors"
              >
                <Edit size={15} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete brand "${brand.name}"? Products under this brand will remain.`)) {
                    deleteBrand(brand.id);
                  }
                }}
                title="Delete Brand"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
          <Award size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold text-slate-600">No brands found</p>
          <p className="text-xs text-slate-400 mt-1">Click &quot;Add Brand&quot; to create one</p>
        </div>
      )}

      {/* Add / Edit Brand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={brandToEdit ? 'Edit Brand' : 'Create New Brand'}
        description="Brands help distinguish manufacturers and roasters."
        onSubmit={handleSubmit}
        submitText={brandToEdit ? 'Save Changes' : 'Create Brand'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. AeroGrind Co."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Origin, manufacturer details, specialties..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(val) => setStatus(val as 'Active' | 'Inactive')}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { useProducts } from './ProductsContext';
import { Category } from './types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { PosSearchInput, PosStatusBadge } from '@/components/pos/common';
import { Plus, Edit, Trash2, FolderPlus, Tag } from 'lucide-react';

export function CategoriesTab() {
  const { categories, addCategory, updateCategory, deleteCategory } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const filteredCategories = categories.filter(c => 
    !searchTerm.trim() || 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setCategoryToEdit(null);
    setName('');
    setDescription('');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setCategoryToEdit(cat);
    setName(cat.name);
    setDescription(cat.description);
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, { name: name.trim(), description: description.trim(), status });
    } else {
      addCategory({ name: name.trim(), description: description.trim(), status });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Tag size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Store Categories</h3>
            <p className="text-xs text-slate-400">Organize and group items in the catalog ({categories.length} total)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <PosSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search categories..."
            className="w-56"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="text-xs shrink-0"
          >
            <Plus size={15} className="mr-1" /> Add Category
          </Button>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(cat => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <PosStatusBadge status={cat.status} />
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  {cat.productCount} {cat.productCount === 1 ? 'Product' : 'Products'}
                </span>
              </div>

              <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-[#159A1D] transition-colors">
                {cat.name}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-1 pt-4 border-t border-slate-100 mt-4">
              <button
                onClick={() => handleOpenEdit(cat)}
                title="Edit Category"
                className="p-1.5 text-slate-400 hover:text-[#159A1D] hover:bg-green-50 rounded-lg transition-colors"
              >
                <Edit size={15} />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete category "${cat.name}"? Products under this category will remain.`)) {
                    deleteCategory(cat.id);
                  }
                }}
                title="Delete Category"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
          <FolderPlus size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold text-slate-600">No categories found</p>
          <p className="text-xs text-slate-400 mt-1">Click &quot;Add Category&quot; to create one</p>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={categoryToEdit ? 'Edit Category' : 'Create New Category'}
        description="Categories group products together across your POS and reports."
        onSubmit={handleSubmit}
        submitText={categoryToEdit ? 'Save Changes' : 'Create Category'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Specialty Syrups"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Describe the items in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

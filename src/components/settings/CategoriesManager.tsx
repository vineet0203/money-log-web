"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { useAppData } from '@/providers/AppDataProvider';
import {
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  Category
} from '@/hooks/queries/categories';

export default function CategoriesManager() {
  const { setHeaderData } = useAppData();
  const { data: categories = [], isLoading } = useGetCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#159A1D',
    budget_limit: ''
  });

  useEffect(() => {
    setHeaderData("Categories Management", "Manage your transaction categories and budgets.", false);
  }, [setHeaderData]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        color: category.color || '#159A1D',
        budget_limit: category.budget_limit || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        color: '#159A1D',
        budget_limit: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name,
      color: formData.color,
      budget_limit: formData.budget_limit ? formData.budget_limit : null
    };

    if (editingCategory) {
      updateCategory.mutate(
        { id: editingCategory.id, ...payload },
        { onSuccess: handleCloseModal }
      );
    } else {
      createCategory.mutate(
        payload,
        { onSuccess: handleCloseModal }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategory.mutate(id);
    }
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Category Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white" 
            style={{ backgroundColor: row.color || '#159A1D' }}
          >
            <LayoutGrid size={16} />
          </div>
          <span className="font-semibold text-slate-900">{row.name}</span>
        </div>
      )
    },
    {
      key: 'budget_limit',
      header: 'Budget Limit',
      render: (row) => (
        <span className="text-slate-600 font-medium font-mono text-xs">
          {row.budget_limit ? `$${parseFloat(row.budget_limit).toFixed(2)}` : 'No Limit'}
        </span>
      )
    },
    {
      key: 'spent_this_month',
      header: 'Spent (This Month)',
      render: (row) => {
        const spent = parseFloat(row.spent_this_month || '0');
        const budget = row.budget_limit ? parseFloat(row.budget_limit) : null;
        const isOver = budget && spent > budget;
        return (
          <span className={`font-mono text-xs ${isOver ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}`}>
            ${spent.toFixed(2)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit category"
          >
            <Edit2 size={15} />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete category"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">Categories & Budgets</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage spending categories, color tags, and monthly budget limits</p>
          </div>
          <Button 
            size="sm" 
            onClick={() => handleOpenModal()} 
            className="shrink-0"
          >
            <Plus size={16} className="mr-1.5" />
            <span>Add Category</span>
          </Button>
        </div>

        {/* DataTable */}
        <div className="p-0">
          <DataTable 
            columns={columns} 
            data={categories} 
            isLoading={isLoading} 
          />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        submitText={editingCategory ? "Save Changes" : "Create Category"}
        isSubmitDisabled={createCategory.isPending || updateCategory.isPending || !formData.name.trim()}
      >
        <div className="space-y-6 py-4">
          <Input 
            label="Category Name"
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Groceries, Rent, Entertainment"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Color Label</label>
            <input 
              type="color" 
              value={formData.color}
              onChange={(e) => setFormData({...formData, color: e.target.value})}
              className="w-full h-12 bg-white border border-slate-200 rounded-lg px-2 py-1 cursor-pointer"
            />
          </div>
          <div>
            <Input 
              label="Monthly Budget Limit (Optional)"
              type="number" 
              step="0.01"
              value={formData.budget_limit}
              onChange={(e) => setFormData({...formData, budget_limit: e.target.value})}
              placeholder="0.00"
            />
            <p className="text-xs text-[#849AB4] mt-1">Leave blank if you don't want to track a budget for this category.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

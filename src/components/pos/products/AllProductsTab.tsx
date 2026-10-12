"use client";

import React, { useState, useMemo } from 'react';
import { useProducts } from './ProductsContext';
import { Product } from './types';
import { AddProductModal } from './AddProductModal';
import { 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  Package, 
  XCircle,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { PosStatCard, PosStatusBadge, PosSearchInput } from '@/components/pos/common';
import { Button } from '@/components/ui/button';

interface AllProductsTabProps {
  onOpenImportExport?: () => void;
}

export function AllProductsTab({ onOpenImportExport }: AllProductsTabProps) {
  const { products, categories, brands, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState<'All' | 'in_stock' | 'low_stock' | 'out_of_stock'>('All');
  const [expandedProductIds, setExpandedProductIds] = useState<number[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // KPIs
  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.minStockAlert).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
    return { total, lowStock, outOfStock, totalStockUnits };
  }, [products]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;

      let matchesStock = true;
      if (selectedStockStatus === 'in_stock') matchesStock = p.stock > p.minStockAlert;
      else if (selectedStockStatus === 'low_stock') matchesStock = p.stock > 0 && p.stock <= p.minStockAlert;
      else if (selectedStockStatus === 'out_of_stock') matchesStock = p.stock === 0;

      return matchesSearch && matchesCat && matchesBrand && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, selectedStockStatus]);

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Barcode', 'Category', 'Brand', 'CostPrice', 'MRP', 'SellingPrice', 'DiscountPct', 'Stock', 'Unit', 'Status'];
    const rows = filteredProducts.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.barcode || '',
      `"${p.category}"`,
      `"${p.brand}"`,
      p.costPrice,
      p.mrp,
      p.sellingPrice,
      p.discountPercent,
      p.stock,
      p.unit,
      p.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `catalog-products-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PosStatCard
          title="Total Products"
          value={stats.total}
          subtitle={`${stats.totalStockUnits} units in inventory`}
          icon={Package}
          color="blue"
        />
        <PosStatCard
          title="Categories"
          value={categories.length}
          subtitle={`${brands.length} partner brands`}
          icon={Layers}
          color="purple"
        />
        <PosStatCard
          title="Low Stock Alert"
          value={stats.lowStock}
          subtitle="Needs replenishment"
          icon={AlertTriangle}
          color="amber"
        />
        <PosStatCard
          title="Out of Stock"
          value={stats.outOfStock}
          subtitle="Unavailable for sale"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          {/* Left: Search & Filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <PosSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by product name, SKU, or barcode..."
              className="min-w-[220px]"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Brands</option>
              {brands.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>

            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value as 'All' | 'in_stock' | 'low_stock' | 'out_of_stock')}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt; alert)</option>
              <option value="low_stock">Low Stock (≤ alert)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              title="Download products CSV"
              className="text-xs"
            >
              <Download size={14} className="mr-1.5" /> Export
            </Button>

            {onOpenImportExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenImportExport}
                className="text-xs"
              >
                Import
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNew}
              className="text-xs"
            >
              <Plus size={15} className="mr-1" /> Add Product
            </Button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Product & SKU</th>
                <th className="py-3.5 px-4">Category / Brand</th>
                <th className="py-3.5 px-4 text-right">MRP</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-center">Variants</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
                const hasVariants = Boolean(product.variants && product.variants.length > 0);
                const isExpanded = expandedProductIds.includes(product.id);

                return (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div>
                          <div className="font-semibold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>{product.sku}</span>
                            {product.barcode && <span>• Barcode: {product.barcode}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                            {product.category}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1 font-medium">{product.brand}</div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-slate-400 line-through text-xs font-medium">
                          ${product.mrp.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div>
                          {product.variants && product.variants.length > 1 ? (
                            (() => {
                              const prices = product.variants.map(v => v.sellingPrice);
                              const minP = Math.min(...prices);
                              const maxP = Math.max(...prices);
                              return (
                                <div>
                                  <span className="font-bold text-slate-900">
                                    {minP === maxP ? `$${minP.toFixed(2)}` : `$${minP.toFixed(2)} - $${maxP.toFixed(2)}`}
                                  </span>
                                  {product.discountPercent > 0 && (
                                    <div className="text-[10px] text-amber-700 font-bold">
                                      Up to {product.discountPercent}% OFF
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <div>
                              <span className="font-bold text-slate-900">${product.sellingPrice.toFixed(2)}</span>
                              {product.discountPercent > 0 && (
                                <div className="text-[10px] text-amber-700 font-bold">
                                  {product.discountPercent}% OFF
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(product.id)}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                            (product.variants?.length || 0) > 1
                              ? 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200'
                              : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                          title="Click to view/expand variants"
                        >
                          <Layers size={12} className={(product.variants?.length || 0) > 1 ? 'text-purple-600' : 'text-slate-500'} />
                          <span>{product.variants?.length || 1}</span>
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isOutOfStock 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : isLowStock 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          {product.stock} {product.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <PosStatusBadge status={product.status} />
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(product)}
                            title="Edit product"
                            className="p-1.5 text-slate-500 hover:text-[#159A1D] hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            title="Delete product"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline Expandable Variants Sub-table */}
                    {isExpanded && hasVariants && (
                      <tr className="bg-purple-50/25 border-b border-slate-100">
                        <td colSpan={8} className="py-3 px-6">
                          <div className="bg-white rounded-xl border border-purple-200/80 overflow-hidden shadow-xs">
                            <div className="bg-purple-50/60 px-4 py-2.5 border-b border-purple-100 flex items-center justify-between text-xs">
                              <span className="flex items-center gap-2 text-purple-950 font-bold">
                                <Layers size={13} className="text-purple-600" />
                                {product.name} — {product.variants?.length} Product Variants
                              </span>
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-[#159A1D] hover:underline text-xs font-bold flex items-center gap-1"
                              >
                                <Edit size={12} /> Edit Variants & Pricing
                              </button>
                            </div>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500">
                                  <th className="py-2.5 px-4 text-left">Variant / Attributes</th>
                                  <th className="py-2.5 px-4 text-left">SKU</th>
                                  <th className="py-2.5 px-4 text-left">Barcode</th>
                                  <th className="py-2.5 px-4 text-right">Cost Price</th>
                                  <th className="py-2.5 px-4 text-right">MRP</th>
                                  <th className="py-2.5 px-4 text-right">Selling Price</th>
                                  <th className="py-2.5 px-4 text-center">Stock</th>
                                  <th className="py-2.5 px-4 text-center">Min Alert</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {product.variants?.map((v) => (
                                  <tr key={v.id} className="hover:bg-slate-50/60">
                                    <td className="py-2.5 px-4 font-semibold text-slate-800">{v.name}</td>
                                    <td className="py-2.5 px-4 font-mono text-slate-500">{v.sku}</td>
                                    <td className="py-2.5 px-4 font-mono text-slate-400">{v.barcode || '—'}</td>
                                    <td className="py-2.5 px-4 text-right text-slate-500">${v.costPrice.toFixed(2)}</td>
                                    <td className="py-2.5 px-4 text-right text-slate-400 line-through">${v.mrp.toFixed(2)}</td>
                                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">${v.sellingPrice.toFixed(2)}</td>
                                    <td className="py-2.5 px-4 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                        v.stock <= 0 
                                          ? 'bg-red-50 text-red-600 border border-red-100' 
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                      }`}>
                                        {v.stock}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                                      {v.minStockAlert ?? 5}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <Package size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-slate-600">No products found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
      />
    </div>
  );
}

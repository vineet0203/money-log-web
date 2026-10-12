"use client";

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Product, ProductVariant } from './types';
import { useProducts } from './ProductsContext';
import { productFormSchema } from './schema';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Package, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export function AddProductModal({ isOpen, onClose, productToEdit }: AddProductModalProps) {
  if (!isOpen) return null;

  return (
    <AddProductFormDialog
      isOpen={isOpen}
      onClose={onClose}
      productToEdit={productToEdit}
      key={productToEdit ? `edit-${productToEdit.id}` : 'new-product'}
    />
  );
}

function AddProductFormDialog({
  isOpen,
  onClose,
  productToEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}) {
  const { categories, brands, addProduct, updateProduct } = useProducts();
  const [activeTab, setActiveTab] = useState<'general' | 'variants'>('general');

  // General Info State
  const [name, setName] = useState(productToEdit?.name || '');
  const [category, setCategory] = useState(productToEdit?.category || categories[0]?.name || 'Coffee');
  const [brand, setBrand] = useState(productToEdit?.brand || brands[0]?.name || 'BaristaPro');
  const [unit, setUnit] = useState(productToEdit?.unit || 'pcs');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [status, setStatus] = useState<'Active' | 'Draft'>(
    productToEdit?.status === 'Draft' ? 'Draft' : 'Active'
  );

  // Variants State - Every product has at least 1 variant
  const initialVariants: ProductVariant[] = useMemo(() => {
    if (productToEdit?.variants && productToEdit.variants.length > 0) {
      return productToEdit.variants;
    }
    return [
      {
        id: 'var-default',
        productId: productToEdit?.id ?? 0,
        name: 'Standard',
        sku: productToEdit?.sku || '',
        barcode: productToEdit?.barcode || '',
        costPrice: productToEdit?.costPrice ?? 10,
        mrp: productToEdit?.mrp ?? 20,
        sellingPrice: productToEdit?.sellingPrice ?? 18,
        stock: productToEdit?.stock ?? 25,
        minStockAlert: productToEdit?.minStockAlert ?? 5,
        attributes: {},
      }
    ];
  }, [productToEdit]);

  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);

  // Attribute Matrix Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [attributeRows, setAttributeRows] = useState<{ type: string; values: string }[]>([
    { type: 'Size', values: 'Small, Medium, Large' }
  ]);
  const [genBaseCost, setGenBaseCost] = useState<number>(10);
  const [genBaseMrp, setGenBaseMrp] = useState<number>(20);
  const [genBaseSellingPrice, setGenBaseSellingPrice] = useState<number>(18);
  const [genBaseStock, setGenBaseStock] = useState<number>(15);
  const [genBaseSkuPrefix, setGenBaseSkuPrefix] = useState<string>('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [variantNotice, setVariantNotice] = useState<string | null>(null);

  // Group error counts by tab for badges
  const generalErrorsCount = useMemo(() => {
    const generalFields = ['name', 'category', 'brand', 'unit', 'status', 'description'];
    return Object.keys(errors).filter(k => generalFields.includes(k)).length;
  }, [errors]);

  const variantErrorsCount = useMemo(() => {
    return Object.keys(errors).filter(k => k === 'variants' || k.startsWith('variants.')).length;
  }, [errors]);

  // Aggregate stats from variants
  const totalStock = useMemo(() => {
    return variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }, [variants]);

  const priceRange = useMemo(() => {
    if (variants.length === 0) return '$0.00';
    const prices = variants.map(v => Number(v.sellingPrice) || 0);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `$${min.toFixed(2)}`;
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }, [variants]);

  // Variant operations
  const handleAddVariant = () => {
    const nextIdx = variants.length + 1;
    const baseSku = (name.trim().slice(0, 3).toUpperCase() || 'SKU') + `-V${nextIdx}`;
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${nextIdx}`,
      productId: productToEdit?.id ?? 0,
      name: `Variant ${nextIdx}`,
      sku: baseSku,
      barcode: '',
      costPrice: variants[0]?.costPrice ?? 10,
      mrp: variants[0]?.mrp ?? 20,
      sellingPrice: variants[0]?.sellingPrice ?? 18,
      stock: 10,
      minStockAlert: 5,
      attributes: {},
    };
    setVariants(prev => [...prev, newVariant]);
    setVariantNotice(null);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, [field]: value };
    }));
    // Clear specific field error
    if (errors[`variants.${index}.${field}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`variants.${index}.${field}`];
        return next;
      });
    }
  };

  const handleDeleteVariant = (index: number) => {
    if (variants.length <= 1) {
      setVariantNotice('Every product must have at least one variant. You cannot delete the only variant.');
      return;
    }
    setVariants(prev => prev.filter((_, idx) => idx !== index));
    setVariantNotice(null);
  };

  // Generate combinations
  const handleGenerateCombinations = () => {
    const validAttributes = attributeRows
      .map(row => ({
        type: row.type.trim(),
        values: row.values.split(',').map(v => v.trim()).filter(Boolean)
      }))
      .filter(row => row.values.length > 0);

    if (validAttributes.length === 0) return;

    const cartesian = (arr: { type: string; values: string[] }[]): Record<string, string>[] => {
      return arr.reduce<Record<string, string>[]>((acc, curr) => {
        if (acc.length === 0) {
          return curr.values.map(val => ({ [curr.type]: val }));
        }
        const result: Record<string, string>[] = [];
        acc.forEach(item => {
          curr.values.forEach(val => {
            result.push({ ...item, [curr.type]: val });
          });
        });
        return result;
      }, []);
    };

    const combinations = cartesian(validAttributes);
    const prefix = genBaseSkuPrefix.trim() || name.trim().slice(0, 3).toUpperCase() || 'SKU';

    const generated: ProductVariant[] = combinations.map((combo, idx) => {
      const nameParts = Object.values(combo).join(' / ');
      const skuCode = Object.values(combo).map(v => v.slice(0, 3).toUpperCase()).join('-');
      return {
        id: `var-gen-${Date.now()}-${idx}`,
        productId: productToEdit?.id ?? 0,
        name: nameParts,
        sku: `${prefix}-${skuCode}`,
        barcode: '',
        costPrice: Number(genBaseCost) || 10,
        mrp: Number(genBaseMrp) || 20,
        sellingPrice: Number(genBaseSellingPrice) || 18,
        stock: Number(genBaseStock) || 15,
        minStockAlert: 5,
        attributes: combo,
      };
    });

    // If current single variant is blank or default with zero stock, replace it, else append
    if (variants.length === 1 && variants[0].name === 'Standard' && !variants[0].sku) {
      setVariants(generated);
    } else {
      setVariants(prev => [...prev, ...generated]);
    }

    setShowGenerator(false);
    setVariantNotice(null);
  };

  // Handle Form Submit with Zod validation
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const payload = {
      name: name.trim(),
      category: category.trim(),
      brand: brand.trim(),
      unit: unit.trim(),
      status: (totalStock <= 0 ? 'Out of Stock' : status) as 'Active' | 'Draft' | 'Out of Stock',
      description: description.trim(),
      variants: variants.map(v => ({
        ...v,
        name: v.name.trim(),
        sku: v.sku.trim(),
        barcode: v.barcode ? v.barcode.trim() : '',
        costPrice: Number(v.costPrice) || 0,
        mrp: Number(v.mrp) || 0,
        sellingPrice: Number(v.sellingPrice) || 0,
        stock: Number(v.stock) || 0,
        minStockAlert: Number(v.minStockAlert) || 5,
      }))
    };

    // Run Zod validation
    const result = productFormSchema.safeParse(payload);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        newErrors[path] = issue.message;
      });
      setErrors(newErrors);

      // Auto-navigate to tab with errors if user is currently on the other tab
      const hasGeneralErr = Object.keys(newErrors).some(k => 
        ['name', 'category', 'brand', 'unit', 'status'].includes(k)
      );
      const hasVariantErr = Object.keys(newErrors).some(k => 
        k === 'variants' || k.startsWith('variants.')
      );

      if (activeTab === 'variants' && hasGeneralErr && !hasVariantErr) {
        setActiveTab('general');
      } else if (activeTab === 'general' && hasVariantErr && !hasGeneralErr) {
        setActiveTab('variants');
      }
      return;
    }

    // Validation passed: calculate parent aggregate numbers
    const validVariants = payload.variants;
    const minSellingPrice = Math.min(...validVariants.map(v => v.sellingPrice));
    const minMrp = Math.min(...validVariants.map(v => v.mrp));
    const minCost = Math.min(...validVariants.map(v => v.costPrice));
    const minAlert = Math.min(...validVariants.map(v => v.minStockAlert));
    const parentStock = validVariants.reduce((sum, v) => sum + v.stock, 0);
    const discountPercent = minMrp > 0 && minMrp > minSellingPrice
      ? Number((((minMrp - minSellingPrice) / minMrp) * 100).toFixed(1))
      : 0;

    const productRecord = {
      name: payload.name,
      sku: validVariants[0].sku,
      barcode: validVariants[0].barcode || '',
      category: payload.category,
      brand: payload.brand,
      costPrice: minCost,
      mrp: minMrp,
      sellingPrice: minSellingPrice,
      discountPercent,
      stock: parentStock,
      minStockAlert: minAlert,
      unit: payload.unit,
      status: (parentStock <= 0 ? 'Out of Stock' : payload.status) as 'Active' | 'Draft' | 'Out of Stock',
      hasVariants: validVariants.length > 1 || (validVariants.length === 1 && validVariants[0].name !== 'Standard'),
      variants: validVariants,
      description: payload.description,
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, productRecord);
    } else {
      addProduct(productRecord);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Edit Product' : 'Add New Product'}
      description="Configure general product details and individual variants with custom pricing & stock inventory."
      maxWidth="max-w-4xl"
      submitText={productToEdit ? 'Save Changes' : 'Create Product'}
      onSubmit={() => handleSubmit()}
    >
      <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1 text-slate-800">
        {/* Navigation Tabs (2 Tabs Only) */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package size={15} />
            <span>General Info</span>
            {generalErrorsCount > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {generalErrorsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'variants' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={15} />
            <span>Variants & Inventory ({variants.length})</span>
            {variantErrorsCount > 0 ? (
              <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {variantErrorsCount}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-normal">
                {totalStock} units
              </span>
            )}
          </button>
        </div>

        {/* Global validation error warning banner if errors exist on inactive tab */}
        {activeTab === 'general' && variantErrorsCount > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>You have {variantErrorsCount} validation error(s) in the <strong>Variants & Inventory</strong> tab.</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('variants')}
              className="text-red-700 font-bold underline hover:text-red-900"
            >
              Go to Variants →
            </button>
          </div>
        )}

        {activeTab === 'variants' && generalErrorsCount > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>You have {generalErrorsCount} validation error(s) in the <strong>General Info</strong> tab.</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className="text-red-700 font-bold underline hover:text-red-900"
            >
              Go to General Info →
            </button>
          </div>
        )}

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ethiopia Yirgacheffe Beans"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors(prev => { const n = { ...prev }; delete n.name; return n; });
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D] ${
                    errors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit of Measure <span className="text-red-500">*</span>
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="pack">Pack / Bag</option>
                  <option value="bottle">Bottle</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gram">Gram (g)</option>
                  <option value="box">Box</option>
                  <option value="liter">Liter (L)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.brand}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Draft')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
                >
                  <option value="Active">Active (Available in store POS)</option>
                  <option value="Draft">Draft (Hidden)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Description</label>
              <textarea
                rows={3}
                placeholder="Product description, tasting notes, storage instructions, or specifications..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#159A1D]/20 focus:border-[#159A1D]"
              />
            </div>

            {/* Informational Callout */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
              <Info className="text-[#159A1D] shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">Pricing and Stock are configured per variant</p>
                <p>
                  Every product has at least one variant. Individual selling prices, cost prices, MRP, and stock inventory levels are configured on the next tab.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className="px-5 py-2.5 bg-[#159A1D] hover:bg-[#128218] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Configure Variants & Pricing</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Variants & Inventory */}
        {activeTab === 'variants' && (
          <div className="space-y-5">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Product Variants & Price Matrix
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every product requires at least 1 variant. Each variant has its own unique SKU, price, and inventory.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerator(!showGenerator)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
                    showGenerator
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles size={14} className="text-purple-600" />
                  <span>Attribute Generator</span>
                  {showGenerator ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3.5 py-2 bg-[#159A1D] hover:bg-[#128218] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add Variant</span>
                </button>
              </div>
            </div>

            {/* Error notice if trying to delete last variant */}
            {variantNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>{variantNotice}</span>
              </div>
            )}

            {/* Collapsible Attribute Matrix Generator */}
            {showGenerator && (
              <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-600" />
                    <h5 className="text-xs font-bold text-purple-950 uppercase tracking-wide">
                      Batch Generate Variant Combinations
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttributeRows(prev => [...prev, { type: 'Flavor', values: 'Vanilla, Caramel' }])}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Another Attribute
                  </button>
                </div>

                {/* Attribute Rows */}
                <div className="space-y-2">
                  {attributeRows.map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={attr.type}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttributeRows(prev => prev.map((a, i) => i === idx ? { ...a, type: val } : a));
                        }}
                        className="w-32 px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-slate-800"
                      >
                        <option value="Size">Size</option>
                        <option value="Color">Color</option>
                        <option value="Volume">Volume</option>
                        <option value="Flavor">Flavor</option>
                        <option value="Roast">Roast</option>
                        <option value="Material">Material</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Comma separated values: Small, Medium, Large"
                        value={attr.values}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAttributeRows(prev => prev.map((a, i) => i === idx ? { ...a, values: val } : a));
                        }}
                        className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />

                      {attributeRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAttributeRows(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Base Defaults for Generated Combinations */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-purple-100">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={genBaseCost}
                      onChange={(e) => setGenBaseCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base MRP ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={genBaseMrp}
                      onChange={(e) => setGenBaseMrp(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Selling ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={genBaseSellingPrice}
                      onChange={(e) => setGenBaseSellingPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-bold text-[#159A1D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={genBaseStock}
                      onChange={(e) => setGenBaseStock(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">SKU Prefix</label>
                    <input
                      type="text"
                      placeholder="e.g. COF"
                      value={genBaseSkuPrefix}
                      onChange={(e) => setGenBaseSkuPrefix(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGenerator(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-purple-100 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateCombinations}
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Generate & Populate Variants
                  </button>
                </div>
              </div>
            )}

            {/* Variants Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-600">
                      <th className="py-3 px-3">Variant Name *</th>
                      <th className="py-3 px-3">SKU *</th>
                      <th className="py-3 px-2 text-right">Cost ($)</th>
                      <th className="py-3 px-2 text-right">MRP ($)</th>
                      <th className="py-3 px-2 text-right">Selling Price ($) *</th>
                      <th className="py-3 px-2 text-center">Discount %</th>
                      <th className="py-3 px-2 text-center">Stock *</th>
                      <th className="py-3 px-2 text-center">Alert &lt;</th>
                      <th className="py-3 px-3">Barcode</th>
                      <th className="py-3 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v, vIdx) => {
                      const mrp = Number(v.mrp) || 0;
                      const sp = Number(v.sellingPrice) || 0;
                      const discPercent = mrp > 0 && mrp > sp
                        ? Number((((mrp - sp) / mrp) * 100).toFixed(0))
                        : 0;

                      const nameError = errors[`variants.${vIdx}.name`];
                      const skuError = errors[`variants.${vIdx}.sku`];
                      const priceError = errors[`variants.${vIdx}.sellingPrice`];
                      const stockError = errors[`variants.${vIdx}.stock`];

                      return (
                        <tr key={v.id || vIdx} className="hover:bg-slate-50/70 transition-colors">
                          {/* Variant Name */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={v.name}
                              placeholder="e.g. Medium, 500ml"
                              onChange={(e) => handleUpdateVariant(vIdx, 'name', e.target.value)}
                              className={`w-32 sm:w-36 px-2.5 py-1.5 bg-slate-50 border rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159A1D] ${
                                nameError ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                              }`}
                            />
                            {nameError && (
                              <p className="text-[10px] text-red-600 font-semibold mt-0.5">{nameError}</p>
                            )}
                          </td>

                          {/* SKU */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={v.sku}
                              placeholder="SKU-001"
                              onChange={(e) => handleUpdateVariant(vIdx, 'sku', e.target.value)}
                              className={`w-28 px-2.5 py-1.5 bg-slate-50 border rounded-lg font-mono text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159A1D] ${
                                skuError ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                              }`}
                            />
                            {skuError && (
                              <p className="text-[10px] text-red-600 font-semibold mt-0.5">{skuError}</p>
                            )}
                          </td>

                          {/* Cost Price */}
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={v.costPrice}
                              onChange={(e) => handleUpdateVariant(vIdx, 'costPrice', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159A1D]"
                            />
                          </td>

                          {/* MRP */}
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={v.mrp}
                              onChange={(e) => handleUpdateVariant(vIdx, 'mrp', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159A1D]"
                            />
                          </td>

                          {/* Selling Price */}
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={v.sellingPrice}
                              onChange={(e) => handleUpdateVariant(vIdx, 'sellingPrice', parseFloat(e.target.value) || 0)}
                              className={`w-20 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs font-bold text-right text-[#159A1D] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159A1D] ${
                                priceError ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                              }`}
                            />
                            {priceError && (
                              <p className="text-[10px] text-red-600 font-semibold mt-0.5">{priceError}</p>
                            )}
                          </td>

                          {/* Discount % Badge */}
                          <td className="py-2.5 px-2 text-center">
                            {discPercent > 0 ? (
                              <span className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold">
                                {discPercent}% OFF
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={v.stock}
                              onChange={(e) => handleUpdateVariant(vIdx, 'stock', parseInt(e.target.value) || 0)}
                              className={`w-16 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs font-semibold text-center focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159A1D] ${
                                stockError ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
                              }`}
                            />
                            {stockError && (
                              <p className="text-[10px] text-red-600 font-semibold mt-0.5">{stockError}</p>
                            )}
                          </td>

                          {/* Min Stock Alert */}
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              value={v.minStockAlert ?? 5}
                              onChange={(e) => handleUpdateVariant(vIdx, 'minStockAlert', parseInt(e.target.value) || 0)}
                              className="w-14 px-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159A1D]"
                            />
                          </td>

                          {/* Barcode */}
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={v.barcode || ''}
                              placeholder="Barcode"
                              onChange={(e) => handleUpdateVariant(vIdx, 'barcode', e.target.value)}
                              className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#159A1D]"
                            />
                          </td>

                          {/* Action */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(vIdx)}
                              disabled={variants.length <= 1}
                              title={variants.length <= 1 ? 'Every product must have at least one variant' : 'Delete variant'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                variants.length <= 1
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                              }`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Summary Bar */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-400">Total Variants: </span>
                    <strong className="text-slate-800">{variants.length}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Combined Stock: </span>
                    <strong className="text-slate-800">{totalStock} {unit}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Selling Price Range: </span>
                    <strong className="text-[#159A1D]">{priceRange}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="text-xs text-[#159A1D] hover:underline font-bold flex items-center gap-1"
                >
                  <Plus size={14} /> Add Another Variant
                </button>
              </div>
            </div>

            {/* Navigation back and submit buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back to General Info</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-6 py-2.5 bg-[#159A1D] hover:bg-[#128218] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                {productToEdit ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

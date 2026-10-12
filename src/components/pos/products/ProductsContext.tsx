"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  Product, 
  Category, 
  Brand, 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_BRANDS 
} from './types';

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: number, updates: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  addCategory: (category: Omit<Category, 'id' | 'productCount'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addBrand: (brand: Omit<Brand, 'id' | 'productCount'>) => void;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  bulkUpdatePrices: (updates: { id: number; sellingPrice?: number; mrp?: number; discountPercent?: number }[]) => void;
  applyCategoryDiscount: (categoryName: string, discountPercent: number) => void;
  importProducts: (newProducts: Product[]) => void;
  updateVariantPriceStock: (variantId: string, updates: { sellingPrice?: number; stock?: number; mrp?: number }) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS);

  // Recalculate productCount for categories and brands dynamically
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      productCount: products.filter(p => p.category === cat.name).length
    }));
  }, [categories, products]);

  const brandsWithCounts = useMemo(() => {
    return brands.map(brand => ({
      ...brand,
      productCount: products.filter(p => p.brand === brand.name).length
    }));
  }, [brands, products]);

  const addProduct = (data: Omit<Product, 'id' | 'createdAt'>) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = {
      ...data,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      variants: data.variants || [],
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: number, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates };
      // Recalculate discount percent if MRP and sellingPrice are updated
      if (updates.mrp !== undefined || updates.sellingPrice !== undefined) {
        const mrp = updates.mrp ?? p.mrp;
        const sp = updates.sellingPrice ?? p.sellingPrice;
        if (mrp > 0) {
          updated.discountPercent = Number(Math.max(0, ((mrp - sp) / mrp) * 100).toFixed(1));
        }
      }
      return updated;
    }));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = (data: Omit<Category, 'id' | 'productCount'>) => {
    const newCategory: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addBrand = (data: Omit<Brand, 'id' | 'productCount'>) => {
    const newBrand: Brand = {
      ...data,
      id: `br-${Date.now()}`,
      productCount: 0,
    };
    setBrands(prev => [...prev, newBrand]);
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBrand = (id: string) => {
    setBrands(prev => prev.filter(b => b.id !== id));
  };

  const bulkUpdatePrices = (updates: { id: number; sellingPrice?: number; mrp?: number; discountPercent?: number }[]) => {
    setProducts(prev => prev.map(p => {
      const match = updates.find(u => u.id === p.id);
      if (!match) return p;
      const updated = { ...p };
      if (match.mrp !== undefined) updated.mrp = match.mrp;
      if (match.sellingPrice !== undefined) updated.sellingPrice = match.sellingPrice;
      if (match.discountPercent !== undefined) {
        updated.discountPercent = match.discountPercent;
        updated.sellingPrice = Number((updated.mrp * (1 - match.discountPercent / 100)).toFixed(2));
      } else if (updated.mrp > 0) {
        updated.discountPercent = Number(Math.max(0, ((updated.mrp - updated.sellingPrice) / updated.mrp) * 100).toFixed(1));
      }
      return updated;
    }));
  };

  const applyCategoryDiscount = (categoryName: string, discountPercent: number) => {
    setProducts(prev => prev.map(p => {
      if (categoryName !== 'All' && p.category !== categoryName) return p;
      const newSellingPrice = Number((p.mrp * (1 - discountPercent / 100)).toFixed(2));
      return {
        ...p,
        discountPercent,
        sellingPrice: newSellingPrice,
      };
    }));
  };

  const importProducts = (newProducts: Product[]) => {
    setProducts(prev => {
      // Merge: replace existing products by SKU or append
      const existingSkus = new Set(prev.map(p => p.sku));
      const filteredNew = newProducts.filter(p => !existingSkus.has(p.sku));
      return [...filteredNew, ...prev];
    });
  };

  const updateVariantPriceStock = (variantId: string, updates: { sellingPrice?: number; stock?: number; mrp?: number }) => {
    setProducts(prev => prev.map(product => {
      if (!product.variants || product.variants.length === 0) return product;
      const hasVariant = product.variants.some(v => v.id === variantId);
      if (!hasVariant) return product;

      const updatedVariants = product.variants.map(v => {
        if (v.id !== variantId) return v;
        return {
          ...v,
          ...(updates.sellingPrice !== undefined ? { sellingPrice: updates.sellingPrice } : {}),
          ...(updates.stock !== undefined ? { stock: updates.stock } : {}),
          ...(updates.mrp !== undefined ? { mrp: updates.mrp } : {}),
        };
      });

      return {
        ...product,
        variants: updatedVariants,
        // Also update total stock from variants
        stock: updatedVariants.reduce((sum, v) => sum + v.stock, 0),
      };
    }));
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories: categoriesWithCounts,
        brands: brandsWithCounts,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        bulkUpdatePrices,
        applyCategoryDiscount,
        importProducts,
        updateVariantPriceStock,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}

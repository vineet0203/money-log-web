"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  Product, 
  Category, 
  Brand, 
  ProductVariant 
} from './types';
import {
  useGetPosProducts,
  useCreatePosProduct,
  useUpdatePosProduct,
  useDeletePosProduct,
  useGetPosCategories,
  useCreatePosCategory,
  useUpdatePosCategory,
  useDeletePosCategory,
  useGetPosBrands,
  useCreatePosBrand,
  useDeletePosBrand,
  PosProduct,
  exportPosProductsCsv,
  useBulkImportPosProducts,
  BulkImportResponse,
} from '@/hooks/queries/posProducts';
import { useSnackbar } from 'notistack';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

interface FilterState {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  stockStatus: 'All' | 'in_stock' | 'low_stock' | 'out_of_stock';
  setStockStatus: (val: 'All' | 'in_stock' | 'low_stock' | 'out_of_stock') => void;
}

interface ProductsContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  isLoading: boolean;
  isError: boolean;
  pagination: PaginationState;
  filters: FilterState;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'productCount'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBrand: (brand: Omit<Brand, 'id' | 'productCount'>) => Promise<void>;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => Promise<void>;
  bulkUpdatePrices: (updates: { id: number; sellingPrice?: number; mrp?: number; discountPercent?: number }[]) => void;
  applyCategoryDiscount: (categoryName: string, discountPercent: number) => void;
  importProducts: (newProducts: Product[]) => void;
  updateVariantPriceStock: (variantId: string, updates: { sellingPrice?: number; stock?: number; mrp?: number }) => void;
  exportCatalog: (params?: { category?: string; status?: string }) => Promise<void>;
  importCatalogFile: (file: File) => Promise<BulkImportResponse>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const res = (error as { response?: { data?: { error?: string } } }).response;
    if (res?.data?.error) return res.data.error;
  }
  return fallback;
}

// Helper to convert backend product to UI Product
function mapBackendToUiProduct(p: PosProduct): Product {
  const variants: ProductVariant[] = (p.variants || []).map((v) => ({
    id: String(v.id || `v-${v.sku}`),
    productId: p.id,
    sku: v.sku || '',
    barcode: v.barcode || '',
    name: v.title,
    attributes: (v.attributes || {}) as Record<string, string>,
    costPrice: Number(v.cost_price),
    mrp: Number(v.mrp),
    sellingPrice: Number(v.selling_price),
    stock: Number(v.stock_quantity),
    minStockAlert: Number(v.min_stock_alert),
  }));

  const firstVar = variants[0];
  const costPrice = firstVar ? firstVar.costPrice : 0;
  const mrp = firstVar ? firstVar.mrp : 0;
  const sellingPrice = p.min_price || (firstVar ? firstVar.sellingPrice : 0);
  const discountPercent = mrp > sellingPrice && mrp > 0
    ? Number((((mrp - sellingPrice) / mrp) * 100).toFixed(1))
    : 0;

  let uiStatus: 'Active' | 'Draft' | 'Out of Stock' = 'Active';
  if (p.status === 'draft') uiStatus = 'Draft';
  else if (p.total_stock <= 0) uiStatus = 'Out of Stock';

  return {
    id: p.id,
    name: p.name,
    sku: firstVar?.sku || `SKU-${p.id}`,
    barcode: firstVar?.barcode || '',
    category: p.category_name || 'Uncategorized',
    brand: p.brand_name || 'Generic',
    costPrice,
    mrp,
    sellingPrice,
    discountPercent,
    stock: p.total_stock,
    minStockAlert: p.min_stock_alert || 5,
    unit: p.base_unit || 'pcs',
    status: uiStatus,
    hasVariants: variants.length > 1 || (variants.length === 1 && variants[0].name !== 'Standard'),
    variants,
    description: p.description || '',
    createdAt: p.created_at ? p.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar } = useSnackbar();

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Filter State
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('All');
  const [brand, setBrand] = useState<string>('All');
  const [stockStatus, setStockStatus] = useState<'All' | 'in_stock' | 'low_stock' | 'out_of_stock'>('All');

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Categories & Brands
  const { data: rawCategories = [], isLoading: isCatLoading } = useGetPosCategories();
  const { data: rawBrands = [], isLoading: isBrandLoading } = useGetPosBrands();

  // Find category ID for filter
  const categoryIdParam = useMemo(() => {
    if (category === 'All') return undefined;
    const found = rawCategories.find((c) => c.name === category);
    return found ? found.id : undefined;
  }, [category, rawCategories]);

  // Find brand ID for filter
  const brandIdParam = useMemo(() => {
    if (brand === 'All') return undefined;
    const found = rawBrands.find((b) => b.name === brand);
    return found ? found.id : undefined;
  }, [brand, rawBrands]);

  // Fetch Paginated Products
  const {
    data: productsResponse,
    isLoading: isProdLoading,
    isError,
  } = useGetPosProducts({
    page,
    limit,
    search: debouncedSearch || undefined,
    category_id: categoryIdParam,
    brand_id: brandIdParam,
    stock_status: stockStatus === 'All' ? undefined : stockStatus,
  });

  // Mutations
  const createProductMutation = useCreatePosProduct();
  const updateProductMutation = useUpdatePosProduct();
  const deleteProductMutation = useDeletePosProduct();

  const createCategoryMutation = useCreatePosCategory();
  const updateCategoryMutation = useUpdatePosCategory();
  const deleteCategoryMutation = useDeletePosCategory();

  const createBrandMutation = useCreatePosBrand();
  const deleteBrandMutation = useDeletePosBrand();
  const bulkImportMutation = useBulkImportPosProducts();

  // UI Categories mapped
  const categories: Category[] = useMemo(() => {
    return rawCategories.map((c) => ({
      id: String(c.id),
      name: c.name,
      description: `Category: ${c.name}`,
      productCount: c.product_count || 0,
      status: c.is_active ? 'Active' : 'Inactive',
    }));
  }, [rawCategories]);

  // UI Brands mapped
  const brands: Brand[] = useMemo(() => {
    return rawBrands.map((b) => ({
      id: String(b.id),
      name: b.name,
      description: `Brand: ${b.name}`,
      productCount: b.product_count || 0,
      status: b.is_active ? 'Active' : 'Inactive',
    }));
  }, [rawBrands]);

  // UI Products mapped
  const products: Product[] = useMemo(() => {
    if (!productsResponse?.data) return [];
    return productsResponse.data.map(mapBackendToUiProduct);
  }, [productsResponse]);

  // Pagination details
  const pagination: PaginationState = {
    page: productsResponse?.pagination?.page || page,
    limit: productsResponse?.pagination?.limit || limit,
    total: productsResponse?.pagination?.total || 0,
    totalPages: productsResponse?.pagination?.totalPages || 1,
    setPage: (p: number) => setPage(p),
    setLimit: (l: number) => {
      setLimit(l);
      setPage(1);
    },
  };

  const filters: FilterState = {
    search,
    setSearch: (s: string) => setSearch(s),
    category,
    setCategory: (c: string) => {
      setCategory(c);
      setPage(1);
    },
    brand,
    setBrand: (b: string) => {
      setBrand(b);
      setPage(1);
    },
    stockStatus,
    setStockStatus: (s) => {
      setStockStatus(s);
      setPage(1);
    },
  };

  // Add Product
  const addProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      // Find category_id and brand_id
      const matchedCat = rawCategories.find((c) => c.name === data.category);
      const matchedBrand = rawBrands.find((b) => b.name === data.brand);

      const variantsPayload = (data.variants || []).map((v, idx) => ({
        sku: v.sku?.trim() || `${data.name.slice(0, 3).toUpperCase()}-${Date.now()}-${idx + 1}`,
        barcode: v.barcode?.trim() || null,
        title: v.name || 'Default',
        attributes: v.attributes || {},
        cost_price: Number(v.costPrice) || 0,
        mrp: Number(v.mrp) || 0,
        selling_price: Number(v.sellingPrice) || 0,
        stock_quantity: Number(v.stock) || 0,
        min_stock_alert: Number(v.minStockAlert) || 5,
        is_active: true,
      }));

      // Ensure at least 1 variant
      if (variantsPayload.length === 0) {
        variantsPayload.push({
          sku: data.sku || `${data.name.slice(0, 3).toUpperCase()}-${Date.now()}`,
          barcode: data.barcode || null,
          title: 'Standard',
          attributes: {},
          cost_price: Number(data.costPrice) || 0,
          mrp: Number(data.mrp) || 0,
          selling_price: Number(data.sellingPrice) || 0,
          stock_quantity: Number(data.stock) || 0,
          min_stock_alert: Number(data.minStockAlert) || 5,
          is_active: true,
        });
      }

      await createProductMutation.mutateAsync({
        name: data.name,
        category_id: matchedCat ? matchedCat.id : null,
        brand_id: matchedBrand ? matchedBrand.id : null,
        description: data.description || null,
        base_unit: data.unit || 'pcs',
        is_taxable: true,
        status: data.status === 'Draft' ? 'draft' : 'active',
        variants: variantsPayload,
      });

      enqueueSnackbar('Product created successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error creating product:', error);
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create product';
      enqueueSnackbar(msg, { variant: 'error' });
      throw error;
    }
  };

  // Update Product
  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.unit !== undefined) payload.base_unit = updates.unit;
      if (updates.status !== undefined) {
        payload.status = updates.status === 'Draft' ? 'draft' : 'active';
      }

      if (updates.category !== undefined) {
        const matchedCat = rawCategories.find((c) => c.name === updates.category);
        payload.category_id = matchedCat ? matchedCat.id : null;
      }
      if (updates.brand !== undefined) {
        const matchedBrand = rawBrands.find((b) => b.name === updates.brand);
        payload.brand_id = matchedBrand ? matchedBrand.id : null;
      }

      if (updates.variants && updates.variants.length > 0) {
        payload.variants = updates.variants.map((v) => {
          const numId = parseInt(v.id, 10);
          return {
            id: isNaN(numId) ? undefined : numId,
            sku: v.sku,
            barcode: v.barcode || null,
            title: v.name,
            attributes: v.attributes || {},
            cost_price: Number(v.costPrice) || 0,
            mrp: Number(v.mrp) || 0,
            selling_price: Number(v.sellingPrice) || 0,
            stock_quantity: Number(v.stock) || 0,
            min_stock_alert: Number(v.minStockAlert) || 5,
            is_active: true,
          };
        });
      }

      await updateProductMutation.mutateAsync({ id, ...payload });
      enqueueSnackbar('Product updated successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error updating product:', error);
      enqueueSnackbar(getErrorMessage(error, 'Failed to update product'), { variant: 'error' });
      throw error;
    }
  };

  // Delete Product
  const deleteProduct = async (id: number) => {
    try {
      await deleteProductMutation.mutateAsync({ id, permanent: false });
      enqueueSnackbar('Product deleted/archived successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      enqueueSnackbar(getErrorMessage(error, 'Failed to delete product'), { variant: 'error' });
    }
  };

  // Add Category
  const addCategory = async (data: Omit<Category, 'id' | 'productCount'>) => {
    try {
      await createCategoryMutation.mutateAsync({
        name: data.name,
        is_active: data.status === 'Active',
      });
      enqueueSnackbar('Category added successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error creating category:', error);
      enqueueSnackbar(getErrorMessage(error, 'Failed to create category'), { variant: 'error' });
    }
  };

  // Update Category
  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) return;
      await updateCategoryMutation.mutateAsync({
        id: numId,
        name: updates.name,
        is_active: updates.status ? updates.status === 'Active' : undefined,
      });
      enqueueSnackbar('Category updated successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error updating category:', error);
      enqueueSnackbar(getErrorMessage(error, 'Failed to update category'), { variant: 'error' });
    }
  };

  // Delete Category
  const deleteCategory = async (id: string) => {
    try {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) return;
      await deleteCategoryMutation.mutateAsync(numId);
      enqueueSnackbar('Category deleted successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      enqueueSnackbar(getErrorMessage(error, 'Failed to delete category'), { variant: 'error' });
    }
  };

  // Add Brand
  const addBrand = async (data: Omit<Brand, 'id' | 'productCount'>) => {
    try {
      await createBrandMutation.mutateAsync({ name: data.name });
      enqueueSnackbar('Brand added successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error creating brand:', error);
      enqueueSnackbar(getErrorMessage(error, 'Failed to create brand'), { variant: 'error' });
    }
  };

  const updateBrand = (_id: string, _updates: Partial<Brand>) => {
    // Local no-op or future API extension
  };

  const deleteBrand = async (id: string) => {
    try {
      const numId = parseInt(id, 10);
      if (isNaN(numId)) return;
      await deleteBrandMutation.mutateAsync(numId);
      enqueueSnackbar('Brand deleted successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error deleting brand:', error);
      enqueueSnackbar(getErrorMessage(error, 'Failed to delete brand'), { variant: 'error' });
    }
  };

  const bulkUpdatePrices = () => {};
  const applyCategoryDiscount = () => {};
  const importProducts = () => {};
  const updateVariantPriceStock = () => {};

  // Export full catalog from backend without pagination limits
  const exportCatalog = async (params?: { category?: string; status?: string }) => {
    try {
      let category_id: number | undefined;
      if (params?.category && params.category !== 'All') {
        const found = rawCategories.find((c) => c.name === params.category);
        if (found) category_id = found.id;
      }

      await exportPosProductsCsv({
        category_id,
        status: params?.status,
        search: debouncedSearch || undefined,
      });
      enqueueSnackbar('Product catalog exported successfully!', { variant: 'success' });
    } catch (error: unknown) {
      console.error('Error exporting products catalog:', error);
      enqueueSnackbar(getErrorMessage(error, 'Failed to export products catalog'), { variant: 'error' });
    }
  };

  // Bulk import products from CSV file via backend API
  const importCatalogFile = async (file: File): Promise<BulkImportResponse> => {
    try {
      const res = await bulkImportMutation.mutateAsync(file);
      enqueueSnackbar(res.message || 'Catalog imported successfully!', { variant: 'success' });
      return res;
    } catch (error: unknown) {
      console.error('Error importing catalog:', error);
      const msg = getErrorMessage(error, 'Failed to import product catalog');
      enqueueSnackbar(msg, { variant: 'error' });
      throw error;
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        categories,
        brands,
        isLoading: isProdLoading || isCatLoading || isBrandLoading,
        isError,
        pagination,
        filters,
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
        exportCatalog,
        importCatalogFile,
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

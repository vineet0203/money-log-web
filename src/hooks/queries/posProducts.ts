import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface PosProductVariant {
  id?: number;
  product_id?: number;
  sku?: string;
  barcode?: string | null;
  title: string;
  attributes?: Record<string, string | number | boolean>;
  cost_price: number;
  mrp: number;
  selling_price: number;
  discount_percent?: number;
  stock_quantity: number;
  min_stock_alert?: number;
  is_active?: boolean;
}

export interface PosProduct {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  brand_id: number | null;
  brand_name: string | null;
  description: string | null;
  base_unit: string;
  is_taxable: boolean;
  tax_rate: number | null;
  status: 'active' | 'draft' | 'archived';
  image_url: string | null;
  options_config: { name: string; values: string[] }[];
  variants_count: number;
  total_stock: number;
  min_price: number;
  max_price: number;
  min_stock_alert: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  variants: PosProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface PosCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  is_active: boolean;
  product_count: number;
}

export interface PosBrand {
  id: number;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  product_count: number;
}

export interface PosProductsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PosProductsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string | number;
  brand_id?: string | number;
  status?: string;
  stock_status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ----------------- Categories Hooks -----------------
export const useGetPosCategories = (params?: { search?: string; is_active?: boolean }) => {
  return useQuery({
    queryKey: ['pos', 'categories', params],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PosCategory[] }>('/pos/categories', {
        params,
      });
      return data.data;
    },
  });
};

export const useCreatePosCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; icon?: string; is_active?: boolean }) => {
      const { data } = await api.post<{ success: boolean; data: PosCategory }>('/pos/categories', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
    },
  });
};

export const useUpdatePosCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; name?: string; icon?: string; is_active?: boolean }) => {
      const { data } = await api.put<{ success: boolean; data: PosCategory }>(`/pos/categories/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
    },
  });
};

export const useDeletePosCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/pos/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
    },
  });
};

// ----------------- Brands Hooks -----------------
export const useGetPosBrands = () => {
  return useQuery({
    queryKey: ['pos', 'brands'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PosBrand[] }>('/pos/brands');
      return data.data;
    },
  });
};

export const useCreatePosBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; logo_url?: string }) => {
      const { data } = await api.post<{ success: boolean; data: PosBrand }>('/pos/brands', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'brands'] });
    },
  });
};

export const useDeletePosBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/pos/brands/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'brands'] });
    },
  });
};

// ----------------- Products Hooks -----------------
export const useGetPosProducts = (params: PosProductsQueryParams = {}) => {
  return useQuery({
    queryKey: ['pos', 'products', params],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: PosProduct[];
        pagination: PosProductsPagination;
      }>('/pos/products', { params });
      return data;
    },
  });
};

export const useGetPosProductById = (id: number | null) => {
  return useQuery({
    queryKey: ['pos', 'products', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<{ success: boolean; data: PosProduct }>(`/pos/products/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreatePosProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<{ success: boolean; data: PosProduct }>('/pos/products', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'categories'] });
    },
  });
};

export const useUpdatePosProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; [key: string]: unknown }) => {
      const { data } = await api.put<{ success: boolean; data: PosProduct }>(`/pos/products/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'categories'] });
    },
  });
};

export const useDeletePosProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, permanent = false }: { id: number; permanent?: boolean }) => {
      const { data } = await api.delete(`/pos/products/${id}`, {
        params: { permanent },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'categories'] });
    },
  });
};

// ----------------- Import & Export API -----------------
export interface BulkImportSummary {
  totalRowsProcessed: number;
  productsCreated: number;
  productsUpdated: number;
  variantsCreated: number;
  variantsUpdated: number;
  categoriesCreated: number;
  brandsCreated: number;
}

export interface BulkImportResponse {
  success: boolean;
  message: string;
  data: BulkImportSummary;
}

export const exportPosProductsCsv = async (params?: {
  category_id?: number | string;
  brand_id?: number | string;
  status?: string;
  search?: string;
}) => {
  const response = await api.get('/pos/products/export', {
    params,
    responseType: 'blob',
  });

  let filename = `pos-products-export-${new Date().toISOString().split('T')[0]}.csv`;
  const disposition = response.headers['content-disposition'];
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const useBulkImportPosProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileOrFormData: File | FormData) => {
      let formData: FormData;
      if (fileOrFormData instanceof FormData) {
        formData = fileOrFormData;
      } else {
        formData = new FormData();
        formData.append('file', fileOrFormData);
      }
      const { data } = await api.post<BulkImportResponse>('/pos/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'brands'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { PosReceiptSettings } from '@/components/pos/settings/types';

export interface PosOrderItemPayload {
  variant_id: number;
  item_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  unit_cost?: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
}

export interface CreatePosOrderPayload {
  customer_name?: string;
  customer_phone?: string;
  register_label?: string;
  subtotal: number;
  discount_total?: number;
  tax_total?: number;
  grand_total: number;
  notes?: string;
  payment_mode?: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Store Credit';
  payment_amount?: number;
  payment_reference?: string;
  receipt_config?: Partial<PosReceiptSettings>;
  items: PosOrderItemPayload[];
}

export interface PosOrder {
  id: number;
  order_number: string;
  register_label: string;
  customer_name: string;
  customer_phone: string | null;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  grand_total: number;
  status: 'completed' | 'refunded' | 'partially_refunded' | 'exchanged' | 'voided';
  notes: string | null;
  order_date: string;
  created_at: string;
  items_count: number;
  total_units: number;
  payment_mode: string;
  payment_reference?: string;
  items?: Array<{
    id: number;
    order_id: number;
    variant_id: number;
    item_name: string;
    sku: string;
    barcode?: string | null;
    variant_title?: string | null;
    product_name?: string | null;
    quantity: number;
    unit_price: number;
    total_amount: number;
  }>;
  payment?: {
    id: number;
    order_id: number;
    payment_mode: string;
    amount: number;
    reference_number: string | null;
  };
  payments?: Array<{
    id: number;
    order_id: number;
    payment_mode: string;
    amount: number;
    reference_number: string | null;
  }>;
  receipt_config?: PosReceiptSettings | null;
}

export interface PosOrdersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_mode?: string;
  start_date?: string;
  end_date?: string;
}

export const POS_ORDERS_QUERY_KEY = ['pos', 'orders'] as const;

export const useGetPosOrders = (params?: PosOrdersQueryParams) => {
  return useQuery({
    queryKey: [...POS_ORDERS_QUERY_KEY, params],
    queryFn: async () => {
      const { data } = await api.get<{
        success: boolean;
        data: PosOrder[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      }>('/pos/orders', { params });
      return data;
    },
  });
};

export const useGetPosOrderById = (id?: number) => {
  return useQuery({
    queryKey: [...POS_ORDERS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get<{ success: boolean; data: PosOrder }>(`/pos/orders/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
};

export const useCreatePosOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePosOrderPayload) => {
      const { data } = await api.post<{
        success: boolean;
        message: string;
        data: PosOrder;
      }>('/pos/orders', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface PosReturnItem {
  variant_id: number;
  item_name?: string;
  quantity: number;
  unit_price?: number;
}

export interface PosReturn {
  id: number;
  return_number: string;
  original_order_id: number;
  original_order_number: string;
  order_date: string;
  original_order_total?: number;
  original_customer_name?: string;
  original_customer_phone?: string;
  customer_name: string;
  refund_amount: number;
  refund_mode: 'Store Credit' | 'Cash' | 'Card' | 'UPI';
  status: 'Processed' | 'Pending';
  reason: string;
  items_summary: string | null;
  returned_items?: PosReturnItem[] | null;
  notes?: string | null;
  created_at: string;
}

export interface PosExchangeItem {
  variant_id: number;
  item_name?: string;
  quantity: number;
  unit_price?: number;
}

export interface PosExchange {
  id: number;
  exchange_number: string;
  original_order_id: number;
  original_order_number: string;
  order_date: string;
  original_order_total?: number;
  original_customer_name?: string;
  original_customer_phone?: string;
  customer_name: string;
  returned_desc: string;
  replacement_desc: string;
  price_difference: number;
  payment_mode?: 'Cash' | 'Card' | 'UPI' | 'Store Credit';
  returned_items?: PosExchangeItem[] | null;
  replacement_items?: PosExchangeItem[] | null;
  notes?: string | null;
  status: 'Completed' | 'Pending';
  created_at: string;
}

export interface ReturnEligibilityData {
  order_id: number;
  order_number: string;
  order_date: string;
  customer_name: string;
  grand_total: number;
  order_status?: string;
  return_window_days: number;
  days_elapsed: number;
  days_remaining: number;
  is_eligible: boolean;
  policy_message: string;
}

export interface CreatePosReturnPayload {
  original_order_id: number;
  refund_amount: number;
  refund_mode?: 'Store Credit' | 'Cash' | 'Card' | 'UPI';
  reason?: string;
  items_summary?: string;
  notes?: string;
  returned_items?: Array<{
    variant_id: number;
    item_name?: string;
    unit_price?: number;
    quantity: number;
  }>;
}

export interface CreatePosExchangePayload {
  original_order_id: number;
  returned_items: Array<{
    variant_id: number;
    item_name?: string;
    quantity: number;
    unit_price?: number;
  }>;
  replacement_items: Array<{
    variant_id: number;
    item_name?: string;
    quantity: number;
    unit_price?: number;
  }>;
  price_difference: number;
  payment_mode?: 'Cash' | 'Card' | 'UPI' | 'Store Credit';
  notes?: string;
}

export const returnKeys = {
  all: ['pos-returns'] as const,
  lists: () => [...returnKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...returnKeys.lists(), params] as const,
  exchanges: (params?: Record<string, unknown>) => [...returnKeys.all, 'exchanges', params] as const,
  eligibility: (orderId: number | null | undefined) => [...returnKeys.all, 'eligibility', orderId] as const,
};

export function useGetPosReturns(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: returnKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/pos/returns', { params });
      return response.data;
    },
  });
}

export function useGetPosExchanges(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: returnKeys.exchanges(params),
    queryFn: async () => {
      const response = await api.get('/pos/returns/exchanges', { params });
      return response.data;
    },
  });
}

export function useCheckReturnEligibility(orderId: number | null | undefined) {
  return useQuery({
    queryKey: returnKeys.eligibility(orderId),
    queryFn: async () => {
      if (!orderId) return null;
      const response = await api.get<{ success: boolean; data: ReturnEligibilityData }>(
        `/pos/returns/check-eligibility/${orderId}`
      );
      return response.data.data;
    },
    enabled: Boolean(orderId),
  });
}

export function useCreatePosReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePosReturnPayload) => {
      const response = await api.post('/pos/returns', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.all });
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
}

export function useCreatePosExchange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePosExchangePayload) => {
      const response = await api.post('/pos/returns/exchange', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.all });
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-products'] });
    },
  });
}

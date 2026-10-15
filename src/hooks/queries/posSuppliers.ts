import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
  Supplier, 
  PurchaseOrder, 
  PurchaseBill, 
  GoodsReceivingRecord, 
  SupplierPayment,
  PurchaseOrderStatus
} from '@/components/pos/suppliers/types';
import { 
  SupplierFormData, 
  CreatePurchaseFormData, 
  GoodsReceivingFormData, 
  SupplierPaymentFormData 
} from '@/components/pos/suppliers/schema';

export interface SupplierMetrics {
  totalPayableBalance: number;
  activeSuppliersCount: number;
  openPOsCount: number;
  totalPurchasesValue: number;
  completedGRNsCount: number;
}

// ----------------------------------------------------------------------
// 1. Metrics Query
// ----------------------------------------------------------------------
export function useSupplierMetricsQuery() {
  return useQuery<SupplierMetrics>({
    queryKey: ['pos', 'suppliers', 'metrics'],
    queryFn: async () => {
      const response = await api.get('/pos/purchases/metrics');
      return response.data.data;
    },
    staleTime: 30000,
  });
}

// ----------------------------------------------------------------------
// 2. Suppliers Queries & Mutations
// ----------------------------------------------------------------------
export function useSuppliersQuery(params?: { search?: string; status?: string }) {
  return useQuery<Supplier[]>({
    queryKey: ['pos', 'suppliers', params],
    queryFn: async () => {
      const response = await api.get('/pos/suppliers', { params });
      return response.data.data;
    },
    staleTime: 60000,
  });
}

export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SupplierFormData) => {
      const response = await api.post('/pos/suppliers', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'suppliers'] });
    },
  });
}

export function useUpdateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SupplierFormData> }) => {
      const response = await api.put(`/pos/suppliers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'suppliers'] });
    },
  });
}

export function useDeleteSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/pos/suppliers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'suppliers'] });
    },
  });
}

// ----------------------------------------------------------------------
// 3. Purchase Orders Queries & Mutations
// ----------------------------------------------------------------------
export function usePurchaseOrdersQuery(params?: { search?: string; status?: string; supplier_id?: string }) {
  return useQuery<PurchaseOrder[]>({
    queryKey: ['pos', 'purchases', 'orders', params],
    queryFn: async () => {
      const response = await api.get('/pos/purchases/orders', { params });
      return response.data.data;
    },
    staleTime: 30000,
  });
}

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePurchaseFormData) => {
      const response = await api.post('/pos/purchases/orders', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'purchases'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'suppliers'] });
    },
  });
}

export function useUpdatePOStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PurchaseOrderStatus }) => {
      const response = await api.put(`/pos/purchases/orders/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'purchases', 'orders'] });
    },
  });
}

// ----------------------------------------------------------------------
// 4. Purchase Bills Queries & Mutations
// ----------------------------------------------------------------------
export function usePurchaseBillsQuery(params?: { search?: string; status?: string; supplier_id?: string }) {
  return useQuery<PurchaseBill[]>({
    queryKey: ['pos', 'purchases', 'bills', params],
    queryFn: async () => {
      const response = await api.get('/pos/purchases/bills', { params });
      return response.data.data;
    },
    staleTime: 30000,
  });
}

export function useCreatePurchaseBillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePurchaseFormData & { isReceived?: boolean }) => {
      const response = await api.post('/pos/purchases/bills', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'purchases'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] }); // Inventory updated
    },
  });
}

// ----------------------------------------------------------------------
// 5. Goods Receiving (GRN) Queries & Mutations
// ----------------------------------------------------------------------
export function useGoodsReceiptsQuery() {
  return useQuery<GoodsReceivingRecord[]>({
    queryKey: ['pos', 'purchases', 'grn'],
    queryFn: async () => {
      const response = await api.get('/pos/purchases/grn');
      return response.data.data;
    },
    staleTime: 30000,
  });
}

export function useProcessGRNMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GoodsReceivingFormData) => {
      const response = await api.post('/pos/purchases/grn', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'purchases'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'products'] }); // Inventory replenished
    },
  });
}

// ----------------------------------------------------------------------
// 6. Supplier Payments Queries & Mutations
// ----------------------------------------------------------------------
export function useSupplierPaymentsQuery(params?: { supplier_id?: string; bill_id?: string }) {
  return useQuery<SupplierPayment[]>({
    queryKey: ['pos', 'purchases', 'payments', params],
    queryFn: async () => {
      const response = await api.get('/pos/purchases/payments', { params });
      return response.data.data;
    },
    staleTime: 30000,
  });
}

export function useRecordPaymentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SupplierPaymentFormData) => {
      const response = await api.post('/pos/purchases/payments', payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'purchases'] });
      queryClient.invalidateQueries({ queryKey: ['pos', 'suppliers'] });
    },
  });
}

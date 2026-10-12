import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/transactions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate both transactions and subscriptions (since paying a sub bumps its billing date)
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

import { useQuery } from '@tanstack/react-query';

export const useGetTransactions = (filters?: { type?: string, fromDate?: string, toDate?: string, page?: number, limit?: number }) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.page && filters?.limit) {
        params.append('offset', ((filters.page - 1) * filters.limit).toString());
      }
      
      const { data } = await api.get(`/transactions?${params.toString()}`);
      return data; // Return full payload { data, total, nextOffset }
    },
  });
};

export const useGetTransactionStats = (filters?: { fromDate?: string, toDate?: string }) => {
  return useQuery({
    queryKey: ['transactionStats', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      const { data } = await api.get(`/transactions/stats?${params.toString()}`);
      return data;
    },
  });
};

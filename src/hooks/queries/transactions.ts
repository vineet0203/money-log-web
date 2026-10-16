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
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number | string; formData: FormData }) => {
      const { data } = await api.put(`/transactions/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const { data } = await api.delete(`/transactions/${id}`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', String(id)] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

import { useQuery } from '@tanstack/react-query';

export interface TransactionFilterParams {
  type?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  category_id?: number | string;
  search?: string;
  has_receipt?: boolean | string;
}

export const useGetTransactions = (filters?: TransactionFilterParams) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.category_id) params.append('category_id', String(filters.category_id));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.has_receipt !== undefined) params.append('has_receipt', String(filters.has_receipt));
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.page && filters?.limit) {
        params.append('offset', ((filters.page - 1) * filters.limit).toString());
      }
      
      const { data } = await api.get(`/transactions?${params.toString()}`);
      return data; // Return full payload { data, total, nextOffset }
    },
  });
};

export interface TransactionRecordSummary {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category_name: string;
  date: string;
}

export interface TransactionStatsAggregate {
  income: number;
  expense: number;
  balance: number;
  highestExpense: number;
  count: number;
  incomeCount: number;
  expenseCount: number;
  average: number;
  incomeAverage: number;
  expenseAverage: number;
  largest: TransactionRecordSummary | null;
  smallest: TransactionRecordSummary | null;
}

export interface TransactionStatsDelta {
  income: number | null;
  expense: number | null;
  balance: number | null;
  count: number | null;
  average: number | null;
}

export interface TransactionStatsResponse extends TransactionStatsAggregate {
  current: TransactionStatsAggregate;
  previous: TransactionStatsAggregate | null;
  delta: TransactionStatsDelta | null;
}

export const useGetTransactionStats = (filters?: {
  fromDate?: string;
  toDate?: string;
  type?: string;
  category_id?: number | string;
  search?: string;
  has_receipt?: boolean | string;
  compare?: 'previous';
}) => {
  return useQuery({
    queryKey: ['transactionStats', filters],
    queryFn: async (): Promise<TransactionStatsResponse> => {
      const params = new URLSearchParams();
      if (filters?.fromDate) params.append('fromDate', filters.fromDate);
      if (filters?.toDate) params.append('toDate', filters.toDate);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.category_id) params.append('category_id', String(filters.category_id));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.has_receipt !== undefined) params.append('has_receipt', String(filters.has_receipt));
      if (filters?.compare) params.append('compare', filters.compare);
      const { data } = await api.get(`/transactions/stats?${params.toString()}`);
      return data;
    },
  });
};

export const useGetTransactionById = (id?: string | number) => {
  return useQuery({
    queryKey: ['transaction', String(id)],
    queryFn: async () => {
      const { data } = await api.get(`/transactions/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
};

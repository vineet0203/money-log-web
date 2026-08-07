import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface Account {
  id: number;
  user_id: number;
  type: 'bank' | 'card' | 'wallet';
  subtype?: string;
  name: string;
  account_number: string;
  holder_name: string;
  expiry_date: string;
  provider?: string;
  external_id?: string;
  logo?: string;
  color?: string;
  balance?: number;
  available_balance?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AccountsResponse {
  data: Account[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface AccountTransaction {
  id: number;
  account_id: number;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  logo_url?: string;
  currency: string;
  primary_category?: string;
  detailed_category?: string;
  pending: boolean;
}

export const useGetAccounts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['accounts', page, limit],
    queryFn: async (): Promise<AccountsResponse> => {
      const { data } = await api.get('/accounts', { params: { page, limit } });
      return data;
    },
  });
};

export const useGetAccount = (id: string | number) => {
  return useQuery({
    queryKey: ['account', id],
    queryFn: async (): Promise<Account> => {
      const { data } = await api.get(`/accounts/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number | string) => {
      const { data } = await api.delete(`/accounts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export interface AccountTransactionsResponse {
  data: AccountTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const useGetAccountTransactions = (accountId: number | string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['accountTransactions', accountId, page, limit],
    queryFn: async (): Promise<AccountTransactionsResponse> => {
      const { data } = await api.get(`/accounts/${accountId}/transactions`, {
        params: { page, limit },
      });
      return data;
    },
    enabled: !!accountId,
  });
};

export const useSyncAllTransactions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/plaid/sync-transactions');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountTransactions'] });
    },
  });
};

export const useSyncBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number | string) => {
      const { data } = await api.post('/plaid/sync-balance', { id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

export const useCreateLinkToken = () => {
  return useMutation({
    mutationFn: async (): Promise<{ link_token: string; expiration: string; request_id: string }> => {
      const { data } = await api.post('/plaid/create-link-token');
      return data;
    }
  });
};

export const useExchangePublicToken = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (publicToken: string) => {
      const { data } = await api.post('/plaid/exchange-public-token', { public_token: publicToken });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });
};

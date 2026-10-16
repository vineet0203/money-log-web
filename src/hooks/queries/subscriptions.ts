import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export type RecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'half_yearly'
  | 'yearly'
  | 'custom';

export type RecurrenceEndMode = 'never' | 'on_date' | 'after_n';

export interface SubscriptionData {
  id: number;
  user_id: number;
  name: string;
  amount: string;
  type: 'expense' | 'income';
  billing_cycle: 'monthly' | 'yearly';
  frequency?: RecurrenceFrequency;
  interval_count?: number;
  by_month_day?: number | null;
  by_weekday?: number | null;
  end_mode?: RecurrenceEndMode;
  end_date?: string | null;
  occurrences_total?: number | null;
  auto_post?: boolean | number;
  start_date: string;
  next_billing_date: string;
  status: 'active' | 'paused' | 'cancelled';
  category_id: number | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  days_left: number;
  missed_count?: number;
  computed_status: 'Ongoing' | 'Upcoming' | 'Inactive';
  is_reminder_on: boolean | number;
  reminder_days: number;
  is_sms_enabled: boolean | number;
  is_email_enabled: boolean | number;
  is_push_enabled?: boolean | number;
}

export interface SubscriptionStats {
  ongoing_count: string;
  upcoming_count: string;
  inactive_count: string;
  total_count: string;
  total_monthly_count: string;
  total_yearly_count: string;
  overdue_count: string;
  within_7_days_count: string;
  within_8_30_days_count: string;
  yearly_30_45_days_count: string;
  total_missed_count?: number | string;
}

export interface RecurringOccurrence {
  id: number;
  user_id: number;
  recurring_id: number;
  due_date: string;
  amount: string;
  status: 'due' | 'paid' | 'skipped' | 'missed' | 'cancelled';
  transaction_id: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  transaction_title?: string;
  transaction_receipt_url?: string | null;
}

export interface CatchUpOccurrence {
  id: number;
  recurring_id: number;
  due_date: string;
  amount: string;
  status: 'missed';
  subscription_name: string;
  frequency: string;
  type: 'expense' | 'income';
  category_id: number | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
}

interface GetSubscriptionsResponse {
  data: SubscriptionData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface GetOccurrencesResponse {
  data: RecurringOccurrence[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const useGetSubscriptions = (page: number = 1, limit: number = 8, status: string = 'All', categoryId: string = 'all') => {
  return useQuery({
    queryKey: ['subscriptions', page, limit, status, categoryId],
    queryFn: async () => {
      const { data } = await api.get<GetSubscriptionsResponse>('/subscriptions', {
        params: { page, limit, status, category_id: categoryId }
      });
      return data;
    },
  });
};

export const useGetSubscriptionStats = () => {
  return useQuery({
    queryKey: ['subscriptions', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<SubscriptionStats>('/subscriptions/stats');
      return data;
    },
  });
};

export const useAddSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newSubscription: any) => {
      const { data } = await api.post('/subscriptions', newSubscription);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['catchUpOccurrences'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useGetSubscriptionDetails = (id: string | number) => {
  return useQuery({
    queryKey: ['subscriptions', String(id), 'details'],
    queryFn: async () => {
      const { data } = await api.get(`/subscriptions/${id}/details`);
      return data;
    },
    enabled: !!id,
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string | number; [key: string]: any }) => {
      const { data } = await api.put(`/subscriptions/${id}`, updateData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ['occurrences', String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ['catchUpOccurrences'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Live Recurrence Preview Query (§2.5)
 */
export const useGetRecurrencePreview = (
  params: {
    start_date?: string;
    frequency?: string;
    interval_count?: number;
    by_month_day?: number;
    by_weekday?: number;
    end_mode?: string;
    end_date?: string;
    occurrences_total?: number;
    count?: number;
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['recurrencePreview', params],
    queryFn: async () => {
      const { data } = await api.get<{ dates: string[] }>('/subscriptions/preview', { params });
      return data.dates;
    },
    enabled: enabled && !!params.start_date,
    staleTime: 60 * 1000,
  });
};

/**
 * Occurrences Timeline Query (§2.5)
 */
export const useGetOccurrences = (
  subscriptionId: string | number,
  params?: {
    status?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: ['occurrences', String(subscriptionId), params],
    queryFn: async () => {
      const { data } = await api.get<GetOccurrencesResponse>(`/subscriptions/${subscriptionId}/occurrences`, {
        params
      });
      return data;
    },
    enabled: !!subscriptionId,
  });
};

/**
 * Pay Occurrence Mutation (§2.5)
 */
export const usePayOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      occurrenceId,
      amount,
      date,
      category_id,
      notes
    }: {
      subscriptionId: string | number;
      occurrenceId: number;
      amount?: number;
      date?: string;
      category_id?: number | null;
      notes?: string;
    }) => {
      const { data } = await api.post(`/subscriptions/${subscriptionId}/occurrences/${occurrenceId}/pay`, {
        amount,
        date,
        category_id,
        notes
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', String(variables.subscriptionId)] });
      queryClient.invalidateQueries({ queryKey: ['occurrences', String(variables.subscriptionId)] });
      queryClient.invalidateQueries({ queryKey: ['catchUpOccurrences'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

/**
 * Skip Occurrence Mutation (§2.5)
 */
export const useSkipOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      occurrenceId,
      reason
    }: {
      subscriptionId: string | number;
      occurrenceId: number;
      reason?: string;
    }) => {
      const { data } = await api.post(`/subscriptions/${subscriptionId}/occurrences/${occurrenceId}/skip`, {
        reason
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', String(variables.subscriptionId)] });
      queryClient.invalidateQueries({ queryKey: ['occurrences', String(variables.subscriptionId)] });
      queryClient.invalidateQueries({ queryKey: ['catchUpOccurrences'] });
    },
  });
};

/**
 * Catch-Up Missed Occurrences Query (§2.3, §2.5)
 */
export const useGetCatchUpOccurrences = () => {
  return useQuery({
    queryKey: ['catchUpOccurrences'],
    queryFn: async () => {
      const { data } = await api.get<{ data: CatchUpOccurrence[]; totalMissed: number }>('/subscriptions/catch-up');
      return data;
    },
  });
};

/**
 * Bulk Catch-Up Mutation (§2.5)
 */
export const useBulkCatchUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      occurrence_ids
    }: {
      action: 'pay' | 'skip';
      occurrence_ids: number[];
    }) => {
      const { data } = await api.post<{ success: boolean; processedCount: number; message: string }>(
        '/subscriptions/catch-up/bulk',
        { action, occurrence_ids }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['catchUpOccurrences'] });
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

/**
 * Undo Payment Mutation (§1.1, §2.5)
 */
export const useUndoSubscriptionPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string | number) => {
      const { data } = await api.post(`/subscriptions/${id}/undo-payment`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions', String(id)] });
      queryClient.invalidateQueries({ queryKey: ['occurrences', String(id)] });
      queryClient.invalidateQueries({ queryKey: ['catchUpOccurrences'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

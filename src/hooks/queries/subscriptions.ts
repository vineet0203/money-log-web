import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface SubscriptionData {
  id: number;
  user_id: number;
  name: string;
  amount: string;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  next_billing_date: string;
  status: 'active' | 'cancelled';
  category_id: number | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  days_left: number;
  computed_status: 'Ongoing' | 'Upcoming' | 'Inactive';
  is_reminder_on: boolean | number;
  reminder_days: number;
  is_sms_enabled: boolean | number;
  is_email_enabled: boolean | number;
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
    },
  });
};

export const useGetSubscriptionDetails = (id: string) => {
  return useQuery({
    queryKey: ['subscriptions', id, 'details'],
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
    },
  });
};

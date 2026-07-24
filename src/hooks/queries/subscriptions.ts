import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

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
}

export interface SubscriptionStats {
  ongoing_count: string;
  upcoming_count: string;
  inactive_count: string;
  total_count: string;
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

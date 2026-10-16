import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

// 1. Get Unread Notifications Count
export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['unreadNotificationsCount'],
    queryFn: async () => {
      const response = await api.get('/notifications/unread-count');
      return response.data as { unreadCount: number };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// 2. Notification Interfaces
export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}

export interface InfiniteNotificationsParams {
  limit?: number;
  unread_only?: boolean;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'alert' | 'info';
  link_url?: string | null;
  is_read: number;
  created_at: string;
}

export interface NotificationsResponse {
  data: Notification[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  unreadCount?: number;
}

// 3. Paginated Notifications Query
export const useGetNotifications = (
  params: GetNotificationsParams = { page: 1, limit: 20, unread_only: false }
) => {
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications', params.page, params.limit, params.unread_only],
    queryFn: async () => {
      const response = await api.get('/notifications', { params });
      return response.data as NotificationsResponse;
    },
  });
};

// 4. Infinite Scroll Notifications Query
export const useGetInfiniteNotifications = (
  params: InfiniteNotificationsParams = { limit: 10, unread_only: false }
) => {
  return useInfiniteQuery({
    queryKey: ['notifications', 'infinite', params.unread_only, params.limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get<NotificationsResponse>('/notifications', {
        params: {
          page: pageParam,
          limit: params.limit || 10,
          unread_only: params.unread_only,
        },
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
  });
};

// 5. Mark Notification as Read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
};

// 6. Mark All Notifications as Read
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.put('/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
};

// 7. Delete Notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationsCount'] });
    },
  });
};

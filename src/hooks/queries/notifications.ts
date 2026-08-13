import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// 2. Get Paginated Notifications
interface GetNotificationsParams {
  page?: number;
  limit?: number;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'alert' | 'info';
  is_read: number;
  created_at: string;
}

export const useGetNotifications = (params: GetNotificationsParams = { page: 1, limit: 20 }) => {
  return useQuery({
    queryKey: ['notifications', params.page, params.limit],
    queryFn: async () => {
      const response = await api.get('/notifications', { params });
      return response.data as {
        data: Notification[];
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
      };
    },
  });
};

// 3. Mark Notification as Read
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

// 4. Mark All Notifications as Read
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

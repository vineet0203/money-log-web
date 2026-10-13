import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { PosReceiptSettings } from '@/components/pos/settings/types';

export const POS_SETTINGS_QUERY_KEY = ['pos', 'settings'] as const;

export const useGetPosSettings = () => {
  return useQuery({
    queryKey: POS_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: PosReceiptSettings }>('/pos/settings');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useUpdatePosSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<PosReceiptSettings>) => {
      const { data } = await api.put<{ success: boolean; message: string; data: PosReceiptSettings }>('/pos/settings', payload);
      return data.data;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(POS_SETTINGS_QUERY_KEY, saved);
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useGetDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/overview');
      return data;
    },
  });
};

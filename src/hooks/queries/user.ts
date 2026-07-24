import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface UserProfile {
  id: number;
  phone_number?: string | null;
  name?: string | null;
  email?: string | null;
  profile_image_url?: string | null;
  global_sms_enabled?: boolean | number;
  global_email_enabled?: boolean | number;
  global_push_enabled?: boolean | number;
  timezone?: string;
  created_at?: string;
}

export const useGetProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData | (Partial<UserProfile> & { remove_profile_image?: boolean })) => {
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      const response = await api.put('/users/profile', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
};

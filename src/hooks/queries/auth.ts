import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

// 1. Send OTP Hook
export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      const response = await api.post('/auth/send-otp', { phone });
      return response.data;
    },
  });
};

// 2. Verify OTP Hook
interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (payload: VerifyOtpPayload) => {
      const response = await api.post('/auth/verify-otp', payload);
      // The response now contains an HttpOnly cookie and just the user object in the body
      return response.data;
    },
  });
};

// 3. Logout Hook
export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/logout');
      return response.data;
    },
  });
};

// 4. Complete Profile Hook
interface CompleteProfilePayload {
  name: string;
  email?: string;
}

export const useCompleteProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CompleteProfilePayload) => {
      const response = await api.post('/auth/complete-profile', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

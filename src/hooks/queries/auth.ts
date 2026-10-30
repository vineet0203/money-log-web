import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface VerifyEmailOtpPayload {
  email: string;
  otp: string;
}

// 1. Login Hook
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post('/auth/login', payload);
      const data = response.data;
      if (typeof window !== 'undefined' && data) {
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

// 2. Signup Hook (Dispatches 6-Digit Email OTP)
export const useSignup = () => {
  return useMutation({
    mutationFn: async (payload: SignupPayload) => {
      const response = await api.post('/auth/signup', payload);
      return response.data;
    },
  });
};

// 3. Verify Email 6-Digit OTP Hook
export const useVerifyEmailOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VerifyEmailOtpPayload) => {
      const response = await api.post('/auth/verify-email-otp', payload);
      const data = response.data;
      if (typeof window !== 'undefined' && data) {
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

// 4. Resend Email OTP Hook
export const useResendEmailOtp = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/resend-email-otp', { email });
      return response.data;
    },
  });
};

// 5. Forgot Password Hook
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    },
  });
};

// 4. Reset Password Hook
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const response = await api.post('/auth/reset-password', payload);
      return response.data;
    },
  });
};

// 5. Logout Hook
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // ignore network error on logout
      } finally {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

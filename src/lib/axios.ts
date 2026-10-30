import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
  headers: {
    'x-client-type': 'web',
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];
let isLoggingOut = false;

/**
 * Forcefully logs out the current user, clears client tokens & cookies,
 * and navigates cleanly to /login?clear=1 to break redirect loops.
 */
export function logoutUser(reason?: string) {
  if (typeof window === 'undefined') return;
  if (isLoggingOut) return;
  isLoggingOut = true;

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[Auth] Logging out user: ${reason || 'Unauthorized / Session expired'}`);
  }

  // 1. Remove tokens from localStorage
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch {
    // ignore
  }

  // 2. Clear client-accessible document cookies
  try {
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  } catch {
    // ignore
  }

  // 3. Inform backend to clear HttpOnly cookies (best effort)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  axios.post(`${apiUrl}/auth/clear-cookies`, {}, { withCredentials: true }).catch(() => {});

  // 4. Redirect with clear=1 to instruct Next.js middleware to delete cookies and render /login
  window.location.replace('/login?clear=1');
}

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor to attach access token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling 401s (token refresh or instant clean logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If there is no response or no config, simply reject
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const isLoginOrAuthAction =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/verify-email-otp') ||
      originalRequest.url?.includes('/auth/resend-email-otp') ||
      originalRequest.url?.includes('/auth/forgot-password') ||
      originalRequest.url?.includes('/auth/reset-password');

    // For login or signup action endpoints, reject directly so forms can display validation/auth errors
    if (isLoginOrAuthAction) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes('/auth/send-otp') ||
      originalRequest.url?.includes('/auth/verify-otp') ||
      originalRequest.url?.includes('/auth/clear-cookies') ||
      originalRequest.url?.includes('/auth/logout');

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      // If 401 on an auth route, or refresh token itself failed, or request was already retried -> logout immediately
      if (originalRequest._retry || originalRequest.url?.includes('/auth/refresh-token') || isAuthRoute) {
        logoutUser('401 on auth/refresh or after retry');
        return Promise.reject(error);
      }

      // Check if we have a refresh token
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      if (!refreshToken) {
        logoutUser('No refresh token present');
        return Promise.reject(error);
      }

      // If already refreshing, queue this request until the refresh finishes
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh-token', { refreshToken });
        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        if (typeof window !== 'undefined' && newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logoutUser('Refresh token invalid or expired');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

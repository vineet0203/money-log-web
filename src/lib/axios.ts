import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'x-client-type': 'web',
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor for handling 401s (token refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 Unauthorized and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to hit the refresh endpoint
        await api.post('/auth/refresh-token');
        
        processQueue(null);
        // If refresh was successful, retry the original request.
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // If refresh fails (e.g. refresh token expired), force clear cookies 
        // to prevent infinite redirect loops in middleware.
        try {
          await axios.post(
            (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api') + '/auth/clear-cookies',
            {},
            { withCredentials: true }
          );
        } catch (e) {
          // ignore error
        }
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

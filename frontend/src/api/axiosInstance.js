import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token check for auth-related endpoints
    const skipAuth = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password'
    ].some(path => config.url.endsWith(path));
    
    if (skipAuth) {
      return config;
    }

    // Get the most relevant token (admin_token takes precedence)
    const token = localStorage.getItem('admin_token') || 
                 localStorage.getItem('user_token') || 
                 localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const originalRequest = error.config;
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Don't retry if we've already retried or it's a login/register request
        if (originalRequest._retry || 
            originalRequest.url.includes('/auth/')) {
          // Clear all auth tokens and redirect to login
          localStorage.removeItem('admin_token');
          localStorage.removeItem('user_token');
          localStorage.removeItem('token');
          
          const isAuthPage = ['/login', '/register', '/admin/login'].some(path => 
            window.location.pathname.includes(path)
          );
          
          if (!isAuthPage && window.location.pathname !== '/') {
            const redirectPath = window.location.pathname.startsWith('/admin') 
              ? '/admin/login' 
              : '/login';
            window.location.href = `${redirectPath}?redirect=${encodeURIComponent(window.location.pathname)}`;
          }
          return Promise.reject(error);
        }
        
        // Mark this request as retried
        originalRequest._retry = true;
        
        try {
          // Try to refresh the token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
            const { token, user } = response.data;
            
            // Store the new token based on user role
            const storageKey = user.role === 'admin' ? 'admin_token' : 'user_token';
            localStorage.setItem(storageKey, token);
            
            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${token}`;
            
            // Retry the original request
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Clear tokens on refresh failure
          localStorage.removeItem('admin_token');
          localStorage.removeItem('user_token');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          
          if (!window.location.pathname.includes('login')) {
            window.location.href = '/login';
          }
        }
      }
      
      // Handle 403 Forbidden (for admin routes)
      if (error.response.status === 403) {
        // If trying to access admin area without admin rights
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = '/?error=admin_required';
        }
        // For non-admin routes, don't redirect, let the component handle the error
        // This prevents unwanted redirects when users get 403 for actions like canceling orders
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from 'axios';
import { pushToast } from '../context/ToastContext';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling — show toast for every API failure
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    // Auth endpoints handle their own 401 (wrong credentials, not expired session)
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password') ||
      url.includes('/auth/send-registration-otp');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Expired/invalid session — clear and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (!error.response) {
      pushToast('error', 'Network error — check your connection');
    } else {
      // Show backend error message for ALL other failures (400, 401, 403, 404, 409, 422, 500…)
      const msg = error.response.data?.message || 'Something went wrong';
      pushToast('error', msg);
    }

    return Promise.reject(error);
  }
);

export default API;

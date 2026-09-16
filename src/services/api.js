import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Base Axios instance for API communication.
 * Configured with base URL, timeouts, and interceptors for auth and error handling.
 * 
 * @type {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds Authorization Bearer token from localStorage to every request if it exists.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global API errors, formatting, and 401 Unauthorized redirects.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';

    if (status === 401) {
      // Unauthorized: Clear token and redirect to login
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      toast.error('Session expired. Please log in again.');
    } else {
      // Generic error toast for other errors
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle 401/403 and format errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error) => {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.fieldErrors) {
      return Object.values(data.fieldErrors).join(', ');
    }
    if (data.message) {
      return data.message;
    }
    if (typeof data === 'string') {
      return data;
    }
  }
  return error.message || 'An unexpected error occurred. Please try again.';
};

export default api;


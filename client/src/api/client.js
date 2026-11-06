import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor to attach Authorization Bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('geoseva_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global responses and expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean local auth token
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/admin')) {
        localStorage.removeItem('geoseva_token');
        localStorage.removeItem('geoseva_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

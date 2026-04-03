// Axios instance with JWT interceptor for all API calls
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach Bearer token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login page when the server returns 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bt_token');
      localStorage.removeItem('bt_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

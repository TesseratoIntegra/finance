import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Gastos
export const gastosAPI = {
  getAll: () => api.get('/gastos/'),
  create: (data) => api.post('/gastos/', data),
  update: (id, data) => api.put(`/gastos/${id}/`, data),
  delete: (id) => api.delete(`/gastos/${id}/`),
  markAsPaid: (id) => api.patch(`/gastos/${id}/mark-paid/`),
};

// Receitas
export const receitasAPI = {
  getAll: () => api.get('/receitas/'),
  create: (data) => api.post('/receitas/', data),
  update: (id, data) => api.put(`/receitas/${id}/`, data),
  delete: (id) => api.delete(`/receitas/${id}/`),
};

// Dashboard
export const dashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics/'),
  getPlanning: () => api.get('/dashboard/planning/'),
  updateCaixa: (value) => api.post('/dashboard/caixa/', { value }),
};

export default api;


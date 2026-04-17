import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Interceptor para adicionar o token em todas as requisições se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@SIGR:token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;

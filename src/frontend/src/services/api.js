import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

const PUBLIC_ENDPOINTS = [
  '/usuarios/login/',
  '/usuarios/registro/',
  '/usuarios/recuperar-senha/enviar/',
  '/usuarios/recuperar-senha/validar/',
  '/usuarios/recuperar-senha/redefinir/',
];

const PUBLIC_EXACT_ENDPOINTS = [
  '/usuarios/setores/',
  '/usuarios/setores',
];

// Evita enviar token expirado/invalido em rotas publicas.
api.interceptors.request.use((config) => {
  const requestPath = config.url || '';
  const isPublicEndpoint =
    PUBLIC_ENDPOINTS.some((publicPath) => requestPath.startsWith(publicPath)) ||
    PUBLIC_EXACT_ENDPOINTS.includes(requestPath.split('?')[0]);

  if (isPublicEndpoint) {
    if (config.headers) {
      delete config.headers.Authorization;
    }
    return config;
  }

  const token = localStorage.getItem('@SIGR:token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@SIGR:token');
      localStorage.removeItem('@SIGR:user');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

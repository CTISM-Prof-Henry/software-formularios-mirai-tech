import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

const PUBLIC_ENDPOINTS = [
  '/usuarios/login/',
  '/usuarios/registro/',
  '/usuarios/setores/',
  '/usuarios/recuperar-senha/enviar/',
  '/usuarios/recuperar-senha/validar/',
  '/usuarios/recuperar-senha/redefinir/',
];

// Evita enviar token expirado/invalido em rotas publicas.
api.interceptors.request.use((config) => {
  const requestPath = config.url || '';
  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((publicPath) =>
    requestPath.startsWith(publicPath)
  );

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

export default api;

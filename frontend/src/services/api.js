import axios from 'axios';

const API_BASE_URL = 'https://goodgoals-natarajanreformed-backend.hf.space/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password) => api.post('/auth/register', { email, password }),
};

export const chatApi = {
  getSidebar: () => api.get('/chats/sidebar'),
  syncThread: (threadId, messages, currentPrompt) =>
    api.post('/chats/sync', { threadId, messages, currentPrompt }),
  resolveReference: (pathString) =>
    api.post('/chats/resolve-reference', { pathString }),
};

export default api;

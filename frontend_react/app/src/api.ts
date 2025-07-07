// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // ou ton backend déployé
  withCredentials: true, // si tu gères l'authentification par cookie
});

// Add interceptor to include JWT token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_Token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;

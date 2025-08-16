// frontend/plugins/axios.js
import axios from 'axios';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  axios.defaults.baseURL = config.public.apiBaseUrl;

  // Interceptor para añadir el token JWT a cada solicitud
  axios.interceptors.request.use(
    (config) => {
      const token = authStore.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor para manejar respuestas de error (ej. 401 Unauthorized)
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Si el token expira o no es válido, cerrar sesión
        authStore.logout();
        // Redirigir al usuario a la página de login
        useRouter().push('/login');
        alert('Tu sesión ha expirado o no es válida. Por favor, inicia sesión de nuevo.');
      }
      return Promise.reject(error);
    }
  );

  return {
    provide: {
      axios: axios
    }
  };
});
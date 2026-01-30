// frontend/stores/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null, // Podría ser { id, username }
    isAuthenticated: false,
    error: null,
  }),
  actions: {
    async login(credentials) {
      try {
        this.error = null;  //NUXT_PUBLIC_API_BASE_URL
        console.log(credentials)
        const response = await axios.post('/auth/login', credentials);
        console.log(response)
        const { token, user } = response.data;
        
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;

        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', token);
          localStorage.setItem('authUser', JSON.stringify(user)); // Guardar también los datos del usuario
        }
        
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error de inicio de sesión.';
        this.clearAuthData();
        return false;
      }
    },
    
    async logout() {
      try {
        // Opcional: Llamada al endpoint de logout si el backend lo requiere
        await axios.post('/auth/logout');
      } catch (error) {
        console.error('Error al intentar cerrar sesión en el backend:', error.message);
        // A pesar del error en el backend, forzamos el logout en el frontend
      } finally {
        this.clearAuthData();
        // Puedes agregar una notificación aquí
        // useRouter().push('/login'); // Redirigir al login
      }
    },

    initializeAuth() {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
          try {
            this.token = storedToken;
            this.user = JSON.parse(storedUser);
            this.isAuthenticated = true;
            // Opcional: podrías hacer una llamada a una ruta protegida simple para validar el token con el backend
          } catch (e) {
            console.error('Error al parsear datos de usuario de localStorage:', e);
            this.clearAuthData();
          }
        }
      }
    },

    clearAuthData() {
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    },
  }
});
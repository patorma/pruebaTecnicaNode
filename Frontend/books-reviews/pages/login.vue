<template>
  <div class="login-page">
    <div class="login-container">
      <h1>Book Reviews</h1>
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Usuario:</label>
          <input type="text" id="username" v-model="username" required autocomplete="username" />
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="password" required autocomplete="current-password" />
        </div>
        <button type="submit" :disabled="authStore.loading">
          <span v-if="authStore.loading">Iniciando...</span>
          <span v-else>Login</span>
        </button>
        <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>
      </form>
      <p class="register-hint">
        ¿No tienes cuenta? <a href="#" @click.prevent="register">Regístrate aquí</a> (solo para fines de prueba)
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');

onMounted(() => {
  // Si ya está autenticado, redirigir a la página principal
  authStore.initializeAuth();
  if (authStore.isAuthenticated) {
    router.push('/');
  }
});

const handleLogin = async () => {
  const success = await authStore.login({ username: username.value, password: password.value });
  if (success) {
    router.push('/'); // Redirigir a la página principal después del login
  }
};

const register = async () => {
  // Esto es solo para propósitos de prueba en el demo.
  // En una aplicación real, tendrías un formulario de registro dedicado.
  if (confirm('¿Quieres registrar este usuario? Solo para pruebas rápidas.')) {
    try {
      authStore.error = null;
      await useAxios().post('/auth/register', { username: username.value, password: password.value });
      alert('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      username.value = '';
      password.value = '';
    } catch (error) {
      authStore.error = error.response?.data?.message || 'Error al registrar.';
    }
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  @include flex-center;
  min-height: 100vh;
  background-color: var(--bg-color-light);
}

.login-container {
  background-color: white;
  padding: 40px;
  border-radius: var(--border-radius);
  @include card-shadow;
  text-align: center;
  width: 100%;
  max-width: 400px;

  h1 {
    color: var(--primary-color);
    margin-bottom: 20px;
  }

  h2 {
    margin-bottom: 30px;
    font-size: 1.8em;
  }

  .form-group {
    margin-bottom: 20px;
    text-align: left;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      box-sizing: border-box; // Incluye padding y border en el width
    }
  }

  button {
    width: 100%;
    padding: 12px;
    font-size: 1.1em;
    margin-top: 10px;
  }

  .error-message {
    color: var(--danger-color);
    margin-top: 15px;
    font-weight: bold;
  }

  .register-hint {
    margin-top: 25px;
    font-size: 0.9em;
    color: var(--text-color-light);

    a {
      color: var(--secondary-color);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
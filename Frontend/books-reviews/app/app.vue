<template>
  <div>
    <NuxtLayout>
      <header class="app-header" v-if="authStore.isAuthenticated">
        <nav>
          <NuxtLink to="/" class="nav-item">
            <font-awesome-icon :icon="['fas', 'search']" />
            Buscador
          </NuxtLink>
          <NuxtLink to="/my-library" class="nav-item">
            <font-awesome-icon :icon="['fas', 'book']" />
            Mi Biblioteca
          </NuxtLink>
        </nav>
        <div class="user-controls">
          <span v-if="authStore.user">
            <font-awesome-icon :icon="['fas', 'user']" /> {{ authStore.user.username }}
          </span>
          <button @click="handleLogout" class="logout-button">
            <font-awesome-icon :icon="['fas', 'times']" /> Cerrar Sesión
          </button>
        </div>
      </header>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';


const authStore = useAuthStore();
const router = useRouter();

// Inicializar la autenticación al cargar la app
onMounted(() => {
  authStore.initializeAuth();
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style lang="scss">
/* Estilos globales de app.vue */
.app-header {
  background-color: $primary-color;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);

  nav {
    display: flex;
    gap: 25px;
  }

  .nav-item {
    color: white;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.1em;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.2s;

    &:hover {
      color: lighten($primary-color, 20%);
    }

    &.router-link-active {
      text-decoration: underline;
    }
  }

  .user-controls {
    display: flex;
    align-items: center;
    gap: 15px;
    span {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.95em;
    }
  }

  .logout-button {
    background-color: $danger-color;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: $border-radius;
    cursor: pointer;
    font-size: 0.9em;
    display: flex;
    align-items: center;
    gap: 5px;
    &:hover {
      background-color: darken($danger-color, 10%);
    }
  }
}
</style>
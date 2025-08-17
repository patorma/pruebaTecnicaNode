<template>
  <div class="container search-page">
    <MyLibraryButton />
    <NotificationToast :message="booksStore.successMessage" type="success" />
    <NotificationToast :message="booksStore.error" type="error" />

    <div class="search-section">
      <h1>Buscador de Libros</h1>
      <form @submit.prevent="handleSearch" class="search-form">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Escribe el nombre de un Libro para continuar"
        />
        <button type="submit">
          <font-awesome-icon :icon="['fas', 'search']" /> Buscar
        </button>
      </form>

      <div v-if="booksStore.lastSearches.length > 0" class="last-searches">
        <h3>Últimas 5 búsquedas:</h3>
        <ul>
          <li v-for="(query, index) in booksStore.lastSearches" :key="index">
            <a @click="setSearchQueryAndSearch(query)">{{ query }}</a>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="booksStore.loading" class="loading-message">
      Cargando resultados...
    </div>

    <div v-if="booksStore.searchResults.length > 0" class="search-results">
      <h2>Resultados de Búsqueda:</h2>
      <div class="book-grid">
        <div v-for="book in booksStore.searchResults" :key="book.openLibraryId" class="book-card-container">
          <div class="book-card" @click="viewBookDetails(book.openLibraryId)">
            <img :src="getCoverImage(book)" :alt="book.title" />
            <h3>{{ book.title }}</h3>
            <p>{{ book.author }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!booksStore.loading && hasSearched && booksStore.error === null" class="no-results">
      <p>No encontramos libros con el título ingresado.</p>
    </div>

    <BookDetail
      v-if="booksStore.selectedBook"
      :book="booksStore.selectedBook"
      @close="booksStore.clearSelectedBook()"
      @book-saved="handleBookSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBooksStore } from '../stores/books';
import { useAuthStore } from '../stores/auth';
import BookDetail from '~/components/BookDetail.vue';
import MyLibraryButton from '~/components/MyLibraryButton.vue';
import NotificationToast from '~/components/NotificationToast.vue';

const booksStore = useBooksStore();
const authStore = useAuthStore();
const router = useRouter();

const searchQuery = ref('');
const hasSearched = ref(false); // Para mostrar el mensaje "no encontramos libros" solo después de una búsqueda

// Inicializar autenticación al cargar la página
onMounted(async () => {
  authStore.initializeAuth();
  if (!authStore.isAuthenticated) {
    router.push('/login'); // Redirigir al login si no está autenticado
  } else {
    await booksStore.fetchLastSearches();
  }
});

const handleSearch = async () => {
  hasSearched.value = true;
  await booksStore.searchBooks(searchQuery.value);
};

const setSearchQueryAndSearch = (query) => {
  searchQuery.value = query;
  handleSearch();
};

const viewBookDetails = async (openLibraryId) => {
  await booksStore.selectBook(openLibraryId);
};

const getCoverImage = (book) => {
  // Priorizar portada de mi biblioteca si existe
  if (book.inMyLibrary && book.coverUrl) {
    // Si viene del backend con la URL de mi biblioteca
    return `${useRuntimeConfig().public.apiBaseUrl}${book.coverUrl}`;
  } else if (book.coverUrl) {
    // Si viene de Open Library
    return book.coverUrl;
  }
  return 'https://via.placeholder.com/100x150?text=No+Cover'; // Imagen por defecto
};

const handleBookSaved = () => {
  booksStore.setSuccess('Libro guardado en tu biblioteca!');
  // Puedes actualizar la lista de búsqueda si necesitas reflejar el "inMyLibrary"
  // o simplemente confiar en que el usuario verá el cambio al volver a buscar.
};
</script>

<style lang="scss" scoped>
.search-page {
  text-align: center;
  padding-top: 50px; // Espacio para el botón de mi biblioteca

  .search-section {
    margin-bottom: 40px;
    .search-form {
      display: flex;
      justify-content: center;
      gap: 10px;
      input {
        width: 400px;
        max-width: 80%;
      }
    }
  }

  .last-searches {
    margin-top: 20px;
    ul {
      list-style: none;
      padding: 0;
      display: flex;
      justify-content: center;
      gap: 15px;
      flex-wrap: wrap;
      li {
        a {
          color: $secondary-color;
          text-decoration: none;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .loading-message {
    margin-top: 20px;
    font-style: italic;
  }

  .search-results {
    margin-top: 30px;
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
      justify-content: center;
    }
    .book-card-container {
      display: flex;
      justify-content: center;
    }
    .book-card {
      background-color: white;
      @include card-shadow;
      cursor: pointer;
      width: 180px; // Ancho fijo para las tarjetas
      height: 300px; // Altura fija para mantener el layout
      overflow: hidden; // Oculta contenido si se desborda
      display: flex;
      flex-direction: column;
      justify-content: space-between; // Alinea el contenido
      
      img {
        max-width: 120px;
        height: 180px; // Altura fija para las portadas
        object-fit: contain; // Asegura que la imagen se vea completa
        margin: 0 auto 10px;
        display: block; // Elimina el espacio extra debajo de la imagen
      }
      h3 {
        font-size: 1.1em;
        margin: 0 0 5px;
        white-space: nowrap; // Evita que el título se rompa
        overflow: hidden;
        text-overflow: ellipsis; // Añade puntos suspensivos
      }
      p {
        font-size: 0.85em;
        color: $text-color-light;
        margin: 0;
      }

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
    }
  }

  .no-results {
    margin-top: 20px;
    font-weight: bold;
    color: $danger-color;
  }
}
</style>
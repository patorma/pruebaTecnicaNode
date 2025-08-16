<template>
  <div class="container my-library-page">
    <NotificationToast :message="booksStore.successMessage" type="success" />
    <NotificationToast :message="booksStore.error" type="error" />

    <div class="header-section">
      <h1>Mi Biblioteca</h1>
      <NuxtLink to="/">
        <button>
          <font-awesome-icon :icon="['fas', 'home']" /> Ir al Buscador
        </button>
      </NuxtLink>
    </div>

    <div class="controls-section">
      <div class="search-filter">
        <input type="text" v-model="librarySearchQuery" placeholder="Buscar por título o autor" @input="applyFilters" />
      </div>
      <div class="filters">
        <label for="sortBy">Ordenar por:</label>
        <select id="sortBy" v-model="sortBy" @change="applyFilters">
          <option value="">Más Recientes</option>
          <option value="rating_asc">Calificación Ascendente</option>
          <option value="rating_desc">Calificación Descendente</option>
        </select>
        <label>
          <input type="checkbox" v-model="excludeNoReview" @change="applyFilters" />
          Excluir sin reseña
        </label>
      </div>
    </div>

    <div v-if="booksStore.loading" class="loading-message">
      Cargando tu biblioteca...
    </div>

    <div v-else-if="booksStore.myLibrary.length === 0" class="no-results">
      <p>Aún no has guardado ningún libro en tu biblioteca. ¡Ve al buscador para añadir algunos!</p>
    </div>

    <div v-else class="book-list">
      <div v-for="book in booksStore.myLibrary" :key="book._id" class="library-book-item">
        <div class="book-info">
          <img :src="getCoverImage(book)" :alt="book.title" class="library-cover" />
          <div class="text-info">
            <h3>{{ book.title }}</h3>
            <p><strong>Autor:</strong> {{ book.author || 'Desconocido' }}</p>
            <p><strong>Año:</strong> {{ book.firstPublishYear || 'Desconocido' }}</p>
            <div class="review-rating">
              <p><strong>Mi Reseña:</strong> {{ book.review || 'No hay reseña.' }}</p>
              <p><strong>Mi Calificación:</strong> <StarRating :model-value="book.rating" :editable="false" /></p>
            </div>
          </div>
        </div>
        <div class="book-actions">
          <button @click="editBook(book)" class="edit-button">
            <font-awesome-icon :icon="['fas', 'edit']" /> Editar
          </button>
          <button @click="confirmDelete(book)" class="delete-button">
            <font-awesome-icon :icon="['fas', 'trash']" /> Eliminar
          </button>
        </div>
      </div>
    </div>

    <div v-if="editingBook" class="book-detail-modal" @click.self="closeEditModal">
      <div class="modal-content">
        <button class="close-button" @click="closeEditModal">
          <font-awesome-icon :icon="['fas', 'times']" />
        </button>
        <h2>Editar Reseña y Calificación</h2>
        <div class="book-details-inner">
          <div class="cover-section">
            <img :src="getCoverImage(editingBook)" :alt="editingBook.title" class="detail-cover" />
          </div>
          <div class="info-section">
            <h3>{{ editingBook.title }}</h3>
            <p><strong>Autor:</strong> {{ editingBook.author || 'Desconocido' }}</p>
            <p><strong>Año:</strong> {{ editingBook.firstPublishYear || 'Desconocido' }}</p>

            <h4>Tu Reseña:</h4>
            <textarea
              v-model="editReviewText"
              placeholder="Edita tu reseña (máx. 500 caracteres)"
              maxlength="500"
              rows="5"
            ></textarea>
            <p class="char-count">{{ editReviewText.length }}/500</p>

            <h4>Tu Calificación:</h4>
            <StarRating v-model="editRating" :editable="true" />
            
            <button @click="saveEditedBook" :disabled="booksStore.loading">
              <span v-if="booksStore.loading">Guardando cambios...</span>
              <span v-else>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useBooksStore } from '~/stores/books';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import StarRating from '~/components/StarRating.vue';
import NotificationToast from '~/components/NotificationToast.vue';

const booksStore = useBooksStore();
const authStore = useAuthStore();
const router = useRouter();

const librarySearchQuery = ref('');
const sortBy = ref(''); // '', 'rating_asc', 'rating_desc'
const excludeNoReview = ref(false);

const editingBook = ref(null);
const editReviewText = ref('');
const editRating = ref(0);

// Inicializar autenticación y cargar biblioteca
onMounted(async () => {
  authStore.initializeAuth();
  if (!authStore.isAuthenticated) {
    router.push('/login');
  } else {
    await booksStore.fetchMyLibrary();
  }
});

// Watch para aplicar filtros cuando cambian
watch([librarySearchQuery, sortBy, excludeNoReview], () => {
  applyFilters();
});

const applyFilters = async () => {
  const filters = {
    q: librarySearchQuery.value,
    sortBy: sortBy.value,
    excludeNoReview: excludeNoReview.value,
  };
  await booksStore.fetchMyLibrary(filters);
};

const getCoverImage = (book) => {
  // Las portadas en la biblioteca ya están en base64 en la BD
  // Por lo tanto, el backend nos las dará como base64 data-URL o como URL del endpoint especial
  const config = useRuntimeConfig();
  if (book.coverBase64) {
    return book.coverBase64; // Si ya es una URL base64
  } else if (book._id) {
    // Si la portada es provista por un endpoint especial del backend (cuando es un libro guardado)
    return `${config.public.apiBaseUrl}/books/library/front-cover/${book._id}`;
  }
  return 'https://via.placeholder.com/100x150?text=No+Cover';
};


const editBook = (book) => {
  editingBook.value = { ...book }; // Copia profunda para no modificar el original directamente
  editReviewText.value = book.review || '';
  editRating.value = book.rating || 0;
};

const closeEditModal = () => {
  editingBook.value = null;
};

const saveEditedBook = async () => {
  if (!editingBook.value) return;

  const success = await booksStore.updateBookReview(editingBook.value._id, {
    review: editReviewText.value,
    rating: editRating.value,
  });

  if (success) {
    booksStore.setSuccess('Libro actualizado exitosamente.');
    closeEditModal();
  }
};

const confirmDelete = async (book) => {
  if (confirm(`¿Estás seguro de que quieres eliminar "${book.title}" de tu biblioteca?`)) {
    const success = await booksStore.deleteBookFromLibrary(book._id);
    if (success) {
      booksStore.setSuccess('Libro eliminado de tu biblioteca.');
    }
  }
};
</script>

<style lang="scss" scoped>
.my-library-page {
  padding-top: 20px;

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h1 {
      margin: 0;
    }
  }

  .controls-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 30px;
    padding: 15px;
    background-color: white;
    border-radius: var(--border-radius);
    @include card-shadow;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .search-filter input {
      width: 100%;
      @media (min-width: 768px) {
        width: 250px;
      }
    }

    .filters {
      display: flex;
      align-items: center;
      gap: 15px;

      select, input[type="checkbox"] {
        padding: 8px;
        border-radius: var(--border-radius);
        border: 1px solid var(--border-color);
      }
    }
  }

  .loading-message, .no-results {
    text-align: center;
    margin-top: 40px;
    font-style: italic;
    color: var(--text-color-light);
  }

  .book-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    }
  }

  .library-book-item {
    background-color: white;
    @include card-shadow;
    padding: 20px;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    gap: 15px;

    @media (min-width: 600px) {
      flex-direction: row;
      align-items: flex-start;
    }

    .book-info {
      display: flex;
      gap: 15px;
      flex-grow: 1;

      .library-cover {
        width: 90px;
        height: 130px;
        object-fit: contain;
        border-radius: var(--border-radius);
        flex-shrink: 0;
      }

      .text-info {
        flex-grow: 1;
        h3 {
          margin-top: 0;
          font-size: 1.4em;
          color: var(--primary-color);
        }
        p {
          margin: 5px 0;
          font-size: 0.9em;
        }
        .review-rating {
          margin-top: 10px;
          p {
            margin-bottom: 5px;
            strong {
              display: block; // Nueva línea para "Mi Reseña:"
            }
          }
        }
      }
    }

    .book-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      
      @media (min-width: 600px) {
        margin-top: 0;
        flex-direction: column; // Botones apilados en vista de escritorio
        justify-content: center;
      }

      button {
        padding: 8px 12px;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        gap: 5px;

        &.edit-button {
          background-color: var(--secondary-color);
        }
        &.delete-button {
          background-color: var(--danger-color);
        }
      }
    }
  }
}

// Estilos para el modal de edición (reutilizados del BookDetail)
.book-detail-modal {
  .modal-content {
    .book-details-inner {
      flex-direction: column; // Siempre en columna para la edición
      text-align: center;
      
      .cover-section {
        .detail-cover {
          max-width: 120px;
          height: auto;
        }
      }
      .info-section {
        h3, p {
          text-align: center;
        }
        textarea {
          width: 90%; // Ajuste para el modal
          margin: 0 auto;
        }
        .char-count {
          text-align: center;
        }
      }
    }
  }
}
</style>
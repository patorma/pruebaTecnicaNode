<template>
  <div class="book-detail-modal" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">
        <font-awesome-icon :icon="['fas', 'times']" />
      </button>
      
      <h2>Detalle del Libro</h2>
      <div v-if="book" class="book-details-inner">
        <div class="cover-section">
          <img :src="getCoverImage(book)" :alt="book.title" class="detail-cover" />
        </div>
        <div class="info-section">
          <h3>{{ book.title }}</h3>
          <p><strong>Autor:</strong> {{ book.author || 'Desconocido' }}</p>
          <p><strong>Año de Publicación:</strong> {{ book.firstPublishYear || 'Desconocido' }}</p>

          <template v-if="!isInMyLibrary">
            <h4>Tu Reseña:</h4>
            <textarea
              v-model="reviewText"
              placeholder="Escribe tu pequeña reseña aquí (máx. 500 caracteres)"
              maxlength="500"
              rows="5"
            ></textarea>
            <p class="char-count">{{ reviewText.length }}/500</p>

            <h4>Tu Calificación:</h4>
            <StarRating v-model="rating" :editable="true" />
            
            <button @click="saveBook" :disabled="booksStore.loading">
              <span v-if="booksStore.loading">Guardando...</span>
              <span v-else>Guardar en Mi Biblioteca</span>
            </button>
          </template>
          <template v-else>
            <p>Este libro ya está en tu biblioteca.</p>
            <NuxtLink :to="`/my-library`">
              <button>Ver en Mi Biblioteca</button>
            </NuxtLink>
          </template>
        </div>
      </div>
      <div v-else>
        <p>No se encontraron detalles del libro.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useBooksStore } from '~/stores/books';
import StarRating from '~/components/StarRating.vue';

const props = defineProps({
  book: Object
});

const emit = defineEmits(['close', 'book-saved']);

const booksStore = useBooksStore();
const reviewText = ref('');
const rating = ref(0);

const isInMyLibrary = computed(() => props.book && props.book.inMyLibrary);

// Resetea los campos cada vez que el libro cambia
watch(() => props.book, (newBook) => {
  if (newBook) {
    reviewText.value = newBook.review || '';
    rating.value = newBook.rating || 0;
  }
}, { immediate: true });


const getCoverImage = (book) => {
  // Función para resolver la URL de la portada, similar a la de index.vue
  const config = useRuntimeConfig();
  if (book.inMyLibrary && book.coverUrl) {
    return `${config.public.apiBaseUrl}${book.coverUrl}`;
  } else if (book.coverUrl) {
    return book.coverUrl;
  }
  return 'https://via.placeholder.com/150x200?text=No+Cover';
};


const saveBook = async () => {
  const bookData = {
    openLibraryId: props.book.openLibraryId,
    title: props.book.title,
    author: props.book.author,
    firstPublishYear: props.book.firstPublishYear,
    coverUrl: getCoverImage(props.book), // Pasa la URL original para que el backend la convierta
    review: reviewText.value,
    rating: rating.value,
  };

  const success = await booksStore.saveBookToLibrary(bookData);
  if (success) {
    emit('book-saved'); // Emitir evento para que el padre sepa que se guardó
    emit('close'); // Cerrar el modal
  }
};
</script>

<style lang="scss" scoped>
.book-detail-modal {
  // Estilos ya definidos en main.scss
  .modal-content {
    display: flex;
    flex-direction: column;
    align-items: center; // Centrar el contenido horizontalmente
    text-align: center; // Centrar el texto

    .book-details-inner {
      display: flex;
      flex-direction: column; // Por defecto en columna
      align-items: center;
      gap: 20px;
      width: 100%;

      @media (min-width: 768px) {
        flex-direction: row; // En fila en pantallas más grandes
        text-align: left;
        align-items: flex-start;
      }

      .cover-section {
        flex-shrink: 0; // Evita que la imagen se encoja
        .detail-cover {
          max-width: 150px;
          height: auto;
          border-radius: $border-radius;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      }

      .info-section {
        flex-grow: 1; // Toma el espacio restante
        width: 100%;

        h3 {
          margin-top: 0;
          font-size: 1.6em;
        }
        p {
          margin-bottom: 8px;
        }

        textarea {
          width: 100%;
          min-height: 100px;
          resize: vertical;
          margin-bottom: 5px;
        }
        .char-count {
          font-size: 0.8em;
          color: $text-color-light;
          text-align: right;
          margin-bottom: 15px;
        }
        button {
          margin-top: 20px;
        }
      }
    }
  }
}
</style>
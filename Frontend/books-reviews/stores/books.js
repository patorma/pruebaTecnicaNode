// frontend/stores/books.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useBooksStore = defineStore('books', {
  state: () => ({
    searchResults: [],
    lastSearches: [],
    myLibrary: [],
    selectedBook: null,
    loading: false,
    error: null,
    successMessage: null,
  }),
  actions: {
    async searchBooks(query) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`/books/search?q=${encodeURIComponent(query)}`);
        this.searchResults = response.data;
        // Actualizar últimas búsquedas
        if (!this.lastSearches.includes(query)) {
          this.lastSearches.unshift(query);
          if (this.lastSearches.length > 5) {
            this.lastSearches.pop();
          }
        }
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al buscar libros.';
        this.searchResults = [];
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchLastSearches() {
      // Este endpoint debería ser llamado en el mounted de la página principal
      try {
        const response = await axios.get('/books/last-search');
        this.lastSearches = response.data;
      } catch (error) {
        console.error('Error al cargar últimas búsquedas:', error.message);
        // Podrías manejar el error de forma más elegante
      }
    },

    async selectBook(bookId) {
      // Esto podría cargar detalles adicionales del libro si la Open Library API
      // tiene más información en su endpoint de detalles de libro por ID de obra.
      // Por ahora, solo almacenamos el ID y la información básica ya disponible.
      this.selectedBook = this.searchResults.find(b => b.openLibraryId === bookId);
      if (!this.selectedBook) {
        // Si no se encuentra en los resultados actuales, podría ser un libro de la biblioteca
        // o un caso donde se llega directamente a /book/[id]
        try {
          // Intentar obtener de la biblioteca si no está en searchResults
          const libraryBook = await axios.get(`/books/my-library/${bookId}`);
          this.selectedBook = libraryBook.data;
        } catch (e) {
          console.error('Libro no encontrado en resultados ni en biblioteca:', e);
          this.error = 'Libro no encontrado.';
          this.selectedBook = null;
        }
      }
    },

    clearSelectedBook() {
      this.selectedBook = null;
    },

    async saveBookToLibrary(bookData) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        const response = await axios.post('/books/my-library', bookData);
        this.successMessage = response.data.message;
        // Opcional: recargar la biblioteca después de guardar
        // await this.fetchMyLibrary(); 
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al guardar el libro.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchMyLibrary(filters = {}) {
      this.loading = true;
      this.error = null;
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await axios.get(`/books/my-library?${params}`);
        this.myLibrary = response.data;
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar mi biblioteca.';
        this.myLibrary = [];
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updateBookReview(bookId, reviewData) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        const response = await axios.put(`/books/my-library/${bookId}`, reviewData);
        this.successMessage = response.data.message;
        // Actualizar el libro en la lista local de myLibrary
        const index = this.myLibrary.findIndex(b => b._id === bookId);
        if (index !== -1) {
          this.myLibrary[index] = response.data.book;
        }
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar la reseña.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async deleteBookFromLibrary(bookId) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        const response = await axios.delete(`/books/my-library/${bookId}`);
        this.successMessage = response.data.message;
        this.myLibrary = this.myLibrary.filter(book => book._id !== bookId);
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar el libro.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Para mostrar notificaciones (toast)
    setSuccess(message) {
      this.successMessage = message;
      setTimeout(() => { this.successMessage = null; }, 3000); // Borrar después de 3 segundos
    },
    setError(message) {
      this.error = message;
      setTimeout(() => { this.error = null; }, 3000);
    }
  }
});
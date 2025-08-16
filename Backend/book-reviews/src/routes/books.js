// backend/routes/books.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authenticateToken = require('../middleware/auth');

// Rutas sin autenticación (búsqueda inicial)
router.get('/search', authenticateToken, bookController.searchBooks); // La búsqueda puede estar protegida si prefieres
router.get('/last-search', authenticateToken, bookController.getLastSearches); // Las últimas búsquedas deben ser por usuario

// Rutas protegidas (Mi Biblioteca)
router.post('/my-library', authenticateToken, bookController.addBookToMyLibrary);
router.get('/my-library', authenticateToken, bookController.getMyLibrary);
router.get('/my-library/:id', authenticateToken, bookController.getBookFromMyLibrary);
router.get('/library/front-cover/:id', bookController.getBookFromMyLibrary); // Endpoint especial para portadas guardadas
router.put('/my-library/:id', authenticateToken, bookController.updateBookInMyLibrary);
router.delete('/my-library/:id', authenticateToken, bookController.deleteBookFromMyLibrary);

module.exports = router;
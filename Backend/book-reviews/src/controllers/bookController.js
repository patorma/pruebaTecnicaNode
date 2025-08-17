// backend/controllers/bookController.js
const Book = require('../models/Book');
const openLibraryService = require('../services/libraryService');
const axios = require('axios'); // Para descargar imágenes y convertir a base64

// Función auxiliar para convertir URL de imagen a Base64
const imageUrlToBase64 = async (url) => {
  if (!url) return null;
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    return `data:${response.headers['content-type']};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Error al convertir imagen a Base64:', url, error.message);
    return null;
  }
};

// GET /api/books/search?q=:nombreDelLibro
exports.searchBooks = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'Parámetro de búsqueda (q) requerido.' });
  }

  try {
    // Guardar la última búsqueda (simple, sin vinculación a usuario en este ejemplo)
    // En un entorno real, esto iría en una colección separada o en el modelo de usuario.
    // Para las 5 últimas búsquedas por usuario, necesitarías una colección `SearchHistory` o
    // un campo `lastSearches` en el modelo `User` que se actualice aquí.
    console.log(` Búsqueda de libros: "${q}"`);

    const openLibraryResults = await openLibraryService.searchBooks(q);
    
    // Verificar si algún libro ya está en "Mi Biblioteca"
    const bookIds = openLibraryResults.map(book => book.bookId);
    const existingBooks = await Book.find({ bookId: { $in: bookIds }, userId: req.user.id }); // Filtrar por usuario si hay auth

    //Recorre cada libro que vino desde Open Library
    const resultsWithCovers = await Promise.all(openLibraryResults.map(async (olBook) => {
         //Busca si ese libro (olBook) ya existe en la base de datos local (existingBooks).
        const existingBook = existingBooks.find(eb => eb.bookId=== olBook.bookId);
      
      let coverUrl = null;
      if (existingBook && existingBook.coverBase64) {
        // Si el libro existe en mi biblioteca y tiene portada en base64
        coverUrl = `/api/books/library/front-cover/${existingBook._id}`; // Usar el ID de MongoDB
      } else if (olBook.coverId) {
        // Si no, usar la portada de Open Library
        coverUrl = openLibraryService.getPortadaUrl(olBook.coverId);
      }
      return { ...olBook, coverUrl, inMyLibrary: !!existingBook };
    }));
    
    res.json(resultsWithCovers);
  } catch (error) {
    console.error(' Error al buscar libros:', error.message);
    res.status(500).json({ message: 'Error al buscar libros.' });
  }
};

// GET /api/books/last-search/ (Necesita una colección o campo para guardar búsquedas)
exports.getLastSearches = async (req, res) => {

  console.log(' Recuperando últimas búsquedas (simulado).');
  res.json([
    "Harry Potter", "El Señor de los Anillos", "Fundación", "Cien años de soledad", "Don Quijote"
  ]);
};

// POST /api/books/my-library
exports.addBookToMyLibrary = async (req, res) => {
  const { bookId, title, author, yearPublication, coverUrl, review, rating } = req.body;

  if (!bookId|| !title) {
    return res.status(400).json({ message: 'Datos mínimos del libro requeridos.' });
  }

  try {
    const existingBook = await Book.findOne({ bookId, userId: req.user.id });
    if (existingBook) {
      console.log(` Libro "${title}" ya existe en la biblioteca del usuario ${req.user.email}.`);
      return res.status(409).json({ message: 'Este libro ya está en tu biblioteca.' });
    }

    const coverBase64 = await imageUrlToBase64(coverUrl);

    const newBook = new Book({
      bookId,
      title,
      author,
      yearPublication,
      coverBase64,
      review,
      rating,
      userId: req.user.id // Asigna el libro al usuario autenticado
    });

    await newBook.save();
    console.log(` Libro "${title}" (ID: ${newBook._id}) guardado en mi biblioteca para ${req.user.email}.`);
    res.status(201).json({ message: 'Libro guardado en tu biblioteca exitosamente.', book: newBook });
  } catch (error) {
    console.error(' Error al guardar libro en mi biblioteca:', error.message);
    res.status(500).json({ message: 'Error al guardar libro en tu biblioteca.', error: error.message });
  }
};

// GET /api/books/my-library/:id
exports.getBookFromMyLibrary = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, userId: req.user.id });

    if (!book) {
      console.log(` Libro con ID ${req.params.id} no encontrado en la biblioteca de ${req.user.email}.`);
      return res.status(404).json({ message: 'Libro no encontrado en tu biblioteca.' });
    }
    
    // Si la solicitud es para la portada específica, devolverla aquí
    if (req.originalUrl.includes('/front-cover/')) {
        if (book.coverBase64) {
            const base64Data = book.coverBase64.split(';base64,').pop();
            const mimeType = book.coverBase64.split(';base64,')[0].split(':')[1];
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Content-Length': Buffer.from(base64Data, 'base64').length
            });
            return res.end(Buffer.from(base64Data, 'base64'));
        } else {
            return res.status(404).json({ message: 'Portada no encontrada para este libro.' });
        }
    }

    console.log(` Recuperando libro con ID ${req.params.id} de la biblioteca de ${req.user.email}.`);
    res.json(book);
  } catch (error) {
    console.error(' Error al obtener libro de mi biblioteca:', error.message);
    res.status(500).json({ message: 'Error al obtener libro de tu biblioteca.' });
  }
};


// PUT /api/books/my-library/:id
exports.updateBookInMyLibrary = async (req, res) => {
  const { review, rating } = req.body;
  
  try {
    const updatedBook = await Book.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { review, rating, updatedAt: Date.now() } },
      { new: true } // Devuelve el documento actualizado
    );

    if (!updatedBook) {
      console.log(` Libro con ID ${req.params.id} no encontrado o no pertenece a ${req.user.email}.`);
      return res.status(404).json({ message: 'Libro no encontrado en tu biblioteca o no tienes permisos para editarlo.' });
    }
    console.log(` Libro con ID ${req.params.id} actualizado en la biblioteca de ${req.user.email}.`);
    res.json({ message: 'Libro actualizado exitosamente.', book: updatedBook });
  } catch (error) {
    console.error(' Error al actualizar libro en mi biblioteca:', error.message);
    res.status(500).json({ message: 'Error al actualizar libro en tu biblioteca.' });
  }
};

// DELETE /api/books/my-library/:id
exports.deleteBookFromMyLibrary = async (req, res) => {
  try {
    const deletedBook = await Book.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!deletedBook) {
      console.log(` Libro con ID ${req.params.id} no encontrado o no pertenece a ${req.user.email}.`);
      return res.status(404).json({ message: 'Libro no encontrado en tu biblioteca o no tienes permisos para eliminarlo.' });
    }
    console.log(` Libro con ID ${req.params.id} eliminado de la biblioteca de ${req.user.email}.`);
    res.json({ message: 'Libro eliminado exitosamente.' });
  } catch (error) {
    console.error(' Error al eliminar libro de mi biblioteca:', error.message);
    res.status(500).json({ message: 'Error al eliminar libro de tu biblioteca.' });
  }
};

// GET /api/books/my-library (con filtros y ordenación)
exports.getMyLibrary = async (req, res) => {
  const { q, sortBy, excludeNoReview } = req.query; // q para título/autor, sortBy para calificación, excludeNoReview

  let filter = { userId: req.user.id }; // Siempre filtrar por el usuario autenticado
  let sort = {};

  if (q) {
    const searchRegex = new RegExp(q, 'i'); // Búsqueda insensible a mayúsculas/minúsculas
    filter.$or = [
      { title: searchRegex },
      { author: searchRegex }
    ];
  }

  if (excludeNoReview === 'true') {
    filter.review = { $ne: null, $ne: '' }; // Excluir documentos donde review es null o cadena vacía
  }

  if (sortBy === 'rating_asc') {
    sort.rating = 1; // 1 para ascendente
  } else if (sortBy === 'rating_desc') {
    sort.rating = -1; // -1 para descendente
  } else {
    sort.createdAt = -1; // Por defecto, los más nuevos primero
  }

  try {
    const books = await Book.find(filter).sort(sort);
    console.log(` Mostrando ${books.length} libros de la biblioteca de ${req.user.email}.`);
    res.json(books);
  } catch (error) {
    console.error(' Error al obtener mi biblioteca:', error.message);
    res.status(500).json({ message: 'Error al obtener tu biblioteca.' });
  }
};
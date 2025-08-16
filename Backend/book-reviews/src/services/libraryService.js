const axios = require('axios');
require('dotenv').config();

const searchBooks = async (query) =>{
    try{
        //encodeURIComponent convierte en formato de busueda seguro para url el nombre del libro a buscar
        const response = await axios.get(`${process.env.OPEN_LIBRARY_API_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`); 
        return response.data.docs.map(book =>({
           bookId: book.key.replace('/works/', ''),
           title: book.title,
           author: book.author_name ? book.author_name[0]: 'Desconocido',
           yearPublication: book.first_publish_year,
           coverId: book.cover_i //id para obtener portada
        }));
    } catch(err){
       console.error('Error al buscar libros en Open library',err.message);
       throw new Error('No se pudo conectar a la API');
    };
}
    const getBookDetails = async (bookId) =>{
        try{
           const response = await axios.get(`${process.env.OPEN_LIBRARY_API_URL}/works/${bookId}.json`);
           return response.data;
        }catch(err){
            console.error(`Errror al obtener el detalle del libro con ID ${bookId}`,err.message);
             throw new Error('No se pudieron obtener el detalle del libro.');
        }
    };

  //Obtener la imagen de la portada del libro
  const getPortadaUrl = (coverId, size= 'M') =>{
    if(!coverId) return null;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }

  module.exports = {
    searchBooks,
    getBookDetails,
    getPortadaUrl
  }

const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    bookId: {type: String, required: true, unique: true},
    title:{type: String, required: true},
    author:{type: String},
    yearPublication:{type: Number},
    converBase64:{type: String}, // Imagen de portada del libro
    review:{type: String, maxlength: 500}, // Reseña del libro
    rating:{type: Number, min: 1, max: 5}, // Calificación del libro
    createdAt: {type: Date, default: Date.now}, // Fecha de creación del libro 
    updatedAt: {type: Date, default: Date.now}, // Fecha de actualización del libro 
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true} // Referencia al usuario que creó el libro  
});

module.exports = mongoose.model('Book', BookSchema);
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware

//habiltar cors para conectarse al frontend
app.use(cors());
// se configura el limite de mb de las imagenes que se pueden subir
app.use(bodyParser.json({limit:'50mb'}));

//Conectar a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(()=>console.log('Conectado a MongoDb'))
    .catch(err=>console.error('Error al conectar a MongoDB:',err));

//Rutas 
app.use('/api/auth', authRoutes);//ruta para el login
app.use('/api/books', bookRoutes); // ruta para los libros



// Ruta para manejar errores 404
app.use((req,res,next)=>{
    res.status(404).json({message: 'Ruta no encontrada'});
});

//Eroores de otra indole
app.use((err,req,res,next)=>{
      console.error(err.stack);//un seguimiento de la ruta del error
      res.status(500).json({message: 'Error salio algo mal'});
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
})


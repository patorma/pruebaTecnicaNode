const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//Registrar un nuevo usuario
exports.registerUser = async(req,res)=>{
  try{
     const {email,password} = req.body;
        //verificar si el usuario ya existe                     
        const existingUser = await User.findOne({email});
        if(existingUser){   
           return res.status(400).json({message: 'El usuario ya existe'});
        }               
        const newUser = new User({email,password});                         
        await newUser.save();
        console.log(`Usuario con mail: ${email} registrado con exito`);
        res.status(201).json({message: 'Usuario registrado exitosamente'});
  }catch(error){
    console.error('Error al registrar un nuevo usuario:',error.message);
    res.status(400).json({message: 'Error al registrar un nuevo usuario',error:error.message});
  }
};

//Login de usuario
exports.login = async (req,res)=>{
    try {

        const {email,password} = req.body;
        //verificar si el usuario existe
        const user = await User.findOne({email});
        if(!user){
            console.log(`Usuario con email: ${email} no encontrado`);
            res.status(401).json({message: 'Credencial inválida'});
        }
      // se verfica que la contraseña ingresada coincide con la registrada pro el usuario
      const isMatch = await user.comparePassword(password);
     if(!isMatch){
        console.log(`Login fallido para el usuario con email: ${email}`);
        return res.status(401).json({message: 'Credencial inválida'});
      }  

      const token = jwt.sign({id: user._id,email: user.email},process.env.JWT_SECRET,{expiresIn:'1h'});
      console.log(`Usuario con email: ${email} inicio sesion. Token generado`);
      res.json({message: 'Inicio de sesion exitoso',token, user: {id: user._id,email:user.email}});

     }catch(error){
        console.error('Error con las credenciales del login',error.message);
        res.status(500).json({message: 'Error con el login',error:error.message});
    }
}

exports.loguot = (req,res)=>{
    //en el caso de JWT no se puede invalidar el token en el servidor
    //se puede implementar una lista negra de tokens invalidos
    //pero para simplificar se asume que el cliente elimina el token localmente
    //desde el frontend
    console.log(`Usuario con email: ${req.user.email} con ID: ${req.user.id} cerro sesion`);
    res.json({message: 'Cierre de sesión exitoso'});
}
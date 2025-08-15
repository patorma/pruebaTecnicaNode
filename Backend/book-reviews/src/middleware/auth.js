const jwt = require('jsonwebtoken');

const autenticacionToken = (req,res,next)=>{
   // se extrae el token del encabezado de autorización 
   //ejemplo Beare tokenDelUsuario que envia en la peticion
   const authHeader = req.headers['authorization'];
   //con [1] toma el segundo elemento del array de beare con token 
   //en este caso el token
  const token = authHeader && authHeader.split(' ')[1];

  if(!token){
     console.log('Acceso denegado: No se proporciono el token');
     return res.status(401).json({message: 'Acceso denegado: No hay token!!!'});
  }

  jwt.verify(tokren,process.env.JWT_SECRET, (err,user)=>{
     if(err){
        console.log('Token inválido',err.message);
        return res.status(403).json({message: 'Token inválido o expiradado'});
     }
     req.user = user;    //contiene el id y email de la solicitud   
     next();
  })
};
// este middleware protege las rutas que necesitan autenticacion
module.exports = autenticacionToken;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({

    email:{type: String, required:true,unique:true},
    password:{type: String, required:true},
});

// Encriptar la contraseña antes de guardar el usuario
UserSchema.pre('save',async function(next){
    //si se ha modificado la contraseña se encripta
    //evita quie se ha a cada rato que se guarde el usuario
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
    return next();
});


//Método para comparar la contraseña ingresada con la contraseña encriptada
//importante por el tema de login 
UserSchema.methods.comparePassword = function(contraseñaIngresada){
    return bcrypt.compare(contraseñaIngresada,this.password)
};

module.exports = mongoose.model('User',UserSchema);

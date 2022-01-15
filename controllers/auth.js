const {response} = require('express')
const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')
const {generarJWT} = require('../helpers/jwt.js')

const crearUsuario = async (req, res = response)=>{

          const {name, email, password} = req.body

          try{
                    // Verificar emal
                    const usuario = await Usuario.findOne({email: email})
                    if(usuario){
                              return res.status(400).json({
                                        ok: false,
                                        msg: 'El usuario ya existe con ese email',
                              })
                    }         

                    // Crear usuario con el modelo
                    const dbUser = new Usuario(req.body)

                    // Hacer un hash a la password
                    const salt = bcrypt.genSaltSync()
                    dbUser.password = bcrypt.hashSync(password, salt)

                    // Generar el JWT 
                    const token = await generarJWT(dbUser.id, dbUser.name)

                    // Crear el usuario de DB
                    await dbUser.save()

                    // Generar respuesta 
                    return res.status(201).json({
                              ok: true,
                              uid: dbUser.id,
                              name: name,
                              token
                    })

          }catch(error){
                    console.log(error)
                    return res.status(500).json({
                              ok: false,
                              msg: 'Por favor hable con el administrador',
                    })
          }

          
}

const loginUsuario = async (req, res = response)=>{
          

          const { email, password} = req.body

          try {
                    // Verificar email
                    const dbUser = await Usuario.findOne({email: email})
                    if(!dbUser){
                              return res.status(400).json({
                                        ok: false,
                                        msg: 'El correo no existe',
                              })
                    }

                    // Verificar password
                    const validPassword = bcrypt.compareSync(password, dbUser.password) //Validamos el password que ingresamos con el que esta en la DB
                    if(!validPassword){
                              return res.status(400).json({
                                        ok: false,
                                        msg: 'Password incorrecto',
                              })
                    }

                    // Generar token
                    const token = await generarJWT(dbUser.id, dbUser.name)

                    // Generar respuesta
                    return res.json({
                              ok: true,
                              uid: dbUser.id,
                              name: dbUser.name,
                              token
                    })
      

          }catch(error){
                    console.log(error)
                    return res.status(500).json({
                              ok: false,
                              msg: 'Por favor hable con el administrador',
                    })
          }

}

const revalidarToken = (req, res = response)=>{
          
          const {uid, name} = req


          return res.json({
                    ok: true,
                    uid,
                    name
          })
}

module.exports = {
          crearUsuario,
          loginUsuario,
          revalidarToken
}
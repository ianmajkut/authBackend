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

const loginUsuario = (req, res = response)=>{
          

          const { email, password} = req.body

          return res.json({
                    ok: true,
                    msg: 'Login usuario /',
          })
}

const revalidarToken = (req, res = response)=>{
          return res.json({
                    ok: true,
                    msg: 'Renew',
          })
}

module.exports = {
          crearUsuario,
          loginUsuario,
          revalidarToken
}
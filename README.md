# auth backend

Proyecto desarrollado en NodeJs con el fin de desarrollar un sistema para crear y loguear usuarios, creando y renovando [JWT](https://jwt.io/#).  El backend contiene su frontend desarrollado en Angular que se encuentra en el siguiente [repositorio](https://github.com/ianmajkut/authApp) con su correspondiente documentación. Como base de datos de utilizó Mongo DB.

## Endpoints

El url base en todos los casos es : `'https://auth-meanbackend.herokuapp.com/api'` .

Método | URL | Descripción
| :---: | :---: | :---:
POST  | `https://auth-meanbackend.herokuapp.com/api/auth` | Loguear Usuario
POST  | `https://auth-meanbackend.herokuapp.com/api/auth/new` | Crear Usuario
GET  | `https://auth-meanbackend.herokuapp.com/api/auth/renew` | Renovar JWT

* Loguear Usuario

  * Ejemplo Request
  
  ```
  POST
  --url: 'https://auth-meanbackend.herokuapp.com/api/auth'
  --body: {
    "email": "test2@test.com",
    "password": "123456"
    }
  ```
  * Respuesta
  
  ```
  {
    "ok": true,
    "uid": "61e617354b9a1fcd7a69fd5a",
    "name": "Test2",
    "email": "test2@test.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MWU2MTczNTRiOWExZmNkN2E2OWZkNWEiLCJuYW1lIjoiVGVzdDIiLCJpYXQiOjE2NDI1NTYzOTYsImV4cCI6MTY0MjY0Mjc5Nn0.dW0nUS247n5d8ahGtQEshxvuIrGq0IM092bEG5usU6c"
  }
  ```
  
* Crear Usuario

  * Ejemplo Request
  ```
  POST
  --url: 'https://auth-meanbackend.herokuapp.com/api/auth/new'
  --body: {
    "name": "Test3"
    "email": "test3@test.com",
    "password": "123456"
    }
  
  ```
  * Respuesta
  
  ```
  {
    "ok": true,
    "uid": "61e76cee423f1f6a411128e4",
    "name": "Test3",
    "email": "test3@test.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MWU3NmNlZTQyM2YxZjZhNDExMTI4ZTQiLCJuYW1lIjoiVGVzdDMiLCJpYXQiOjE2NDI1NTY2NTQsImV4cCI6MTY0MjY0MzA1NH0.AXSwSumSPD5w65MtolsyqjUYPhB7HKk-pPLrhQ9vtoc"
  }
  ```
  
* Renovar JWT

  * Ejemplo Request
  ```
  GET
  --url: 'https://auth-meanbackend.herokuapp.com/api/auth/renew'
  --header: 'x-token' 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MWU2MTczNTRiOWExZmNkN2E2OWZkNWEiLCJuYW1lIjoiVGVzdDIiLCJpYXQiOjE2NDI0NzA4OTEsImV4cCI6MTY0MjU1NzI5MX0.M1A0xuyOTeBV77ZpVYwYdpBZjN8v2FYPjbTrQNxJeLk'
  ```
  * Respuesta
  ```
  {
    "ok": true,
    "uid": "61e617354b9a1fcd7a69fd5a",
    "name": "Test2",
    "email": "test2@test.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MWU2MTczNTRiOWExZmNkN2E2OWZkNWEiLCJuYW1lIjoiVGVzdDIiLCJpYXQiOjE2NDI1NTY4MDEsImV4cCI6MTY0MjY0MzIwMX0.dUVcjvwtUjz5GdyYPkZYIqCGBWSJhgFdeRttA2cmQEM"
  }
  ```
  
  :exclamation: **PRECAUCIÓN: TESTEAR LOS ENDPOINTS PREVIAMENTE EN POSTMAN** :exclamation:
  
  
  ## DB
  
  En el `index.html` luego de crear el servidor express llamamos a la función `dbConnection()`. Más información sobre [.connect()](https://mongoosejs.com/docs/connections.html).  
```js
  const dbConnection = async() => {

    try {
        /*
        Esperamos a que conectar con la base de datos. BD_CNN es el path de la base
        de datos de Mongo que se encuentra en el .env que es cargado en las variables
        de entorno gracias a 'dotnev'
        */
        await mongoose.connect( process.env.BD_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            
        });

        console.log('DB Online');


    } catch (error) {
        console.log(error);
        throw new Error('Error a la hora de inicializas DB');
    }


}
```

Esquema de BD. Más información sobre [Schemas](https://mongoosejs.com/docs/guide.html) y [Models](https://mongoosejs.com/docs/models.html)

```js
const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema({
          name: {
                    type: String,
                    required: true
          },
          email: {
                    type: String,
                    required: true,
                    unique: true
          },
          password: {
                    type: String,
                    required: true
          }
})

//Conversión de Schema a Model para poder usar. Recordar que tiene que ser singular
module.exports = model('Usuario', UsuarioSchema)
```

## Rutas

```js
const {Router} = require('express')
const { check } = require('express-validator')
const { crearUsuario, loginUsuario, revalidarToken} = require('../controllers/auth')
const { validarCampos } = require('../middlewares/validar-campos')
const { validarJWT } = require('../middlewares/validar-jwt')

const router = Router()

//Crear nuevo usuario
router.post('/new', [
          check('name', 'El nombre es obligatorio').not().isEmpty(),
          check('email', 'El email es obligatorio').isEmail(),
          check('password', 'La contraseña es obligatoria').isLength({min: 6}),
          //Custom Middleware
          validarCampos
] ,crearUsuario)

//Login de usuario
router.post('/', [
          check('email', 'El email es obligatorio').isEmail(),
          check('password', 'La contraseña es obligatoria').isLength({min: 6}),
          //Custom Middleware
          validarCampos
] ,loginUsuario)

//Validar y revalidar token
router.get('/renew',
validarJWT, 
revalidarToken)

module.exports = router

```
* Custom Middlewares
  * validar-campos.js
  
  El objetivo es ver si hay errores en el request y de ser el caso, la response tira un error 400, mostrando los errores. Para esto utilizamos el [validationResult(req)](https://express-validator.github.io/docs/validation-result-api.html) de `express-validator`.
  
```js
  const { response } = require("express")
const {validationResult} = require('express-validator')

const validarCampos = (req,res = response, next)=>{
          const errors = validationResult(req)
          if(!errors.isEmpty()){
                    return res.status(400).json({
                              ok:false,
                              errors: errors.mapped()
                    })
          }

          next()
}

module.exports = {
          validarCampos
}
```
  * validar-jwt.js

```js
const {response} = require('express')
const jwt = require('jsonwebtoken')

const validarJWT = (req, res = response, next) => {
          
          //Extraemos el token del header
          const token = req.headers['x-token']

          //Si no existe, el response va a ser el siguiente error
          if(!token){
                    return res.status(401).json({
                              ok: false,
                              msg: 'No hay token'
                    })
          }

          try {
                    //Verificamos el token con la key definida en el .env
                    const {uid, name} = jwt.verify(token, process.env.SECRET_JWT_SEED)
                    req.uid = uid
                    req.name = name

          } catch (error) {
                    return res.status(401).json({
                              ok: false,
                              msg: 'Token no valido'
                    })
          }

          next()
}

module.exports = {
          validarJWT
}
  
```

## Controllers 
### crearUsuario()
```js

const {response} = require('express')
const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')
const {generarJWT} = require('../helpers/jwt.js')

const crearUsuario = async (req, res = response)=>{

          const {name, email, password} = req.body

          try{
                    // Verificar email
                    //Buscamos si hay un usuario en la DB con el mismo mail que obtenemos del body
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
                              email,
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


```

### loginUsuario()

```js

const {response} = require('express')
const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')
const {generarJWT} = require('../helpers/jwt.js')

const loginUsuario = async (req, res = response)=>{
          

          const { email, password} = req.body

          try {
                    // Verificar email
                    //Buscamos si hay un usuario en la DB con el mismo mail que obtenemos del body
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
                              email: dbUser.email,
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

```


### revalidarToken()

```js
const revalidarToken = async (req, res = response)=>{
          
          const {uid} = req

          //Leer db para obtener el email
          const dbUser = await Usuario.findById(uid)
          
          //Generamos JWT
          const token = await generarJWT(uid, dbUser.name)

          return res.json({
                    ok: true,
                    uid,
                    name: dbUser.name,
                    email: dbUser.email,
                    token
          })
}

```

## Manejo de rutas

Para que no haya complicaciones en el manejo de rutas entre node y Angular, se definió el siguiente código con el fin de que, para cualquier ruta que no este definida en el  `Routes`, se mandará al index.html para que Angular se encargue.

```js

//Manejar las demas rutas
app.get('*', (req, res)=>{
          res.sendFile(path.resolve(__dirname, 'public/index.html'))
})

```






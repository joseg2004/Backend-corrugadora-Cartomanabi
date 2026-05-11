require('dotenv').config()

require('./helpers/createFolder')
require('./connections/hana')
// require('./connections/psql')

const { initRedis } = require('./connections/redis')
const { validateSecretOnStartup } = require('./helpers/jwtRotation')

const app = require('./server')

// Inicializar Redis para token blacklist
initRedis()

// Validar política de rotación JWT
validateSecretOnStartup()

app.listen(app.get('port'), () => {
   console.log(
      `[${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}] - Servidor en el puerto ${app.get('port')}`
   )
})
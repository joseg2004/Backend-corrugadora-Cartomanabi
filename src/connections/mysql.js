const mysql = require('mysql')
const {
   promisify
} = require('util')

const {
   cdtlsMySQL
} = require('./credentials')

const connectionDB = mysql.createPool(cdtlsMySQL)

const ERRORS_DB = {
   'PROTOCOL_CONNECTION_LOST': 'Conexión a la Base de datos cerrada',
   'ER_CON_COUNT_ERROR': 'Muchas conexiones a la Base de datos',
   'ECONNREFUSED': 'Conexión a la Base de datos rechazada',
   'ER_BAD_DB_ERROR': 'Base de datos incorrecta o desconocida',
   'ER_ACCESS_DENIED_ERROR': 'Acceso denegado al usuario de la Base de datos',
   'ENOTFOUND': 'Host de la Base de datos incorrecto o desconocido'
}

connectionDB.getConnection((err, connection) => {
   if (err) {
      const errorDB = ERRORS_DB[err.code]
      if (errorDB) console.error('Error DB ==> ' + errorDB)
   }

   if (connection) {
      connection.release()
      console.log(`CONNECTED a la base de datos de MySQL - ${process.env.MYSQL_DATABASE} ✅`)
   }

   return
})

connectionDB.query = promisify(connectionDB.query)

module.exports = connectionDB
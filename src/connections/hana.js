const hdb = require('hdb')
const {
   promisify
} = require('util')

const {
   cdtlsHana
} = require('./credentials')

const client = hdb.createClient(cdtlsHana)

client.connect(function (err) {
   if (err) console.log(err.message)

   console.log(`${client.readyState.toUpperCase()} a la base de datos de HANA - ${process.env.HANA_DATABASE} - ${process.env.HANA_DB_COPLAIM} - ${process.env.HANA_DB_DATOS} - ${process.env.HANA_DB_EMVCLI} - ${process.env.HANA_DB_SGEP} - ${process.env.HANA_DB_CHERNO} - ${process.env.HANA_DATABASE_AU} ✅`)
})

client.exec = promisify(client.exec)

module.exports = client

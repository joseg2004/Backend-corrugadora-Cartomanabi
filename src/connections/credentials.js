require('dotenv').config()

module.exports = {
   cdtlsMySQL : {
      host     : process.env.MYSQL_HOST,
      user     : process.env.MYSQL_USER,
      password : process.env.MYSQL_PASSWORD,
      database : process.env.MYSQL_DATABASE
   },
   cdtlsHana : {
      host     : process.env.HANA_HOST,
      port     : process.env.HANA_PORT,
      user     : process.env.HANA_USERNAME,
      password : process.env.HANA_PASSWORD
   }
}
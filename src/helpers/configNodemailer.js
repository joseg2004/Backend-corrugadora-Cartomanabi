const nodemailer = require('nodemailer')

let transporte = nodemailer.createTransport({
   host: process.env.OFFICE_HOST,
   port: process.env.OFFICE_PORT,
   secure: false,
   auth: {
      user: process.env.OFFICE_USER,
      pass: process.env.OFFICE_PASS,
   },
   tls: {
      rejectUnauthorized: false
   }
})

module.exports = {
   transporte
}
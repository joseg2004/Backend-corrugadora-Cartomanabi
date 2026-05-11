const path = require('path')
const { transporte } = require('./configNodemailer')

exports.sendMail = async function sendMail({
   fileName = '',
   nameCli = '',
   nameVend = '',
   emailCli = '',
   emailVend = '',
   notificarMail = false,
}) {
   let toMail = ''

   notificarMail
      ? toMail = `${emailVend};${emailCli}`
      : toMail = `${emailVend}`

   let info = await transporte.sendMail({
      from: 'doc_electronicos@cartomanabi.com',
      to: toMail,
      subject: `📦 Cotización ${fileName}`,
      text: `Estimada/o cliente ${nameCli}, \n \nAdjunto a este correo encontrará la cotización que solicitó. Si tiene alguna duda o pregunta, por favor no dude en contactarnos. \n \nEste mensaje ha sido generado automáticamente por ${nameVend}. \n \nPor favor diríjase al e-mail: ${emailVend}. \n \nAtentamente, \nSistema de Cotizaciones del grupo EXPOCOE.`,
      attachments: [{
         filename: `${fileName}.pdf`,
         path: path.join(__dirname, `../docs/cotizaciones/${fileName}.pdf`),
         contentType: 'application/pdf'
      }],
   })

   console.log('Message sent: %s', info.messageId)
}
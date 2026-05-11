const axios = require('axios')

exports.sendWhatsApp = async function sendWhatsApp({
   notiWhats = false,
   fileName = '',
   nameCli = '',
   numCli = '',
   nameVend = '',
   numVend = '',
}) {
   let path = ''

   if (notiWhats) {
      // Send WhatsApp to client
      path = `/enviar-cotizacion-coplaim?tipoMensaje=cliente&numero=593${Number(numCli)}@c.us&nombreCliente=${nameCli.replace(' ','*').replace('/', '*')}&nombreVendedor=${nameVend}&numeroVendedor=+593${numVend}&nombrepdf=${fileName}.pdf`

      try {
         const resp = await axios.get(`${process.env.API_NODE_RED}${path}`)

         if (resp.status == 200) {
            console.log(resp.data)
         }
      } catch (e) {
         console.error(e)
      }
   }

   // Send WhatsApp to seller
   path = `/enviar-cotizacion-coplaim?tipoMensaje=vendedor&numero=593${Number(numVend)}@c.us&nombreVendedor=${nameVend}&nombreCliente=${nameCli.replace(' ','*').replace('/', '*')}&numeroVendedor=${numVend}&numeroCliente=+593${Number(numCli)}&nombrepdf=${fileName}.pdf`

   try {
      const resp = await axios.get(`${process.env.API_NODE_RED}${path}`)

      if (resp.status == 200) {
         console.log(resp.data)
      }
   } catch (e) {
      console.error(e)
   }
}
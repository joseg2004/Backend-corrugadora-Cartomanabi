const client = require('../connections/hana')
const {
   getTicket,
   allPTCode,
   allClients,
   getTestLaminas
} = require('../models/hanaQTickets')
const {
   createPDFPT,
   createPDFLAM
} = require('../helpers/createPDF')

const ctrlTickets = {}

ctrlTickets.allTickets = async (req, res) => {
   try {
      client.connect()
      const allTicket = await client.exec(getTicket())

      if (allTicket.length > 0) {
         return res.status(200).json({
            msg: 'Tickets obtenidos correctamente 🖖',
            data: allTicket,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay tickets registrados 😫',
            data: []
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlTickets.generatePDF = async (req, res) => {
   try {
      const {
         PTCODE,
         ORPRO,
         CLIENT,
         PRODUCT,
         TEST,
         SUSCRIP,
         OC,
         CANT,
         NUM_BULTO,
         UNI_BULL,
         T_PALL,
         LCOM1,
         MCOM1,
         LCOM2,
         MCOM2,
         MCOM22,
         LEDM
      } = req.body

      let resp

      if (PTCODE.includes('PT')) {
         resp = createPDFPT({ PTCODE, ORPRO, CLIENT, PRODUCT, TEST, SUSCRIP, OC, CANT, NUM_BULTO, UNI_BULL, T_PALL })
      } else {
         resp = createPDFLAM({ PTCODE, ORPRO, CLIENT, PRODUCT, TEST, SUSCRIP, LCOM1, MCOM1, LCOM2, MCOM2, MCOM22, LEDM })
      }

      if (resp) {
         return res.status(200).json({
            msg: 'PDF generado correctamente 🖖',
            data: ORPRO
         })
      } else {
         return res.status(204).json({
            msg: 'No se pudo generar el PDF 😫',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlTickets.allInfo = async (req, res) => {
   try {
      client.connect()
      const allsPT = await client.exec(allPTCode())
      const allsCLI = await client.exec(allClients())
      const allsTEST = await client.exec(getTestLaminas())

      if (allsPT.length > 0) {
         return res.status(200).json({
            msg: 'PT obtenidos correctamente 🖖',
            data: {
               allsPT,
               allsCLI,
               allsTEST
            }
         })
      } else {
         return res.status(204).json({
            msg: 'No hay PT registrados 😫',
            data: []
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

module.exports = ctrlTickets
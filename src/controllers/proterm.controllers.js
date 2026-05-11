const ctrlProdPT = {}

const moment = require('moment')
moment.locale('es')
const client = require('../connections/hana')
const { decodeJWT } = require('../helpers/fntHelpers')
const {
   getProdTem,
   getExitProdTerm,
   postSaveProdTerm,
   postSaveHisPT,
   putProdTerm,
   getDetailsIns,
} = require('../models/hanaQProdTerm')

ctrlProdPT.allOrderLibPT = async (req, res) => {
   try {
      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const allOrders = await client.exec(getProdTem())

      if (allOrders.length > 0) {
         let one = 0, two = 0, three = 0, four = 0, POSITION = 0

         await Promise.all(
            allOrders.map(async (order) => {
               const exitOrder = await client.exec(
                  getExitProdTerm({ DOC: order.DOC_SAP })
               )

               if (exitOrder.length === 0) {
                  if (order.NUM_IMP === 1) { ++one, POSITION = one }
                  if (order.NUM_IMP === 2) { ++two, POSITION = two }
                  if (order.NUM_IMP === 3) { ++three, POSITION = three }
                  if (order.NUM_IMP === 4) { ++four, POSITION = four }

                  const resp = await client.exec(
                     postSaveProdTerm(order.DOC_SAP, order.NUM_IMP, POSITION)
                  )
                  if (resp) {
                     await client.exec(postSaveHisPT(
                        `Se creo la orden ${order.DOC_SAP} en la tabla PLPT`,
                        USER
                     ))
                  }
               }
            })
         )

         const allOrdersLib = await client.exec(
            getExitProdTerm({
               DATE: moment().utcOffset('-05:00').format('YYYY-MM-DD'),
            })
         )

         if (allOrdersLib.length > 0) {
            return res.status(200).json({
               msg: 'Ordenes liberadas registrados 🤩',
               data: allOrdersLib,
            })
         }

         return res.status(200).json({
            msg: 'No hay ordenes liberadas registrados 😫',
            data: [],
         })
      } else {
         return res.status(200).json({
            msg: 'No hay ordenes liberadas registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlProdPT.saveOrderPos = async (req, res) => {
   try {
      const { dataPos } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      await Promise.all(
         dataPos.map(async (order, idx) => {
            await client.exec(
               putProdTerm({ POSITION: idx + 1, ID_PLPT: order.ID_PLPT })
            )

            await client.exec(postSaveHisPT(
               `Cambio de posición ${order.DOC_SAP} en la tabla PLPT ${idx + 1} ${order.ID_PLPT}`,
               USER
            ))
         })
      )

      const allOrdersLib = await client.exec(
         getExitProdTerm({
            DATE: moment().utcOffset('-05:00').format('YYYY-MM-DD'),
         })
      )

      if (allOrdersLib.length > 0) {
         return res.status(200).json({
            msg: 'Órden cambiada de posición con éxito 🤩',
            data: allOrdersLib,
         })
      } else {
         return res.status(200).json({
            msg: 'No se ha podido cambiar la posición 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlProdPT.putStatusPT = async (req, res) => {
   try {
      let data = {}
      const { ID, ACTION } = req.body

      client.connect()

      if (ACTION === 'Inicio') {
         data = {
            ID_PLPT: ID,
            INICIO: moment().utcOffset('-05:00').format('YYYY-MM-DD HH:mm:ss')
         }
      } else if (ACTION === 'Fin') {
         data = {
            ID_PLPT: ID,
            FIN: moment().utcOffset('-05:00').format('YYYY-MM-DD HH:mm:ss'),
            STATUS: 'C'
         }
      }

      const resp = await client.exec(
         putProdTerm(data)
      )

      const allOrdersLib = await client.exec(
         getExitProdTerm({
            DATE: moment().utcOffset('-05:00').format('YYYY-MM-DD'),
         })
      )

      if (resp) {
         return res.status(200).json({
            msg: `Órden ${ACTION === 'Inicio' ? 'iniciada' : 'finalizada'} con éxito 🤩`,
            data: allOrdersLib
         })
      } else {
         return res.status(200).json({
            msg: 'No se ha podido ejecutar la acción 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlProdPT.allDetailsIns = async (req, res) => {
   try {
      client.connect()
      const allInsumos = await client.exec(getDetailsIns(req.query.ID))

      if (allInsumos.length > 0) {
         res.status(200).json({
            msg: 'Insumos obtenidos correctamente 🖖',
            data: allInsumos,
         })
      } else {
         res.status(200).json({
            msg: 'No hay insumos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

module.exports = ctrlProdPT

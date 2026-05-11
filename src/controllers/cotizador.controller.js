const { customAlphabet } = require('nanoid')
const idGen = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
const client = require('../connections/hana')
const { CrearPDF } = require('../helpers/createCotiPDF')
const { decodeJWT } = require('../helpers/fntHelpers')
const {
   getClientCarto,
   getClientAustro,
   getProductsCliVend,
   searchUserDept,
   postCotizacion,
   searchCotizacion,
   postCotizacionDetalle,
   searchCotizaciones,
   searchCotizacionDetalle,
   getProductsCliVendAu,
   searchProductsAustro,
   getSearchClientAustro,
   postAsignClientAustro,
   getSearchClientCarto,
   postAsignClientCarto,
   searchAllProducts,
   searchCotizacionesCli,
   searchAllInfoCot,
} = require('../models/hanaQCotizador')

const { sendMail } = require('../helpers/sendMailCoti')
const { sendWhatsApp } = require('../helpers/sendWhatsCoti')
const { assignSellers } = require('../helpers/srchVendedoresAsign')

const ctrlCotizador = {}

ctrlCotizador.getAllClients = async (req, res) => {
   try {
      client.connect()

      const { company, type } = req.query
      const { user: USER, userID: ID, permiso: PRIV } = await decodeJWT(req.headers.authorization)

      let allClients = []

      const { vendedores } = await assignSellers({ vend: USER })

      if (company === 'Cartomanabi') {
         allClients = await client.exec(
            getClientCarto({
               user: process.env.AUTH_COTI_PRIV.includes(PRIV) || process.env.AUTH_COTI_ID.includes(ID) || type.includes('S') ? '' : vendedores,
               type
            })
         )
      }

      if (company === 'Austrobox') {
         allClients = await client.exec(
            getClientAustro({
               user: process.env.AUTH_COTI_PRIV.includes(PRIV) || type.includes('S') ? '' : vendedores,
               type
            })
         )
      }

      if (allClients.length > 0) {
         return res.status(200).json({
            msg: 'Clientes obtenidos correctamente 🖖',
            data: allClients,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay clientes asociados 😫',
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

ctrlCotizador.getAllProdCliVend = async (req, res) => {
   try {
      const { clients, company } = req.query

      const { user: USER, userID: ID, permiso: PRIV } = await decodeJWT(req.headers.authorization)

      client.connect()
      let allProducts = []

      const { vendedores } = await assignSellers({ vend: USER })

      if (clients) {
         if (company === 'Cartomanabi') {

            allProducts = await client.exec(
               getProductsCliVend({
                  user: process.env.AUTH_COTI_PRIV.includes(PRIV) || process.env.AUTH_COTI_ID.includes(ID) ? '' : vendedores,
                  cli: clients,
               })
            )
         }

         if (company === 'Austrobox') {
            allProducts = await client.exec(
               getProductsCliVendAu({
                  user: process.env.AUTH_COTI_PRIV.includes(PRIV) || process.env.AUTH_COTI_ID.includes(ID) ? '' : vendedores,
                  cli: clients,
               })
            )
         }
      }

      if (allProducts.length > 0) {
         return res.status(200).json({
            msg: 'Productos obtenidos correctamente 🖖',
            data: allProducts,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay productos asociados 😫',
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

ctrlCotizador.saveCotizacion = async (req, res) => {
   try {
      const { client: cliente, products, totales, observaciones } = req.body

      const idCOT = `COT-${idGen(10)}`
      const { user } = await decodeJWT(req.headers.authorization)
      const USER = await client.exec(searchUserDept({ user }))

      const cabCoti = {
         COD_CLIENT: cliente?.COD_CLIENT,
         IDENTITY: idCOT,
         RUC: cliente?.RUC,
         CLIENTE: cliente?.CLIENTE,
         TELEFONO: cliente?.CELULAR,
         EMAIL: cliente?.EMAIL,
         CIA: cliente?.CIA,
         CIUDAD: cliente?.CIUDAD || '',
         DIRECCION: cliente?.DIRECCION || '',
         PLAZO: observaciones?.plazoEntrega,
         CHECK_PEDIDO: observaciones?.boxPedido,
         CHECK_CLI_TRO: observaciones?.valCli,
         CHECK_TRO_CLI: observaciones?.valTro,
         CHECK_NOT_EMAIL: observaciones?.notCliEmail,
         CHECK_NOT_WHATS: observaciones?.notCliWhats,
         CHECK_DAYS_CRED : observaciones?.viewDaysCred,
         CHECK_MEDIDAS: observaciones?.viewMedidas,
         SUB_CERO: totales?.subCero,
         SUB_DOCE: totales?.subDoce,
         IVA: totales?.ivaTot,
         TOTAL: totales?.totPagar,
         VENDEDOR: cliente?.USUARIO,
         ESTADO: cliente?.ESTADO || 'A',
         USER: user
      }

      client.connect()
      const resp = await client.exec(postCotizacion(cabCoti))

      if (resp) {
         const cotiCab = await client.exec(searchCotizacion({ identity: idCOT }))

         if (cotiCab.length > 0) {
            const savePromises = products.map(async (item) => {
               const resp = await client.exec(postCotizacionDetalle({
                  ID_COTI: cotiCab[0].ID_COTI,
                  INDICE: item.INDICE,
                  CODE_PT: item.CODE_PT,
                  PRODUCTO: item.PRODUCTO,
                  CANTIDAD: item.quantity,
                  ALTO: item.ALTO,
                  LARGO: item.LARGO,
                  ANCHO: item.ANCHO,
                  COD_MERCADO: item.COD_MERCADO,
                  MERCADO: item.MERCADO,
                  TIPO: item.TIPO,
                  TIP_BOX: item.TIP_BOX,
                  TEST: item.TEST,
                  FLAUTA: item.FLAUTA,
                  ECT: item.ECT,
                  COLOR_BOX: item.COLOR,
                  FACTOR: item.FACTOR,
                  PRE_MINIMO: item.PRE_MINIMO,
                  PRE_MINIMO_BRD: item.PRE_MINIMO_BRD,
                  PRE_SUGERIDO: item.PRE_SUGERIDO,
                  PRE_SUGERIDO_BRD: item.PRE_SUGERIDO_BRD,
                  PRE_MANUAL: item.PRE_MANUAL,
                  PRE_MANUAL_BRD: item.PRE_MANUAL_BRD,
                  LARGO_LAM: item.LARGO_LAM,
                  ANCHO_LAM: item.ANCHO_LAM,
                  SELECT_PRE: item.selectPre,
                  PRE_MIN_CALC: item.preMinimo,
                  PRE_SUG_CALC: item.preSugrd,
                  PRE_MAN_CALC: item.preManual,
                  PRECIO: item.precio,
                  CHECK_TROQ: item.checkTroquel,
                  TROQUEL_CALC: item.troquel.troquelCal,
                  TROQUEL_MANL: item.troquel.troquelManual,
                  CHECK_CLI: item.checkClise,
                  COLOR: item.color,
                  LARGO_IMP: item.largoImp,
                  ANCHO_IMP: item.anchoImp,
                  CLISE_CALC: item.clise.cliseCal,
                  CLISE_MANL: item.clise.cliseManual,
                  LLEVA_IVA: item.llevaIVA,
                  IVA: item.iva,
                  ESTUCADO: item.estucado,
                  PESO: item.peso,
                  AREA: item.area,
                  LT_HOJA: item.ltHoja,
                  AT_HOJA: item.atHoja,
                  CABIDA: item.cabida,
               }))

               return resp
            })

            const results = await Promise.all(savePromises)

            if (results.every(rslt => rslt === 1)) {
               const CODE = cotiCab[0].ID_COTI + 200

               const fileName =
                     CODE < 9999
                        ? `000${CODE}`
                        : CODE < 99999
                           ? `00${CODE}`
                           : CODE < 999999
                              ? `0${CODE}`
                              : `${CODE}`

               const resPDF = await CrearPDF({
                  CLIENT: cliente,
                  BOX: products,
                  TOTALES: totales,
                  OBSERVACIONES: observaciones,
                  fileName: `COT-CM-${fileName}`,
                  USER: USER[0],
               })

               if (resPDF) {
                  try {
                     sendMail({
                        nameCli: cliente?.CLIENTE,
                        emailCli: cliente?.EMAIL,
                        nameVend: USER[0]?.NOMBRE,
                        emailVend: USER[0]?.EMAIL,
                        fileName: `COT-CM-${fileName}`,
                        notificarMail: observaciones?.notCliEmail,
                     })
                  } catch (e) {
                     console.error(e)
                  }

                  try {
                     sendWhatsApp({
                        nameCli: cliente?.CLIENTE,
                        numCli: cliente?.CELULAR,
                        nameVend: USER[0]?.NOMBRE,
                        numVend: USER[0]?.MOBILE,
                        fileName: `COT-CM-${fileName}`,
                        notiWhats: observaciones?.notCliWhats,
                     })
                  } catch (e) {
                     console.error(e)
                  }

                  return res.status(200).json({
                     msg: 'PDF generado correctamente 🖖',
                     data: `COT-CM-${fileName}`
                  })
               } else {
                  return res.status(204).json({
                     msg: 'No se pudo generar el PDF 😫',
                  })
               }
            } else {
               return res.status(204).json({
                  msg: 'No se pudo guardar la cotización 😫',
               })
            }
         } else {
            return res.status(240).json({
               msg: 'No se pudo guardar la cotización 😫',
            })
         }
      } else {
         return res.status(500).json({
            msg: 'Error al guardar la cotización. Intentelo más luego x_x 🤯',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCotizador.getCotizaciones = async (req, res) => {
   try {
      client.connect()

      const { date } = req.query
      const { user: USER, permiso: PRIV } = await decodeJWT(req.headers.authorization)

      let itemsAll = await client.exec(
         searchCotizaciones({
            user: process.env.AUTH_COTI_PRIV.includes(PRIV) ? '' : USER,
            date
         })
      )

      if (itemsAll.length > 0) {
         return res.status(200).json({
            msg: 'Cotizaciones obtenidos correctamente 🖖',
            data: itemsAll,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay cotizaciones registradas 😫',
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

ctrlCotizador.getItemsCotizaciones = async (req, res) => {
   try {
      client.connect()

      const { ID } = req.query

      let allItems = await client.exec(
         searchCotizacionDetalle({ ID })
      )

      if (allItems.length > 0) {
         return res.status(200).json({
            msg: 'Cotizaciones obtenidos correctamente 🖖',
            data: allItems,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay cotizaciones registradas 😫',
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

ctrlCotizador.getDetailsCotizaciones = async (req, res) => {
   try {
      const { DATE } = req.query
      const { user: USER, permiso: PRIV } = await decodeJWT(req.headers.authorization)

      client.connect()
      let allItems = await client.exec(searchAllInfoCot({
         user: process.env.AUTH_COTI_PRIV.includes(PRIV) ? '' : USER,
         date: DATE
      }))

      if (allItems.length === 0) {
         return res.status(204).json({
            msg: 'No hay cotizaciones registradas 😫',
            data: [],
         })
      }

      return res.status(200).json({
         msg: 'Cotizaciones obtenidos correctamente 🖖',
         data: allItems,
      })
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCotizador.getAllProdCompany = async (req, res) => {
   try {
      const { company } = req.query

      client.connect()
      let allProducts = []

      if (company === 'Cartomanabi') {
         allProducts = await client.exec(
            searchAllProducts()
         )
      }

      if (company === 'Austrobox') {
         allProducts = await client.exec(
            searchProductsAustro()
         )
      }

      if (allProducts.length > 0) {
         return res.status(200).json({
            msg: 'Productos obtenidos correctamente 🖖',
            data: allProducts,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay productos asociados 😫',
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

ctrlCotizador.postAssignProdCli = async (req, res) => {
   try {
      const { products, cliente, company } = req.body
      const { userID: ID } = await decodeJWT(req.headers.authorization)

      if (products.length === 0) {
         return res.status(204).json({
            msg: 'No hay productos para asignar 😫',
         })
      }

      client.connect()

      if (company === 'Cartomanabi') {
         for (const item of products) {
            try {
               const resp = await client.exec(
                  getSearchClientCarto({
                     PT: item,
                     CLIENT: cliente,
                  })
               )

               if (resp.length > 0) {
                  return res.status(203).json({
                     msg: `${item} - Producto ya asignado 🤔`,
                  })
               }
            } catch (e) {
               console.error(e)

               return res.status(500).json({
                  msg: 'Error del server. Intentelo más luego x_x 🤯',
               })
            }
         }

         const savePromises = products.map(async (item) => {
            const resp = await client.exec(
               postAsignClientCarto({
                  PT: item,
                  CLIENT: cliente,
                  SUST: item,
                  ID,
                  SCN: 'Y'
               })
            )

            return resp
         })

         const results = await Promise.all(savePromises)

         if (results.every(rslt => rslt === 1)) {
            return res.status(200).json({
               msg: 'Productos asignados correctamente 🎊',
            })
         } else {
            return res.status(204).json({
               msg: 'No se pudo asignar los productos 😫',
            })
         }
      }

      if (company === 'Austrobox') {
         for (const item of products) {
            try {
               const resp = await client.exec(
                  getSearchClientAustro({
                     PT: item,
                     CLIENT: cliente,
                  })
               )

               if (resp.length > 0) {
                  return res.status(203).json({
                     msg: `${item} - Producto ya asignado 🤔`,
                  })
               }
            } catch (e) {
               console.error(e)

               return res.status(500).json({
                  msg: 'Error del server. Intentelo más luego x_x 🤯',
               })
            }
         }

         const savePromises = products.map(async (item) => {
            const resp = await client.exec(
               postAsignClientAustro({
                  PT: item,
                  CLIENT: cliente,
                  SUST: item,
                  ID,
                  SCN: 'Y'
               })
            )

            return resp
         })

         const results = await Promise.all(savePromises)

         if (results.every(rslt => rslt === 1)) {
            return res.status(200).json({
               msg: 'Productos asignados correctamente 🎊',
            })
         } else {
            return res.status(204).json({
               msg: 'No se pudo asignar los productos 😫',
            })
         }
      }

      return res.status(204).json({
         msg: 'No se pudo asignar los productos 😫',
      })
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCotizador.getClientsCotizaciones = async (req, res) => {
   try {
      client.connect()

      const { clients } = req.query
      const { user: USER, permiso: PRIV } = await decodeJWT(req.headers.authorization)

      let itemsAll = await client.exec(
         searchCotizacionesCli({
            user: process.env.AUTH_COTI_PRIV.includes(PRIV) ? '' : USER,
            clients
         })
      )

      if (itemsAll.length > 0) {
         return res.status(200).json({
            msg: 'Cotizaciones obtenidos correctamente 🖖',
            data: itemsAll,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay cotizaciones registradas 😫',
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

module.exports = ctrlCotizador

const { customAlphabet } = require('nanoid')
const idGen = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10)
const moment = require('moment')
moment.locale('es')

const ctrlBobinas = {}

const client = require('../connections/hana')
// const connectionDB = require('../connections/mysql')

const { getPapel } = require('../models/hanaQuery')

// const {
//    saveTPapel,
//    searchTPapel,
// } = require('../models/mysqlQuery')

const {
   getAllImportacion,
   searchTipImport,
   saveTipImport,
   searchTermPuerto,
   saveTermPuerto,
   searchTipFact,
   saveTipFact,
   searchAllFactura,
   saveImportacion,
   saveFactura
} = require('../models/hanaQImportacion')

const { decodeJWT } = require('../helpers/fntHelpers')

ctrlBobinas.getPapelSAP = async (req, res) => {
   try {
      client.connect()
      const allPapel = await client.exec(getPapel())

      if (allPapel.length > 0) {
         return res.status(200).json({
            msg: 'Papel obtenido correctamente 🖖',
            data: allPapel,
         })
      } else {
         return res.status(400).json({
            msg: 'No hay papel registrado 😫',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

// ctrlBobinas.postTPapel = async (req, res) => {
//    try {
//       const { codigo, detalle } = req.body

//       const idTP = `TP-CM-${idGen()}`

//       const searchTPap = await connectionDB.query(
//          searchTPapel(idTP, codigo.toUpperCase())
//       )

//       if (searchTPap.length > 0) {
//          return res.status(400).json({
//             msg: 'El tipo de papel ya existe 😫',
//          })
//       } else {
//          const newTPapel = await connectionDB.query(
//             saveTPapel(idTP, codigo.toUpperCase(), detalle.toUpperCase())
//          )

//          if (newTPapel.affectedRows > 0) {
//             return res.status(200).json({
//                msg: 'Tipo de papel guardado correctamente 🖖',
//                data: [
//                   {
//                      id: idTP,
//                      codigo: codigo.toUpperCase(),
//                      detalle: detalle.toUpperCase(),
//                   },
//                ],
//             })
//          } else {
//             return res.status(400).json({
//                msg: 'No se pudo guardar el tipo de papel 😫',
//             })
//          }
//       }
//    } catch (e) {
//       console.error(e)

//       return res.status(500).json({
//          msg: 'Error del server. Intentelo más luego x_x 🤯',
//       })
//    }
// }

// ctrlBobinas.getAllTPapel = async (req, res) => {
//    try {
//       const allTPapel = await connectionDB.query(searchTPapel())

//       if (allTPapel.length > 0) {
//          return res.status(200).json({
//             msg: 'Todos los tipos de papel 🖖',
//             data: allTPapel,
//          })
//       } else {
//          return res.status(204).json({
//             msg: 'No hay tipos de papel registrados 😫',
//          })
//       }
//    } catch (e) {
//       console.error(e)

//       return res.status(500).json({
//          msg: 'Error del server. Intentelo más luego x_x 🤯',
//       })
//    }
// }

ctrlBobinas.postPuerto = async (req, res) => {
   try {
      const { idCanton, nombre, direccion, email, duenio, telOne, telTwo } = req.body
      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()

      const recursive = async () => {
         const idPuerto = `PTO-CM-${idGen()}`

         // connectionDB.query(searchPuerto(idPuerto))
         const searchPto = await client.exec(searchTermPuerto({ ID: idPuerto }))

         if (searchPto.length > 0) {
            recursive()
         } else {
            const data = {
               idPuerto,
               idCanton,
               nombre: nombre.toUpperCase(),
               direccion: direccion.toUpperCase(),
               email: email.toLowerCase(),
               duenio: duenio.toUpperCase(),
               telOne,
               telTwo,
               USER
            }

            // connectionDB.query(savePuerto(data))
            const newPuerto = await client.exec(saveTermPuerto(data))

            if (newPuerto) {
               return res.status(200).json({
                  msg: 'Puerto guardado correctamente 🖖',
                  data
               })
            } else {
               return res.status(204).json({
                  msg: 'No se pudo guardar el puerto 😫',
                  data: [],
               })
            }
         }
      }

      recursive()
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlBobinas.getAllPuertos = async (req, res) => {
   try {
      // connectionDB.query(searchPuerto())
      client.connect()
      const allPuertos = await client.exec(searchTermPuerto({ ID: '', NOM: '', CANT: '', PROV: '' }))

      if (allPuertos.length > 0) {
         return res.status(200).json({
            msg: 'Todos los puertos encontrados 🖖',
            data: allPuertos,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay puertos registrados 😫',
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

ctrlBobinas.postTipImp = async (req, res) => {
   try {
      const { numImp, tipImp } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      const recursive = async () => {
         const idImp = `IMP-CM-${idGen()}`

         // connectionDB.query(searchTipImp(idImp))
         client.connect()
         const searchIDTImp = await client.exec(searchTipImport({ ID: idImp }))

         if (searchIDTImp.length > 0) {
            recursive()
         } else {
            // connectionDB.query(searchTipImp(idImp, tipImp.toUpperCase()))
            const searchTImp = await client.exec(searchTipImport({ ID: idImp, IMP: tipImp.toUpperCase() }))

            if (searchTImp.length > 0) {
               return res.status(204).json({
                  msg: 'El tipo de importación ya existe 😫',
               })
            } else {
               // connectionDB.query(saveTipImp(idImp, numImp, tipImp.toUpperCase()))
               const newImport = await client.exec(saveTipImport({
                  ID: idImp,
                  NUM: numImp,
                  TIP: tipImp.toUpperCase(),
                  USER
               }))

               if (newImport) {
                  return res.status(200).json({
                     msg: 'Información guardada correctamente 🖖',
                     data: {
                        id: idImp,
                        numero: numImp,
                        tipo: tipImp.toUpperCase(),
                     },
                  })
               } else {
                  return res.status(400).json({
                     msg: 'No se pudo guardar la información 😫',
                  })
               }
            }
         }
      }

      recursive()
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlBobinas.getAllTipImp = async (req, res) => {
   try {
      client.connect()
      const allData = await client.exec(searchTipImport({ ID: '', IMP: '' }))

      if (allData.length > 0) {
         return res.status(200).json({
            msg: 'Todos tipos de importaciones 🖖',
            data: allData,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay tipos de importaciones registrados 😫',
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

ctrlBobinas.postImportacion = async (req, res) => {
   const { user: USER } = await decodeJWT(req.headers.authorization)

   const { data } = req.body
   const {
      ID_PAIS,
      ID_PRTO,
      ID_TIMPT,
      ORDEN_COMPRA,
      FACTURA,
      DAI,
      MRN,
      BL,
      PROVEEDOR,
      DATE_ARRIBO,
      VENC_ECAS,
      REGIMEN,
      COMENTARIO
   } = data

   client.connect()

   const recursive = async () => {
      const idImport = `IMP-CM-${idGen()}`

      // connectionDB.query(searchImport(idImport, DAI))
      const searchImp = await client.exec(getAllImportacion({ ID: idImport, DAI }))

      if (searchImp.length > 0) {
         recursive()
      } else {
         const data = {
            ID_IMPT: idImport,
            ID_PAIS,
            ID_PRTO,
            ID_TIMPT,
            ORDEN_COMPRA,
            FACTURA,
            DAI,
            MRN,
            BL,
            PROVEEDOR: PROVEEDOR && PROVEEDOR.toUpperCase(),
            DATE_ARRIBO: moment(DATE_ARRIBO).format('YYYY-MM-DD'),
            VENC_ECAS: moment(VENC_ECAS).format('YYYY-MM-DD'),
            REGIMEN,
            COMENTARIO: COMENTARIO && COMENTARIO.toUpperCase(),
            USER
         }

         // connectionDB.query(saveImport(data))
         const newImport = await client.exec(saveImportacion(data))

         if (newImport) {
            return res.status(200).json({
               msg: 'Importación guardada correctamente 🖖',
               data
            })
         } else {
            return res.status(400).json({
               msg: 'No se pudo guardar la importación 😫',
            })
         }
      }
   }

   recursive()
}

ctrlBobinas.getAllImportacion = async (req, res) => {
   try {
      // connectionDB.query(searchImport())
      client.connect()
      const allImport = await client.exec(getAllImportacion({ DAI: '', ID: '' }))

      if (allImport.length > 0) {
         return res.status(200).json({
            msg: 'Todas las importaciones encontradas 🖖',
            data: allImport,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay importaciones registradas 😫',
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

ctrlBobinas.getAllTipFact = async (req, res) => {
   try {
      // connectionDB.query(searchTipFact())
      client.connect()
      const allTipFact = await client.exec(searchTipFact({ ID: '', TIP: '' }))

      if (allTipFact.length > 0) {
         return res.status(200).json({
            msg: 'Todos los tipos de facturas encontrados 🖖',
            data: allTipFact,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay tipos de facturas registrados 😫',
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

ctrlBobinas.postTipFact = async (req, res) => {
   try {
      const { tipFact } = req.body
      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()

      const recursive = async () => {
         const idFact = `TFAC-CM-${idGen()}`

         // connectionDB.query(searchTipFact(idFact, tipFact.toUpperCase()))
         const searchIDFact = await client.exec(searchTipFact({ ID: idFact, TIP: tipFact.toUpperCase() }))

         if (searchIDFact.length > 0) {
            recursive()
         } else {
            // connectionDB.query(saveTipFact(idFact, tipFact.toUpperCase()))
            const newTFact = await client.exec(saveTipFact({ ID: idFact, TIPO: tipFact.toUpperCase(), USER }))

            if (newTFact) {
               return res.status(200).json({
                  msg: 'Información guardada correctamente 🖖',
                  data: {
                     id: idFact,
                     tipo: tipFact.toUpperCase(),
                  }
               })
            } else {
               return res.status(400).json({
                  msg: 'No se pudo guardar la información 😫',
               })
            }
         }
      }

      recursive()
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlBobinas.getAllFacturas = async (req, res) => {
   try {
      // connectionDB.query(searchFactura())
      client.connect()
      const allFact = await client.exec(searchAllFactura({ ID_FACT: '', ID_IMPT: '' }))

      if (allFact.length > 0) {
         return res.status(200).json({
            msg: 'Todas las facturas encontradas 🖖',
            data: allFact,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay facturas registradas 😫',
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

ctrlBobinas.postFacturas = async (req, res) => {
   try {
      const { data } = req.body
      const {
         ID_IMPT,
         ID_TINVC,
         COMENTARIO
      } = data

      const { user: USER } = await decodeJWT(req.headers.authorization)
      client.connect()

      const recursive = async () => {
         const idFact = `FAC-CM-${idGen()}`

         // connectionDB.query(searchFactura(idFact, ID_IMPPAPEL))
         const searchFact = await client.exec(searchAllFactura({ ID_FACT: idFact, ID_IMPT: ID_IMPT }))

         if (searchFact.length > 0) {
            recursive()
         } else {
            const data = {
               ID_INVC: idFact,
               ID_IMPT,
               ID_TINVC,
               COMENTARIO: COMENTARIO && COMENTARIO.toUpperCase(),
               USER
            }

            // connectionDB.query(saveFactura(data))
            const newFact = await client.exec(saveFactura(data))

            if (newFact) {
               // connectionDB.query(searchFactura(idFact))
               let data = await client.exec(searchAllFactura({ ID_FACT: idFact }))

               return res.status(200).json({
                  msg: 'Información guardada correctamente 🖖',
                  data: data[0],
               })
            } else {
               return res.status(400).json({
                  msg: 'No se pudo guardar la información 😫',
               })
            }
         }
      }

      recursive()
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

module.exports = ctrlBobinas

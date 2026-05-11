const ctrlLogin = {}

const xlsx = require('xlsx')
const client = require('../connections/hana')
// const psql = require('../connections/psql')
const { CrearPDF } = require('../helpers/createPDFCal')

const {
   getAllLotesDespachoPDFCal,
   getAllDataCabDespachoPDFCal,
   getDetailsEmbaje,
   getColorsImpresion,
   getCodePDFCal,
   insertPDFCal
} = require('../models/hanaQCalidad')

const {
   searhCountries,
   searhProvincias,
   searhCantones
} = require('../models/hanaQImportacion')

const {
   searchEmployees,
   updateAsistencia
} = require('../models/psqlQSorteo')

ctrlLogin.welcome = (req, res) => {
   res.status(200).json({
      msg: 'Welcome to the API - COPLAIM !!!🖖'
   })
}

ctrlLogin.getAllCountries = async (req, res) => {
   try {
      // connectionDB.query(allCountries())
      client.connect()
      const allCont = await client.exec(searhCountries({ COD: '', PAIS: '' }))

      if (allCont.length > 0) {
         res.status(200).json({
            msg: 'Todos los países registrados 🖖',
            data: allCont,
         })
      } else {
         res.status(204).json({
            msg: 'No hay países registrados 😫',
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

ctrlLogin.getAllProvincias = async (req, res) => {
   try {
      // connectionDB.query(allProvincias())
      client.connect()
      const allProv = await client.exec(searhProvincias({ PROV: '' }))

      if (allProv.length > 0) {
         res.status(200).json({
            msg: 'Todas las provincias registradas 🖖',
            data: allProv,
         })
      } else {
         res.status(204).json({
            msg: 'No hay provincias registradas 😫',
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

ctrlLogin.getAllCantones = async (req, res) => {
   try {
      // connectionDB.query(allCantones())
      let allCant = []

      client.connect()

      if (req.query.nom || req.query.idProv) {
         allCant = await client.exec(searhCantones({
            CANT: req.query.nom,
            PROV: req.query.idProv
         }))
      } else {
         allCant = await client.exec(searhCantones({ CANT: '', PROV: '' }))
      }

      if (allCant.length > 0) {
         res.status(200).json({
            msg: 'Todos los cantones registrados 🖖',
            data: allCant,
         })
      } else {
         res.status(204).json({
            msg: 'No hay cantones registrados 😫',
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

ctrlLogin.getAllLoteDespPDFCal = async (req, res) => {
   try {
      const {
         FECHA,
         CLIENTE,
         VENDEDOR,
      } = req.query

      client.connect()
      const allInformation = await client.exec(getAllLotesDespachoPDFCal({
         FECHA,
         CLIENTE,
         VENDEDOR,
      }))

      if (allInformation.length > 0) {
         res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInformation,
         })
      } else {
         res.status(204).json({
            msg: 'No existe información registrada 😫',
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

ctrlLogin.generatePDFCalidad = async (req, res) => {
   try {
      const { GUIA, DOC_SAP, LOTE, PT_CODE } = req.body

      client.connect()
      const verifyPDF = await client.exec(getCodePDFCal({
         GUIA,
         DOC_SAP,
         LOTE,
      }))

      if (verifyPDF.length > 0) {
         let code =
            verifyPDF[0].CODE < 9999
               ? `000${verifyPDF[0].CODE}`
               : verifyPDF[0].CODE < 99999
                  ? `00${verifyPDF[0].CODE}`
                  : verifyPDF[0].CODE < 999999
                     ? `0${verifyPDF[0].CODE}`
                     : `${verifyPDF[0].CODE}`

         const allInformation = await client.exec(getAllLotesDespachoPDFCal({
            FOLIO: GUIA, // Esto le cambié
            DOC_SAP,
            LOTE,
         }))

         if (allInformation.length > 0) {
            const allInfoCab = await client.exec(getAllDataCabDespachoPDFCal({
               LOTE,
               PT_CODE,
            }))

            if (allInfoCab.length > 0) {
               const allInfoPT = await client.exec(getDetailsEmbaje({
                  PT_CODE: allInfoCab[0].PT_CODE
               }))

               if (allInfoPT.length > 0) {
                  const allInfoColors = await client.exec(getColorsImpresion({
                     OP: allInfoCab[0].ORDEN_PROD
                  }))

                  const dataPDF = {
                     allInformation: [{ ...allInformation[0], CANTIDAD: allInformation.reduce((acc, it) => acc + Number(it.CANTIDAD), 0) }],
                     allInfoCab,
                     allInfoPT,
                     allInfoColors
                  }

                  const resp = CrearPDF(dataPDF, code)

                  if (resp) {
                     return res.status(200).json({
                        msg: 'PDF generado correctamente 🖖',
                        data: `${code}.pdf`,
                     })
                  } else {
                     return res.status(400).json({
                        msg: 'No se pudo generar el PDF 😫',
                     })
                  }
               } else {
                  res.status(400).json({
                     msg: 'El producto no tiene la información completa 😫',
                     data: [],
                  })
               }
            } else {
               res.status(400).json({
                  msg: 'No tiene registrado los datos de calidad 😫',
                  data: [],
               })
            }
         } else {
            res.status(400).json({
               msg: 'No tiene lote, guia o doc. de SAP 😫',
               data: [],
            })
         }
      } else {
         const allInformation = await client.exec(getAllLotesDespachoPDFCal({
            FOLIO: GUIA, // Esto le cambié
            DOC_SAP,
            LOTE,
         }))

         if (allInformation.length > 0) {
            const allInfoCab = await client.exec(getAllDataCabDespachoPDFCal({
               LOTE,
               PT_CODE
            }))

            if (allInfoCab.length > 0) {
               const allInfoPT = await client.exec(getDetailsEmbaje({
                  PT_CODE: allInfoCab[0].PT_CODE
               }))

               if (allInfoPT.length > 0) {
                  const allInfoColors = await client.exec(getColorsImpresion({
                     OP: allInfoCab[0].ORDEN_PROD
                  }))

                  const codePDF = await client.exec(getCodePDFCal({
                     GUIA: '',
                     DOC_SAP: '',
                     LOTE: '',
                  }))

                  let code =
                     codePDF[0].CODE < 9999
                        ? `000${codePDF[0].CODE + 1}`
                        : codePDF[0].CODE < 99999
                           ? `00${codePDF[0].CODE + 1}`
                           : codePDF[0].CODE < 999999
                              ? `0${codePDF[0].CODE + 1}`
                              : `${codePDF[0].CODE + 1}`

                  const dataPDF = {
                     allInformation: [{ ...allInformation[0], CANTIDAD: allInformation.reduce((acc, it) => acc + Number(it.CANTIDAD), 0) }],
                     allInfoCab,
                     allInfoPT,
                     allInfoColors
                  }

                  const resp = CrearPDF(dataPDF, code)

                  if (resp) {
                     await client.exec(insertPDFCal({
                        ID_PDFCA: codePDF[0].CODE + 1,
                        GUIA,
                        DOC_SAP,
                        LOTE,
                     }))

                     return res.status(200).json({
                        msg: 'PDF generado correctamente 🖖',
                        data: `${code}.pdf`,
                     })
                  } else {
                     return res.status(400).json({
                        msg: 'No se pudo generar el PDF 😫',
                     })
                  }
               } else {
                  res.status(400).json({
                     msg: 'El producto no tiene la información completa 😫',
                     data: [],
                  })
               }
            } else {
               res.status(400).json({
                  msg: 'No tiene registrado los datos de calidad 😫',
                  data: [],
               })
            }
         } else {
            res.status(400).json({
               msg: 'No tiene lote, guia o doc. de SAP 😫',
               data: [],
            })
         }
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlLogin.uploadFile = async (req, res) => {
   try {
      console.log(req.files)

      if (req.files) {
         const { path } = req.files[0]

         try {
            const workbook = xlsx.readFile(path)
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const data = xlsx.utils.sheet_to_json(firstSheet)

            // validationSchema ==> Validar schema
            console.log(data)
         } catch (e) {
            console.error(e)
         }

         res.status(200).json({
            msg: 'Archivo subido correctamente 🖖',
            data: req.files,
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

// ctrlLogin.getAllEmployeesChern = async (req, res) => {
//    try {
//       const allInformation = await psql.query(searchEmployees())

//       if (allInformation.rowCount > 0) {
//          return res.status(200).json({
//             msg: 'Información obtenida correctamente 🖖',
//             data: allInformation.rows
//          })
//       } else {
//          return res.status(204).json({
//             msg: 'No existe información registrada 😫',
//             data: []
//          })
//       }
//    } catch (e) {
//       console.error(e)

//       res.status(500).json({
//          msg: 'Error del server. Intentelo más luego x_x 🤯',
//       })
//    }
// }

ctrlLogin.getAllEmployeesChern = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(searchEmployees())

      if (allInfo.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo
         })
      } else {
         return res.status(204).json({
            msg: 'No existe información registrada 😫',
            data: []
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlLogin.postSaveAsistEmployee = async (req, res) => {
   try {
      const { DNI, STATUS } = req.body

      client.connect()
      const allInfo = await client.exec(updateAsistencia({ DNI, STATUS }))

      if (allInfo) {
         return res.status(200).json({
            msg: 'Asistencia actualizada correctamente 🖖',
            data: []
         })
      } else {
         return res.status(204).json({
            msg: 'No se pudo actualizar la asistencia 😫',
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

module.exports = ctrlLogin
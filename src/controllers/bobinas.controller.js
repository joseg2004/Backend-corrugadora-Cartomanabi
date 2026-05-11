const { customAlphabet } = require('nanoid')
const idGen = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 5)
const moment = require('moment')
moment.locale('es')
const { createItmPDF } = require('../helpers/PDFItmBob')
const { createPDFBobAdu, createPDFBob, createPDFBobinas } = require('../helpers/createPDF')
const { createItmPDFAdu } = require('../helpers/PDFItmBobAdu')

const ctrlImport = {}

const client = require('../connections/hana')
const {
   getStockBobinas,
   getDescBobinas,
   getGramAnchBob,
   saveItmBobinas,
   getStockLaminas,
   searchBobADUANA,
   getInfoBobinas,
   getAllInfoBobinas,
   getStockBobinasDays
} = require('../models/hanaQBobinas')

const {
   getAllBobinas
} = require('../models/hanaQuery')

const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

ctrlImport.getBobinas = async (req, res) => {
   try {
      client.connect()
      const allBobinas = await client.exec(getAllBobinas())

      if (allBobinas.length > 0) {
         res.status(200).json({
            msg: 'Bobinas obtenidas correctamente 🖖',
            data: allBobinas,
         })
      } else {
         res.status(204).json({
            msg: 'No hay bobinas registradas 😫',
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

ctrlImport.getAllBobinas = async (req, res) => {
   try {
      client.connect()

      // if (req.query.cod) {
      //    const allGraBobinas = await client.exec(getGramAnchBob({bod: req.query.bod, cod: req.query.cod, prov: req.query.prov}))
      //    const allDescBobinas = await client.exec(getDescBobinas({bod: req.query.bod, cod: req.query.cod, prov: req.query.prov}))

      //    res.status(200).json({
      //       msg: 'Bobinas obtenidas correctamente 🖖',
      //       data: {
      //          allGraBobinas,
      //          allDescBobinas
      //       }
      //    })
      // } else {

      const allStockBobinas = await client.exec(
         getStockBobinas({
            bod: req.query.bod,
            cod: req.query.cod,
            prov: req.query.prov && req.query.prov.replace(/,/g, '\',\''),
         })
      )

      const allGraBobinas = await client.exec(
         getGramAnchBob({
            bod: req.query.bod,
            cod: req.query.cod,
            prov: req.query.prov && req.query.prov.replace(/,/g, '\',\''),
         })
      )

      const allDescBobinas = await client.exec(
         getDescBobinas({
            bod: req.query.bod,
            cod: req.query.cod,
            prov: req.query.prov && req.query.prov.replace(/,/g, '\',\''),
         })
      )

      if (allStockBobinas.length > 0) {
         res.status(200).json({
            msg: 'Bobinas obtenidas correctamente 🖖',
            data: {
               allStockBobinas,
               allGraBobinas,
               allDescBobinas
            }
         })
      } else {
         res.status(200).json({
            msg: 'No hay bobinas registradas 😫',
            data: {
               allStockBobinas: [],
               allGraBobinas: [],
               allDescBobinas: []
            },
         })
      }
      // }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlImport.postItmBobinas = async (req, res) => {
   try {
      const {
         detailsSho
      } = req.body

      client.connect()
      const ID = `BOB-${idGen()}`

      const savePromises = detailsSho.map(async (itm) => {
         const resp = await client.exec(
            saveItmBobinas(
               ID, `${itm.CODIGO}`, `${itm.LOTE}`, `${itm.ALMACEN}`, `${itm.U_GC_GRAMAJE.toFixed(2)}`, `${itm.U_GC_ANCHO.toFixed(2)}`, `${itm.STOCK.toFixed(3)}`, `${itm.FECHA || moment().format('YYYY-MM-DD')}`
            )
         )

         return resp
      })

      const results = await Promise.all(savePromises)
      if (results.every(rslt => rslt === 1)) {
         const resp = createItmPDF(ID)

         if (resp) {
            return res.status(200).json({
               msg: 'PDF generado correctamente 🖖',
               data: ID
            })
         } else {
            return res.status(204).json({
               msg: 'No se pudo generar el PDF 😫',
            })
         }
      } else {
         res.status(204).json({
            msg: 'Error al generar el reporte x_x 🤯',
            data: '',
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlImport.getAllLaminas = async (req, res) => {
   try {
      client.connect()
      const allLaminas = await client.exec(getStockLaminas({
         alm: req.query.alm,
         art: req.query.art,
      }))

      if (allLaminas.length > 0) {
         res.status(200).json({
            msg: 'Láminas obtenidas correctamente 🖖',
            data: allLaminas,
         })
      } else {
         res.status(204).json({
            msg: 'No hay láminas registradas 😫',
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

ctrlImport.getBobinasAduana = async (req, res) => {
   try {
      client.connect()
      const allAduana = await client.exec(searchBobADUANA({
         date: req.query.date,
         cod: req.query.cod,
         prov: req.query.prov && req.query.prov.replace(/,/g, '\',\''),
         std: req.query.std,
      }))

      if (allAduana.length > 0) {
         res.status(200).json({
            msg: 'Bobinas obtenidas correctamente 🖖',
            data: allAduana,
         })
      } else {
         res.status(204).json({
            msg: 'No hay bobinas registradas 😫',
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

ctrlImport.getGeneratePDFBobAdu = async (req, res) => {
   try {
      const {
         LOTE
      } = req.body

      client.connect()
      const resp = await client.exec(searchBobADUANA({ LOTE }))

      if (resp.length > 0) {
         const data = createPDFBobAdu({
            COD: resp[0].LOTE,
            DATE: resp[0].FECHA,
            DESCRIPCION: resp[0].DESCRIPCION,
            PROVEEDOR: resp[0].PROVEEDOR,
            LOTE: resp[0].LOTE,
            CODIGO: resp[0].TIPO,
            PESO: resp[0].PESO,
            GRAMAJE: resp[0].GRAMAJE,
            ANCHO: resp[0].ANCHO
         })

         if (data) {
            return res.status(200).json({
               msg: 'PDF generado correctamente 🖖',
               data: `BOB-${LOTE.toUpperCase()}.pdf`
            })
         } else {
            return res.status(204).json({
               msg: 'No se pudo generar el PDF 😫',
            })
         }
      } else {
         return res.status(204).json({
            msg: 'No existe ese lote de bobina 😫',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlImport.getGeneratePDFBob = async (req, res) => {
   try {
      const {
         LOTE,
         ACCION
      } = req.body

      client.connect()

      const resp = await client.exec(getInfoBobinas({ LOTE }))

      if (resp.length > 0) {
         const data = createPDFBob({
            COD: resp[0].LOTE,
            DATE: resp[0].FECHA,
            DESCRIPCION: resp[0].DESCRIPCION,
            PROVEEDOR: resp[0]?.PROVEEDOR || '---',
            LOTE: resp[0].LOTE,
            CODIGO: resp[0].CODIGO,
            PESO: Number(resp[0].PESO || 0),
            GRAMAJE: Number(resp[0]?.GRAMAJE || 0),
            ANCHO: Number(resp[0]?.ANCHO || 0),
            CANTIDAD: ACCION !== '' ? Number(resp[0].PESO || 0) : '',
            LOTEPROV: resp[0]?.LOTEPROV || '---',
            RECICLADO: resp[0]?.RECICLADO === 'SI' ? '(RECICLADO)' : resp[0]?.RECICLADO === 'HP' ? '(HIGH PERFORMANCE)' : '',
            FSC: resp[0]?.FSC || 'NO',
         })
         console.log(data);

         if (data) {
            return res.status(200).json({
               msg: 'PDF generado correctamente 🖖',
               data: `BOB-CM-${LOTE.toUpperCase()}.pdf`
            })
         } else {
            return res.status(204).json({
               msg: 'No se pudo generar el PDF 😫',
            })
         }
      } else {
         return res.status(204).json({
            msg: 'No existe ese lote de bobina 😫',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlImport.postItmBobinasAdu = async (req, res) => {
   try {
      const {
         detailsSho
      } = req.body

      client.connect()
      const ID = `BOB-${idGen()}`

      const savePromises = detailsSho.map(async (itm) => {
         const resp = await client.exec(
            saveItmBobinas(
               ID, `${itm.CODIGO}`, `${itm.LOTE}`, `${itm.ALMACEN}`, `${itm.U_GC_GRAMAJE.toFixed(2)}`, `${itm.U_GC_ANCHO.toFixed(2)}`, `${itm.STOCK.toFixed(3)}`, `${itm.FECHA}`
            )
         )

         return resp
      })

      const results = await Promise.all(savePromises)
      if (results.every(rslt => rslt === 1)) {
         const resp = createItmPDFAdu(ID)

         if (resp) {
            return res.status(200).json({
               msg: 'PDF generado correctamente 🖖',
               data: ID
            })
         } else {
            return res.status(204).json({
               msg: 'No se pudo generar el PDF 😫',
            })
         }
      } else {
         res.status(204).json({
            msg: 'Error al generar el reporte x_x 🤯',
            data: '',
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlImport.getGeneratePDFBobinas = async (req, res) => {
   try {
      const {
         detailsSho
      } = req.body

      const lotes = detailsSho.map(itm => `${itm.CODIGO} - ${itm.LOTE}`)
      // console.log(lotes)

      if (lotes.length > 0) {
         client.connect()
         const resp = await client.exec(getAllInfoBobinas(lotes.join('\', \'')))

         if (resp.length > 0) {
            const LOTE = idGen(10)
            const data = createPDFBobinas(resp, `${LOTE}`)

            if (data) {
               return res.status(200).json({
                  msg: 'PDF generado correctamente 🖖',
                  data: `BOB-CM-${LOTE.toUpperCase()}`
               })
            } else {
               return res.status(204).json({
                  msg: 'No se pudo generar el PDF 😫',
               })
            }
         } else {
            return res.status(204).json({
               msg: 'No existe ese lote de bobina 😫',
            })
         }
      } else {
         return res.status(204).json({
            msg: 'No tienes lotes seleccionados 😫',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlImport.getBobinasDays = async (req, res) => {
   try {
      const { bod, cod, month } = req.query

      const
         START =
            moment()
               .utcOffset('-05:00')
               .date(1)
               .subtract(month, 'months')
               .format('YYYY-MM-DD'),
         END =
            moment(moment().subtract(1, 'months').format('YYYY-MM-DD'))
               .utcOffset('-05:00')
               .date(months[Number(moment().subtract(1, 'months').format('MM')) - 1])
               .format('YYYY-MM-DD'),
         START_ONE =
            moment()
               .utcOffset('-05:00')
               .date(1)
               .subtract(1, 'months')
               .format('YYYY-MM-DD'),
         END_ONE =
            moment(`${START_ONE}`)
               .date(months[Number(moment(START_ONE).format('MM')) - 1])
               .format('YYYY-MM-DD'),
         START_TWO =
            moment()
               .utcOffset('-05:00')
               .date(1)
               .subtract(2, 'months')
               .format('YYYY-MM-DD'),
         END_TWO =
            moment(`${START_TWO}`)
               .date(months[Number(moment(START_TWO).format('MM')) - 1])
               .format('YYYY-MM-DD'),
         START_THREE =
            moment()
               .utcOffset('-05:00')
               .date(1)
               .subtract(3, 'months')
               .format('YYYY-MM-DD'),
         END_THREE =
            moment(`${START_THREE}`)
               .date(months[Number(moment(START_THREE).format('MM')) - 1])
               .format('YYYY-MM-DD'),
         START_ACTUAL =
            moment()
               .utcOffset('-05:00')
               .date(1)
               .format('YYYY-MM-DD'),
         END_ACTUAL =
            moment(`${START_ACTUAL}`)
               .date(months[Number(moment(START_ACTUAL).format('MM')) - 1])
               .format('YYYY-MM-DD')

      client.connect()
      const allBobinas = await client.exec(getStockBobinasDays({
         bod,
         cod,
         NUM_MONTH: month,
         START,
         END,
         START_ONE,
         END_ONE,
         START_TWO,
         END_TWO,
         START_THREE,
         END_THREE,
         START_ACTUAL,
         END_ACTUAL,
      }))

      if (allBobinas.length > 0) {
         res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allBobinas,
         })
      } else {
         res.status(204).json({
            msg: 'No hay información registrada 😫',
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

module.exports = ctrlImport
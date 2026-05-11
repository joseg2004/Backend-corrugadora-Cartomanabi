const { customAlphabet } = require('nanoid')
const idGen = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 9)
const client = require('../connections/hana')
const nodemailer = require('nodemailer')
const path = require('path')
const moment = require('moment')
moment.locale('es')

const ctrlTickets = {}

const { getAllProducts, saveRequisionCab, saveRequisionDet } = require('../models/hanaQBodega')
const { decodeJWT } = require('../helpers/fntHelpers')
const { CrearPDFRequi } = require('../helpers/PDFRequisicion')
const { searchUserDept } = require('../models/hanaQCotizador')

ctrlTickets.allProductsBod = async (req, res) => {
   try {
      client.connect()
      const allProducts = await client.exec(getAllProducts({
         date: req.query.date,
      }))

      if (allProducts.length > 0) {
         return res.status(200).json({
            msg: 'Productos obtenidos correctamente 🖖',
            data: allProducts,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay productos registrados 😫',
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

ctrlTickets.saveRequision = async (req, res) => {
   try {
      const {
         detailsSho,
         text
      } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)
      const ID = `REQUI-${idGen()}`

      client.connect()
      const saveRequision = await client.exec(saveRequisionCab({
         ID,
         USER,
         COMENTARIO: text ? text.toUpperCase() : '',
         DATE: moment().format('YYYY-MM-DD'),
         STD: 'PENDIENTE',
      }))

      if (saveRequision) {
         const savePromises = detailsSho.map(async (item) => {
            const resp = await client.exec(saveRequisionDet({
               ID_REQUI: ID,
               CODE_PRO: item.CODE_PRO,
               PRODUCTO: item.PRODUCTO.replaceAll('"', '').replaceAll('\'', '').replaceAll(';', '').replaceAll(',', ''),
               CODE_UTIL: item.CODE_UTILIDAD,
               UTILIDAD: item.UTILIDAD,
               END_COMPRA: item.END_COMPRA ? item.END_COMPRA.split('/').reverse().join('-') : moment().format('YYYY-MM-DD'),
               CANTIDAD: Number(item.CANTIDAD),
            }))

            return resp
         })

         const results = await Promise.all(savePromises)

         if (results.every(rslt => rslt === 1)) {
            const products = detailsSho.map(item => ({
               CODE_PRO: item.CODE_PRO,
               PRODUCTO: item.PRODUCTO,
               CANTIDAD: Number(item.CANTIDAD),
            }))

            const srchDept = await client.exec(searchUserDept({ user: USER }))

            const resp = CrearPDFRequi(
               {
                  ID,
                  USER: `${srchDept[0].NAME}`,
                  PERMISO: srchDept[0].DEPARTAMENT,
                  COMENTARIO: text ? text.toUpperCase() : '',
                  DATE: moment().format('DD/MM/YYYY'),
               },
               products
            )

            if (resp) {
               try {
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

                  const info = await transporte.sendMail({
                     from: `CARTOMANABI SA <${process.env.OFFICE_USER}>`,
                     to: `${process.env.EMAIL_BODEGA}`,
                     subject: 'Requisición Cartomanabi',
                     text: `Estimada ${process.env.NAME_BODEGA}, \n \nNos complace informarles que ${srchDept[0].NAME.toUpperCase()} ha solicitado la requición ${ID} ${text ? `, con nota ${text.toUpperCase()}` : ''}. \n \nSaludos cordiales, \n \nCARTOMANABI SA`,
                     attachments: [{
                        filename: `${ID}.pdf`,
                        path: path.join(__dirname, `../docs/requisicion/${ID}.pdf`),
                        contentType: 'application/pdf'
                     }],
                  })

                  console.log(info.response)
               } catch (e) {
                  console.log(e)
               }

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
      } else {
         return res.status(204).json({
            msg: 'Error al generar el reporte x_x 🤯',
            data: '',
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
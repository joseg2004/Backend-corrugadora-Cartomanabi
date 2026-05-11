const client = require('../connections/hana')
const moment = require('moment')
moment.locale('es')
const axios = require('axios')
const { SignInSL, httpsAgent } = require('../helpers/cnfSLayer')
const { decodeJWT } = require('../helpers/fntHelpers')

const ctrlOrdrComp = {}

const {
   searchListProveedores,
   searchListItm,
   saveOrdcComp,
   searchOrdcComp,
   searchDirSocio,
   searchListPayments,
   searchItmOrders,
   searchSocioDet,
   searchWeekPaper,
   searchListProvRepuestos,
   searchListItmRep
} = require('../models/hanaQOrdrComp')
const { createPurchasePDF, createPurchaseOtrosPDF } = require('../helpers/PDFPurchaseOrders')
const { searchFactPO } = require('../models/hanaQImportacion')

ctrlOrdrComp.getListProveedores = async (req, res) => {
   try {
      const { TIPO } = req.query

      client.connect()
      let allInfo = []

      if (Number(TIPO) === 30) {
         allInfo = await client.exec(searchListProveedores())
      }

      if (Number(TIPO) === 31) {
         allInfo = await client.exec(searchListProvRepuestos())
      }

      if (allInfo.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo,
         })
      } else {
         return res.status(201).json({
            msg: 'No hay información registrada 😫',
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

ctrlOrdrComp.getListPaper = async (req, res) => {
   try {
      const { TIPO } = req.query

      client.connect()
      let allInfo = []

      if (Number(TIPO) === 30) {
         allInfo = await client.exec(searchListItm())
      }

      if (Number(TIPO) === 31) {
         allInfo = await client.exec(searchListItmRep())
      }

      if (allInfo.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo,
         })
      } else {
         return res.status(201).json({
            msg: 'No hay información registrada 😫',
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

ctrlOrdrComp.getListPayments = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(searchListPayments())

      if (allInfo.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo,
         })
      } else {
         return res.status(201).json({
            msg: 'No hay información registrada 😫',
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

ctrlOrdrComp.postPurchaseOrdr = async (req, res) => {
   try {
      const {
         RUC,
         CLIENTE,
         DIRECCION,
         DATE_ARR,
         OC_PROV,
         FSC,
         COMMENT,
         PAYMENT,
         MONEY,
         ROWS,
         PASS,
         TIPO
      } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      const auth = await SignInSL(USER, PASS)

      if (auth) {
         let docsLines = []

         if (TIPO === '') {
            return res.status(203).json({
               msg: 'El tipo de documento es obligatorio 😫'
            })
         }

         if (RUC === '') {
            return res.status(203).json({
               msg: 'El RUC del proveedor es obligatorio 😫'
            })
         }

         if (CLIENTE === '') {
            return res.status(203).json({
               msg: 'El nombre del proveedor es obligatorio 😫'
            })
         }

         if (DATE_ARR === '') {
            return res.status(203).json({
               msg: 'La fecha de llegada es obligatoria 😫'
            })
         }

         if (ROWS.length < 1) {
            return res.status(203).json({
               msg: 'No se puede crear una orden de compra sin items 😫'
            })
         }

         // const CED = RUC.replaceAll('SE', '')

         ROWS.forEach((itm) => {
            docsLines.push({
               'LineNum': itm.LINE,
               'ItemCode': `${itm.CODE}`,
               'ItemDescription': `${itm.DESCRIPTION}`,
               'Quantity': Number(itm.CANTIDAD),
               'ShipDate': `${moment(itm.DATE_ENTG).format('YYYY-MM-DD')}`,
               'UnitPrice': Number(itm.PRICE),
               'WarehouseCode': TIPO === 31 ? '08' : itm.VATGRP ? '01' : '08',
               'VatGroup': itm.VATGRP ? 'IVA_15' : 'IVA_0',
               'TaxCode': itm.VATGRP ? 'IVA_15' : 'IVA_0',
               'ItemDetails': `${itm?.DETALLE ? itm?.DETALLE.toUpperCase() : ''}`,
               'U_GC_ANCHO': TIPO === 31 ? '' : Number(itm.ANCHO),
               'U_GC_GRAM': TIPO === 31 ? '' : Number(itm.GRAMAJE),
               'U_GC_ORDR_PROV': `${OC_PROV}`,
               'U_GC_SOLICITANTE': `${FSC || ''}`
            })
         })

         const values = {
            'DocType': 'dDocument_Items',
            'DocDate': `${moment().utcOffset('-05:00').format('YYYY-MM-DD')}`,
            'DocDueDate': `${moment(DATE_ARR).format('YYYY-MM-DD')}`,
            'CardCode': `${RUC}`,
            'NumAtCard': `${OC_PROV}`,
            'PaymentGroupCode': Number(PAYMENT),
            'JournalMemo': `Pedidos - ${RUC}`,
            'Comments': `${COMMENT}`,
            'Confirmed': 'tYES',
            'SummeryType': 'dNoSummary',
            'PayToCode': `${DIRECCION}`,
            'LanguageCode': 25,
            'FederalTaxID': `${RUC.slice(1)}`,
            'DocCurrency': 'USD',
            'U_GC_DESTINO': `${MONEY}`,
            'U_GC_ORIGEN': 'COPLAIM',
            'DocumentLines': docsLines
         }

         const resp = await axios.post(`${process.env.SL_URL}/PurchaseOrders`, values, {
            headers: {
               Cookie: `B1SESSION=${auth};`,
               'Content-Type': 'application/json;charset=UTF-8',
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
            },
            httpsAgent: httpsAgent,
         })

         if (resp.status === 201) {
            const { DocEntry, DocNum } = resp.data

            client.connect()
            const saveComp = await client.exec(saveOrdcComp({
               DOC_ENTRY: DocEntry,
               DOC_NUM: DocNum,
               USER,
               ESTADO: 'R',
               TIPO_DOC: TIPO,
            }))

            if (saveComp) {
               return res.status(200).json({
                  msg: 'Orden de compra creada correctamente 🖖',
                  data: resp.data
               })
            } else {
               return res.status(204).json({
                  msg: 'Error al crear la orden de compra 😶',
               })
            }
         }

         if (resp.status === 400) {
            return res.status(204).json({
               msg: 'Error al crear la orden de compra 😶',
            })
         }
      } else {
         return res.status(203).json({
            msg: 'Credenciales de acceso incorrectas 😫',
         })
      }
   } catch (e) {
      console.log(e)
      console.error(e.response.data)

      return res.status(500).json({
         msg: `${e?.response?.data?.error?.message?.value} 🤯`,
         data: []
      })
   }
}

ctrlOrdrComp.getListOrdPurchase = async (req, res) => {
   try {
      const { ID } = req.query

      client.connect()

      const allInfo = await client.exec(searchOrdcComp(ID))

      if (allInfo.length === 0) {
         return res.status(201).json({
            msg: 'No hay información registrada 😫',
            data: []
         })
      }

      const docEntries = [...new Set(allInfo.map(r => r.DOC_ENTRY).filter(Boolean))]

      const results = await Promise.all(
         docEntries.map(de => client.exec(searchFactPO(de)))
      )

      const itemsByDocEntry = {}
      docEntries.forEach((de, idx) => {
         itemsByDocEntry[de] = results[idx] || []
      })

      return res.status(200).json({
         msg: 'Información obtenida correctamente 🖖',
         data: { allInfo, itemsByDocEntry },
      })

   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlOrdrComp.getListDirectionsBP = async (req, res) => {
   try {
      const { RUC } = req.query

      client.connect()
      const allInfo = await client.exec(searchDirSocio({ RUC }))

      if (allInfo.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo,
         })
      } else {
         return res.status(201).json({
            msg: 'No hay información registrada 😫',
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

ctrlOrdrComp.getDetailsOrdPurchase = async (req, res) => {
   try {
      const {
         ID
      } = req.query

      const auth = await SignInSL(process.env.SL_USER, process.env.SL_PASS)

      if (auth) {
         const resp = await axios.get(`${process.env.SL_URL}/PurchaseOrders(${ID})?$select=DocEntry,DocNum,DocType,DocDate,DocDueDate,CardCode,NumAtCard,JournalMemo,Comments,Confirmed,SummeryType,PaymentGroupCode,PayToCode,LanguageCode,FederalTaxID,DocCurrency,DocumentLines,U_GC_DESTINO,DocumentStatus,BusinessPartner/CardName&$expand=BusinessPartner`, {
            headers: {
               Cookie: `B1SESSION=${auth};`,
               'Content-Type': 'application/json;charset=UTF-8',
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
            },
            httpsAgent: httpsAgent,
         })

         if (resp.status === 200) {
            const data = resp.data

            return res.status(200).json({
               msg: 'Informacion obtenida correctamente 🖖',
               data
            })
         }

         if (resp.status === 400) {
            return res.status(204).json({
               msg: 'Error al cargar los datos 😶',
            })
         }
      } else {
         return res.status(203).json({
            msg: 'Credenciales de acceso incorrectas 😫',
         })
      }
   } catch (e) {
      console.log(e)
      console.error(e.response.data)

      return res.status(500).json({
         msg: `${e?.response?.data?.error?.message?.value} 🤯`,
         data: []
      })
   }
}

ctrlOrdrComp.putPurchaseOrdr = async (req, res) => {
   try {
      const {
         DOC_ENTRY,
         RUC,
         CLIENTE,
         DIRECCION,
         DATE_ARR,
         OC_PROV,
         COMMENT,
         PAYMENT,
         MONEY,
         ROWS,
         PASS,
         TIPO
      } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      const auth = await SignInSL(USER, PASS)

      if (!auth) {
         return res.status(203).json({
            msg: 'Credenciales de acceso incorrectas 😫',
         })
      }

      let docsLines = []

      if (TIPO === '') {
         return res.status(203).json({
            msg: 'El tipo de documento es obligatorio 😫'
         })
      }

      if (RUC === '') {
         return res.status(203).json({
            msg: 'El RUC del proveedor es obligatorio 😫'
         })
      }

      if (CLIENTE === '') {
         return res.status(203).json({
            msg: 'El nombre del proveedor es obligatorio 😫'
         })
      }

      if (DATE_ARR === '') {
         return res.status(203).json({
            msg: 'La fecha de llegada es obligatoria 😫'
         })
      }

      if (ROWS.length < 1) {
         return res.status(203).json({
            msg: 'No se puede crear una orden de compra sin items 😫'
         })
      }

      ROWS.forEach((itm) => {
         if (itm.STATUS === 'bost_Close') {
            docsLines.push({
               'LineNum': itm.LINE,
               'ItemCode': `${itm.CODE}`,
               'Quantity': Number(itm.CANTIDAD),
               'ShipDate': `${moment(itm.DATE_ENTG).format('YYYY-MM-DD')}`,
               'U_GC_ORDR_PROV': `${itm.OC_PROV}`,
               'U_GC_SOLICITANTE': `${itm?.FSC || ''}`
            })
         } else {
            docsLines.push({
               'LineNum': itm.LINE,
               'ItemCode': `${itm.CODE}`,
               'ItemDescription': `${itm.DESCRIPTION}`,
               'Quantity': Number(itm.CANTIDAD),
               'ShipDate': `${moment(itm.DATE_ENTG).format('YYYY-MM-DD')}`,
               'UnitPrice': Number(itm.PRICE),
               'VatGroup': itm.VATGRP ? 'IVA_15' : 'IVA_0',
               'TaxCode': itm.VATGRP ? 'IVA_15' : 'IVA_0',
               'ItemDetails': `${itm?.DETALLE ? itm?.DETALLE.toUpperCase() : ''}`,
               'U_GC_ANCHO': TIPO === 31 ? '' : Number(itm.ANCHO),
               'U_GC_GRAM': TIPO === 31 ? '' : Number(itm.GRAMAJE),
               'U_GC_ORDR_PROV': `${itm.OC_PROV}`,
               'U_GC_SOLICITANTE': `${itm?.FSC || ''}`
            })
         }
      })

      const values = {
         'DocType': 'dDocument_Items',
         'DocDueDate': `${moment(DATE_ARR).format('YYYY-MM-DD')}`,
         'NumAtCard': `${OC_PROV}`,
         'PaymentGroupCode': Number(PAYMENT),
         'Comments': `${COMMENT}`,
         'Confirmed': 'tYES',
         'PayToCode': `${DIRECCION}`,
         'LanguageCode': 25,
         'DocCurrency': 'USD',
         'U_GC_DESTINO': `${MONEY}`,
         'DocumentLines': docsLines
      }

      const resp = await axios.patch(`${process.env.SL_URL}/PurchaseOrders(${DOC_ENTRY})`, values, {
         headers: {
            'Cookie': `B1SESSION=${auth};`,
            'Content-Type': 'application/json;charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
            'B1S-ReplaceCollectionsOnPatch': true
         },
         httpsAgent: httpsAgent,
      })

      if (resp.status === 204) {
         return res.status(200).json({
            msg: 'Orden de compra actualizada correctamente 🖖',
            data: []
         })
      }

      if (resp.status === 400) {
         return res.status(204).json({
            msg: 'Error al crear la orden de compra 😶',
         })
      }
   } catch (e) {
      console.log(e)
      console.error(e.response.data)

      return res.status(500).json({
         msg: `${e?.response?.data?.error?.message?.value} 🤯`,
         data: []
      })
   }
}

ctrlOrdrComp.generatePDFPurchaseOrders = async (req, res) => {
   try {
      const {
         ENTRY,
         NUM,
         TIPO
      } = req.body




      client.connect()
      const searchOrder = await client.exec(searchItmOrders({ ENTRY, NUM, TIPO }))

      if (searchOrder.length > 0) {
         const provDetails = await client.exec(searchSocioDet({ RUC: searchOrder[0].COD_PROV }))

         if (provDetails.length > 0) {
            const CLIENT = {
               PROVEEDOR: provDetails[0].PROVEDOR,
               NIT: provDetails[0].COD_PROV,
               CONTACT: provDetails[0].CONTACT,
               PHONE1: provDetails[0].PHONE1,
               PHONE2: provDetails[0].PHONE2,
               FORMA_PAGO: searchOrder[0].FORM_PAY,
               FECHA_ARR: searchOrder[0].FECHA_ARR,
               ORIGEN: provDetails[0].ORIGEN,
               MONEY: searchOrder[0].MONEY,
               COMMENTS: searchOrder[0].COMMENTS,
               CIA: 'Cartomanabi SA',
            }

            const TOTALES = {
               subCero: 0,
               subDoce: Number(searchOrder[0].TOTAL - searchOrder[0].IVA12).toFixed(5),
               ivaTot: Number(searchOrder[0].IVA12).toFixed(5),
               totPagar: Number(searchOrder[0].TOTAL).toFixed(5),
            }

            let resPDF = false

            const is32 = Number(TIPO) === 32
            const docNum = searchOrder?.[0]?.DOC_NUM ?? ''
            const fecha = searchOrder?.[0]?.FECHA_ARR
            const yy = fecha
               ? String(new Date(fecha).getFullYear()).slice(-2)
               : String(new Date().getFullYear()).slice(-2)
            const fileName = is32
               ? `OC-CM-${yy}${docNum}`      // tipo 32: año pegado al número
               : `OC-CM-${docNum}`          // tipo 30: como estaba

            if (Number(TIPO) === 30 || Number(TIPO) === 32) {


               resPDF = await createPurchasePDF({
                  CLIENT,
                  ITEMS: searchOrder,
                  TOTALES,
                  FILE: fileName
               })
            }

            if (Number(TIPO) === 31) {
               resPDF = await createPurchaseOtrosPDF({
                  CLIENT,
                  ITEMS: searchOrder,
                  TOTALES,
                  FILE: fileName
               })
            }

            if (resPDF) {
               return res.status(201).json({
                  msg: 'PDF generado correctamente 🖖',
                  data: `${fileName}.pdf`
               })
            }

            return res.status(400).json({
               msg: 'Error al generar el PDF 😶',
               data: []
            })
         } else {
            return res.status(204).json({
               msg: 'No hay información registrada 😫',
               data: []
            })
         }
      } else {
         return res.status(204).json({
            msg: 'No hay información registrada 😫',
            data: []
         })
      }
   } catch (e) {
      console.log(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlOrdrComp.getTimeWeekPaper = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(searchWeekPaper())

      if (allInfo.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo,
         })
      } else {
         return res.status(201).json({
            msg: 'No hay información registrada 😫',
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

module.exports = ctrlOrdrComp
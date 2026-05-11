const client = require('../connections/hana')
const moment = require('moment')
moment.locale('es')
const fs = require('fs')
const path = require('path')
const { decodeJWT, numberFormatToDecimals, skipEmails } = require('../helpers/fntHelpers')
const { asigVendedorRest } = require('../helpers/searchVendedorAsig')
const { listCliAccounts, detailsAccounts, getTotalAccounts, searchPaymentsCli } = require('../models/hanaQAccounts')
const axios = require('axios')
// const stdAccountsTmp = require('../templates/emails/stdAccounts.tmp')
const zlib = require('zlib')
const newStdAccTmp = require('../templates/emails/newStdAcc.tmp')
const { createPDFAccountStd } = require('../helpers/createPDF')
const { loginAuth } = require('../models/hanaQuery')
const mailConfSaldosTmp = require('../templates/emails/mailConfSaldos.tmp')
const { searchDetailsAnexoCli } = require('../models/hanaQAnexosComp')

const ctrlTickets = {}

ctrlTickets.allAccountState = async (req, res) => {
   try {
      const { user: USER, permiso } = await decodeJWT(req.headers.authorization)

      const users = await asigVendedorRest({ VEND: USER, ID: USER })

      client.connect()
      const allData = await client.exec(listCliAccounts({
         ID: process.env.AUTH_PRIV_ACCT.includes(permiso) || process.env.AUTH_USER_ACCT.includes(USER) ? '' : users
      }))

      if (allData.length > 0) {
         return res.status(200).json({
            msg: 'Productos obtenidos correctamente 🖖',
            data: allData,
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
         msg: `${e?.message || 'Error del server. Intentelo más luego x_x'}🤯`,
      })
   }
}

ctrlTickets.postMailClient = async (req, res) => {
   try {
      const { RUC, OPT } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      const srchEmail = await client.exec(loginAuth(USER))

      const allData = await client.exec(detailsAccounts({ RUC }))

      if (allData.length === 0) {
         return res.status(204).json({
            msg: 'No hay cuentas registradas 😫',
            data: []
         })
      }

      const fecha = moment().utcOffset('-05:00').format('YYYY-MM-DD')
      const infoAdicional = await client.exec(searchDetailsAnexoCli({ RUC: allData[0].CodCliente }))
      const totalData = await client.exec(getTotalAccounts({ RUC }))
      const srchPayments = await client.exec(searchPaymentsCli({ RUC: allData[0].CodCliente, FECHA: fecha }))

      const optPDF = {
         cliente: allData[0].Cliente,
         vencido: numberFormatToDecimals(allData.filter(itm => itm.StdFactura === 'V').reduce((a, b) => a + Number(b.Saldo), 0), 2),
         vencer: numberFormatToDecimals(allData.filter(itm => itm.StdFactura === 'PV').reduce((a, b) => a + Number(b.Saldo), 0), 2),
         fecha: moment().format('LL'),
         totalinesV: `<tr>
                           <td>${totalData[0].Cliente}</td>
                           <td>${totalData[0].DiasCredito}</td>
                           <th>$ ${numberFormatToDecimals(Number(totalData[0].Total_Vencido) + Number(totalData[0].Total_Por_Vencer), 2) }</th>
                           <td>$ ${numberFormatToDecimals(totalData[0].Total_Vencido, 2)}</td>
                           <td>$ ${numberFormatToDecimals(totalData[0].Total_Por_Vencer, 2)}</td>
                           <td>$ ${numberFormatToDecimals(totalData[0].Vencido_30, 2)}</td>
                           <td>$ ${numberFormatToDecimals(totalData[0].Vencido_31_60, 2)}</td>
                           <td>$ ${numberFormatToDecimals(totalData[0].Vencido_61_90, 2)}</td>
                           <td>$ ${numberFormatToDecimals(totalData[0].MasVencido_90, 2)}</td>
                        </tr>`,
         infoAdicional: infoAdicional // .length > 0 ? infoAdicional[0] : {}
      }

      // const tmplt = stdAccountsTmp(optPDF)
      const tmplt = newStdAccTmp(optPDF)

      // Datos del cliente para el Excel
      const clientData = {
         nombre: allData[0].Cliente,
         dcred: Number(totalData[0].DiasCredito),
         vendedor: totalData[0].Vendedor || 'Sin vendedor',
         saldoFinal: (Number(totalData[0]?.Total_Vencido) + Number(totalData[0]?.Total_Por_Vencer)) || '0.00',
         fechaCorte: moment().format('DD-MM-YYYY HH:mm:ss'),
         totalCartera :(Number(totalData[0].Total_Vencido) + Number(totalData[0].Total_Por_Vencer)).toFixed(2),
         vencido: Number(totalData[0].Total_Vencido).toFixed(2),
         porVencer: Number(totalData[0].Total_Por_Vencer).toFixed(2),
         vencido30d: Number(totalData[0].Vencido_30).toFixed(2),
         vencido31a60d: Number(totalData[0].Vencido_31_60).toFixed(2),
         vencido61a90d: Number(totalData[0].Vencido_61_90).toFixed(2),
         vencido90omas: Number(totalData[0].MasVencido_90).toFixed(2),
         infoAdicional: infoAdicional // .length > 0 ? infoAdicional[0] : {}
      }

      const payments = {
         PAGO: srchPayments.filter((itm) => itm.TipoDoc === 'PAGO'),
         ANTICIPO: srchPayments.filter((itm) => itm.TipoDoc === 'ANTICIPO'),
         RETENCION: srchPayments.filter((itm) => itm.TipoDoc === 'RETENCION'),
      } // PAGO - ANTICIPO - RETENCION

      const nameFile = `${allData[0].Cliente.replace(/ /g, '_')}_${moment().format('DD-MM-YYYY')}.pdf`

      // Dividir los datos en dos grupos
      const dataV = allData
         .filter((itm) => itm.StdFactura === 'V')
         .map((line) => ({
            tipo: 'FA',
            documento: line.Factura,
            fecha: moment(line.Emision).format('DD/MM/YYYY'),
            fechaVenc: moment(line.Vencimiento).format('DD/MM/YYYY'),
            valor: Number(line.TotalFactura).toFixed(2),
            abonos: Number(line.Abono).toFixed(2),
            saldo: Number(line.Saldo).toFixed(2),
            corriente: (
               moment(line.Vencimiento).diff(moment(line.Emision)) >= 0 && moment(line.Vencimiento).diff(moment(line.Emision)) <= 15
            )
               ? Number((Number(line.TotalFactura) - Number(line.Abono)).toFixed(3))
               : 0,
            de1a30: line.StdFactura === 'V' && (Number(line.Dias) <= 0 && Number(line.Dias) >= -30) ? Number(Number(line.TotalFactura-Number(line.Abono)).toFixed(3)) : 0,
            de31a60: line.StdFactura === 'V' && (Number(line.Dias) < -30 && Number(line.Dias) >= -60) ? Number(Number(line.TotalFactura-Number(line.Abono)).toFixed(3)) : 0,
            de61a90: line.StdFactura === 'V' && (Number(line.Dias) < -60 && Number(line.Dias) >= -90) ? Number(Number(line.TotalFactura-Number(line.Abono)).toFixed(3)) : 0,
            masDe91: line.StdFactura === 'V' && (Number(line.Dias) < -90 ) ? Number(Number(line.TotalFactura).toFixed(3)) : 0,
            diasAtraso: line.Dias * (-1)
         })).sort((a, b) => b.diasAtraso - a.diasAtraso)

      const dataPV = allData
         .filter((itm) => itm.StdFactura === 'PV')
         .map((line) => ({
            tipo: 'FA',
            documento: line.Factura,
            pedido: line.Pedido || '',
            fecha: moment(line.Emision).format('DD/MM/YYYY'),
            fechaVenc: moment(line.Vencimiento).format('DD/MM/YYYY'),
            valor: Number(line.TotalFactura).toFixed(2),
            abonos: Number(line.Abono).toFixed(2),
            saldo: Number(line.Saldo).toFixed(2),
            corriente: 0,
            de1a30: (line.Dias >= 0 && line.Dias <= 30) ? Number(Number(line.TotalFactura - Number(line.Abono)).toFixed(3)) : 0,
            de31a60: (line.Dias > 30 && line.Dias <= 60) ? Number(Number(line.TotalFactura- Number(line.Abono)).toFixed(3)) : 0,
            de61a90: (line.Dias > 60 && line.Dias <= 90) ? Number(Number(line.TotalFactura - Number(line.Abono)).toFixed(3)) : 0,
            masDe91: (line.Dias > 90 ) ? Number(Number(line.TotalFactura).toFixed(3)) : 0,
            diasAtraso: line.Dias
         })).sort((a, b) => a.diasAtraso - b.diasAtraso)

      const createFile = await createPDFAccountStd(dataV, dataPV, clientData, nameFile, payments, fecha)

      if (!createFile) {
         return res.status(400).json({
            msg: 'Error al generar el archivo 😫',
         })
      }

      const resp = await axios.post(`${process.env.API_JOBS}/email`, {
         from: `CARTOMANABI SA <${process.env.EMAIL_CONTABILIDAD}>`,
         to: OPT === 'Clientes' ? allData[0].EmailCli : allData[0].EmailVend,
         cc: `${process.env.EMAIL_ACCOUNTS};${OPT === 'Clientes' ? (
            allData[0].Cliente === 'AUSTROBOX' ? `${allData[0].EmailVend}; ${allData[0].EmailAsign}` : `${allData[0].EmailVend}; ${allData[0].EmailAsign}`
         ) : ''};${srchEmail[0]?.MAIL_USER ?? ''}`,
         // cc: `${process.env.EMAIL_GERENCIA}`,
         subject: `Estado de cuenta de ${allData[0].Cliente}`,
         html: zlib.gzipSync(tmplt.replace(/\n/g, '')),
         file: [{
            filename: nameFile,
            content: fs.readFileSync(path.join(__dirname, `../docs/accstates/${nameFile.toUpperCase()}`)).toString('base64'),
            encoding: 'base64',
            contentType: 'application/pdf'
         }],
         auth: {
            user: process.env.EMAIL_CONTABILIDAD,
            pass: process.env.PASS_CONTABILIDAD
         }
      }, {
         headers: {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/json',
         }
      })

      // fs.unlinkSync(excelPath)

      if (resp.status === 200) {
         return res.status(200).json({
            msg: resp.data.msg,
            data: []
         })
      }

      return res.status(400).json({
         msg: 'Error al notificar al cliente 😫',
      })

   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: `${e?.message || 'Error del server. Intentelo más luego x_x'}🤯`,
      })
   }
}

ctrlTickets.getDetailsAcc = async (req, res) => {
   try {
      const { RUC } = req.query

      const allData = await client.exec(detailsAccounts({ RUC }))

      if (allData.length > 0) {
         return res.status(200).json({
            msg: 'Est. cuentas obtenidas correctamente 🖖',
            data: allData,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay estados de cuentas registradas 😫',
            data: []
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: `${e?.message || 'Error del server. Intentelo más luego x_x'}🤯`,
      })
   }
}

ctrlTickets.postMailClientConfAcc = async (req, res) => {
   try {
      const { RUC, OPT } = req.body

      // const { user: USER } = await decodeJWT(req.headers.authorization)

      // const srchEmail = await client.exec(loginAuth(USER))

      const allData = await client.exec(detailsAccounts({ RUC }))

      if (allData.length === 0) {
         return res.status(204).json({
            msg: 'No hay cuentas registradas 😫',
            data: []
         })
      }

      const fecha = moment().utcOffset('-05:00').format('YYYY-MM-DD')
      const totalData = await client.exec(getTotalAccounts({ RUC }))
      const infoAdicional = await client.exec(searchDetailsAnexoCli({ RUC: allData[0].CodCliente }))
      const srchPayments = await client.exec(searchPaymentsCli({ RUC: allData[0].CodCliente, FECHA: fecha }))

      const optPDF = {
         cod_cli: allData[0].RUC,
         cliente: allData[0].Cliente,
         vencido: numberFormatToDecimals(allData.filter(itm => itm.StdFactura === 'V').reduce((a, b) => a + Number(b.Saldo), 0), 2),
         vencer: numberFormatToDecimals(allData.filter(itm => itm.StdFactura === 'PV').reduce((a, b) => a + Number(b.Saldo), 0), 2),
         fecha: moment().format('LL'),
         mail_cont: process.env.EMAIL_COMUNICATION,
         name_cont: process.env.NAME_CONTRALOR,
         tel_cont: process.env.TEL_CONTRALOR,
         infoAdicional: infoAdicional // .length > 0 ? infoAdicional[0] : {}
      }

      const tmplt = mailConfSaldosTmp(optPDF)

      // Datos del cliente para el Excel
      const clientData = {
         nombre: allData[0].Cliente,
         dcred: Number(totalData[0].DiasCredito),
         vendedor: totalData[0].Vendedor || 'Sin vendedor',
         saldoFinal: (Number(totalData[0]?.Total_Vencido) + Number(totalData[0]?.Total_Por_Vencer)) || '0.00',
         fechaCorte: moment().format('DD-MM-YYYY HH:mm:ss'),
         totalCartera :(Number(totalData[0].Total_Vencido) + Number(totalData[0].Total_Por_Vencer)).toFixed(2),
         vencido: Number(totalData[0].Total_Vencido).toFixed(2),
         porVencer: Number(totalData[0].Total_Por_Vencer).toFixed(2),
         vencido30d: Number(totalData[0].Vencido_30).toFixed(2),
         vencido31a60d: Number(totalData[0].Vencido_31_60).toFixed(2),
         vencido61a90d: Number(totalData[0].Vencido_61_90).toFixed(2),
         vencido90omas: Number(totalData[0].MasVencido_90).toFixed(2),
         infoAdicional: infoAdicional // .length > 0 ? infoAdicional[0] : {}
      }

      const payments = {
         PAGO: srchPayments.filter((itm) => itm.TipoDoc === 'PAGO'),
         ANTICIPO: srchPayments.filter((itm) => itm.TipoDoc === 'ANTICIPO'),
         RETENCION: srchPayments.filter((itm) => itm.TipoDoc === 'RETENCION'),
      } // PAGO - ANTICIPO - RETENCION

      const nameFile = `${allData[0].Cliente.replace(/ /g, '_')}_${moment().format('DD-MM-YYYY')}.pdf`

      // Dividir los datos en dos grupos
      const dataV = allData
         .filter((itm) => itm.StdFactura === 'V')
         .map((line) => ({
            tipo: 'FA',
            documento: line.Factura,
            fecha: moment(line.Emision).format('DD/MM/YYYY'),
            fechaVenc: moment(line.Vencimiento).format('DD/MM/YYYY'),
            valor: Number(line.TotalFactura).toFixed(2),
            abonos: Number(line.Abono).toFixed(2),
            saldo: Number(line.Saldo).toFixed(2),
            corriente: (
               moment(line.Vencimiento).diff(moment(line.Emision)) >= 0 && moment(line.Vencimiento).diff(moment(line.Emision)) <= 15
            )
               ? Number((Number(line.TotalFactura) - Number(line.Abono)).toFixed(3))
               : 0,
            de1a30: line.StdFactura === 'V' && (Number(line.Dias) <= 0 && Number(line.Dias) >= -30) ? Number(Number(line.TotalFactura-Number(line.Abono)).toFixed(3)) : 0,
            de31a60: line.StdFactura === 'V' && (Number(line.Dias) < -30 && Number(line.Dias) >= -60) ? Number(Number(line.TotalFactura-Number(line.Abono)).toFixed(3)) : 0,
            de61a90: line.StdFactura === 'V' && (Number(line.Dias) < -60 && Number(line.Dias) >= -90) ? Number(Number(line.TotalFactura-Number(line.Abono)).toFixed(3)) : 0,
            masDe91: line.StdFactura === 'V' && (Number(line.Dias) < -90 ) ? Number(Number(line.TotalFactura).toFixed(3)) : 0,
            diasAtraso: line.Dias * (-1)
         })).sort((a, b) => b.diasAtraso - a.diasAtraso)

      const dataPV = allData
         .filter((itm) => itm.StdFactura === 'PV')
         .map((line) => ({
            tipo: 'FA',
            documento: line.Factura,
            pedido: line.Pedido || '',
            fecha: moment(line.Emision).format('DD/MM/YYYY'),
            fechaVenc: moment(line.Vencimiento).format('DD/MM/YYYY'),
            valor: Number(line.TotalFactura).toFixed(2),
            abonos: Number(line.Abono).toFixed(2),
            saldo: Number(line.Saldo).toFixed(2),
            corriente: 0,
            de1a30: (line.Dias >= 0 && line.Dias <= 30) ? Number(Number(line.TotalFactura - Number(line.Abono)).toFixed(3)) : 0,
            de31a60: (line.Dias > 30 && line.Dias <= 60) ? Number(Number(line.TotalFactura- Number(line.Abono)).toFixed(3)) : 0,
            de61a90: (line.Dias > 60 && line.Dias <= 90) ? Number(Number(line.TotalFactura - Number(line.Abono)).toFixed(3)) : 0,
            masDe91: (line.Dias > 90 ) ? Number(Number(line.TotalFactura).toFixed(3)) : 0,
            diasAtraso: line.Dias
         })).sort((a, b) => a.diasAtraso - b.diasAtraso)

      const createFile = await createPDFAccountStd(dataV, dataPV, clientData, nameFile, payments, fecha)

      if (!createFile) {
         return res.status(400).json({
            msg: 'Error al generar el archivo 😫',
         })
      }

      const emails = skipEmails(allData[0].EmailCli, ['@cartomanabi.com', '@cartomanabi.co'])

      if (emails.length === 0) {
         return res.status(204).json({
            msg: 'No se encontraron correos válidos para enviar la notificación 😫',
         })
      }

      // console.log(emails.join(';'))

      const resp = await axios.post(`${process.env.API_JOBS}/email`, {
         from: `CARTOMANABI SA <${process.env.EMAIL_CONTRALOR}>`,
         to: OPT === 'Clientes' ? `${emails.join(';')}` : `${emails.join(';')}`,
         // to: 'mdelgado@cartomanabi.com',
         // cc: `${OPT === 'Clientes' ? (
         //    allData[0].Cliente === 'AUSTROBOX' ? `${allData[0].EmailVend}; ${allData[0].EmailAsign}` : `${allData[0].EmailVend}; ${allData[0].EmailAsign}`
         // ) : ''};${srchEmail[0]?.MAIL_USER ?? ''}`,
         // cco: `${process.env.EMAIL_GERENCIA}`,
         subject: 'Solicitud de Confirmación de Saldo - CARTOMANABI SA',
         html: zlib.gzipSync(tmplt.replace(/\n/g, '')),
         file: [{
            filename: nameFile,
            content: fs.readFileSync(path.join(__dirname, `../docs/accstates/${nameFile.toUpperCase()}`)).toString('base64'),
            encoding: 'base64',
            contentType: 'application/pdf'
         }],
         auth: {
            user: process.env.EMAIL_CONTRALOR,
            pass: process.env.PASS_CONTRALOR
         }
      }, {
         headers: {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/json',
         }
      })

      // fs.unlinkSync(excelPath)

      if (resp.status === 200) {
         return res.status(200).json({
            msg: resp.data.msg,
            data: []
         })
      }

      return res.status(400).json({
         msg: 'Error al notificar al cliente 😫',
      })

   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: `${e?.message || 'Error del server. Intentelo más luego x_x'}🤯`,
      })
   }
}

module.exports = ctrlTickets
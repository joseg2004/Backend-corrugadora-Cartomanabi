const client = require('../connections/hana')
const moment = require('moment')
moment.locale('es')
const fs = require('fs')
const path = require('path')
const { decodeJWT, numberFormatToDecimals } = require('../helpers/fntHelpers')
const { detailsAccountsAu, getTotalAccountsAu } = require('../models/hanaQAccountsAu')
const axios = require('axios')
// const stdAccountsTmp = require('../templates/emails/stdAccounts.tmp')
const zlib = require('zlib')
const { createPDFAccountStdAu } = require('../helpers/createPDF')
const { loginAuth } = require('../models/hanaQuery')
const newStdAccAuTmp = require('../templates/emails/newStdAccAu.tmp')

const ctrlTicketsAu = {}

ctrlTicketsAu.postMailClientAu = async (req, res) => {
   try {
      const { RUC, OPT } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      const srchEmail = await client.exec(loginAuth(USER))

      const allData = await client.exec(detailsAccountsAu({ RUC }))

      if (allData.length > 0) {
         const totalData = await client.exec(getTotalAccountsAu({ RUC }))

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
                        </tr>`
         }

         const tmplt = newStdAccAuTmp(optPDF)

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
         }

         const nameFile = `AU_${allData[0].Cliente.replace(/ /g, '_')}_${moment().format('DD-MM-YYYY')}.pdf`

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

         const createFile = await createPDFAccountStdAu(dataV, dataPV, clientData, nameFile)

         if (!createFile) {
            return res.status(400).json({
               msg: 'Error al generar el archivo 😫',
            })
         }

         const resp = await axios.post(`${process.env.API_JOBS}/email`, {
            from: `AUSTROBOX SA <${process.env.EMAIL_CONTABILIDAD_AU}>`,
            to: OPT === 'Clientes' ? allData[0].EmailCli : allData[0].EmailVend,
            cc: `${srchEmail[0]?.MAIL_USER ?? ''}`,
            // cco: `${process.env.EMAIL_GERENCIA}`,
            subject: `Estado de cuenta de ${allData[0].Cliente}`,
            html: zlib.gzipSync(tmplt.replace(/\n/g, '')),
            file: [{
               filename: nameFile,
               content: fs.readFileSync(path.join(__dirname, `../docs/accstates/${nameFile.toUpperCase()}`)).toString('base64'),
               encoding: 'base64',
               contentType: 'application/pdf'
            }],
            auth: {
               user: process.env.EMAIL_CONTABILIDAD_AU,
               pass: process.env.PASS_CONTABILIDAD_AU
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
      } else {
         return res.status(204).json({
            msg: 'No hay cuentas registradas 😫',
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

module.exports = ctrlTicketsAu
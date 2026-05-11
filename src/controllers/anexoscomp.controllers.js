const client = require('../connections/hana')
const axios = require('axios')
const moment = require('moment')
moment.locale('es')
const xlsx = require('xlsx')
const fs = require('fs')
const zlib = require('zlib')
const stdAnexosTmp = require('../templates/emails/stdAnexos.tmp')

const ctrlAnexosComp = {}

const {
   searchAnexos,
   searchFactura,
   searchFactOri,
   saveFact21,
   searchFact21,
   saveCabFact21,
   searchCabFact21,
   searchListProdFact21,
   saveProdFact21,
   searchProdFact21,
   searchStockAduana,
   saveMatPriFact21,
   searchMatPriFact21,
   updateCabFact21,
   searchBusinesPartners,
   searchStockSenae,
   searchAnexosEmail,
   updateFact21,
   searchPapFacturas,
   searchFact21Bob,
   saveCabFact21Bob,
   saveMatPriFact21Bob,
   searchMatPriFact21Bob,
   updateCabFact21Bob,
   searchItemsStockSenae,
   searchDetailsAnexoCli,
   searchFacturasClienteByMonth,
   searchProductosByFactura
} = require('../models/hanaQAnexosComp')
const { decodeJWT } = require('../helpers/fntHelpers')
const { SignInSL, httpsAgent } = require('../helpers/cnfSLayer')
const { saveLogs } = require('../models/hanaQuery')

ctrlAnexosComp.getListAnexos = async (req, res) => {
   try {
      const { MONTH, YEAR } = req.query

      client.connect()
      const allData = await client.exec(searchAnexos({ MONTH, YEAR }))

      if (allData.length > 0) {
         return res.status(200).json({
            msg: 'Anexos obtenidos correctamente 🖖',
            data: allData,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay anexos registrados 😫',
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

ctrlAnexosComp.getDescpFact = async (req, res) => {
   try {
      const { FACT } = req.query

      client.connect()
      const data = await client.exec(searchFactura({ FACT }))
      const fact = await client.exec(searchFactOri({ DOC: data[0].DocSAP }))

      if (data.length > 0) {
         return res.status(200).json({
            msg: 'Anexos obtenidos correctamente 🖖',
            data: {
               data,
               fact
            },
         })
      } else {
         return res.status(204).json({
            msg: 'No hay anexos registrados 😫',
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

ctrlAnexosComp.postSaveFact21 = async (req, res) => {
   try {
      const { data } = req.body
      const { user: USER } = await decodeJWT(req.headers.authorization)

      // console.log(JSON.stringify(data, null, 2))

      // const lines = data.map(async (itm) => {
      //    client.connect()
      //    const searchID = await client.exec(searchListProdFact21({ ID_FR21: itm.Factura })) // AND T0."Cantidad" > 0

      //    return searchID
      // })

      // const results = await Promise.all(lines)
      // console.log(results)

      let MPFact21 = []

      client.connect()
      const searchID = await client.exec(searchFact21({ ID_AUTH: '', ID_FR21: '', STD: '', MAX: true }))

      const codeAuto = Number(searchID[0]?.CODE)

      let code =
            codeAuto < 9
               ? `000000${codeAuto + 1}`
               : codeAuto < 99
                  ? `00000${codeAuto + 1}`
                  : codeAuto < 999
                     ? `0000${codeAuto + 1}`
                     : codeAuto < 9999
                        ? `000${codeAuto + 1}`
                        : codeAuto < 99999
                           ? `00${codeAuto + 1}`
                           : codeAuto < 999999
                              ? `0${codeAuto + 1}`
                              : `${codeAuto + 1}`

      const saveFR21 = await client.exec(saveFact21({ ID_FR21: code, USER }))

      if (saveFR21) {
         const savePromises = data.map(async (itm) => {
            const resp = await client.exec(
               saveCabFact21({
                  ID_FR21: code,
                  DOC_SAP: itm.DocSAP,
                  FACTURA: itm.Factura,
                  FECHA: moment(itm.FechaFactura).format('YYYY-MM-DD')
               })
            )

            return resp
         })

         const results = await Promise.all(savePromises)

         if (results.every(rslt => rslt === 1)) {
            try {
               let cantKraft = await client.exec(searchStockAduana({ TYPE: 'KRAFT' }))
               let cantMedium = await client.exec(searchStockAduana({ TYPE: 'MEDIUM' }))
               let cantWhite = await client.exec(searchStockAduana({ TYPE: 'WHITE' }))
               let cantAlm = await client.exec(searchStockAduana({ TYPE: 'APRESTO' }))
               let cantResn = await client.exec(searchStockAduana({ TYPE: 'RESINA' }))
               let cantAdtv = await client.exec(searchStockAduana({ TYPE: 'ADITIVO' }))
               let cantPegmt = await client.exec(searchStockAduana({ TYPE: 'PEGAMENTO' }))
               let cantAdhs = await client.exec(searchStockAduana({ TYPE: 'ADHESIVO' }))

               // Filtrar los stocks de aduana para obtener solo los que tienen saldo positivo
               // cantAlm = cantAlm.filter(alm => (Number((Number(alm.Saldo) - Number(alm.Consumido)).toFixed(2)) > 0))

               let indice = 0

               const promises = data.map(async (itm) => {
                  const info = await client.exec(searchListProdFact21({ ID_FR21: itm.Factura }))

                  // console.log(JSON.stringify(info, null, 2))

                  const savePromises = info.map(async (it, idx) => {
                     ++idx

                     const resp = await client.exec(
                        saveProdFact21({
                           ID_FR21: code,
                           FACTURA: itm.Factura,
                           CODE_PT: it.CodProducto,
                           DESCRIPCION: it.Descripcion,
                           SUBPARTIDA: it.SUBPARTIDA,
                           U_MEDIDA: 'U',
                           CANTIDAD: it.Cantidad,
                           GR_ALM: it.GR_ALM,
                           FLAUTA: it.FLAUTA,
                           INDICE: ++indice
                        })
                     )

                     // Hacer los calculos matemáticos para obtener el valor a consumir de papel
                     if (resp) {
                        let cantAlmCons = 0, cantResnCons = 0, cantAdtvCons = 0, cantPegmtCons = 0

                        const cantKraftCons = Number(Number(it.KRAFT).toFixed(2))
                        const cantMediumCons = Number(Number(it.MEDIUM).toFixed(2))
                        const cantWhiteCons = Number(Number(it.WHITE).toFixed(2))
                        const prevAlmidon = Number(((Number(Number(it.TOT_AREA).toFixed(2)) * it.GR_ALM) / 1000).toFixed(2))
                        const prevPegamento = Number((Number(it.TOT_AREA) / 1000).toFixed(2))
                        const cantAdhesivoCons = Number(Number(it.CNS_PVA)) // 0.00215

                        // Si el producto tiene más de una flauta, se consume el 24.6% del almidón, 1.8% de resina y 1.8% de aditivo por cada flauta (2.2 es la constante resultante de multiplicar el porcentaje por el número de flautas)
                        if (it.FLAUTA.length > 1) {
                           cantAlmCons = Number((prevAlmidon * 0.246 * 2.2).toFixed(2)) // (24.6 / 100) = 24.6% | 2.2 const x flauta
                           cantResnCons = Number((prevAlmidon * 0.018 * 2.2).toFixed(2)) // (18 / 100) = 18% | 2.2 const x flauta
                           cantAdtvCons = Number((prevAlmidon * 0.018 * 2.2).toFixed(2)) // (18 / 100) = 18% | 2.2 const x flauta
                           cantPegmtCons = Number((prevPegamento * 0.246 * 2.2).toFixed(2)) // (24.6 / 100) = 24.6% | 2.2 const x flauta
                        } else {
                           if (it.FLAUTA === 'C') {
                              cantAlmCons = Number((prevAlmidon * 0.246).toFixed(2))
                              cantResnCons = Number((prevAlmidon * 0.018).toFixed(2))
                              cantAdtvCons = Number((prevAlmidon * 0.018).toFixed(2))
                              cantPegmtCons = Number((prevPegamento * 0.246).toFixed(2))
                           } else {
                              if (it.FLAUTA === 'B') {
                                 cantAlmCons = Number((prevAlmidon * 0.246 * 1.2).toFixed(2))
                                 cantResnCons = Number((prevAlmidon * 0.018 * 1.2).toFixed(2))
                                 cantAdtvCons = Number((prevAlmidon * 0.018 * 1.2).toFixed(2))
                                 cantPegmtCons = Number((prevPegamento * 0.246 * 1.2).toFixed(2))
                              }
                           }
                        }

                        let iniKraft = 0, iniMedium = 0, iniWhite = 0, iniAlm = 0, iniResn = 0, iniAdtv = 0, iniPegmt = 0, iniAdhs = 0
                        let faltanteKraft = 0, faltanteMedium = 0, faltanteWhite = 0, faltanteAlm = 0, faltanteResn = 0, faltanteAdtv = 0, faltantePegmt = 0, faltanteAdhs = 0

                        const kraft = cantKraft[iniKraft]
                        const medium = cantMedium[iniMedium]
                        const white = cantWhite[iniWhite]
                        const almidon = cantAlm[iniAlm]
                        const resina = cantResn[iniResn]
                        const aditivo = cantAdtv[iniAdtv]
                        const pegamento = cantPegmt[iniPegmt]
                        const adhesivo = cantAdhs[iniAdhs]

                        const consumoKraft = (kraft, cant) => {
                           if (
                              Number((Number(kraft.Saldo) - Number(kraft.Consumido)).toFixed(2)) > 0
                           ) {
                              const porc = Number((cant * 0.10).toFixed(2)) // 0.09

                              if (
                                 Number(
                                    (Number(kraft.Saldo) - Number(kraft.Consumido)).toFixed(2)
                                 ) >=
                                 Number(
                                    (Number(cant) + Number(porc)).toFixed(2)
                                 )
                              ) {
                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: kraft.Anexo,
                                    COD_ADUANA: kraft.CodInsumo,
                                    DESCRIPCION: kraft.DESCRIPCION,
                                    SUBPARTIDA: kraft.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number((cant).toFixed(2)),
                                    DESPERDICIO: porc,
                                    MERMA: 0,
                                    TOTAL: Number((Number(porc) + Number(cant)).toFixed(2)),
                                 })

                                 // Actualizar el stock de la aduana modificando la cantidad consumida
                                 cantKraft = cantKraft.map((k) => {
                                    if (k.Anexo === kraft.Anexo && k.CodInsumo === kraft.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number(porc) + Number(cant)).toFixed(2))
                                    }

                                    return k
                                 })

                                 faltanteKraft = 0
                              } else {
                                 const krafUti = Number(((Number(kraft.Saldo) - Number(kraft.Consumido)) / 1.1).toFixed(2))

                                 faltanteKraft = Number((Number(cant)).toFixed(2)) - Number(krafUti.toFixed(2))

                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: kraft.Anexo,
                                    COD_ADUANA: kraft.CodInsumo,
                                    DESCRIPCION: kraft.DESCRIPCION,
                                    SUBPARTIDA: kraft.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number(krafUti.toFixed(2)),
                                    DESPERDICIO: Number(((Number(kraft.Saldo) - Number(kraft.Consumido)).toFixed(2) - Number(krafUti.toFixed(2))).toFixed(2)),
                                    MERMA: 0,
                                    TOTAL: Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2)),
                                 })

                                 cantKraft = cantKraft.map((k) => {
                                    if (k.Anexo === kraft.Anexo && k.CodInsumo === kraft.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                                    }

                                    return k
                                 })

                                 if (faltanteKraft > 0) {
                                    iniKraft++

                                    consumoKraft(cantKraft[iniKraft], faltanteKraft)
                                 }
                              }
                           } else {
                              iniKraft++

                              consumoKraft(cantKraft[iniKraft], cant)
                           }
                        }

                        const consumoMedium = (medium, cant) => {
                           if (
                              Number((Number(medium.Saldo) - Number(medium.Consumido)).toFixed(2)) > 0
                           ) {
                              const porc = Number((cant * 0.10).toFixed(2)) // 0.09

                              if (
                                 Number(
                                    (Number(medium.Saldo) - Number(medium.Consumido)).toFixed(2)
                                 ) >=
                                 Number(
                                    (Number(cant) + Number(porc)).toFixed(2)
                                 )
                              ) {
                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: medium.Anexo,
                                    COD_ADUANA: medium.CodInsumo,
                                    DESCRIPCION: medium.DESCRIPCION,
                                    SUBPARTIDA: medium.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number((cant).toFixed(2)),
                                    DESPERDICIO: porc,
                                    MERMA: 0,
                                    TOTAL: Number((Number(porc) + Number(cant)).toFixed(2)),
                                 })

                                 // Actualizar el stock de la aduana modificando la cantidad consumida
                                 cantMedium = cantMedium.map((k) => {
                                    if (k.Anexo === medium.Anexo && k.CodInsumo === medium.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number(porc) + Number(cant)).toFixed(2))
                                    }

                                    return k
                                 })

                                 faltanteMedium = 0
                              } else {
                                 const krafUti = Number(((Number(medium.Saldo) - Number(medium.Consumido)) / 1.1).toFixed(2))

                                 faltanteMedium = Number((Number(cant)).toFixed(2)) - Number(krafUti.toFixed(2))

                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: medium.Anexo,
                                    COD_ADUANA: medium.CodInsumo,
                                    DESCRIPCION: medium.DESCRIPCION,
                                    SUBPARTIDA: medium.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number(krafUti.toFixed(2)),
                                    DESPERDICIO: Number(((Number(medium.Saldo) - Number(medium.Consumido)).toFixed(2) - Number(krafUti.toFixed(2))).toFixed(2)),
                                    MERMA: 0,
                                    TOTAL: Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2)),
                                 })

                                 cantMedium = cantMedium.map((k) => {
                                    if (k.Anexo === medium.Anexo && k.CodInsumo === medium.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                                    }

                                    return k
                                 })

                                 if (faltanteMedium > 0) {
                                    iniMedium++

                                    consumoMedium(cantMedium[iniMedium], faltanteMedium)
                                 }
                              }
                           } else {
                              iniMedium++

                              consumoMedium(cantMedium[iniMedium], cant)
                           }
                        }

                        const consumoWhite = (white, cant) => {
                           if (
                              Number((Number(white.Saldo) - Number(white.Consumido)).toFixed(2)) > 0
                           ) {
                              const porc = Number((cant * 0.10).toFixed(2)) // 0.09

                              if (
                                 Number(
                                    (Number(white.Saldo) - Number(white.Consumido)).toFixed(2)
                                 ) >=
                                 Number(
                                    (Number(cant) + Number(porc)).toFixed(2)
                                 )
                              ) {
                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: white.Anexo,
                                    COD_ADUANA: white.CodInsumo,
                                    DESCRIPCION: white.DESCRIPCION,
                                    SUBPARTIDA: white.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number((cant).toFixed(2)),
                                    DESPERDICIO: porc,
                                    MERMA: 0,
                                    TOTAL: Number((Number(porc) + Number(cant)).toFixed(2)),
                                 })

                                 // Actualizar el stock de la aduana modificando la cantidad consumida
                                 cantWhite = cantWhite.map((k) => {
                                    if (k.Anexo === white.Anexo && k.CodInsumo === white.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number(porc) + Number(cant)).toFixed(2))
                                    }

                                    return k
                                 })

                                 faltanteWhite = 0
                              } else {
                                 const krafUti = Number(((Number(white.Saldo) - Number(white.Consumido)) / 1.1).toFixed(2))

                                 faltanteWhite = Number((Number(cant)).toFixed(2)) - Number(krafUti.toFixed(2))

                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: white.Anexo,
                                    COD_ADUANA: white.CodInsumo,
                                    DESCRIPCION: white.DESCRIPCION,
                                    SUBPARTIDA: white.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number(Number(krafUti).toFixed(2)),
                                    DESPERDICIO: Number(((Number(white.Saldo) - Number(white.Consumido)).toFixed(2) - Number(krafUti.toFixed(2))).toFixed(2)),
                                    MERMA: 0,
                                    TOTAL: Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2)),
                                 })

                                 cantWhite = cantWhite.map((k) => {
                                    if (k.Anexo === white.Anexo && k.CodInsumo === white.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                                    }

                                    return k
                                 })

                                 if (faltanteWhite > 0) {
                                    iniWhite++

                                    consumoWhite(cantWhite[iniWhite], faltanteWhite)
                                 }
                              }
                           } else {
                              iniWhite++

                              consumoWhite(cantWhite[iniWhite], cant)
                           }
                        }

                        const consumoAlm = (almidon, cant) => {
                           if (
                              Number((Number(almidon.Saldo) - Number(almidon.Consumido)).toFixed(2)) > 0
                           ) {
                              const porc = Number((cant * Number(process.env.PROCENTAJE_MERMA)).toFixed(2))

                              if (
                                 Number(
                                    (Number(almidon.Saldo) - Number(almidon.Consumido)).toFixed(2)
                                 ) >=
                                 Number(
                                    (Number(cant) + Number(porc)).toFixed(2)
                                 )
                              ) {
                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: almidon.Anexo,
                                    COD_ADUANA: almidon.CodInsumo,
                                    DESCRIPCION: almidon.DESCRIPCION,
                                    SUBPARTIDA: almidon.SubPartida2,
                                    // U_MEDIDA: 'KG',
                                    U_MEDIDA: almidon.U_MEDIDA,
                                    CANTIDAD: Number((cant).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: porc,
                                    TOTAL: Number((Number(porc) + Number(cant)).toFixed(2)),
                                 })

                                 // Actualizar el stock de la aduana modificando la cantidad consumida
                                 cantAlm = cantAlm.map((k) => {
                                    if (k.Anexo === almidon.Anexo && k.CodInsumo === almidon.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number(porc) + Number(cant)).toFixed(2))
                                    }

                                    return k
                                 })

                                 faltanteAlm = 0
                              } else {
                                 const krafUti = Number(((Number(almidon.Saldo) - Number(almidon.Consumido)) / 1.1).toFixed(2))

                                 faltanteAlm = Number((Number(cant)).toFixed(2)) - Number(krafUti.toFixed(2))

                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: almidon.Anexo,
                                    COD_ADUANA: almidon.CodInsumo,
                                    DESCRIPCION: almidon.DESCRIPCION,
                                    SUBPARTIDA: almidon.SubPartida2,
                                    // U_MEDIDA: 'KG',
                                    U_MEDIDA: almidon.U_MEDIDA,
                                    CANTIDAD: Number(Number(krafUti).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: Number(((Number(almidon.Saldo) - Number(almidon.Consumido)).toFixed(2) - Number(krafUti.toFixed(2))).toFixed(2)),
                                    TOTAL: Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2)),
                                 })

                                 cantAlm = cantAlm.map((k) => {
                                    if (k.Anexo === almidon.Anexo && k.CodInsumo === almidon.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                                    }

                                    return k
                                 })

                                 if (faltanteAlm > 0) {
                                    iniAlm++

                                    if (cantAlm[iniAlm]?.Saldo > 0) consumoAlm(cantAlm[iniAlm], faltanteAlm)
                                 }
                              }
                           } else {
                              iniAlm++

                              if (cantAlm[iniAlm]?.Saldo > 0) consumoAlm(cantAlm[iniAlm], cant)
                           }
                        }

                        const consumoResn = (resina, cant) => {
                           if (
                              Number((Number(resina.Saldo) - Number(resina.Consumido)).toFixed(2)) > 0
                           ) {
                              const porc = Number((cant * Number(process.env.PROCENTAJE_MERMA)).toFixed(2))

                              if (
                                 Number(
                                    (Number(resina.Saldo) - Number(resina.Consumido)).toFixed(2)
                                 ) >=
                                 Number(
                                    (Number(cant) + Number(porc)).toFixed(2)
                                 )
                              ) {
                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: resina.Anexo,
                                    COD_ADUANA: resina.CodInsumo,
                                    DESCRIPCION: resina.DESCRIPCION,
                                    SUBPARTIDA: resina.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number((cant).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: porc,
                                    TOTAL: Number((Number(porc) + Number(cant)).toFixed(2)),
                                 })

                                 // Actualizar el stock de la aduana modificando la cantidad consumida
                                 cantResn = cantResn.map((k) => {
                                    if (k.Anexo === resina.Anexo && k.CodInsumo === resina.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number(porc) + Number(cant)).toFixed(2))
                                    }

                                    return k
                                 })

                                 faltanteResn = 0
                              } else {
                                 const krafUti = Number(((Number(resina.Saldo) - Number(resina.Consumido)) / 1.8).toFixed(2)) // Antes 1.1

                                 faltanteResn = Number((Number(cant)).toFixed(2)) - Number(krafUti.toFixed(2))

                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: resina.Anexo,
                                    COD_ADUANA: resina.CodInsumo,
                                    DESCRIPCION: resina.DESCRIPCION,
                                    SUBPARTIDA: resina.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number(Number(krafUti).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: Number(((Number(resina.Saldo) - Number(resina.Consumido)).toFixed(2) - Number(krafUti.toFixed(2))).toFixed(2)),
                                    TOTAL: Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2)),
                                 })

                                 cantResn = cantResn.map((k) => {
                                    if (k.Anexo === resina.Anexo && k.CodInsumo === resina.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                                    }

                                    return k
                                 })

                                 if (faltanteResn > 0) {
                                    iniResn++

                                    if (cantResn[iniResn]?.Saldo > 0) consumoResn(cantResn[iniResn], faltanteResn)
                                 }
                              }

                              console.table(MPFact21)
                           } else {
                              iniResn++

                              if (cantResn[iniResn]?.Saldo > 0) consumoResn(cantResn[iniResn], cant)
                           }
                        }

                        const consumoAdtv = (aditivo, cant) => {
                           if (
                              Number((Number(aditivo.Saldo) - Number(aditivo.Consumido)).toFixed(2)) > 0
                           ) {
                              const porc = Number((cant * Number(process.env.PROCENTAJE_MERMA)).toFixed(2))

                              if (
                                 Number(
                                    (Number(aditivo.Saldo) - Number(aditivo.Consumido)).toFixed(2)
                                 ) >=
                                 Number(
                                    (Number(cant) + Number(porc)).toFixed(2)
                                 )
                              ) {
                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: aditivo.Anexo,
                                    COD_ADUANA: aditivo.CodInsumo,
                                    DESCRIPCION: aditivo.DESCRIPCION,
                                    SUBPARTIDA: aditivo.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number((cant).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: porc,
                                    TOTAL: Number((Number(porc) + Number(cant)).toFixed(2)),
                                 })

                                 // Actualizar el stock de la aduana modificando la cantidad consumida
                                 cantAdtv = cantAdtv.map((k) => {
                                    if (k.Anexo === aditivo.Anexo && k.CodInsumo === aditivo.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number(porc) + Number(cant)).toFixed(2))
                                    }

                                    return k
                                 })

                                 faltanteAdtv = 0
                              } else {
                                 const adtvUti = Number(((Number(aditivo.Saldo) - Number(aditivo.Consumido)) / 1.1).toFixed(2))

                                 faltanteAdtv = Number((Number(cant)).toFixed(2)) - Number(adtvUti.toFixed(2))

                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: aditivo.Anexo,
                                    COD_ADUANA: aditivo.CodInsumo,
                                    DESCRIPCION: aditivo.DESCRIPCION,
                                    SUBPARTIDA: aditivo.SubPartida2,
                                    U_MEDIDA: 'KG',
                                    CANTIDAD: Number(Number(adtvUti).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: Number(((Number(aditivo.Saldo) - Number(aditivo.Consumido)).toFixed(2) - Number(adtvUti.toFixed(2))).toFixed(2)),
                                    TOTAL: Number((Number(adtvUti.toFixed(2)) * 1.1).toFixed(2)),
                                 })

                                 cantAdtv = cantAdtv.map((k) => {
                                    if (k.Anexo === aditivo.Anexo && k.CodInsumo === aditivo.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number((Number(adtvUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                                    }

                                    return k
                                 })

                                 if (faltanteAdtv > 0) {
                                    iniAdtv++

                                    if (cantAdtv[iniAdtv]?.Saldo > 0) consumoAdtv(cantAdtv[iniAdtv], faltanteAdtv)
                                 }
                              }
                           } else {
                              iniAdtv++

                              if (cantAdtv[iniAdtv]?.Saldo > 0) consumoAdtv(cantAdtv[iniAdtv], cant)
                           }
                        }

                        const consumoPegmt = (pegamento, cant) => {
                           if (
                              Number((Number(pegamento.Saldo) - Number(pegamento.Consumido)).toFixed(2)) > 0
                           ) {
                              const porc = Number((cant * Number(process.env.PROCENTAJE_MERMA_GOMA)).toFixed(2))

                              if (
                                 Number(
                                    (Number(pegamento.Saldo) - Number(pegamento.Consumido)).toFixed(2)
                                 ) >=
                                 Number(
                                    (Number(cant) + Number(porc)).toFixed(2)
                                 )
                              ) {
                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: pegamento.Anexo,
                                    COD_ADUANA: pegamento.CodInsumo,
                                    DESCRIPCION: pegamento.DESCRIPCION,
                                    SUBPARTIDA: pegamento.SubPartida2,
                                    // U_MEDIDA: 'KG',
                                    U_MEDIDA: pegamento.U_MEDIDA,
                                    CANTIDAD: Number((cant).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: porc,
                                    TOTAL: Number((Number(porc) + Number(cant)).toFixed(2)),
                                 })

                                 // Actualizar el stock de la aduana modificando la cantidad consumida
                                 cantPegmt = cantPegmt.map((k) => {
                                    if (k.Anexo === pegamento.Anexo && k.CodInsumo === pegamento.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number(porc) + Number(cant)).toFixed(2))
                                    }

                                    return k
                                 })

                                 faltantePegmt = 0
                              } else {
                                 const pegmtUti = Number(((Number(pegamento.Saldo) - Number(pegamento.Consumido)) / 1.1).toFixed(2))

                                 faltantePegmt = Number((Number(cant)).toFixed(2)) - Number(pegmtUti.toFixed(2))

                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: pegamento.Anexo,
                                    COD_ADUANA: pegamento.CodInsumo,
                                    DESCRIPCION: pegamento.DESCRIPCION,
                                    SUBPARTIDA: pegamento.SubPartida2,
                                    // U_MEDIDA: 'KG',
                                    U_MEDIDA: pegamento.U_MEDIDA,
                                    CANTIDAD: Number(Number(pegmtUti).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: Number(((Number(pegamento.Saldo) - Number(pegamento.Consumido)).toFixed(2) - Number(pegmtUti.toFixed(2))).toFixed(2)),
                                    TOTAL: Number((Number(pegmtUti.toFixed(2)) * 1.1).toFixed(2)),
                                 })

                                 cantPegmt = cantPegmt.map((k) => {
                                    if (k.Anexo === pegamento.Anexo && k.CodInsumo === pegamento.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number((Number(pegmtUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                                    }

                                    return k
                                 })

                                 if (faltantePegmt > 0) {
                                    iniPegmt++

                                    if (cantPegmt[iniPegmt]?.Saldo > 0) consumoPegmt(cantPegmt[iniPegmt], faltantePegmt)
                                 }
                              }
                           } else {
                              iniPegmt++

                              if (cantPegmt[iniPegmt]?.Saldo > 0) consumoPegmt(cantPegmt[iniPegmt], cant)
                           }
                        }

                        const consumoAdhs = (adhesivo, cant) => {
                           if (
                              Number((Number(adhesivo.Saldo) - Number(adhesivo.Consumido)).toFixed(2)) > 0
                           ) {
                              const porc = Number((cant * Number(process.env.PROCENTAJE_MERMA_GOMA)).toFixed(2))

                              if (
                                 Number(
                                    (Number(adhesivo.Saldo) - Number(adhesivo.Consumido)).toFixed(2)
                                 ) >=
                                 Number(
                                    (Number(cant) + Number(porc)).toFixed(2)
                                 )
                              ) {
                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: adhesivo.Anexo,
                                    COD_ADUANA: adhesivo.CodInsumo,
                                    DESCRIPCION: adhesivo.DESCRIPCION,
                                    SUBPARTIDA: adhesivo.SubPartida2,
                                    // U_MEDIDA: 'KG',
                                    U_MEDIDA: adhesivo.U_MEDIDA,
                                    CANTIDAD: Number((cant).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: porc,
                                    TOTAL: Number((Number(porc) + Number(cant)).toFixed(2)),
                                 })

                                 // Actualizar el stock de la aduana modificando la cantidad consumida
                                 cantAdhs = cantAdhs.map((k) => {
                                    if (k.Anexo === adhesivo.Anexo && k.CodInsumo === adhesivo.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number(porc) + Number(cant)).toFixed(2))
                                    }

                                    return k
                                 })

                                 faltanteAdhs = 0
                              } else {
                                 const adhsUti = Number(((Number(adhesivo.Saldo) - Number(adhesivo.Consumido)) / 1.1).toFixed(2))

                                 faltanteAdhs = Number((Number(cant)).toFixed(2)) - Number(adhsUti.toFixed(2))

                                 MPFact21.push({
                                    ID_FR21: code,
                                    FACTURA: itm.Factura,
                                    ITEM_FACTURA: idx,
                                    CODE_PT: it.CodProducto,
                                    DAI: adhesivo.Anexo,
                                    COD_ADUANA: adhesivo.CodInsumo,
                                    DESCRIPCION: adhesivo.DESCRIPCION,
                                    SUBPARTIDA: adhesivo.SubPartida2,
                                    // U_MEDIDA: 'KG',
                                    U_MEDIDA: adhesivo.U_MEDIDA,
                                    CANTIDAD: Number(Number(adhsUti).toFixed(2)),
                                    DESPERDICIO: 0,
                                    MERMA: Number(((Number(adhesivo.Saldo) - Number(adhesivo.Consumido)).toFixed(2) - Number(adhsUti.toFixed(2))).toFixed(2)),
                                    TOTAL: Number((Number(adhsUti.toFixed(2)) * 1.1).toFixed(2)),
                                 })

                                 cantAdhs = cantAdhs.map((k) => {
                                    if (k.Anexo === adhesivo.Anexo && k.CodInsumo === adhesivo.CodInsumo) {
                                       k.Consumido = Number((Number(k.Consumido) + Number((Number(adhsUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                                    }

                                    return k
                                 })

                                 if (faltanteAdhs > 0) {
                                    iniAdhs++

                                    if (cantAdhs[iniAdhs]?.Saldo > 0) consumoAdhs(cantAdhs[iniAdhs], faltanteAdhs)
                                 }
                              }
                           } else {
                              iniAdhs++

                              if (cantAdhs[iniAdhs]?.Saldo > 0) consumoAdhs(cantAdhs[iniAdhs], cant)
                           }
                        }

                        cantKraftCons > 0 && consumoKraft(kraft, cantKraftCons) // Consumo de papel kraft
                        // cantKraftCons > 0 && consumoWhite(white, cantKraftCons) // Consumo de papel kraft
                        cantMediumCons > 0 && consumoMedium(medium, cantMediumCons) // Consumo de papel medium
                        cantWhiteCons > 0 && consumoWhite(white, cantWhiteCons) // Consumo de papel blanco

                        // Verificar si se tiene stock de almidon
                        const verifyAlm = cantAlm.some((alm) => Number((Number(alm.Saldo) - Number(alm.Consumido)).toFixed(2)) > 0)
                        verifyAlm && (cantAlmCons > 0 && consumoAlm(almidon, cantAlmCons)) // Consumo de almidón

                        // Verificar si se tiene stock de resina
                        const verifyResn = cantResn.some((resn) => Number((Number(resn.Saldo) - Number(resn.Consumido)).toFixed(2)) > 0)
                        verifyResn && (cantResnCons > 0 && consumoResn(resina, cantResnCons)) // Consumo de resina

                        // Verificar si se tiene stock del aditivo
                        const verifyAdtv = cantAdtv.some((adtv) => Number((Number(adtv.Saldo) - Number(adtv.Consumido)).toFixed(2)) > 0)
                        verifyAdtv && (cantAdtvCons > 0 && consumoAdtv(aditivo, cantAdtvCons)) // Consumo de aditivo

                        // Verificar si se tiene stock del pegamento
                        const verifyPegmt = cantPegmt.some((pegmt) => Number((Number(pegmt.Saldo) - Number(pegmt.Consumido)).toFixed(2)) > 0)
                        verifyPegmt && (cantPegmtCons > 0 && consumoPegmt(pegamento, cantPegmtCons)) // Consumo de pegamento

                        // Verificar si se tiene stock del adhesivo
                        const verifyAdhs = cantAdhs.some((adhs) => Number((Number(adhs.Saldo) - Number(adhs.Consumido)).toFixed(2)) > 0)
                        verifyAdhs && (cantAdhesivoCons > 0 && consumoAdhs(adhesivo, cantAdhesivoCons)) // Consumo de adhesivo

                        return 1
                     } else {
                        return 0
                     }
                  })

                  const results = await Promise.all(savePromises)

                  return results.every((rslt) => rslt === 1)
               })

               console.table(MPFact21) // Resultado del array y los datos a guardar en MPFR21

               const results = await Promise.all(promises)

               if (results.every((result) => result)) {
                  // console.table(MPFact21) // Resultado del array y los datos a guardar en MPFR21

                  const savePromises = MPFact21.map(async (itm) => {
                     const resp = await client.exec(
                        saveMatPriFact21({
                           ID_FR21: itm.ID_FR21,
                           FACTURA: itm.FACTURA,
                           ITEM_FACTURA: itm.ITEM_FACTURA,
                           CODE_PT: itm.CODE_PT,
                           DAI: itm.DAI,
                           COD_ADUANA: itm.COD_ADUANA,
                           DESCRIPCION: itm.DESCRIPCION,
                           SUBPARTIDA: itm.SUBPARTIDA,
                           U_MEDIDA: itm.U_MEDIDA,
                           CANTIDAD: itm.CANTIDAD,
                           DESPERDICIO: itm.DESPERDICIO,
                           MERMA: itm.MERMA,
                           TOTAL: itm.TOTAL
                        })
                     )

                     return resp
                  })

                  const results = await Promise.all(savePromises)

                  if (results.every((result) => result)) {
                     return res.status(200).json({
                        msg: 'Factura registrada correctamente 🖖',
                        data: []
                     })
                  } else {
                     return res.status(204).json({
                        msg: 'No se pudo guardar la factura 😫',
                        data: []
                     })
                  }
               } else {
                  return res.status(204).json({
                     msg: 'No se pudo guardar la factura 😫',
                     data: []
                  })
               }
            } catch (e) {
               console.error(e)

               return res.status(500).json({
                  msg: `${e?.message || 'Error del server. Intentelo más luego x_x'} 🤯`,
               })
            }
         } else {
            return res.status(204).json({
               msg: 'No se pudo guardar la factura 😫',
               data: []
            })
         }
      } else {
         return res.status(204).json({
            msg: 'No se pudo guardar la factura 😫',
            data: []
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: `${e?.message || 'Error del server. Intentelo más luego x_x'} 🤯`,
      })
   }
}

ctrlAnexosComp.getAllFact21 = async (req, res) => {
   try {
      const { FILTER } = req.query

      client.connect()
      const data = await client.exec(searchFact21({
         ID_AUTH: '',
         ID_FR21: '',
         STD: FILTER,
         MAX: false
      }))

      if (data.length > 0) {
         return res.status(200).json({
            msg: 'Listado de facturas registradas 🖖',
            data
         })
      } else {
         return res.status(204).json({
            msg: 'No existen facturas registradas 😫',
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

ctrlAnexosComp.getDescpFact21 = async (req, res) => {
   try {
      const { ID } = req.query

      client.connect()
      const details = await client.exec(searchFact21({ ID_FR21: ID }))
      const fact = await client.exec(searchCabFact21({ ID_FR21: ID }))
      const prod = await client.exec(searchProdFact21({ ID_FR21: ID }))
      const mat = await client.exec(searchMatPriFact21({ ID_FR21: ID }))

      return res.status(200).json({
         msg: 'Información encontrada 🖖',
         data: {
            details,
            fact,
            prod,
            mat
         }
      })
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.getCabFact21 = async (req, res) => {
   try {
      const { ID } = req.query

      client.connect()
      const data = await client.exec(searchCabFact21({ ID_FR21: ID }))

      if (data.length > 0) {
         return res.status(200).json({
            msg: 'Detalle principal de anexo encontrado 🖖',
            data
         })
      } else {
         return res.status(204).json({
            msg: 'No existen información registrada 😫',
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

ctrlAnexosComp.getProFact21 = async (req, res) => {
   try {
      const { ID } = req.query

      client.connect()
      const data = await client.exec(searchProdFact21({ ID_FR21: ID }))

      if (data.length > 0) {
         return res.status(200).json({
            msg: 'Detalle principal de anexo encontrado 🖖',
            data
         })
      } else {
         return res.status(204).json({
            msg: 'No existen información registrada 😫',
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

ctrlAnexosComp.getMatPriFact21 = async (req, res) => {
   try {
      const { ID } = req.query

      client.connect()
      const data = await client.exec(searchMatPriFact21({ ID_FR21: ID }))

      if (data.length > 0) {
         return res.status(200).json({
            msg: 'Items de anexo encontrados 🖖',
            data
         })
      } else {
         return res.status(204).json({
            msg: 'No existen información registrada 😫',
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

ctrlAnexosComp.putCabFact21 = async (req, res) => {
   try {
      const {
         ID_FR21,
         ID_AUTH,
         COMENTARIO,
         ESTADO,
         FECHA2
      } = req.body

      client.connect()
      const data = await client.exec(updateCabFact21({
         ID_FR21,
         ID_AUTH,
         COMENTARIO,
         ESTADO,
         FECHA1: moment().utcOffset('-05:00').format('YYYY-MM-DD'),
         FECHA2: FECHA2 || ''
      }))

      if (data) {
         return res.status(200).json({
            msg: 'Anexo actualizado con éxito 🖖',
            data
         })
      } else {
         return res.status(204).json({
            msg: 'No se pudo actualizar la información 😫',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.getAllBusinesPartners = async (req, res) => {
   try {
      const { RUC } = req.query

      client.connect()
      const data = await client.exec(searchBusinesPartners({ RUC }))

      if (data.length > 0) {
         return res.status(200).json({
            msg: 'Socios de negocios existentes 🖖',
            data
         })
      } else {
         return res.status(204).json({
            msg: 'No existe el cliente o socio de negocio 😫',
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

ctrlAnexosComp.putBusinessPartners = async (req, res) => {
   try {
      const {
         ID_BP,
         NUM_SENAE,
         PASS
      } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      const auth = await SignInSL(USER, PASS)

      if (auth) {
         const values = {
            'UnifiedFederalTaxID': NUM_SENAE
         }

         const resp = await axios.patch(`${process.env.SL_URL}/BusinessPartners('${ID_BP}')`, values, {
            headers: {
               Cookie: `B1SESSION=${auth};`,
               'Content-Type': 'application/json;charset=UTF-8',
               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36'
            },
            httpsAgent: httpsAgent,
         })

         if (resp.status === 204) {
            return res.status(200).json({
               msg: 'Contrato actualizado con éxito 🖖'
            })
         }

         if (resp.status === 400) {
            return res.status(203).json({
               msg: 'No se pudo actualizar el contrato 😫'
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

ctrlAnexosComp.getListStockSenae = async (req, res) => {
   try {
      const { TIPO } = req.query

      client.connect()
      const allData = await client.exec(searchStockSenae({ TIPO }))

      if (allData.length === 0) {
         return res.status(204).json({
            msg: 'No hay stock registrado 😫',
            data: []
         })
      }

      return res.status(200).json({
         msg: 'Stock obtenido correctamente 🖖',
         data: allData,
      })
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.getListSenaeEmail = async (req, res) => {
   try {
      const { RUC, STD } = req.query

      client.connect()
      const allData = await client.exec(searchAnexosEmail({ RUC, ANEXO: '', STD }))

      if (allData.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allData,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay información registrada 😫',
            data: []
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Inténtelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.postMailClient = async (req, res) => {
   try {
      const { ANEXO } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)
      const allData = await client.exec(searchAnexosEmail({ RUC: '', ANEXO, STD: '' }))

      if (allData.length === 0) {
         return res.status(204).json({
            msg: 'No hay cuentas registradas 😫',
            data: []
         })
      }

      const { CLIENTE, RUC, ID_FR21, ID_AUTH, DAYS, EMAIL, MAIL_USER } = allData[0]

      const detailsFact = await client.exec(searchProdFact21({ ID_FR21 }))
      const detailsPend = await client.exec(searchDetailsAnexoCli({ RUC }))

      const optPDF = {
         cliente: CLIENTE,
         numAnexo: ID_AUTH,
         dias: DAYS,
         linesV: String(detailsFact.map((line, idx) => {
            return ` <tr>
                           <th>${++idx}</th>
                           <td>${line.ntfc_no}</td>
                           <td>${line.FECHA}</td>
                           <td>${line.DESCRIPCION}</td>
                           <td>${Number(line.CANTIDAD)}</td>
                        </tr>`
         })).replace(/,/g, ''),
         infoPend: detailsPend.length > 0 ? detailsPend[0] : {}
      }

      const tmplt = stdAnexosTmp(optPDF)

      const resp = await axios.post(`${process.env.API_JOBS}/email`, {
         from: `CARTOMANABI SA <${process.env.EMAIL_IMPORTACIONES}>`,
         to: EMAIL,
         cc: `${MAIL_USER};${process.env.EMAIL_IMP}`,
         // cco: process.env.OFFICE_USER,
         subject: `Anexos compensatorios ${ID_AUTH} - CARTOMANABI`,
         html: zlib.gzipSync(tmplt.replace(/\n/g, '')),
         auth: {
            user: process.env.EMAIL_IMPORTACIONES,
            pass: process.env.PASS_IMPORTACIONES
         }
      }, {
         headers: {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/json',
         }
      })

      if (resp.status === 200) {
         try {
            await client.exec(saveLogs({
               CODE: ID_FR21,
               MOTIVO: 'Envío de correo - ANEXOS',
               USER
            }))
         } catch (e) {
            console.error(e)
         }

         return res.status(200).json({
            msg: resp.data.msg,
            data: []
         })
      }

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })

   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.postMailMasClient = async (req, res) => {
   try {
      const { STD } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)
      const allAnexos = await client.exec(searchAnexosEmail({ RUC: '', ANEXO: '', STD: '' }))

      const allData = allAnexos.filter((itm) => itm.ESTADO === STD)

      if (allData.length > 0) {
         for (const itm of allData) {
            const detailsFact = await client.exec(searchProdFact21({ ID_FR21: itm.ID_FR21 }))

            const optPDF = {
               cliente: itm.CLIENTE,
               numAnexo: itm.ID_AUTH,
               dias: itm.DAYS,
               linesV: String(detailsFact.map((line, idx) => {
                  return ` <tr>
                              <th>${++idx}</th>
                              <td>${line.ntfc_no}</td>
                              <td>${line.FECHA}</td>
                              <td>${line.DESCRIPCION}</td>
                              <td>${Number(line.CANTIDAD)}</td>
                           </tr>`
               })).replace(/,/g, '')
            }

            const tmplt = stdAnexosTmp(optPDF)

            const resp = await axios.post(`${process.env.API_JOBS}/email`, {
               from: `CARTOMANABI SA <${process.env.EMAIL_IMPORTACIONES}>`,
               to: itm.EMAIL,
               cc: `${itm.MAIL_USER};${process.env.EMAIL_IMP}`,
               subject: `Anexos compensatorios ${itm.ID_AUTH} - CARTOMANABI`,
               html: zlib.gzipSync(tmplt.replace(/\n/g, '')),
               auth: {
                  user: process.env.EMAIL_IMPORTACIONES,
                  pass: process.env.PASS_IMPORTACIONES
               }
            }, {
               headers: {
                  'Content-Encoding': 'gzip',
                  'Content-Type': 'application/json',
               }
            })

            if (resp.status === 200) {
               try {
                  await client.exec(saveLogs({
                     CODE: itm.ID_FR21,
                     MOTIVO: 'Envío de correo - ANEXOS',
                     USER,
                     STATUS: 0
                  }))
               } catch (e) {
                  console.error(e)

                  try {
                     await client.exec(saveLogs({
                        CODE: itm.ID_FR21,
                        MOTIVO: e?.message || 'Error en el envío de correo - ANEXOS',
                        USER,
                        STATUS: 1
                     }))
                  } catch (er) {
                     console.error(er)
                  }
               }
            }

            if (resp.status === 400) {
               try {
                  await client.exec(saveLogs({
                     CODE: itm.ID_FR21,
                     MOTIVO: 'No se envío el correo - ANEXOS',
                     USER,
                     STATUS: 1
                  }))
               } catch (er) {
                  console.error(er)
               }
            }

            await new Promise(resolve => setTimeout(resolve, 10000)) // 10 segundos
         }

         return res.status(200).json({
            msg: 'Correos enviados correctamente 🖖',
            data: []
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
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.uploadFileUpdStd = async (req, res) => {
   try {
      const dateSixMonth = moment().utcOffset('-05:00').subtract(6, 'months').subtract(10, 'days')

      if (req.files) {
         const { path } = req.files[0]

         try {
            const workbook = xlsx.readFile(path)
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const data = xlsx.utils.sheet_to_json(firstSheet, { range: 1 })

            // console.table(data)

            if (data.length > 0) {
               const result =
                  data
                     .filter((itm) => itm.s_rgs_tp_cd === 'ACPT')
                     .filter((itm) => {
                        const date = moment(itm.use_max_tmlm, 'DD/MM/YYYY')

                        return date.isAfter(dateSixMonth)
                     })

               const savePromises = result.map(async (itm) => {
                  const resp = await client.exec(
                     updateFact21({
                        ID_AUTH: itm.rgs_no,
                        FECHA2: moment(itm. use_max_tmlm, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                        SALDO: itm.s_saldo_inventario === 'SI' ? 'NO' : 'SI',
                        ESTADO: itm.s_saldo_inventario === 'SI' ? 'O' : (itm.s_prcs_stat_cd === 'ACEPTADO' ? 'G' : '')
                     })
                  )

                  return resp
               })

               const results = await Promise.all(savePromises)

               if (results.some(rslt => rslt === 1)) {
                  return res.status(200).json({
                     msg: 'Facturas actualizadas correctamente 🖖',
                     data: result
                  })
               } else {
                  return res.status(204).json({
                     msg: 'No se pudo actualizar la factura 😫',
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
            console.error(e)

            return res.status(500).json({
               msg: 'Error del server. Intentelo más luego x_x 🤯',
            })
         } finally {
            fs.unlinkSync(path)
         }
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.getFacturasPapel = async (req, res) => {
   try {
      const { MONTH, YEAR } = req.query

      client.connect()
      const allData = await client.exec(searchPapFacturas({ MONTH, YEAR }))

      if (allData.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allData,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay información registrada 😫',
            data: []
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Inténtelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.postSaveFact21Bob = async (req, res) => {
   try {
      const { FACT } = req.body
      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const searchID = await client.exec(searchFact21Bob({ MAX: true }))

      const codeAuto = Number(searchID[0]?.CODE || 0)

      let code =
            codeAuto < 9
               ? `000000${codeAuto + 1}`
               : codeAuto < 99
                  ? `00000${codeAuto + 1}`
                  : codeAuto < 999
                     ? `0000${codeAuto + 1}`
                     : codeAuto < 9999
                        ? `000${codeAuto + 1}`
                        : codeAuto < 99999
                           ? `00${codeAuto + 1}`
                           : codeAuto < 999999
                              ? `0${codeAuto + 1}`
                              : `${codeAuto + 1}`

      const searchItmFact = await client.exec(searchPapFacturas({ FACT }))

      if (searchItmFact.length === 0) {
         return res.status(204).json({
            msg: 'No se pudo guardar la factura 😫',
            data: []
         })
      }

      const saveFact21 = await client.exec(saveCabFact21Bob({
         ID_FR21: code,
         ID_FSAP: FACT,
         FECHA1: moment().format('YYYY-MM-DD'),
         USER
      }))

      if (!saveFact21) {
         return res.status(204).json({
            msg: 'No se pudo generar la factura 😫',
            data: []
         })
      }

      let cantKraft = await client.exec(searchStockAduana({ TYPE: 'KRAFT' }))
      let cantMedium = await client.exec(searchStockAduana({ TYPE: 'MEDIUM' }))
      let cantWhite = await client.exec(searchStockAduana({ TYPE: 'WHITE' }))

      let MPFact21 = []

      const promises = searchItmFact.map(async (itm) => {
         const consumo = Number(itm?.KG || 0)

         let initKraft = 0, initMedium = 0, initWhite = 0,
            faltanteKraft = 0, faltanteMedium = 0, faltanteWhite = 0

         const kraft = cantKraft[initKraft]
         const medium = cantMedium[initMedium]
         const white = cantWhite[initWhite]

         const consumoKraft = (paperStk, cant) => {
            if (
               Number((Number(paperStk.Saldo) - Number(paperStk.Consumido)).toFixed(2)) > 0
            ) {

               if (
                  Number((Number(paperStk.Saldo) - Number(paperStk.Consumido)).toFixed(2)) >= Number(Number(cant).toFixed(2))
               ) {
                  MPFact21.push({
                     ID_FR21: code,
                     CODE: itm.ITM_CODE,
                     DAI: paperStk.Anexo,
                     COD_ADUANA: paperStk.CodInsumo,
                     DESCRIPCION: paperStk.DESCRIPCION,
                     SUBPARTIDA: paperStk.SubPartida2,
                     U_MEDIDA: 'KG',
                     TOTAL: Number(Number(cant).toFixed(2)),
                  })

                  // Actualizar el stock de la aduana modificando la cantidad consumida
                  cantKraft = cantKraft.map((k) => {
                     if (k.Anexo === paperStk.Anexo && k.CodInsumo === paperStk.CodInsumo) {
                        k.Consumido = Number((Number(k.Consumido) + Number(cant)).toFixed(2))
                     }

                     return k
                  })

                  faltanteKraft = 0
               } else {
                  const krafUti = Number(((Number(paperStk.Saldo) - Number(paperStk.Consumido))).toFixed(2))

                  faltanteKraft = Number((Number(cant)).toFixed(2)) - Number(krafUti.toFixed(2))

                  MPFact21.push({
                     ID_FR21: code,
                     CODE: itm.ITM_CODE,
                     DAI: paperStk.Anexo,
                     COD_ADUANA: paperStk.CodInsumo,
                     DESCRIPCION: paperStk.DESCRIPCION,
                     SUBPARTIDA: paperStk.SubPartida2,
                     U_MEDIDA: 'KG',
                     TOTAL: Number(Number(krafUti).toFixed(2)),
                  })

                  cantKraft = cantKraft.map((k) => {
                     if (k.Anexo === paperStk.Anexo && k.CodInsumo === paperStk.CodInsumo) {
                        k.Consumido = Number((Number(k.Consumido) + Number((Number(krafUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                     }

                     return k
                  })

                  if (faltanteKraft > 0) {
                     initKraft++

                     consumoKraft(cantKraft[initKraft], faltanteKraft)
                  }
               }
            } else {
               initKraft++

               consumoKraft(cantKraft[initKraft], cant)
            }
         }

         const consumoMedium = (paperStk, cant) => {
            if (
               Number((Number(paperStk.Saldo) - Number(paperStk.Consumido)).toFixed(2)) > 0
            ) {

               if (
                  Number((Number(paperStk.Saldo) - Number(paperStk.Consumido)).toFixed(2)) >= Number(Number(cant).toFixed(2))
               ) {
                  MPFact21.push({
                     ID_FR21: code,
                     CODE: itm.ITM_CODE,
                     DAI: paperStk.Anexo,
                     COD_ADUANA: paperStk.CodInsumo,
                     DESCRIPCION: paperStk.DESCRIPCION,
                     SUBPARTIDA: paperStk.SubPartida2,
                     U_MEDIDA: 'KG',
                     TOTAL: Number(Number(cant).toFixed(2)),
                  })

                  // Actualizar el stock de la aduana modificando la cantidad consumida
                  cantMedium = cantMedium.map((k) => {
                     if (k.Anexo === paperStk.Anexo && k.CodInsumo === paperStk.CodInsumo) {
                        k.Consumido = Number((Number(k.Consumido) + Number(cant)).toFixed(2))
                     }

                     return k
                  })

                  faltanteMedium = 0
               } else {
                  const mediumUti = Number(((Number(paperStk.Saldo) - Number(paperStk.Consumido))).toFixed(2))

                  faltanteMedium = Number((Number(cant)).toFixed(2)) - Number(mediumUti.toFixed(2))

                  MPFact21.push({
                     ID_FR21: code,
                     CODE: itm.ITM_CODE,
                     DAI: paperStk.Anexo,
                     COD_ADUANA: paperStk.CodInsumo,
                     DESCRIPCION: paperStk.DESCRIPCION,
                     SUBPARTIDA: paperStk.SubPartida2,
                     U_MEDIDA: 'KG',
                     TOTAL: Number(Number(mediumUti).toFixed(2)),
                  })

                  cantMedium = cantMedium.map((k) => {
                     if (k.Anexo === paperStk.Anexo && k.CodInsumo === paperStk.CodInsumo) {
                        k.Consumido = Number((Number(k.Consumido) + Number((Number(mediumUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                     }

                     return k
                  })

                  if (faltanteMedium > 0) {
                     initMedium++

                     consumoMedium(cantMedium[initMedium], faltanteMedium)
                  }
               }
            } else {
               initMedium++

               consumoMedium(cantMedium[initMedium], cant)
            }
         }

         const consumoWhite = (paperStk, cant) => {
            if (
               Number((Number(paperStk.Saldo) - Number(paperStk.Consumido)).toFixed(2)) > 0
            ) {

               if (
                  Number((Number(paperStk.Saldo) - Number(paperStk.Consumido)).toFixed(2)) >= Number(Number(cant).toFixed(2))
               ) {
                  MPFact21.push({
                     ID_FR21: code,
                     CODE: itm.ITM_CODE,
                     DAI: paperStk.Anexo,
                     COD_ADUANA: paperStk.CodInsumo,
                     DESCRIPCION: paperStk.DESCRIPCION,
                     SUBPARTIDA: paperStk.SubPartida2,
                     U_MEDIDA: 'KG',
                     TOTAL: Number(Number(cant).toFixed(2)),
                  })

                  // Actualizar el stock de la aduana modificando la cantidad consumida
                  cantWhite = cantWhite.map((k) => {
                     if (k.Anexo === paperStk.Anexo && k.CodInsumo === paperStk.CodInsumo) {
                        k.Consumido = Number((Number(k.Consumido) + Number(cant)).toFixed(2))
                     }

                     return k
                  })

                  faltanteWhite = 0
               } else {
                  const mediumUti = Number(((Number(paperStk.Saldo) - Number(paperStk.Consumido))).toFixed(2))

                  faltanteWhite = Number((Number(cant)).toFixed(2)) - Number(mediumUti.toFixed(2))

                  MPFact21.push({
                     ID_FR21: code,
                     CODE: itm.ITM_CODE,
                     DAI: paperStk.Anexo,
                     COD_ADUANA: paperStk.CodInsumo,
                     DESCRIPCION: paperStk.DESCRIPCION,
                     SUBPARTIDA: paperStk.SubPartida2,
                     U_MEDIDA: 'KG',
                     TOTAL: Number(Number(mediumUti).toFixed(2)),
                  })

                  cantWhite = cantWhite.map((k) => {
                     if (k.Anexo === paperStk.Anexo && k.CodInsumo === paperStk.CodInsumo) {
                        k.Consumido = Number((Number(k.Consumido) + Number((Number(mediumUti.toFixed(2)) * 1.1).toFixed(2))).toFixed(2))
                     }

                     return k
                  })

                  if (faltanteWhite > 0) {
                     initWhite++

                     consumoWhite(cantWhite[initWhite], faltanteWhite)
                  }
               }
            } else {
               initWhite++

               consumoWhite(cantWhite[initWhite], cant)
            }
         }

         (itm.CODE === 'KRAFT' && Number(itm?.KG || 0) > 0) && consumoKraft(kraft, consumo);
         (itm.CODE === 'MEDIUM' && Number(itm?.KG || 0) > 0) && consumoMedium(medium, consumo);
         (itm.CODE === 'WHITE' && Number(itm?.KG || 0) > 0) && consumoWhite(white, consumo)

         return 1
      })

      const results = await Promise.all(promises)

      if (results.every((result) => result)) {
         console.table(MPFact21) // Resultado del array y los datos a guardar en MPFR21

         const savePromises = MPFact21.map(async (itm) => {
            const resp = await client.exec(
               saveMatPriFact21Bob({
                  ID_FR21: itm.ID_FR21,
                  CODE: itm.CODE,
                  DAI: itm.DAI,
                  COD_ADUANA: itm.COD_ADUANA,
                  DESCRIPCION: itm.DESCRIPCION,
                  SUBPARTIDA: itm.SUBPARTIDA,
                  U_MEDIDA: itm.U_MEDIDA,
                  TOTAL: itm.TOTAL,
               })
            )

            return resp
         })

         const results = await Promise.all(savePromises)

         if (results.every((result) => result)) {
            return res.status(200).json({
               msg: 'Factura registrada correctamente 🖖',
               data: []
            })
         } else {
            return res.status(204).json({
               msg: 'No se pudo guardar la factura 😫',
               data: []
            })
         }
      } else {
         return res.status(204).json({
            msg: 'No se pudo guardar la factura 😫',
            data: []
         })
      }

   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: e?.message || 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.getDetailsFacturasPapel = async (req, res) => {
   try {
      const { ID_FR21 } = req.query

      client.connect()
      const allData = await client.exec(searchMatPriFact21Bob({ ID_FR21 }))

      if (allData.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allData,
         })
      } else {
         return res.status(204).json({
            msg: 'No hay información registrada 😫',
            data: []
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Inténtelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.putCabFact21Papel = async (req, res) => {
   try {
      const {
         ID_FR21,
         ID_AUTH,
         COMENTARIO
      } = req.body

      client.connect()
      const data = await client.exec(updateCabFact21Bob({
         ID_FR21,
         ID_AUTH,
         COMENTARIO,
         FECHA2: moment().utcOffset('-05:00').format('YYYY-MM-DD'),
      }))

      if (data) {
         return res.status(200).json({
            msg: 'Anexo actualizado con éxito 🖖',
            data
         })
      } else {
         return res.status(204).json({
            msg: 'No se pudo actualizar la información 😫',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlAnexosComp.postNacionalizarPaper = async (req, res) => {
   try {
      const { DATA } = req.body
      const { DATE, ITEMS } = DATA

      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const searchID = await client.exec(searchFact21Bob({ MAX: true }))
      const codeAuto = Number(searchID[0]?.CODE || 0)

      let code =
            codeAuto < 9
               ? `000000${codeAuto + 1}`
               : codeAuto < 99
                  ? `00000${codeAuto + 1}`
                  : codeAuto < 999
                     ? `0000${codeAuto + 1}`
                     : codeAuto < 9999
                        ? `000${codeAuto + 1}`
                        : codeAuto < 99999
                           ? `00${codeAuto + 1}`
                           : codeAuto < 999999
                              ? `0${codeAuto + 1}`
                              : `${codeAuto + 1}`

      const saveFact21 = await client.exec(saveCabFact21Bob({
         ID_FR21: code,
         ID_FSAP: 0,
         ID_AUTH: 'NAC',
         FECHA1: moment(DATE).format('YYYY-MM-DD'),
         USER
      }))

      if (!saveFact21) {
         return res.status(204).json({
            msg: 'No se pudo generar la factura 😫',
            data: []
         })
      }

      const savePaperNacional = async (item) => {
         try {
            const { CODE, DAI, QTY } = item

            const searchPaper = await client.exec(searchItemsStockSenae({ CODE, DAI }))

            if (searchPaper.length === 0) {
               return {
                  error: true,
                  status: 400,
                  msg: `Papel no disponible, revise el stock. (${CODE} - ${DAI}) 😫`,
                  data: []
               }
            }

            const { Tipo, SubPartida2, Unidad, DESCRIPCION } = searchPaper[0]

            const saveItem = await client.exec(saveMatPriFact21Bob({
               ID_FR21: code,
               CODE: Tipo,
               DAI: DAI,
               COD_ADUANA: CODE,
               DESCRIPCION: DESCRIPCION,
               SUBPARTIDA: SubPartida2,
               U_MEDIDA: Unidad,
               TOTAL: QTY
            }))

            if (!saveItem) {
               return {
                  error: true,
                  status: 400,
                  msg: `No se pudo nacionalizar el papel: (${CODE} - ${DAI}) 😫`,
                  data: []
               }
            }

            return {
               error: false,
               status: 201,
               msg: 'Papel nacionalizado con éxito 🎉',
               data: []
            }
         } catch (e) {
            console.error(e)

            return {
               error: true,
               status: 400,
               msg: `Error: ${e?.message || e || 'Problemas en el servidor x_x'} 😫`,
               data: []
            }
         }
      }

      for (let idx = 0; idx < ITEMS.length; idx++) {
         const result = await savePaperNacional(ITEMS[idx])

         if (result.error) {
            return res.status(result.status).json({ msg: result.msg })
         }
      }

      return res.status(201).json({
         msg: 'Papel nacionalizado con éxito 🎉',
      })
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: e?.message || 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

/**
 * Obtener facturas de un cliente por año y mes con productos en formato árbol
 * @route GET /anexoscomp/facturas/cliente
 * @param {string} RUC - RUC del cliente
 * @param {number} YEAR - Año
 * @param {number} MONTH - Mes
 */
ctrlAnexosComp.getFacturasClienteByMonth = async (req, res) => {
   try {
      const { RUC, YEAR, MONTH } = req.query

      if (!RUC) {
         return res.status(400).json({
            msg: 'El RUC del cliente es requerido 😫',
            data: []
         })
      }

      client.connect()

      // Obtener facturas del cliente
      const facturas = await client.exec(searchFacturasClienteByMonth({
         RUC,
         YEAR: YEAR || '',
         MONTH: MONTH || ''
      }))

      if (facturas.length === 0) {
         return res.status(204).json({
            msg: 'No se encontraron facturas para el cliente en el período indicado 😫',
            data: []
         })
      }

      // Agrupar por fecha y obtener productos de cada factura
      const facturasConProductos = await Promise.all(
         facturas.map(async (factura) => {
            const productos = await client.exec(searchProductosByFactura({
               FACTURA: factura.FACTURA
            }))

            return {
               ...factura,
               PRODUCTOS: productos || []
            }
         })
      )

      // Agrupar por fecha (día)
      const groupedByDate = facturasConProductos.reduce((acc, item) => {
         const fecha = moment(item.FECHA_FACTURA).format('YYYY-MM-DD')

         if (!acc[fecha]) {
            acc[fecha] = []
         }

         acc[fecha].push(item)
         return acc
      }, {})

      // Convertir a formato de árbol para el frontend
      const treeData = Object.keys(groupedByDate)
         .sort((a, b) => new Date(b) - new Date(a))
         .map((fecha, idxFecha) => ({
            key: `fecha-${idxFecha}`,
            title: moment(fecha).format('DD/MM/YYYY'),
            fecha: fecha,
            children: groupedByDate[fecha].map((factura, idxFactura) => ({
               key: `factura-${idxFecha}-${idxFactura}`,
               title: factura.ID_AUTH || factura.ID_FR21,
               id_fr21: factura.ID_FR21,
               id_auth: factura.ID_AUTH,
               estado: factura.ESTADO,
               factura: factura.FACTURA,
               children: [{
                  key: `ntfc-${idxFecha}-${idxFactura}`,
                  title: factura.FACTURA,
                  isNtfc: true,
                  children: factura.PRODUCTOS.map((producto, idxProd) => ({
                     key: `prod-${idxFecha}-${idxFactura}-${idxProd}`,
                     title: `${producto.CODE_PT} | ${producto.DESCRIPCION} | ${producto.CANTIDAD}`,
                     code_pt: producto.CODE_PT,
                     descripcion: producto.DESCRIPCION,
                     cantidad: producto.CANTIDAD,
                     u_medida: producto.U_MEDIDA,
                     subpartida: producto.SUBPARTIDA,
                     isProduct: true
                  }))
               }]
            }))
         }))

      // Preparar datos planos para Excel/PDF
      const flatData = facturasConProductos.map(factura => ({
         FECHA: moment(factura.FECHA_FACTURA).format('DD/MM/YYYY'),
         ID_AUTH: factura.ID_AUTH || '',
         ID_FR21: factura.ID_FR21,
         ESTADO: factura.ESTADO,
         FACTURA: factura.FACTURA,
         CLIENTE: factura.CLIENTE,
         RUC: factura.RUC,
         PRODUCTOS: factura.PRODUCTOS
      }))

      return res.status(200).json({
         msg: 'Facturas obtenidas correctamente 🖖',
         data: {
            treeData,
            flatData,
            totalFacturas: facturas.length,
            totalProductos: facturasConProductos.reduce((sum, f) => sum + f.PRODUCTOS.length, 0)
         }
      })
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: e?.message || 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

module.exports = ctrlAnexosComp
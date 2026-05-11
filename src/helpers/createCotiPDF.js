const { jsPDF } = require('jspdf')
// eslint-disable-next-line no-unused-vars
const { autoTable } = require('jspdf-autotable')
const path = require('path')
const moment = require('moment')
moment.locale('es')
const { fondo, logoCartomanabi, logoAustrobox } = require('./imgCotizador')

const dias = [
   'Domingo',
   'Lunes',
   'Martes',
   'Miércoles',
   'Jueves',
   'Viernes',
   'Sábado',
]

// exports.CrearPDF = async function pdf({
//    CLIENT,
//    BOX,
//    TOTALES,
//    OBSERVACIONES,
//    fileName,
//    USER
// }) {
//    let lines = []

//    BOX.forEach((box) => {
//       lines.push({
//          CODIGO: box.CODE_PT,
//          DESCRIPCIÓN: box.PRODUCTO,
//          MEDIDAS: `${box.LARGO} x ${box.ANCHO} x ${box.ALTO}`,
//          DATOS: `${box.ECT} ${box.COLOR.toUpperCase()}`,
//          CANT: OBSERVACIONES.viewTotals ? box.quantity : 2000,
//          PRECIO: (box.precio * 1).toFixed(4),
//          TOTAL: (box.precio * box.quantity).toFixed(3)
//       })

//       if (box.checkTroquel) {
//          lines.push({
//             CODIGO: `TRO${box.CODE_PT.slice(2)}`,
//             DESCRIPCIÓN: `TROQUEL ${box.PRODUCTO}`,
//             MEDIDAS: '',
//             DATOS: '',
//             CANT: '1',
//             PRECIO: box.troquel.troquelManual,
//             TOTAL: Number(box.troquel.troquelManual).toFixed(3),
//          })
//       }

//       if (box.checkClise) {
//          lines.push({
//             CODIGO: `CLI${box.CODE_PT.slice(2)}`,
//             DESCRIPCIÓN: `CLISÉ ${box.PRODUCTO}`,
//             MEDIDAS: '',
//             DATOS: '',
//             CANT: '1',
//             PRECIO: box.clise.cliseManual,
//             TOTAL: Number(box.clise.cliseManual).toFixed(3),
//          })
//       }
//    })

//    var itmTable = 0,
//       pages = lines > 13
//          ? (
//             lines.length > 22
//                ? Math.ceil(lines.length / 22)
//                : Math.ceil(lines.length / 13)
//          ) : Math.ceil(lines.length / 13)

//    // pages = lines.length > 13
//    //    ? Math.ceil(lines.length / 25)
//    //    : Math.ceil(lines.length / 13)

//    try {
//       var doc = new jsPDF()

//       const pdfDesign = async (a, recorrido, initial) => {
//          const fechaCotizacion = `${dias[new Date().getDay()]}, ${moment().utcOffset('-05:00').format('LL')}`

//          doc.addImage(fondo, 'JPEG', -5, -1, 250, 300)

//          CLIENT.CIA.toUpperCase() === 'CARTOMANABISA'
//             ? doc.addImage(logoCartomanabi, 'PNG', 5, 17)
//             : doc.addImage(logoAustrobox, 'PNG', 5, 17, 86, 17)

//          doc.setFontSize(18)
//          doc.setTextColor('white')
//          doc.setFont(undefined, 'bold')
//          doc.text(148, 30, fileName.split('.')[0])

//          doc.setFontSize(11)
//          doc.setTextColor('black')
//          doc.setFont(undefined, 'bold')
//          doc.text(20, 55, 'Fecha:')
//          doc.text(20, 65, 'Compañía:')
//          doc.text(20, 70, 'Ciudad:')
//          doc.text(20, 75, 'Dirección:')
//          doc.text(135, 70, 'Teléfono:')
//          doc.text(135, 75, 'RUC:')
//          doc.text(135, 80, 'Atención:')
//          doc.text(20, 80, 'Asunto:')
//          doc.setFontSize(9)
//          doc.text(55, 85, 'Nos es grato detallar el precio de la(s) siguiente(s) caja(s):')

//          doc.setFontSize(11)
//          doc.setFont(undefined, 'normal')
//          doc.text(34, 55, fechaCotizacion)

//          if (
//             CLIENT.CLIENTE != undefined &&
//             CLIENT.CELULAR != undefined &&
//             CLIENT.RUC != undefined
//          ) {
//             doc.text(41, 65, CLIENT.CLIENTE)
//             doc.text(38, 70, CLIENT?.CIUDAD || '')
//             doc.text(41, 75, `${CLIENT?.DIRECCION?.slice(0, 38) || ''}...`)

//             doc.text(153, 70, CLIENT.CELULAR)
//             doc.text(145, 75, CLIENT.RUC)
//             doc.text(154, 80, USER?.TIP_CONTACTO || '')
//             doc.text(35, 80, 'COTIZACIÓN')
//          }

//          var lineas = [], aux = 0

//          for (let i = initial; i <= recorrido; i++) {
//             if (i === lines.length) break

//             lineas[aux++] = [
//                i + 1,
//                lines[i]?.CODIGO,
//                lines[i]?.DESCRIPCIÓN,
//                lines[i]?.MEDIDAS,
//                lines[i]?.DATOS,
//                lines[i]?.CANT,
//                `$ ${lines[i]?.PRECIO}`,
//                OBSERVACIONES.viewTotals ? lines[i]?.TOTAL : null,
//             ]
//          }

//          doc.autoTable({
//             head: [
//                [
//                   '#',
//                   'CODIGO',
//                   'DESCRIPCIÓN',
//                   'MED. INTERNAS',
//                   'ECT/PAPEL',
//                   OBSERVACIONES.viewTotals ? 'CANT.' : 'MIN.',
//                   'PRECIO',
//                   OBSERVACIONES.viewTotals ? 'TOTAL' : null,
//                ],
//             ],
//             body: lineas,
//             columnStyles: {
//                0: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 10,
//                },
//                1: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 22,
//                },
//                2: {
//                   halign: 'left',
//                   fontSize: 7.5,
//                },
//                3: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 27,
//                },
//                4: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 23,
//                },
//                5: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                },
//                6: {
//                   halign: 'right',
//                   fontSize: 7.5,
//                },
//                7: {
//                   halign: 'right',
//                   fontSize: 7.5,
//                }
//             },
//             theme: 'striped',
//             startY: 90,
//             styles: {
//                fontSize: 7.5,
//             },
//             headStyles: {
//                halign: 'center',
//                fillColor: [66, 165, 245],
//             },
//          })

//          if (a === pages) {
//             OBSERVACIONES.viewTotals && (
//                doc.autoTable({
//                   body: [
//                      [
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         'SUBTOTAL 0%',
//                         TOTALES.subCero,
//                      ],
//                      [
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         '',
//                         'SUBTOTAL 15%',
//                         TOTALES.subDoce,
//                      ],
//                      ['', '', '', '', '', '', '', '', '', 'IVA 15%', TOTALES.ivaTot],
//                      ['', '', '', '', '', '', '', '', '', 'TOTAL', TOTALES.totPagar],
//                   ],
//                   columnStyles: {
//                      9: {
//                         halign: 'left',
//                      },
//                      10: {
//                         halign: 'right',
//                      },
//                   },
//                   theme: 'striped',
//                   styles: {
//                      fontSize: 7.5,
//                   },
//                })
//             )

//             doc.setFontSize(9)
//             doc.setFont(undefined, 'bold')
//             doc.text(20, 225, 'OBSERVACIONES:')
//             doc.setFont(undefined, 'normal')

//             doc.text(
//                20,
//                230,
//                `1. Plazo de entrega ${OBSERVACIONES.plazoEntrega} días hábiles después de recibir la Orden de Compra con aprobación, diseño y estructura.`
//             )
//             doc.text(20, 234, `2. Forma de pago: ${OBSERVACIONES.viewDaysCred ? CLIENT.FORMA_PAGO.slice(2) : '***'}.`)
//             doc.text(
//                20,
//                238,
//                `3. Transporte por cuenta de ${
//                   CLIENT.CIA != undefined
//                      ? CLIENT.CIA.split('SA')[0].toUpperCase()
//                      : ''
//                }.`
//             )
//             doc.text(20, 242, '4. Validez de esta cotización: 30 días.')
//             doc.text(
//                20,
//                246,
//                '5. El pedido entregado tendá una diferencia de un 10% + o - de la cantidad de su pedido original.'
//             )
//             doc.text(
//                20,
//                250,
//                OBSERVACIONES.valCli === true
//                   ? `6. Valor de clisé pago por parte del cliente.`
//                   : OBSERVACIONES.valTro === true
//                      ? `6. Valor de troquel pago por parte del cliente.`
//                      : OBSERVACIONES.boxPedido === true
//                         ? '6. Requiere pedido mínimo de 2000 cajas por ítem.'
//                         : ''
//             )
//             doc.text(
//                20,
//                254,
//                OBSERVACIONES.valCli === true && OBSERVACIONES.valTro === true
//                   ? `7. Valor de troquel pago por parte del cliente.`
//                   : OBSERVACIONES.valTro === true && OBSERVACIONES.boxPedido === true
//                      ? '7. Requiere pedido mínimo de 2000 cajas por ítem.'
//                      : ''
//             )
//             doc.text(
//                20,
//                258,
//                OBSERVACIONES.valCli === true && OBSERVACIONES.valTro === true && OBSERVACIONES.boxPedido === true
//                   ? '8. Requiere pedido mínimo de 2000 cajas por ítem.'
//                   : ''
//             )
//             // doc.text(20, 262, 'Atentamente,')

//             doc.autoTable({
//                body: [
//                   [ `Atentamente,` ],
//                   [ `${USER.NAME}` ],
//                   [ `${USER.DEPARTAMENT} ${CLIENT.CIA}` ],
//                   [ `Cel.: ${USER?.MOBILE || '0000000000'}` ],
//                   [ `${USER.EMAIL}` ],
//                ],
//                columnStyles: {
//                   0: {
//                      halign: 'center',
//                   },
//                },
//                theme: 'plain',
//                styles: {
//                   cellPadding: 0,
//                },
//                startY: 262,
//             })
//          }

//          doc.setFontSize(7)
//          doc.setTextColor('white')
//          doc.setFont(undefined, 'bold')
//          doc.text(35, 291, 'Evite imprimir este mensaje si no es estrictamente necesario. De esta manera ahorras agua, energía y recursos forestales.')

//          if (a < pages) {
//             doc.addPage()
//          }
//       }

//       let base = 23, recorrido = lines.length

//       for (let a = 1; a <= pages; a++) {
//          if (a === 1) {
//             if (lines.length <= 13) {
//                itmTable = 0
//                recorrido = 13
//             } else if (lines.length > base) {
//                itmTable = 0
//                recorrido = base
//             }
//          }

//          if (a > 1) {
//             if (lines.length > 13 && lines.length < base) {
//                itmTable = 14
//                recorrido = lines.length
//             } else if (lines.length > base) {
//                itmTable = 24
//                recorrido = lines.length
//             }
//          }

//          pdfDesign(a, recorrido, itmTable)
//       }

//       doc.save(path.join(__dirname, `../docs/cotizaciones/${fileName}.pdf`))

//       return true
//    } catch (e) {
//       console.error(e)

//       return false
//    }
// }

exports.CrearPDF = async function pdf({
   CLIENT,
   BOX,
   TOTALES,
   OBSERVACIONES,
   fileName,
   USER
}) {
   let lines = []

   BOX.forEach((box) => {
      lines.push({
         CODIGO: box.CODE_PT,
         DESCRIPCIÓN: box.PRODUCTO,
         MEDIDAS: OBSERVACIONES.viewMedidas ? `${box.LARGO} x ${box.ANCHO} x ${box.ALTO}` : box.TIPO === 'Regular' && box.TIP_BOX === 'Regular' ? `${box.LARGO} x ${box.ANCHO} x ${box.ALTO}` : `${box.LARGO_LAM} x ${box.ANCHO_LAM} x 0`,
         DATOS: `${box.ECT} ${box.COLOR.toUpperCase()}`,
         CANT: OBSERVACIONES.viewTotals ? box.quantity : (box.quantity > 2000 ? box.quantity : 2000),
         PRECIO: (box.precio * 1).toFixed(4),
         TOTAL: (box.precio * box.quantity).toFixed(3)
      })

      if (box.checkTroquel) {
         lines.push({
            CODIGO: `TRO${box.CODE_PT.slice(2)}`,
            DESCRIPCIÓN: `TROQUEL ${box.PRODUCTO}`,
            MEDIDAS: '',
            DATOS: '',
            CANT: '1',
            PRECIO: box.troquel.troquelManual,
            TOTAL: Number(box.troquel.troquelManual).toFixed(3),
         })
      }

      if (box.checkClise) {
         lines.push({
            CODIGO: `CLI${box.CODE_PT.slice(2)}`,
            DESCRIPCIÓN: `CLISÉ ${box.PRODUCTO}`,
            MEDIDAS: '',
            DATOS: '',
            CANT: '1',
            PRECIO: box.clise.cliseManual,
            TOTAL: Number(box.clise.cliseManual).toFixed(3),
         })
      }
   })

   var itmTable = 0,
      pages = lines.length > 13
         ? (
            lines.length > 22
               ? Math.ceil(lines.length / 22)
               : Math.ceil(lines.length / 13)
         ) : Math.ceil(lines.length / 13)

   try {
      var doc = new jsPDF()

      const pdfDesign = async (a, recorrido, initial) => {
         const fechaCotizacion = `${dias[new Date().getDay()]}, ${moment().utcOffset('-05:00').format('LL')}`

         doc.addImage(fondo, 'JPEG', -5, -1, 250, 300)

         CLIENT.CIA.toUpperCase() === 'CARTOMANABISA'
            ? doc.addImage(logoCartomanabi, 'PNG', 5, 17)
            : doc.addImage(logoAustrobox, 'PNG', 5, 17, 86, 17)

         doc.setFontSize(18)
         doc.setTextColor('white')
         doc.setFont(undefined, 'bold')
         doc.text(148, 30, fileName.split('.')[0])

         doc.setFontSize(11)
         doc.setTextColor('black')
         doc.setFont(undefined, 'bold')
         doc.text(20, 65, 'Fecha:')
         doc.text(20, 75, 'Cliente:')
         doc.text(20, 80, 'Atención: ')
         doc.text(20, 85, 'Ciudad: ')
         doc.text(135, 80, 'Teléfono:')
         doc.text(135, 85, 'RUC:')
         doc.setFontSize(9)
         // doc.text(55, 95, 'Nos es grato detallar el precio de la(s) siguiente(s) caja(s):')

         doc.setFontSize(11)
         doc.setFont(undefined, 'normal')
         doc.text(34, 65, fechaCotizacion)

         if (
            CLIENT.CLIENTE != undefined &&
            CLIENT.CELULAR != undefined &&
            CLIENT.RUC != undefined
         ) {
            doc.text(41, 75, CLIENT.CLIENTE || '')
            doc.text(41, 85, `${CLIENT?.CIUDAD?.slice(0, 38) || ''}`)
            doc.text(41, 80, CLIENT?.ATENCION || '')
            doc.text(153, 80, CLIENT.CELULAR || '')
            doc.text(145, 85, CLIENT.RUC || '')
            doc.text(154, 90, USER?.TIP_CONTACTO || '')
         }

         var lineas = [], aux = 0

         for (let i = initial; i <= recorrido; i++) {
            if (i === lines.length) break

            lineas[aux++] = [
               `${i + 1}`,
               `${lines[i]?.CODIGO}`,
               `${lines[i]?.DESCRIPCIÓN}`,
               `${lines[i]?.MEDIDAS}`,
               `${lines[i]?.DATOS}`,
               `${lines[i]?.CANT}`,
               `$ ${lines[i]?.PRECIO}`,
               `${OBSERVACIONES.viewTotals ? lines[i]?.TOTAL : null}`,
            ]
         }

         doc.autoTable({
            head: [
               [
                  '#',
                  'CODIGO',
                  'DESCRIPCIÓN',
                  'MED. INTERNAS',
                  'ECT/PAPEL',
                  OBSERVACIONES.viewTotals ? 'CANT.' : 'MIN.',
                  'PRECIO',
                  OBSERVACIONES.viewTotals ? 'TOTAL' : null,
               ],
            ],
            body: lineas,
            columnStyles: {
               0: { halign: 'center', fontSize: 7.5, cellWidth: 10 },
               1: { halign: 'center', fontSize: 7.5, cellWidth: 22 },
               2: { halign: 'left', fontSize: 7.5 },
               3: { halign: 'center', fontSize: 7.5, cellWidth: 27 },
               4: { halign: 'center', fontSize: 7.5, cellWidth: 23 },
               5: { halign: 'center', fontSize: 7.5 },
               6: { halign: 'right', fontSize: 7.5 },
               7: { halign: 'right', fontSize: 7.5 }
            },
            theme: 'striped',
            startY: 95,
            styles: { fontSize: 7.5 },
            headStyles: {
               halign: 'center',
               fillColor: [200, 200, 200], // Color gris (RGB)
               fontStyle: 'bold', // Negritas
               textColor: 0 // Color del texto negro
            },
         })


         // Calcular la posición final de la tabla
         const tableEndY = doc.previousAutoTable.finalY + 10

         // Renderizar Totales dinámicamente según el check en OBSERVACIONES
         if (OBSERVACIONES.viewTotals) {
            doc.autoTable({
               body: [
                  ['', '', '', '', '', '', '', '', 'SUBTOTAL 0%', TOTALES.subCero],
                  ['', '', '', '', '', '', '', '', 'SUBTOTAL 15%', TOTALES.subDoce],
                  ['', '', '', '', '', '', '', '', 'IVA 15%', TOTALES.ivaTot],
                  ['', '', '', '', '', '', '', '', 'TOTAL', TOTALES.totPagar],
               ],
               columnStyles: {
                  9: { halign: 'left' },
                  10: { halign: 'right' },
               },
               theme: 'striped',
               styles: { fontSize: 7.5 },
               startY: tableEndY,
            })
         }

         // Calcular la posición final de los Totales
         const totalsEndY = OBSERVACIONES.viewTotals ? doc.previousAutoTable.finalY + 10 : tableEndY

         // Renderizar Observaciones justo debajo de los Totales
         doc.setFontSize(9)
         doc.setFont(undefined, 'bold')
         doc.text(20, totalsEndY, 'Terminos y Condiciones:')
         doc.setFont(undefined, 'normal')
         doc.text(20, totalsEndY + 5, `1. Plazo de entrega ${OBSERVACIONES.plazoEntrega} días hábiles después de recibir la Orden de Compra con aprobación, diseño y estructura.`)
         doc.text(20, totalsEndY + 9, `2. Forma de pago: ${OBSERVACIONES.viewDaysCred ? CLIENT.FORMA_PAGO.slice(2) : '***'}.`)
         doc.text(20, totalsEndY + 13, `3. Transporte por cuenta de ${CLIENT.CIA ? CLIENT.CIA.split('SA')[0].toUpperCase() : ''}.`)
         doc.text(20, totalsEndY + 17, '4. Validez de esta cotización: 30 días.')
         doc.text(20, totalsEndY + 21, '5. El pedido entregado tendá una diferencia de un 10% + o - de la cantidad de su pedido original.')

         // Continuar con las observaciones adicionales según las condiciones
         doc.text(20, totalsEndY + 25, OBSERVACIONES.valCli ? '6. Valor de clisé pago por parte del cliente.' : OBSERVACIONES.valTro ? '6. Valor de troquel pago por parte del cliente.' : OBSERVACIONES.boxPedido ? '6. Requiere pedido mínimo de 2000 cajas por ítem.' : '')
         doc.text(20, totalsEndY + 29, OBSERVACIONES.valCli && OBSERVACIONES.valTro ? '7. Valor de troquel pago por parte del cliente.' : OBSERVACIONES.valTro && OBSERVACIONES.boxPedido ? '7. Requiere pedido mínimo de 2000 cajas por ítem.' : '')
         doc.text(20, totalsEndY + 33, OBSERVACIONES.valCli && OBSERVACIONES.valTro && OBSERVACIONES.boxPedido ? '8. Requiere pedido mínimo de 2000 cajas por ítem.' : '')

         doc.autoTable({
            body: [
               [ 'Atentamente,' ],
               [ `${USER.NAME}` ],
               [ `${USER.DEPARTAMENT} ${CLIENT.CIA}` ],
               [ `Cel.: ${USER?.MOBILE || '0000000000'}` ],
               [ `${USER.EMAIL}` ],
            ],
            columnStyles: {
               0: {
                  halign: 'center',
               },
            },
            theme: 'plain',
            styles: {
               cellPadding: 0,
            },
            startY: totalsEndY+60,
         })
         // }

         doc.setFontSize(7)
         doc.setTextColor('white')
         doc.setFont(undefined, 'bold')
         doc.text(35, 291, 'Evite imprimir este mensaje si no es estrictamente necesario. De esta manera ahorras agua, energía y recursos forestales.')

         if (a < pages) {
            doc.addPage()
         }
      }

      for (let a = 1; a <= pages; a++) {
         let base = 23, recorrido = lines.length
         if (a === 1) {
            recorrido = lines.length <= 13 ? 13 : base
         } else if (a > 1) {
            recorrido = lines.length < base ? lines.length : 24
         }

         pdfDesign(a, recorrido, itmTable)
      }

      doc.save(path.join(__dirname, `../docs/cotizaciones/${fileName}.pdf`))

      return true
   } catch (e) {
      console.error(e)
      return false
   }
}

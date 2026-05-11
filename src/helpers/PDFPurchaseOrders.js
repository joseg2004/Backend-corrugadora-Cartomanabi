// const { jsPDF } = require('jspdf')
require('jspdf-autotable')
const path = require('path')
const moment = require('moment')
const PdfPrinter = require('pdfmake')
const fs = require('fs')
moment.locale('es')
const { logoCartomanabi } = require('./imgCotizador')
const { numberFormatToDecimals } = require('./fntHelpers')

// const dias = [
//    'Domingo',
//    'Lunes',
//    'Martes',
//    'Miércoles',
//    'Jueves',
//    'Viernes',
//    'Sábado',
// ]

// exports.createPurchasePDF = async function pdf({
//    CLIENT,
//    ITEMS,
//    TOTALES,
//    FILE
// }) {
//    let lines = []

//    ITEMS.forEach((itm) => {
//       lines.push({
//          CODIGO: itm.CODE_PT,
//          DESCRIPCION: `${itm?.DESCRIPTION} ${itm?.DETALLE || itm?.DETALLE !== '' ? `- ${itm?.DETALLE}` : ''}`,
//          GRAMAJE: Number(itm?.GRAMAJE || 0),
//          ANCHO: Number(itm?.ANCHO || 0),
//          CANT: Number(itm?.CANTIDAD || 0).toFixed(2),
//          PRECIO: (itm.PRICE * 1).toFixed(5),
//          TOTAL: (itm.PRICE * itm.CANTIDAD).toFixed(5),
//       })
//    })

//    var itmTable = 0,
//       pages = lines > 20
//          ? (
//             lines.length > 20
//                ? Math.ceil(lines.length / 20)
//                : Math.ceil(lines.length / 20)
//          ) : Math.ceil(lines.length / 20)

//    try {
//       var doc = new jsPDF()

//       const pdfDesign = async (a, recorrido, initial) => {
//          const sem = moment(`${CLIENT.FECHA_ARR}`).format('d'),
//             dia = moment(`${CLIENT.FECHA_ARR}`).format('DD'),
//             mes = moment(`${CLIENT.FECHA_ARR}`).format('MM'),
//             anio = moment(`${CLIENT.FECHA_ARR}`).format('YYYY')

//          const fechaDoc = `${dias[sem]}, ${dia} de ${moment.months()[mes - 1]} del ${anio}`

//          doc.addImage(fondo, 'JPEG', -5, -1, 250, 300)
//          doc.addImage(logoCartomanabi, 'PNG', 5, 17)

//          doc.setFontSize(22)
//          doc.setTextColor('white')
//          doc.setFont(undefined, 'bold')
//          doc.text(152, 30, FILE.split('.')[0])

//          doc.setFontSize(10)
//          doc.setTextColor('black')
//          doc.setFont(undefined, 'bold')
//          // doc.text(20, 55, 'Fecha:')
//          doc.text(20, 45, 'Fecha:')
//          doc.text(20, 49, 'Proveedor:')
//          doc.text(20, 53, 'NIT/RUT/TaxID/RUC:')
//          doc.text(20, 57, 'Persona Contacto:')
//          doc.text(20, 61, 'Teléfono:')
//          doc.text(20, 65, 'Origen:')
//          doc.text(132, 65, 'Moneda:')

//          doc.setFontSize(9)
//          doc.text(75, 71, 'Nos es grato detallar la orden de compra:')

//          doc.setFontSize(11)
//          doc.setFont(undefined, 'normal')
//          doc.text(34, 45, fechaDoc)

//          doc.text(43, 49, CLIENT?.PROVEEDOR || '')
//          doc.text(61, 53, CLIENT?.NIT || '')
//          doc.text(57, 57, CLIENT?.CONTACT || '')
//          doc.text(39, 61, CLIENT?.PHONE1 || CLIENT?.PHONE2 || '')
//          doc.text(36, 65, CLIENT?.ORIGEN || '')
//          doc.text(150, 65, CLIENT?.MONEY || 'USD')

//          var lineas = [], aux = 0

//          for (let i = initial; i <= recorrido; i++) {
//             if (i === lines.length) break

//             lineas[aux++] = [
//                aux,
//                lines[i]?.CODIGO,
//                lines[i]?.DESCRIPCION,
//                lines[i]?.GRAMAJE,
//                lines[i]?.ANCHO,
//                lines[i]?.CANT,
//                lines[i]?.PRECIO,
//                lines[i]?.TOTAL,
//             ]
//          }

//          doc.autoTable({
//             head: [
//                [
//                   '#',
//                   'CODIGO',
//                   'DESCRIPCIÓN',
//                   'GRAM. (gr)',
//                   'ANCH. (mm)',
//                   'CANT. (kg)',
//                   'PRE. UNIT.',
//                   'PRECIO',
//                ],
//             ],
//             body: lineas,
//             columnStyles: {
//                0: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 8,
//                },
//                1: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                },
//                2: {
//                   halign: 'left',
//                   fontSize: 6.5,
//                },
//                3: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                },
//                4: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                },
//                5: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                },
//                6: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                },
//                7: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                }
//             },
//             theme: 'striped',
//             startY: 74,
//             styles: {
//                fontSize: 7.5,
//             },
//             headStyles: {
//                halign: 'center',
//                fillColor: [66, 165, 245],
//             },
//          })

//          if (a === pages) {
//             doc.autoTable({
//                body: [
//                   [
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      'SUBTOTAL 0%',
//                      TOTALES?.subCero,
//                   ],
//                   [
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      'SUBTOTAL 15%',
//                      TOTALES?.subDoce,
//                   ],
//                   ['', '', '', '', '', '', '', '', '', 'IVA 15%', TOTALES?.ivaTot],
//                   ['', '', '', '', '', '', '', '', '', 'TOTAL', TOTALES?.totPagar],
//                ],
//                columnStyles: {
//                   9: {
//                      halign: 'left',
//                   },
//                   10: {
//                      halign: 'right',
//                   },
//                },
//                theme: 'striped',
//                styles: {
//                   fontSize: 7.5,
//                },
//             })

//             const afterTableY = doc.lastAutoTable.finalY + 5

//             doc.setFontSize(8)
//             doc.setFont(undefined, 'bold')
//             doc.text(15, afterTableY, 'COMENTARIO:')

//             doc.autoTable({
//                body: [[`${CLIENT.COMMENTS}.`]],
//                columnStyles: {
//                   0: { halign: 'left', fontSize: 7.5 },
//                },
//                theme: 'plain',
//                styles: {
//                   cellPadding: 0,
//                   cellWidth: 'auto',
//                },
//                startY: afterTableY + 2,
//             })

//             let y = doc.lastAutoTable.finalY + 5

//             doc.setFontSize(9)
//             doc.setFont(undefined, 'bold')
//             doc.text(15, y, 'OBSERVACIONES:')

//             doc.setFont(undefined, 'normal')
//             doc.text(15, y += 5, `1. Forma de pago: ${CLIENT.FORMA_PAGO.slice(2).replaceAll('-', '')}.`)
//             doc.text(15, y += 4, '2. Persona de contacto: Ing. Jeniffer Bravo')
//             doc.text(20, y += 4, '- Cel. +593 96 971 3397')
//             doc.text(120, y, '- Telf.: +593 55 000 555 Ext.: 1013')
//             doc.text(20, y += 4, '- Email: jbravo@cartomanabi.com')
//             doc.text(15, y += 4, '3. Información de la empresa:')
//             doc.text(20, y += 4, '- Identificación fiscal (RUC): 1391912811001')
//             doc.text(20, y += 4, '- Nombre: CARTONERA MANABI CARTOMANABI S.A.')
//             doc.text(20, y += 4, '- Dirección: SECTOR LAS PALMAS')
//             doc.text(20, y += 4, '- Calle: VIA MONTECRISTI PORTOVIEJO KM 13.3')
//             doc.text(120, y, '- Ciudad: MONTECRISTI')
//             doc.text(120, y += 4, '- Código postal: EC130223')
//             doc.text(120, y += 4, '- Telf.: +593 55 000 555')

//             doc.setFont(undefined, 'bold')
//             doc.text(15, y += 10, 'REGIMEN 21:')

//             doc.setFontSize(8)
//             doc.text(15, y += 8, 'Resolución Nro. SENAE-SGO-2022-0282-RE')
//             doc.text(15, y += 4, 'Código operador de comercio exterior (Deposito Industrial) : 12777806')

//             doc.setFont(undefined, 'normal')
//             doc.text(15, y += 4, 'FUNCIONAMIENTO DE INSTALACIÓN INDUSTRIAL PARA OPERAR BAJO EL RÉGIMEN DE IMPORTACIÓN TEMPORAL PARA')
//             doc.text(15, y += 3, 'PERFECCIONAMIENTO ACTIVO A LA COMPAÑÍA CARTONERA MANABI CARTOMANABI S.A. / RUC: 1391912811001')

//             doc.setFontSize(9)
//             doc.setFont(undefined, 'bold')
//             doc.text(20, y += 5, 'Atentamente,')

//             doc.setFont(undefined, 'normal')
//             doc.autoTable({
//                body: [
//                   ['Geovanny Coellar'],
//                   [`Gerente ${CLIENT.CIA}`],
//                   ['gcoellar@cartomanabi.com'],
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
//                startY: 266,
//             })
//          }

//          let y1 = doc.lastAutoTable.finalY + 27

//          doc.setFontSize(7)
//          doc.setTextColor('white')
//          doc.setFont(undefined, 'bold')
//          doc.text(35, y1, 'Evite imprimir este mensaje si no es estrictamente necesario. De esta manera ahorras agua, energía y recursos forestales.')

//          if (a < pages) {
//             doc.addPage()
//          }
//       }

//       let base = 20, recorrido = lines.length

//       for (let a = 1; a <= pages; a++) {
//          if (a === 1) {
//             if (lines.length <= 20) {
//                itmTable = 0
//                recorrido = 20
//             } else if (lines.length > base) {
//                itmTable = 0
//                recorrido = base
//             }
//          }

//          if (a > 1) {
//             if (lines.length > 20 && lines.length < base) {
//                itmTable = 20
//                recorrido = lines.length
//             } else if (lines.length > base) {
//                itmTable = 21
//                recorrido = lines.length
//             }
//          }

//          pdfDesign(a, recorrido, itmTable)
//       }

//       doc.save(path.join(__dirname, `../docs/purchase/${FILE}.pdf`))

//       return true
//    } catch (e) {
//       console.error(e)

//       return false
//    }
// }

exports.createPurchasePDF = async function pdf({
   CLIENT,
   ITEMS,
   TOTALES,
   FILE
}) {
   return new Promise((resolve, reject) => {
      try {
         // ============ PALETA DE COLORES CORPORATIVOS ============
         const COLORS = {
            primary: '#88b6e2',      // Azul suave - COLOR PRINCIPAL
            blue: '#88b6e2',         // Azul suave
            blueDark: '#5a8bc4',     // Azul oscuro
            orange: '#f29000',       // Naranja secundario
            brown: '#957745',        // Marrón oscuro
            brownMid: '#d2a472',     // Marrón medio
            beige: '#e1c1a2',        // Beige
            darkText: '#2c3e50',     // Texto oscuro profesional
            grayText: '#6b6b6b',     // Texto gris
            lightBg: '#f0f7fc'       // Fondo azul muy claro
         }

         // Fecha formateada
         const sem = moment(CLIENT.FECHA_ARR).format('d')
         const dia = moment(CLIENT.FECHA_ARR).format('DD')
         const mes = moment(CLIENT.FECHA_ARR).format('MM')
         const anio = moment(CLIENT.FECHA_ARR).format('YYYY')
         const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
         const fechaDoc = `${dias[sem]}, ${dia} de ${moment.months()[mes - 1]} del ${anio}`

         // Preparar datos de items
         const tableBody = ITEMS.map((itm, idx) => [
            { text: (idx + 1).toString(), style: 'tableCell', alignment: 'center', bold: true, color: COLORS.blueDark },
            { text: itm.CODE_PT || '', style: 'tableCell', alignment: 'center' },
            { text: `${itm?.DESCRIPTION || ''} ${itm?.DETALLE ? `- ${itm?.DETALLE}` : ''}`.trim(), style: 'tableCell' },
            { text: itm?.FSC || '', style: 'tableCell', alignment: 'center' },
            { text: Number(itm?.GRAMAJE || 0).toString(), style: 'tableCell', alignment: 'center' },
            { text: Number(itm?.ANCHO || 0).toString(), style: 'tableCell', alignment: 'center' },
            { text: Number(itm?.CANTIDAD || 0).toFixed(2), style: 'tableCell', alignment: 'right' },
            { text: (itm.PRICE * 1).toFixed(5), style: 'tableCell', alignment: 'right' },
            { text: numberFormatToDecimals((itm.PRICE || 0) * (itm.CANTIDAD || 0), 2), style: 'tableCellBold', alignment: 'right', color: COLORS.primary }
         ])

         // Capturar variables para usar en header/footer
         const headerTitle = FILE.split('.')[0]
         const logo = logoCartomanabi
         const colors = COLORS

         // Definición del documento
         const docDefinition = {
            pageSize: 'LETTER',
            pageMargins: [40, 60, 40, 80],

            header: function() {
               return {
                  margin: [40, 15, 40, 10], // márgenes: izquierda, arriba, derecha, abajo
                  stack: [
                     // // Banda superior azul con degradado simulado
                     // {
                     //    canvas: [
                     //       {
                     //          type: 'rect',
                     //          x: 0,
                     //          y: 0,
                     //          w: 535,
                     //          h: 5,
                     //          color: colors.primary
                     //       },
                     //       {
                     //          type: 'rect',
                     //          x: 0,
                     //          y: 5,
                     //          w: 535,
                     //          h: 2,
                     //          color: colors.blueDark
                     //       }
                     //    ],
                     //    height: 7
                     // },
                     // Contenido del header con logo
                     {
                        columns: [
                           {
                              image: logo,
                              width: 110,
                              margin: [0, 10, 0, 0]
                           },
                           {
                              stack: [
                                 {
                                    text: headerTitle,
                                    fontSize: 20,
                                    bold: true,
                                    color: colors.primary,
                                    alignment: 'right',
                                    margin: [0, 15, 0, 6]
                                 },
                                 {
                                    canvas: [
                                       {
                                          type: 'line',
                                          x1: 200,
                                          y1: 0,
                                          x2: 320,
                                          y2: 0,
                                          lineWidth: 3,
                                          lineColor: colors.orange
                                       }
                                    ],
                                    margin: [0, 0, 0, 0]
                                 },
                                 {
                                    text: 'CARTONERA MANABÍ S.A.',
                                    fontSize: 9,
                                    color: colors.grayText,
                                    alignment: 'right',
                                    margin: [0, 4, 0, 0]
                                 }
                              ],
                              width: '*'
                           }
                        ]
                     }
                  ]
               }
            },

            footer: function(currentPage, pageCount) {
               return {
                  margin: [40, 20, 40, 10],
                  stack: [
                     {
                        canvas: [
                           {
                              type: 'line',
                              x1: 0,
                              y1: 0,
                              x2: 535,
                              y2: 0,
                              lineWidth: 2.5,
                              lineColor: colors.primary
                           },
                           {
                              type: 'line',
                              x1: 0,
                              y1: 4,
                              x2: 535,
                              y2: 4,
                              lineWidth: 1,
                              lineColor: colors.orange
                           }
                        ]
                     },
                     {
                        text: 'Evite imprimir este mensaje si no es estrictamente necesario. De esta manera ahorras agua, energía y recursos forestales.',
                        style: 'footer',
                        alignment: 'center',
                        margin: [0, 8, 0, 5]
                     },
                     {
                        text: `Página ${currentPage} de ${pageCount}`,
                        style: 'pageNumber',
                        alignment: 'right'
                     }
                  ]
               }
            },

            content: [
               // LÍNEA DECORATIVA SUPERIOR - Doble línea elegante
               {
                  canvas: [
                     {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 535,
                        y2: 0,
                        lineWidth: 4,
                        lineColor: COLORS.primary
                     },
                     {
                        type: 'line',
                        x1: 0,
                        y1: 6,
                        x2: 535,
                        y2: 6,
                        lineWidth: 1.5,
                        lineColor: COLORS.orange
                     }
                  ],
                  margin: [0, 0, 0, 14]
               },

               // INFORMACIÓN DEL CLIENTE
               {
                  columns: [
                     {
                        width: '50%',
                        stack: [
                           { text: 'Fecha:', style: 'label' },
                           { text: fechaDoc, style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'Proveedor:', style: 'label' },
                           { text: CLIENT.PROVEEDOR || '', style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'NIT/RUT/TaxID/RUC:', style: 'label' },
                           { text: CLIENT.NIT || '', style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'Persona Contacto:', style: 'label' },
                           { text: CLIENT.CONTACT || '', style: 'value', margin: [0, 0, 0, 8] }
                        ]
                     },
                     {
                        width: '50%',
                        stack: [
                           { text: 'Teléfono:', style: 'label' },
                           { text: CLIENT.PHONE1 || CLIENT.PHONE2 || '', style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'Origen:', style: 'label' },
                           { text: CLIENT.ORIGEN || '', style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'Moneda:', style: 'label' },
                           { text: CLIENT.MONEY || 'USD', style: 'value', margin: [0, 0, 0, 8] }
                        ]
                     }
                  ],
                  margin: [0, 0, 0, 10]
               },

               // LÍNEA DIVISORIA
               {
                  canvas: [
                     {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 535,
                        y2: 0,
                        lineWidth: 1,
                        lineColor: COLORS.beige
                     }
                  ],
                  margin: [0, 0, 0, 10]
               },

               // MENSAJE INTRODUCTORIO
               {
                  text: 'Nos es grato detallar la orden de compra:',
                  style: 'intro',
                  alignment: 'center',
                  margin: [0, 0, 0, 10],
                  fontSize: 9
               },

               // TABLA DE ITEMS
               {
                  table: {
                     headerRows: 1,
                     widths: [25, 45, '*', 30, 35, 35, 40, 50, 50],
                     body: [
                        [
                           { text: '#', style: 'tableHeader', alignment: 'center' },
                           { text: 'CÓDIGO', style: 'tableHeader', alignment: 'center' },
                           { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                           { text: 'FSC', style: 'tableHeader', alignment: 'center' },
                           { text: 'GRAM.\n(gr)', style: 'tableHeader', alignment: 'center' },
                           { text: 'ANCH.\n(mm)', style: 'tableHeader', alignment: 'center' },
                           { text: 'CANT.\n(kg)', style: 'tableHeader', alignment: 'center' },
                           { text: 'PRE. UNIT.', style: 'tableHeader', alignment: 'center' },
                           { text: 'PRECIO', style: 'tableHeader', alignment: 'center' }
                        ],
                        ...tableBody
                     ]
                  },
                  layout: {
                     fillColor: function(rowIndex) {
                        return rowIndex === 0 ? COLORS.primary : (rowIndex % 2 === 0 ? COLORS.lightBg : null)
                     },
                     hLineWidth: function(i, node) {
                        return i === 0 || i === 1 || i === node.table.body.length ? 1.5 : 0.5
                     },
                     vLineWidth: function() {
                        return 0
                     },
                     hLineColor: function(i) {
                        return i === 0 || i === 1 ? COLORS.blueDark : COLORS.beige
                     },
                     paddingTop: function() { return 6 },
                     paddingBottom: function() { return 6 },
                     paddingLeft: function() { return 5 },
                     paddingRight: function() { return 5 }
                  },
                  margin: [0, 0, 0, 15]
               },

               // TOTALES
               {
                  columns: [
                     { text: '', width: '*' },
                     {
                        width: 200,
                        stack: [
                           {
                              columns: [
                                 { text: 'SUBTOTAL 0%', style: 'totalLabel', width: '*' },
                                 { text: numberFormatToDecimals(TOTALES?.subCero || '0.00', 2), style: 'totalValue', width: 80, alignment: 'right' }
                              ],
                              margin: [0, 0, 0, 5]
                           },
                           {
                              columns: [
                                 { text: 'SUBTOTAL 15%', style: 'totalLabel', width: '*' },
                                 { text: numberFormatToDecimals(TOTALES?.subDoce || '0.00', 2), style: 'totalValue', width: 80, alignment: 'right' }
                              ],
                              margin: [0, 0, 0, 5]
                           },
                           {
                              columns: [
                                 { text: 'IVA 15%', style: 'totalLabel', width: '*' },
                                 { text: numberFormatToDecimals(TOTALES?.ivaTot || '0.00', 2), style: 'totalValue', width: 80, alignment: 'right' }
                              ],
                              margin: [0, 0, 0, 8]
                           },
                           {
                              canvas: [
                                 {
                                    type: 'line',
                                    x1: 0,
                                    y1: 0,
                                    x2: 200,
                                    y2: 0,
                                    lineWidth: 2,
                                    lineColor: COLORS.primary
                                 }
                              ],
                              margin: [0, 0, 0, 8]
                           },
                           {
                              columns: [
                                 { text: 'TOTAL', style: 'totalLabelFinal', width: '*' },
                                 { text: numberFormatToDecimals(TOTALES?.totPagar || '0.00', 2), style: 'totalValueFinal', width: 80, alignment: 'right' }
                              ]
                           }
                        ]
                     }
                  ],
                  margin: [0, 0, 0, 20]
               },

               // COMENTARIO
               CLIENT.COMMENTS ? {
                  stack: [
                     {
                        text: 'COMENTARIO:',
                        style: 'sectionTitle',
                        margin: [0, 0, 0, 8]
                     },
                     {
                        text: CLIENT.COMMENTS,
                        style: 'comment',
                        margin: [0, 0, 0, 10]
                     }
                  ]
               } : {},

               // OBSERVACIONES
               {
                  text: 'OBSERVACIONES:',
                  style: 'sectionTitle',
                  margin: [0, 10, 0, 5]
               },
               {
                  ul: [
                     { text: `Forma de pago: ${CLIENT.FORMA_PAGO.slice(2).replaceAll('-', '')}`, style: 'observation' },
                     [
                        { text: 'Persona de contacto: Ing. Jeniffer Bravo', style: 'observation' },
                        { text: '• Cel: +593 96 971 3397  • Email: jbravo@cartomanabi.com', style: 'observationSub', margin: [15, 2, 0, 0] }
                     ],
                     [
                        { text: 'Información de la empresa:', style: 'observation' },
                        { text: '• RUC: 1391912811001', style: 'observationSub', margin: [15, 2, 0, 0] },
                        { text: '• Nombre: CARTONERA MANABI CARTOMANABI S.A.', style: 'observationSub', margin: [15, 2, 0, 0] },
                        { text: '• Dirección: SECTOR LAS PALMAS, VIA MONTECRISTI PORTOVIEJO KM 13.3', style: 'observationSub', margin: [15, 2, 0, 0] },
                        { text: '• Ciudad: MONTECRISTI  • Código postal: EC130223  • Telf: +593 55 000 555', style: 'observationSub', margin: [15, 2, 0, 0] }
                     ],
                     { text: 'Incorporar el logo FSC en la factura', style: 'observation' },
                     { text: 'Incluir el código del certificado FSC correspondiente a la organización', style: 'observation' },
                     { text: 'Adjuntar el documento de certificación FSC vigente', style: 'observation' },
                     { text: 'Indicar en el detalle de cada ítem si el producto corresponde a FSC 100%, FSC Mixto o FSC Reciclado', style: 'observation' },
                  ],
                  margin: [0, 0, 0, 10]
               },

               // RÉGIMEN 21
               {
                  stack: [
                     {
                        text: 'RÉGIMEN 21:',
                        style: 'regimen',
                        margin: [0, 0, 0, 5]
                     },
                     {
                        text: 'Resolución Nro. SENAE-SGO-2022-0282-RE',
                        style: 'regimenText'
                     },
                     {
                        text: 'Código operador de comercio exterior (Deposito Industrial): 12777806',
                        style: 'regimenText'
                     },
                     {
                        text: 'FUNCIONAMIENTO DE INSTALACIÓN INDUSTRIAL PARA OPERAR BAJO EL RÉGIMEN DE IMPORTACIÓN TEMPORAL PARA PERFECCIONAMIENTO ACTIVO A LA COMPAÑÍA CARTONERA MANABI CARTOMANABI S.A. / RUC: 1391912811001',
                        style: 'regimenText',
                        margin: [0, 2, 0, 0]
                     }
                  ],
                  margin: [0, 5, 0, 25]
               },

               // FIRMA
               {
                  stack: [
                     {
                        canvas: [
                           {
                              type: 'line',
                              x1: 200,
                              y1: 0,
                              x2: 335,
                              y2: 0,
                              lineWidth: 3,
                              lineColor: COLORS.primary
                           },
                           {
                              type: 'line',
                              x1: 210,
                              y1: 4,
                              x2: 325,
                              y2: 4,
                              lineWidth: 1,
                              lineColor: COLORS.orange
                           }
                        ],
                        margin: [0, 0, 0, 10]
                     },
                     {
                        text: 'Geovanny Coellar',
                        style: 'firmaNombre',
                        alignment: 'center'
                     },
                     {
                        text: `Gerente ${CLIENT.CIA}`,
                        style: 'firmaCargo',
                        alignment: 'center',
                        margin: [0, 3, 0, 3]
                     },
                     {
                        text: 'gcoellar@cartomanabi.com',
                        style: 'firmaEmail',
                        alignment: 'center'
                     }
                  ],
                  margin: [0, 20, 0, 0]
               }
            ],

            styles: {
               header: {
                  fontSize: 22,
                  bold: true,
                  color: COLORS.primary
               },
               label: {
                  fontSize: 9,
                  bold: true,
                  color: COLORS.primary,
                  margin: [0, 0, 0, 2]
               },
               value: {
                  fontSize: 10,
                  color: COLORS.darkText
               },
               intro: {
                  fontSize: 11,
                  italics: true,
                  color: COLORS.blueDark
               },
               tableHeader: {
                  fontSize: 8,
                  bold: true,
                  color: '#ffffff',
                  fillColor: COLORS.primary
               },
               tableCell: {
                  fontSize: 8,
                  color: COLORS.darkText
               },
               tableCellBold: {
                  fontSize: 8,
                  bold: true,
                  color: COLORS.primary
               },
               totalLabel: {
                  fontSize: 9,
                  bold: true,
                  color: COLORS.blueDark
               },
               totalValue: {
                  fontSize: 9,
                  color: COLORS.darkText
               },
               totalLabelFinal: {
                  fontSize: 11,
                  bold: true,
                  color: COLORS.primary
               },
               totalValueFinal: {
                  fontSize: 11,
                  bold: true,
                  color: COLORS.primary
               },
               sectionTitle: {
                  fontSize: 10,
                  bold: true,
                  color: COLORS.primary
               },
               comment: {
                  fontSize: 9,
                  color: COLORS.grayText,
                  italics: true
               },
               observation: {
                  fontSize: 8.5,
                  color: COLORS.darkText,
                  margin: [0, 2, 0, 2]
               },
               observationSub: {
                  fontSize: 8,
                  color: COLORS.grayText
               },
               regimen: {
                  fontSize: 9,
                  bold: true,
                  color: COLORS.primary
               },
               regimenText: {
                  fontSize: 7.5,
                  color: COLORS.grayText,
                  margin: [0, 1, 0, 1]
               },
               firmaNombre: {
                  fontSize: 11,
                  bold: true,
                  color: COLORS.blueDark
               },
               firmaCargo: {
                  fontSize: 9,
                  color: COLORS.darkText
               },
               firmaEmail: {
                  fontSize: 8.5,
                  color: COLORS.primary
               },
               footer: {
                  fontSize: 7,
                  color: COLORS.grayText
               },
               pageNumber: {
                  fontSize: 8,
                  bold: true,
                  color: COLORS.primary
               }
            },

            defaultStyle: {
               font: 'Helvetica'
            }
         }

         // Crear el PDF
         const fonts = {
            Helvetica: {
               normal: 'Helvetica',
               bold: 'Helvetica-Bold',
               italics: 'Helvetica-Oblique',
               bolditalics: 'Helvetica-BoldOblique'
            }
         }

         const printer = new PdfPrinter(fonts)
         const pdfDoc = printer.createPdfKitDocument(docDefinition)
         const filePath = path.join(__dirname, `../docs/purchase/${FILE}.pdf`)

         pdfDoc.pipe(fs.createWriteStream(filePath))

         pdfDoc.on('end', () => {
            resolve(true)
         })

         pdfDoc.on('error', (err) => {
            console.error(err)
            reject(false)
         })

         pdfDoc.end()

      } catch (e) {
         console.error(e)
         reject(false)
      }
   })
}


// exports.createPurchaseOtrosPDF = async function pdf({
//    CLIENT,
//    ITEMS,
//    TOTALES,
//    FILE
// }) {
//    let lines = []

//    ITEMS.forEach((itm) => {
//       lines.push({
//          CODIGO: itm.CODE_PT,
//          DESCRIPCION: `${itm?.DESCRIPTION} ${itm?.DETALLE || itm?.DETALLE !== '' ? `- ${itm?.DETALLE}` : ''}`,
//          CANT: Number(itm?.CANTIDAD || 0).toFixed(2),
//          PRECIO: (itm.PRICE * 1).toFixed(5),
//          TOTAL: (itm.PRICE * itm.CANTIDAD).toFixed(5),
//       })
//    })

//    var itmTable = 0,
//       pages = lines > 13
//          ? (
//             lines.length > 25
//                ? Math.ceil(lines.length / 25)
//                : Math.ceil(lines.length / 13)
//          ) : Math.ceil(lines.length / 13)

//    try {
//       var doc = new jsPDF()

//       const pdfDesign = async (a, recorrido, initial) => {
//          const sem = moment(`${CLIENT.FECHA_ARR}`).format('d'),
//             dia = moment(`${CLIENT.FECHA_ARR}`).format('DD'),
//             mes = moment(`${CLIENT.FECHA_ARR}`).format('MM'),
//             anio = moment(`${CLIENT.FECHA_ARR}`).format('YYYY')

//          const fechaDoc = `${dias[sem]}, ${dia} de ${moment.months()[mes - 1]} del ${anio}`

//          doc.addImage(fondo, 'JPEG', -5, -1, 250, 300)
//          doc.addImage(logoCartomanabi, 'PNG', 5, 17)

//          doc.setFontSize(22)
//          doc.setTextColor('white')
//          doc.setFont(undefined, 'bold')
//          doc.text(152, 30, FILE.split('.')[0])

//          doc.setFontSize(10)
//          doc.setTextColor('black')
//          doc.setFont(undefined, 'bold')
//          // doc.text(20, 55, 'Fecha:')
//          doc.text(20, 45, 'Fecha:')
//          doc.text(20, 49, 'Proveedor:')
//          doc.text(20, 53, 'NIT/RUT/TaxID/RUC:')
//          doc.text(20, 57, 'Persona Contacto:')
//          doc.text(20, 61, 'Teléfono:')
//          doc.text(20, 65, 'Origen:')
//          doc.text(132, 65, 'Moneda:')

//          doc.setFontSize(9)
//          doc.text(75, 71, 'Nos es grato detallar la orden de compra:')

//          doc.setFontSize(11)
//          doc.setFont(undefined, 'normal')
//          doc.text(34, 45, fechaDoc)

//          doc.text(43, 49, CLIENT?.PROVEEDOR || '')
//          doc.text(61, 53, CLIENT?.NIT || '')
//          doc.text(57, 57, CLIENT?.CONTACT || '')
//          doc.text(39, 61, CLIENT?.PHONE1 || CLIENT?.PHONE2 || '')
//          doc.text(36, 65, CLIENT?.ORIGEN || '')
//          doc.text(150, 65, CLIENT?.MONEY || 'USD')

//          var lineas = [], aux = 0

//          for (let i = initial; i <= recorrido; i++) {
//             if (i === lines.length) break

//             lineas[aux++] = [
//                aux,
//                lines[i]?.CODIGO,
//                lines[i]?.DESCRIPCION,
//                lines[i]?.CANT,
//                lines[i]?.PRECIO,
//                lines[i]?.TOTAL,
//             ]
//          }

//          doc.autoTable({
//             head: [
//                [
//                   '#',
//                   'CODIGO',
//                   'DESCRIPCIÓN',
//                   'CANT.',
//                   'PRE. UNIT.',
//                   'PRECIO',
//                ],
//             ],
//             body: lineas,
//             columnStyles: {
//                0: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 8,
//                },
//                1: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                },
//                2: {
//                   halign: 'left',
//                   fontSize: 7.5,
//                },
//                3: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                },
//                4: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                },
//                5: {
//                   halign: 'center',
//                   fontSize: 7.5,
//                   cellWidth: 20,
//                }
//             },
//             theme: 'striped',
//             startY: 74,
//             styles: {
//                fontSize: 7.5,
//             },
//             headStyles: {
//                halign: 'center',
//                fillColor: [66, 165, 245],
//             },
//          })

//          if (a === pages) {
//             doc.autoTable({
//                body: [
//                   [
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      'SUBTOTAL 0%',
//                      TOTALES?.subCero,
//                   ],
//                   [
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      '',
//                      'SUBTOTAL 15%',
//                      TOTALES?.subDoce,
//                   ],
//                   ['', '', '', '', '', '', '', '', '', 'IVA 15%', TOTALES?.ivaTot],
//                   ['', '', '', '', '', '', '', '', '', 'TOTAL', TOTALES?.totPagar],
//                ],
//                columnStyles: {
//                   9: {
//                      halign: 'left',
//                   },
//                   10: {
//                      halign: 'right',
//                   },
//                },
//                theme: 'striped',
//                styles: {
//                   fontSize: 7.5,
//                },
//             })

//             // doc.setFontSize(9)
//             // doc.setFont(undefined, 'bold')
//             // doc.text(15, 183, 'COMENTARIO:')
//             // doc.autoTable({
//             //    body: [
//             //       [`${CLIENT.COMMENTS}.`]
//             //    ],
//             //    columnStyles: {
//             //       0: {
//             //          halign: 'left',
//             //          fontSize: 8.5,
//             //       },
//             //    },
//             //    theme: 'plain',
//             //    styles: {
//             //       cellPadding: 0,
//             //       cellWidth: 'auto'
//             //    },
//             //    startY: 185,
//             // })

//             const afterTableY = doc.lastAutoTable.finalY + 5

//             doc.setFontSize(9)
//             doc.setFont(undefined, 'bold')
//             doc.text(15, afterTableY, 'COMENTARIO:')

//             doc.autoTable({
//                body: [[`${CLIENT.COMMENTS}.`]],
//                columnStyles: {
//                   0: { halign: 'left', fontSize: 7.5 },
//                },
//                theme: 'plain',
//                styles: {
//                   cellPadding: 0,
//                   cellWidth: 'auto',
//                },
//                startY: afterTableY + 2,
//             })

//             let y = doc.lastAutoTable.finalY + 5

//             doc.setFontSize(9)
//             doc.setFont(undefined, 'bold')
//             doc.text(15, y, 'OBSERVACIONES:')

//             doc.setFont(undefined, 'normal')
//             doc.text(15, y, `1. Forma de pago: ${CLIENT.FORMA_PAGO.slice(2).replaceAll('-', '')}.`)
//             doc.text(15, y += 4, '2. Persona de contacto: Jeniffer Bravo')
//             doc.text(20, y += 4, '- Cel. +593 96 971 3397')
//             doc.text(120, y, '- Telf.: +593 55 000 555 Ext.: 1013')
//             doc.text(20, y += 4, '- Email: jbravo@cartomanabi.com')
//             doc.text(15, y += 4, '3. Información de la empresa:')
//             doc.text(20, y += 4, '- Identificación fiscal (RUC): 1391912811001')
//             doc.text(20, y += 4, '- Nombre: CARTONERA MANABI CARTOMANABI S.A.')
//             doc.text(20, y += 4, '- Dirección: SECTOR LAS PALMAS')
//             doc.text(20, y += 4, '- Calle: VIA MONTECRISTI PORTOVIEJO KM 13.3')
//             doc.text(120, y += 4, '- Ciudad: MONTECRISTI')
//             doc.text(120, y += 4, '- Código postal: EC130223')
//             doc.text(120, y += 4, '- Telf.: +593 55 000 555')

//             doc.setFont(undefined, 'bold')
//             doc.text(15, y += 4, 'REGIMEN 21:')

//             doc.setFontSize(8)
//             doc.text(15, y += 4, 'Resolución Nro. SENAE-SGO-2022-0282-RE')
//             doc.text(15, y += 4, 'Código operador de comercio exterior (Deposito Industrial) : 12777806')

//             doc.setFont(undefined, 'normal')
//             doc.text(15, y += 4, 'FUNCIONAMIENTO DE INSTALACIÓN INDUSTRIAL PARA OPERAR BAJO EL RÉGIMEN DE IMPORTACIÓN TEMPORAL PARA')
//             doc.text(15, y += 4, 'PERFECCIONAMIENTO ACTIVO A LA COMPAÑÍA CARTONERA MANABI CARTOMANABI S.A. / RUC: 1391912811001')

//             doc.setFontSize(9)
//             doc.setFont(undefined, 'bold')
//             doc.text(20, y += 4, 'Atentamente,')

//             doc.setFont(undefined, 'normal')
//             doc.autoTable({
//                body: [
//                   ['Geovanny Coellar'],
//                   [`Gerente ${CLIENT.CIA}`],
//                   ['gcoellar@cartomanabi.com'],
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
//                startY: y += 2,
//             })
//          }

//          let y1 = doc.lastAutoTable.finalY + 5

//          doc.setFontSize(7)
//          doc.setTextColor('white')
//          doc.setFont(undefined, 'bold')
//          doc.text(35, y1 += 28, 'Evite imprimir este mensaje si no es estrictamente necesario. De esta manera ahorras agua, energía y recursos forestales.')

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

//       doc.save(path.join(__dirname, `../docs/purchase/${FILE}.pdf`))

//       return true
//    } catch (e) {
//       console.error(e)

//       return false
//    }
// }

exports.createPurchaseOtrosPDF = async function pdf({
   CLIENT,
   ITEMS,
   TOTALES,
   FILE
}) {
   return new Promise((resolve, reject) => {
      try {
         // ============ PALETA DE COLORES CORPORATIVOS ============
         const COLORS = {
            primary: '#88b6e2',      // Azul suave - COLOR PRINCIPAL
            blue: '#88b6e2',         // Azul suave
            blueDark: '#5a8bc4',     // Azul oscuro
            orange: '#f29000',       // Naranja secundario
            brown: '#957745',        // Marrón oscuro
            brownMid: '#d2a472',     // Marrón medio
            beige: '#e1c1a2',        // Beige
            darkText: '#2c3e50',     // Texto oscuro profesional
            grayText: '#6b6b6b',     // Texto gris
            lightBg: '#f0f7fc'       // Fondo azul muy claro
         }

         // Fecha formateada
         const sem = moment(CLIENT.FECHA_ARR).format('d')
         const dia = moment(CLIENT.FECHA_ARR).format('DD')
         const mes = moment(CLIENT.FECHA_ARR).format('MM')
         const anio = moment(CLIENT.FECHA_ARR).format('YYYY')
         const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
         const fechaDoc = `${dias[sem]}, ${dia} de ${moment.months()[mes - 1]} del ${anio}`

         // Preparar datos de items
         const tableBody = ITEMS.map((itm, idx) => [
            { text: (idx + 1).toString(), style: 'tableCell', alignment: 'center', bold: true, color: COLORS.blueDark },
            { text: itm.CODE_PT || '', style: 'tableCell', alignment: 'center' },
            { text: `${itm?.DESCRIPTION || ''} ${itm?.DETALLE ? `- ${itm?.DETALLE}` : ''}`.trim(), style: 'tableCell' },
            // { text: itm?.FSC || '', style: 'tableCell', alignment: 'center' },
            // { text: Number(itm?.GRAMAJE || 0).toString(), style: 'tableCell', alignment: 'center' },
            // { text: Number(itm?.ANCHO || 0).toString(), style: 'tableCell', alignment: 'center' },
            { text: Number(itm?.CANTIDAD || 0).toFixed(2), style: 'tableCell', alignment: 'right' },
            { text: (itm.PRICE * 1).toFixed(5), style: 'tableCell', alignment: 'right' },
            { text: numberFormatToDecimals((itm.PRICE || 0) * (itm.CANTIDAD || 0), 2), style: 'tableCellBold', alignment: 'right', color: COLORS.primary }
         ])

         // Capturar variables para usar en header/footer
         const headerTitle = FILE.split('.')[0]
         const logo = logoCartomanabi
         const colors = COLORS

         // Definición del documento
         const docDefinition = {
            pageSize: 'LETTER',
            pageMargins: [40, 60, 40, 80],

            header: function() {
               return {
                  margin: [40, 15, 40, 10], // márgenes: izquierda, arriba, derecha, abajo
                  stack: [
                     // // Banda superior azul con degradado simulado
                     // {
                     //    canvas: [
                     //       {
                     //          type: 'rect',
                     //          x: 0,
                     //          y: 0,
                     //          w: 535,
                     //          h: 5,
                     //          color: colors.primary
                     //       },
                     //       {
                     //          type: 'rect',
                     //          x: 0,
                     //          y: 5,
                     //          w: 535,
                     //          h: 2,
                     //          color: colors.blueDark
                     //       }
                     //    ],
                     //    height: 7
                     // },
                     // Contenido del header con logo
                     {
                        columns: [
                           {
                              image: logo,
                              width: 110,
                              margin: [0, 10, 0, 0]
                           },
                           {
                              stack: [
                                 {
                                    text: headerTitle,
                                    fontSize: 20,
                                    bold: true,
                                    color: colors.primary,
                                    alignment: 'right',
                                    margin: [0, 15, 0, 6]
                                 },
                                 {
                                    canvas: [
                                       {
                                          type: 'line',
                                          x1: 200,
                                          y1: 0,
                                          x2: 320,
                                          y2: 0,
                                          lineWidth: 3,
                                          lineColor: colors.orange
                                       }
                                    ],
                                    margin: [0, 0, 0, 0]
                                 },
                                 {
                                    text: 'CARTONERA MANABÍ S.A.',
                                    fontSize: 9,
                                    color: colors.grayText,
                                    alignment: 'right',
                                    margin: [0, 4, 0, 0]
                                 }
                              ],
                              width: '*'
                           }
                        ]
                     }
                  ]
               }
            },

            footer: function(currentPage, pageCount) {
               return {
                  margin: [40, 20, 40, 10],
                  stack: [
                     {
                        canvas: [
                           {
                              type: 'line',
                              x1: 0,
                              y1: 0,
                              x2: 535,
                              y2: 0,
                              lineWidth: 2.5,
                              lineColor: colors.primary
                           },
                           {
                              type: 'line',
                              x1: 0,
                              y1: 4,
                              x2: 535,
                              y2: 4,
                              lineWidth: 1,
                              lineColor: colors.orange
                           }
                        ]
                     },
                     {
                        text: 'Evite imprimir este mensaje si no es estrictamente necesario. De esta manera ahorras agua, energía y recursos forestales.',
                        style: 'footer',
                        alignment: 'center',
                        margin: [0, 8, 0, 5]
                     },
                     {
                        text: `Página ${currentPage} de ${pageCount}`,
                        style: 'pageNumber',
                        alignment: 'right'
                     }
                  ]
               }
            },

            content: [
               // LÍNEA DECORATIVA SUPERIOR - Doble línea elegante
               {
                  canvas: [
                     {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 535,
                        y2: 0,
                        lineWidth: 4,
                        lineColor: COLORS.primary
                     },
                     {
                        type: 'line',
                        x1: 0,
                        y1: 6,
                        x2: 535,
                        y2: 6,
                        lineWidth: 1.5,
                        lineColor: COLORS.orange
                     }
                  ],
                  margin: [0, 0, 0, 14]
               },

               // INFORMACIÓN DEL CLIENTE
               {
                  columns: [
                     {
                        width: '50%',
                        stack: [
                           { text: 'Fecha:', style: 'label' },
                           { text: fechaDoc, style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'Proveedor:', style: 'label' },
                           { text: CLIENT.PROVEEDOR || '', style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'NIT/RUT/TaxID/RUC:', style: 'label' },
                           { text: CLIENT.NIT || '', style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'Persona Contacto:', style: 'label' },
                           { text: CLIENT.CONTACT || '', style: 'value', margin: [0, 0, 0, 8] }
                        ]
                     },
                     {
                        width: '50%',
                        stack: [
                           { text: 'Teléfono:', style: 'label' },
                           { text: CLIENT.PHONE1 || CLIENT.PHONE2 || '', style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'Origen:', style: 'label' },
                           { text: CLIENT.ORIGEN || '', style: 'value', margin: [0, 0, 0, 8] },

                           { text: 'Moneda:', style: 'label' },
                           { text: CLIENT.MONEY || 'USD', style: 'value', margin: [0, 0, 0, 8] }
                        ]
                     }
                  ],
                  margin: [0, 0, 0, 10]
               },

               // LÍNEA DIVISORIA
               {
                  canvas: [
                     {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 535,
                        y2: 0,
                        lineWidth: 1,
                        lineColor: COLORS.beige
                     }
                  ],
                  margin: [0, 0, 0, 10]
               },

               // MENSAJE INTRODUCTORIO
               {
                  text: 'Nos es grato detallar la orden de compra:',
                  style: 'intro',
                  alignment: 'center',
                  margin: [0, 0, 0, 10],
                  fontSize: 9
               },

               // TABLA DE ITEMS
               {
                  table: {
                     headerRows: 1,
                     widths: [25, 45, '*',40, 50, 50],
                     body: [
                        [
                           { text: '#', style: 'tableHeader', alignment: 'center' },
                           { text: 'CÓDIGO', style: 'tableHeader', alignment: 'center' },
                           { text: 'DESCRIPCIÓN', style: 'tableHeader' },
                           // { text: 'FSC', style: 'tableHeader', alignment: 'center' },
                           // { text: 'GRAM.\n(gr)', style: 'tableHeader', alignment: 'center' },
                           // { text: 'ANCH.\n(mm)', style: 'tableHeader', alignment: 'center' },
                           { text: 'CANT.\n(kg)', style: 'tableHeader', alignment: 'center' },
                           { text: 'PRE. UNIT.', style: 'tableHeader', alignment: 'center' },
                           { text: 'PRECIO', style: 'tableHeader', alignment: 'center' }
                        ],
                        ...tableBody
                     ]
                  },
                  layout: {
                     fillColor: function(rowIndex) {
                        return rowIndex === 0 ? COLORS.primary : (rowIndex % 2 === 0 ? COLORS.lightBg : null)
                     },
                     hLineWidth: function(i, node) {
                        return i === 0 || i === 1 || i === node.table.body.length ? 1.5 : 0.5
                     },
                     vLineWidth: function() {
                        return 0
                     },
                     hLineColor: function(i) {
                        return i === 0 || i === 1 ? COLORS.blueDark : COLORS.beige
                     },
                     paddingTop: function() { return 6 },
                     paddingBottom: function() { return 6 },
                     paddingLeft: function() { return 5 },
                     paddingRight: function() { return 5 }
                  },
                  margin: [0, 0, 0, 15]
               },

               // TOTALES
               {
                  columns: [
                     { text: '', width: '*' },
                     {
                        width: 200,
                        stack: [
                           {
                              columns: [
                                 { text: 'SUBTOTAL 0%', style: 'totalLabel', width: '*' },
                                 { text: numberFormatToDecimals(TOTALES?.subCero || '0.00', 2), style: 'totalValue', width: 80, alignment: 'right' }
                              ],
                              margin: [0, 0, 0, 5]
                           },
                           {
                              columns: [
                                 { text: 'SUBTOTAL 15%', style: 'totalLabel', width: '*' },
                                 { text: numberFormatToDecimals(TOTALES?.subDoce || '0.00', 2), style: 'totalValue', width: 80, alignment: 'right' }
                              ],
                              margin: [0, 0, 0, 5]
                           },
                           {
                              columns: [
                                 { text: 'IVA 15%', style: 'totalLabel', width: '*' },
                                 { text: numberFormatToDecimals(TOTALES?.ivaTot || '0.00', 2), style: 'totalValue', width: 80, alignment: 'right' }
                              ],
                              margin: [0, 0, 0, 8]
                           },
                           {
                              canvas: [
                                 {
                                    type: 'line',
                                    x1: 0,
                                    y1: 0,
                                    x2: 200,
                                    y2: 0,
                                    lineWidth: 2,
                                    lineColor: COLORS.primary
                                 }
                              ],
                              margin: [0, 0, 0, 8]
                           },
                           {
                              columns: [
                                 { text: 'TOTAL', style: 'totalLabelFinal', width: '*' },
                                 { text: numberFormatToDecimals(TOTALES?.totPagar || '0.00', 2), style: 'totalValueFinal', width: 80, alignment: 'right' }
                              ]
                           }
                        ]
                     }
                  ],
                  margin: [0, 0, 0, 20]
               },

               // COMENTARIO
               CLIENT.COMMENTS ? {
                  stack: [
                     {
                        text: 'COMENTARIO:',
                        style: 'sectionTitle',
                        margin: [0, 0, 0, 8]
                     },
                     {
                        text: CLIENT.COMMENTS,
                        style: 'comment',
                        margin: [0, 0, 0, 10]
                     }
                  ]
               } : {},

               // OBSERVACIONES
               {
                  text: 'OBSERVACIONES:',
                  style: 'sectionTitle',
                  margin: [0, 10, 0, 5]
               },
               {
                  ul: [
                     { text: `Forma de pago: ${CLIENT.FORMA_PAGO.slice(2).replaceAll('-', '')}`, style: 'observation' },
                     [
                        { text: 'Persona de contacto: Ing. Jeniffer Bravo', style: 'observation' },
                        { text: '• Cel: +593 96 971 3397  • Email: jbravo@cartomanabi.com', style: 'observationSub', margin: [15, 2, 0, 0] }
                     ],
                     [
                        { text: 'Información de la empresa:', style: 'observation' },
                        { text: '• RUC: 1391912811001', style: 'observationSub', margin: [15, 2, 0, 0] },
                        { text: '• Nombre: CARTONERA MANABI CARTOMANABI S.A.', style: 'observationSub', margin: [15, 2, 0, 0] },
                        { text: '• Dirección: SECTOR LAS PALMAS, VIA MONTECRISTI PORTOVIEJO KM 13.3', style: 'observationSub', margin: [15, 2, 0, 0] },
                        { text: '• Ciudad: MONTECRISTI  • Código postal: EC130223  • Telf: +593 55 000 555', style: 'observationSub', margin: [15, 2, 0, 0] }
                     ],
                     // { text: 'Incorporar el logo FSC en la factura', style: 'observation' },
                     // { text: 'Incluir el código del certificado FSC correspondiente a la organización', style: 'observation' },
                     // { text: 'Adjuntar el documento de certificación FSC vigente', style: 'observation' },
                     // { text: 'Indicar en el detalle de cada ítem si el producto corresponde a FSC 100%, FSC Mixto o FSC Reciclado', style: 'observation' },
                  ],
                  margin: [0, 0, 0, 10]
               },

               // RÉGIMEN 21
               {
                  stack: [
                     {
                        text: 'RÉGIMEN 21:',
                        style: 'regimen',
                        margin: [0, 0, 0, 5]
                     },
                     {
                        text: 'Resolución Nro. SENAE-SGO-2022-0282-RE',
                        style: 'regimenText'
                     },
                     {
                        text: 'Código operador de comercio exterior (Deposito Industrial): 12777806',
                        style: 'regimenText'
                     },
                     {
                        text: 'FUNCIONAMIENTO DE INSTALACIÓN INDUSTRIAL PARA OPERAR BAJO EL RÉGIMEN DE IMPORTACIÓN TEMPORAL PARA PERFECCIONAMIENTO ACTIVO A LA COMPAÑÍA CARTONERA MANABI CARTOMANABI S.A. / RUC: 1391912811001',
                        style: 'regimenText',
                        margin: [0, 2, 0, 0]
                     }
                  ],
                  margin: [0, 5, 0, 25]
               },

               // FIRMA
               {
                  stack: [
                     {
                        canvas: [
                           {
                              type: 'line',
                              x1: 200,
                              y1: 0,
                              x2: 335,
                              y2: 0,
                              lineWidth: 3,
                              lineColor: COLORS.primary
                           },
                           {
                              type: 'line',
                              x1: 210,
                              y1: 4,
                              x2: 325,
                              y2: 4,
                              lineWidth: 1,
                              lineColor: COLORS.orange
                           }
                        ],
                        margin: [0, 0, 0, 10]
                     },
                     {
                        text: 'Geovanny Coellar',
                        style: 'firmaNombre',
                        alignment: 'center'
                     },
                     {
                        text: `Gerente ${CLIENT.CIA}`,
                        style: 'firmaCargo',
                        alignment: 'center',
                        margin: [0, 3, 0, 3]
                     },
                     {
                        text: 'gcoellar@cartomanabi.com',
                        style: 'firmaEmail',
                        alignment: 'center'
                     }
                  ],
                  margin: [0, 20, 0, 0]
               }
            ],

            styles: {
               header: {
                  fontSize: 22,
                  bold: true,
                  color: COLORS.primary
               },
               label: {
                  fontSize: 9,
                  bold: true,
                  color: COLORS.primary,
                  margin: [0, 0, 0, 2]
               },
               value: {
                  fontSize: 10,
                  color: COLORS.darkText
               },
               intro: {
                  fontSize: 11,
                  italics: true,
                  color: COLORS.blueDark
               },
               tableHeader: {
                  fontSize: 8,
                  bold: true,
                  color: '#ffffff',
                  fillColor: COLORS.primary
               },
               tableCell: {
                  fontSize: 8,
                  color: COLORS.darkText
               },
               tableCellBold: {
                  fontSize: 8,
                  bold: true,
                  color: COLORS.primary
               },
               totalLabel: {
                  fontSize: 9,
                  bold: true,
                  color: COLORS.blueDark
               },
               totalValue: {
                  fontSize: 9,
                  color: COLORS.darkText
               },
               totalLabelFinal: {
                  fontSize: 11,
                  bold: true,
                  color: COLORS.primary
               },
               totalValueFinal: {
                  fontSize: 11,
                  bold: true,
                  color: COLORS.primary
               },
               sectionTitle: {
                  fontSize: 10,
                  bold: true,
                  color: COLORS.primary
               },
               comment: {
                  fontSize: 9,
                  color: COLORS.grayText,
                  italics: true
               },
               observation: {
                  fontSize: 8.5,
                  color: COLORS.darkText,
                  margin: [0, 2, 0, 2]
               },
               observationSub: {
                  fontSize: 8,
                  color: COLORS.grayText
               },
               regimen: {
                  fontSize: 9,
                  bold: true,
                  color: COLORS.primary
               },
               regimenText: {
                  fontSize: 7.5,
                  color: COLORS.grayText,
                  margin: [0, 1, 0, 1]
               },
               firmaNombre: {
                  fontSize: 11,
                  bold: true,
                  color: COLORS.blueDark
               },
               firmaCargo: {
                  fontSize: 9,
                  color: COLORS.darkText
               },
               firmaEmail: {
                  fontSize: 8.5,
                  color: COLORS.primary
               },
               footer: {
                  fontSize: 7,
                  color: COLORS.grayText
               },
               pageNumber: {
                  fontSize: 8,
                  bold: true,
                  color: COLORS.primary
               }
            },

            defaultStyle: {
               font: 'Helvetica'
            }
         }

         // Crear el PDF
         const fonts = {
            Helvetica: {
               normal: 'Helvetica',
               bold: 'Helvetica-Bold',
               italics: 'Helvetica-Oblique',
               bolditalics: 'Helvetica-BoldOblique'
            }
         }

         const printer = new PdfPrinter(fonts)
         const pdfDoc = printer.createPdfKitDocument(docDefinition)
         const filePath = path.join(__dirname, `../docs/purchase/${FILE}.pdf`)

         pdfDoc.pipe(fs.createWriteStream(filePath))

         pdfDoc.on('end', () => {
            resolve(true)
         })

         pdfDoc.on('error', (err) => {
            console.error(err)
            reject(false)
         })

         pdfDoc.end()

      } catch (e) {
         console.error(e)
         reject(false)
      }
   })
}
const { jsPDF } = require('jspdf')
// eslint-disable-next-line no-unused-vars
const autoTable = require('jspdf-autotable')
const moment = require('moment')
moment.locale('es')
const path = require('path')
const QRCode = require('qrcode')
const firma = require('./base64')
const { logoCartomanabi, fondo } = require('./imgCalidad')

exports.CrearPDF = async function pdf(DATA, NAME_FILE) {
   const {
      allInformation,
      allInfoCab,
      allInfoPT,
      allInfoColors
   } = DATA

   const colors = allInfoColors.map((color) => color.TINTA || color.TINTA_SAP).join(' - ')

   try {
      let border = 0,
         color = [66, 165, 245]

      var doc = new jsPDF()

      //Tabla de Encabezado
      doc.autoTable({
         body: [
            [
               '',
               'CERTIFICADO DE CALIDAD',
               'DEPARTAMENTO DE ASEGURAMIENTO DE CALIDAD',
            ],
         ],
         columnStyles: {
            0: {
               cellWidth: 65,
            },
            1: {
               cellWidth: 76,
               halign: 'center',
               valign: 'middle',
               fontSize: 14,
               fontStyle: 'bold',
            },
            2: {
               cellWidth: 38,
               halign: 'center',
               fontSize: 9,
            },
         },
         theme: 'grid',
         bodyStyles: { lineColor: [0, 0, 0] },
         startY: 10,
      })

      doc.autoTable({
         body: [['', 'CM-AC-TR-F-01', 'Versión: 6', 'N° Página: 1/1']],
         columnStyles: {
            0: {
               cellWidth: 65,
               fontSize: 20,
               //lineWidth: 0,
            },
            1: {
               cellWidth: 76,
               halign: 'center',
               valign: 'middle',
               fontSize: 14,
               fontStyle: 'bold',
               textColor: color,
            },
            2: {
               cellWidth: 19,
               halign: 'center',
               valign: 'middle',
               fontSize: 7,
            },
            3: {
               cellWidth: 19,
               halign: 'center',
               valign: 'middle',
               fontSize: 7,
            },
         },
         theme: 'grid',
         bodyStyles: { lineColor: [0, 0, 0] },
         startY: 24,
      })

      doc.autoTable({
         body: [['']],
         columnStyles: {
            0: {
               cellWidth: 65,
               fontSize: 54.4,
            },
         },
         theme: 'grid',
         bodyStyles: { lineColor: [0, 0, 0] },
         startY: 10,
      })

      //Insertar LOGO
      doc.addImage(logoCartomanabi, 'PNG', 13, 12, 66, 22)

      let y = 45 //a partir de aquí se empieza a escribir

      doc.setFontSize(11)
      doc.setFont(undefined, 'bold')

      //columna 1
      doc.text(20, y + 0, 'Fecha de producción: ')
      doc.text(20, y + 5, 'Símbolo: ')
      doc.text(20, y + 10, 'Cliente: ')
      doc.text(20, y + 15, 'Lote: ')
      doc.text(20, y + 20, 'Tarjeta de impresión: ')
      doc.text(20, y + 25, 'Orden de compra: ')

      //columna 2
      doc.text(87, y + 0, 'Caducidad: ')

      //columna 3
      doc.text(135, y + 0, 'ID. Certificación: ')
      doc.text(135, y + 15, 'Cantidad Solicitada: ')
      doc.text(135, y + 20, 'Código: ')
      doc.text(135, y + 25, 'Producto: ')

      doc.setFont(undefined, 'normal')
      doc.setTextColor(135)

      //columna 1
      doc.text(65, y + 0, `${moment(allInformation[0].FECH_PROD).format('DD/MM/YYYY')}`)
      doc.text(40, y + 5, `${allInformation[0].CAJA}`)
      doc.text(38, y + 10, `${allInformation[0].CLIENTE}`)
      doc.text(38, y + 15, `${allInfoCab[0].LOTE_CAL}`)
      doc.text(63, y + 20, `${Number(allInfoCab[0].PT_CODE.slice(2))}`)
      doc.text(57, y + 25, `${allInfoCab[0].ORDEN_COMP.slice(0, 18) || '---'}`)

      //columna 2
      doc.text(110, y + 0, `${moment(allInformation[0].FECH_PROD).add(1, 'years').format('DD/MM/YYYY')}`)

      //columna 3
      doc.text(168, y + 0, `${NAME_FILE}`)
      doc.text(175, y + 15, `${Number(allInformation[0].CANTIDAD)}`)
      doc.text(155, y + 20, `${allInfoCab[0].PT_CODE} - ${allInfoPT[0].TEST}`)
      doc.text(157, y + 25, `${allInformation[0].PRODUCTO || '---'}`)

      //Tabla 1
      doc.autoTable({
         body: [
            ['LAS PRUEBAS DE CALIDAD SON REALIZADAS BAJO NORMATIVAS TAPPI'],
         ],
         columnStyles: {
            0: {
               halign: 'center',
               fontSize: 10,
               fontStyle: 'bold',
               fillColor: [204, 209, 209],
            },
         },
         theme: 'grid',
         startY: 75.16,
      })

      doc.autoTable({
         head: [['PARÁMETRO', 'UNIDADES', 'RESULTADO', 'NORMA TAPPI']],
         body: [
            ['ECT', 'Lbf/in', `${Number(allInfoCab[0].ECT)}`, 'Tappi 839'],
            ['CALIBRE', 'In/1000', `${Number(allInfoCab[0].CALIBRE_IN)}`, 'Tappi 411'],
            ['PIN ADHESIÓN', 'Lbf/5in²', `${allInformation[0].FLAUTA === 'C' ? Number(allInfoCab[0].PAT_C) : (
               allInformation[0].FLAUTA === 'B' ? Number(allInfoCab[0].PAT_B) : (
                  allInformation[0].FLAUTA === 'BC' ? `${Number(allInfoCab[0].PAT_B)} - ${Number(allInfoCab[0].PAT_C)}` : (
                     allInformation[0].FLAUTA === 'CB' ? `${Number(allInfoCab[0].PAT_C)} - ${Number(allInfoCab[0].PAT_B)}` : ''
                  )
               )
            )}`, 'Tappi 821'],
            ['FLAT CRUSH TEST', 'Lbf/10in²', `${Number(allInfoCab[0].FCTC)}`, 'Tappi 825'],
            ['RESISTENCIA CARGA DINÁMICA', 'Lbf', `${Number(allInfoCab[0].BCTREPRO_LBF)}`, 'Tappi 804'],
            ['RESISTENCIA CARGA ESTÁTICA', 'Lbf', `${Number(allInfoCab[0].CARGA_EST)}`, ''],
            ['COBB30', 'gH O/m²', `${Number(allInfoCab[0].COBB)}`, 'Tappi 441'],
            ['HUMEDAD', '%', `${Number(allInfoCab[0].HUMEDAD)}`, ''],
         ],
         theme: 'grid',
         headStyles: {
            fillColor: [52, 73, 94],
            fontSize: 10,
            halign: 'center',
         },
         columnStyles: {
            0: {
               fontSize: 8,
               fontStyle: 'bold',
            },
            1: {
               fontSize: 8,
               fontStyle: 'bold',
               halign: 'center',
            },
            2: {
               fontSize: 8,
               halign: 'center',
            },
            3: {
               fontSize: 8,
               fontStyle: 'bold',
               halign: 'center',
            },
         },
         startY: 82.8,
      })

      //El 2 subíndice
      doc.setFontSize(4.1)
      doc.setTextColor(87, 88, 88)
      doc.text(100.18, 135.7, '2')

      //Tabla 2
      doc.autoTable({
         body: [['ESPECIFICACIÓN DEL EMBALAJE E IMPRESIÓN']],
         columnStyles: {
            0: {
               halign: 'center',
               fontSize: 10,
               fontStyle: 'bold',
               fillColor: [204, 209, 209],
            },
         },
         theme: 'grid',
         startY: 150.16,
      })

      doc.autoTable({
         body: [
            ['', 'LARGO (mm)', `${Number(allInfoCab[0].LARGO)}`, ''],
            ['', 'ANCHO (mm)', `${Number(allInfoCab[0].ANCHO)}`, ''],
            ['', 'ALTO (mm)', `${Number(allInfoCab[0].ALTO)}`, ''],
            [`COLORES DE IMPRESIÓN ${colors.length > 70 ? '\n': ''}`, '', ''],
            ['UNIDADES POR BULTO', `${Number(allInfoCab[0].UNI_BULTO)}`, 'PALETIZADO:', `${allInfoCab[0].PALETIZADO === 'S' ? 'SI' : 'NO'}`],
            ['RECUBRIMIENTO INTERNO', `${allInfoPT[0].RECUBRIMIENTO}`, 'REQUERIMIENTO:', `${allInfoCab[0].REQUERIMIENTO.replaceAll(',', ' - ')}`],
            [
               'REQUERIMIENTO DE IMPRESIÓN',
               `TEXTO:       ${allInfoPT[0].IMP_TEXT === 'SI' ? 'SI' : 'NO'}`,
               `IMÁGENES:       ${allInfoPT[0].IMP_IMG === 'SI' ? 'SI' : 'NO'}`,
               `CÓDIGO DE BARRAS:       ${allInfoPT[0].IMP_COBA === 'SI' ? 'SI' : 'NO'}`,
            ],
         ],
         theme: 'grid',
         headStyles: {
            fillColor: [52, 73, 94],
            halign: 'center',
         },
         columnStyles: {
            0: {
               fontSize: 8,
               cellWidth: 65,
               fontStyle: 'bold',
            },
            1: {
               fontSize: 8,
               fontStyle: 'bold',
               halign: 'center',
            },
            2: {
               fontSize: 8,
               fontStyle: 'bold',
               halign: 'left',
            },
            3: {
               fontSize: 8,
               fontStyle: 'bold',
               halign: 'center',
            },
         },
         startY: 157.8,
      })

      //celda vacía MEDIDAS INTERNAS DE LA CAJA
      doc.autoTable({
         body: [['']],
         columnStyles: {
            0: {
               cellWidth: 65,
               fontStyle: 'bold',
               fontSize: 41.3,
            },
         },
         theme: 'grid',
         startY: 157.8,
      })

      doc.autoTable({
         body: [['MEDIDAS INTERNAS DE LA CAJA']],
         margin: {
            left: 14.5,
         },
         columnStyles: {
            0: {
               cellWidth: 61,
               fontStyle: 'bold',
               lineWidth: border,
            },
         },
         theme: 'grid',
         startY: 165.3,
      })

      //celda vacía Tolerancia
      doc.autoTable({
         body: [['']],
         margin: {
            left: 143,
         },
         columnStyles: {
            0: {
               cellWidth: 52.7,
               fontStyle: 'bold',
               fontSize: 41.3,
            },
         },
         theme: 'grid',
         startY: 157.8,
      })

      doc.autoTable({
         body: [['TOLERANCIA +/- 3 mm']],
         margin: {
            left: 149,
         },
         columnStyles: {
            0: {
               cellWidth: 42,
               fontStyle: 'bold',
               lineWidth: border,
            },
         },
         theme: 'grid',
         startY: 165.3,
      })

      //celda vacía colores
      doc.autoTable({
         body: [[`${colors}`]],
         margin: {
            left: 79.1,
         },
         columnStyles: {
            0: {
               cellWidth: 116.78,
               fontStyle: 'bold',
               fontSize: 8,
            },
         },
         theme: 'grid',
         startY: 178.1,
      })

      //Texto negrita
      doc.setFontSize(8)
      doc.setTextColor('black')
      doc.setFont(undefined, 'bold')

      //tabla 2
      let y2 = 34
      doc.text(
         20,
         y2 + 178,
         'Apilamiento máximo menor a 90 días para mantener la propiedad de apilamiento.'
      )
      doc.text(
         20,
         y2 + 181,
         'Este cuadro es válido para productos no portantes o semiportantes, los productos portantes trabajan junto con la caja en la'
      )
      doc.text(20, y2 + 184, 'sustentación de la carga.')
      doc.text(
         20,
         y2 + 187,
         'Esta certificación no prevé arrumes que sobresalgan de los bordes de las estibas o estantes (en voladizo ni daños en las cajas'
      )
      doc.text(20, y2 + 190, 'por manipulaciones y transporte inadecuado.')
      doc.text(
         20,
         y2 + 193,
         'Tiempo de vida útil 12 meses bajo condiciones de almacenamiento controlado.'
      )
      doc.text(
         20,
         y2 + 196,
         'El lote cumple con los criterios de aceptación del plan de muestreo aplicado MIL-STD-105D.'
      )
      doc.text(20, y2 + 199, 'Presencia de contaminante y alérgenos: No.')

      doc.text(20, y2 + 205, 'Observaciones:')

      doc.setFont(undefined, 'normal')
      doc.text(
         45,
         y2 + 205,
         'Las muestras deben ser ambientadas en condiciones estándar (humedad relativa 50%, temperatura 23°C) durante'
      )
      doc.text(
         45,
         y2 + 208,
         '24 horas antes de ser probadas en un compresómetros. Los papeles utilizados son adecuados para el embalaje de'
      )
      doc.text(
         45,
         y2 + 211,
         'productos alimenticios y aditivos cumplen con las regulaciones de productos alimenticios y aditivos cumplen con las'
      )
      doc.text(
         45,
         y2 + 214,
         'regulaciones de la FDA 21 CFR 170-199, FDA 176.170 -CFR -Code Federal Regulations Title 21, Reglamento UE'
      )
      doc.text(
         45,
         y2 + 217,
         'Nº 10/2011, Reglamento UE Nº 836/2011 Reglamento (CE) Nº 1935/2004, GB 4806.8-2016 y Mercosur (GMC/Res.'
      )
      doc.text(
         45,
         y2 + 220,
         'Nº 03/92, 40/15, 56/92). Este producto fue fabricado en apego y cumplimiento de los productos internos de biosegu-'
      )
      doc.text(
         45,
         y2 + 223,
         'ridad relacionados al Covid-19 establecidos por CartoManabí.'
      )

      doc.setFont(undefined, 'bold')
      doc.text(90, y2 + 243, 'Geanella Cedeño F.')
      doc.text(80, y2 + 246, 'Dpto. Aseguramiento de Calidad')

      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.5)
      doc.line(75, y2 + 240, 130, y2 + 240)

      // Agregar la imagen encima de la línea
      let imgWidth = 35, imgHeight = 35
      doc.addImage(firma, 'PNG', 85, y2 + 255 - imgHeight, imgWidth, imgHeight)

      //doc.addImage(logoCartomanabi, 'PNG', 30,100, 300, 100);

      doc.saveGraphicsState()
      doc.setGState(new doc.GState({ opacity: 0.2 }))
      doc.addImage(fondo, 65, 105, 80, 80)
      doc.restoreGraphicsState()
      let url = 'https://backend.cartomanabi.com'

      QRCode.toDataURL(
         `${url}/certificate/${NAME_FILE.toUpperCase()}.pdf`,
         function (err, url) {
            doc.addImage(
               `${url}/certificate/${NAME_FILE.toUpperCase()}.pdf`,
               'PNG',
               150,
               255,
               40,
               40
            )

            doc.save(
               path.join(
                  __dirname,
                  `../docs/certificate/${NAME_FILE.toUpperCase()}.pdf`
               )
            )
         }
      )

      return true
   } catch (e) {
      console.error(e)

      return false
   }
}

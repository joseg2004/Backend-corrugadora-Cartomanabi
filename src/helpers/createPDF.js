const path = require('path')
const fs = require('fs')
const pdfMake = require('pdfmake')
const qr = require('qr-image')
const moment = require('moment')
const { numberFormatToDecimals } = require('./fntHelpers')
moment.locale('es')

const LOCALE = 'es-EC'
const fmt2 = new Intl.NumberFormat(LOCALE, {
   minimumFractionDigits: 2,
   maximumFractionDigits: 2
})
const moneyAuto = (v) => `$ ${fmt2.format(Number(v || 0))}`

var fonts = {
   Roboto: {
      normal: path.join(__dirname, '..', 'assets', '/fonts/Roboto-Regular.ttf'),
      bold: path.join(__dirname, '..', 'assets', '/fonts/Roboto-Medium.ttf'),
      italics: path.join(__dirname, '..', 'assets', '/fonts/Roboto-Italic.ttf'),
      bolditalics: path.join(__dirname, '..', 'assets', '/fonts/Roboto-MediumItalic.ttf')
   }
}

function pdfContent(array, PTCODE) {
   return {
      content: array,
      pageSize: 'A4',
      styles: {
         header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10],
         },
         subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5],
         },
         tableExample: {
            // Left - Top - Right - Bottom
            // margin: [0, 5, 0, 90]
            margin: [0, PTCODE.includes('PT') ? 5 : 90, 0, PTCODE.includes('PT') ? 90 : 0]
            // margin: [15, 150, 0, 150]
         },
         tableHeader: {
            bold: true,
            fontSize: 13,
            color: 'black',
            alignment: 'center',
         },
         textCenter: {
            bold: true,
            fontSize: 16,
            color: '#4286f4',
            alignment: 'center',
            margin: [10, 10, 10, 10],
         },
         smallText: {
            bold: true,
            fontSize: 35,
            color: 'black',
            alignment: 'center',
         },
         smallTextVerDos: {
            bold: true,
            fontSize: 14,
            color: 'black',
            alignment: 'center',
         },
         bigText: {
            bold: true,
            fontSize: 14,
            color: 'black',
            alignment: 'center',
         },
         bigTextPT: {
            bold: true,
            fontSize: 14,
            color: 'black',
            alignment: 'center',
         },
         bgText: {
            bold: true,
            fontSize: 30,
            color: 'black',
            alignment: 'center',
         },
         text: {
            bold: true,
            fontSize: 15,
            color: 'black',
            alignment: 'center',
         },
         textDescp: {
            bold: true,
            fontSize: 15,
            color: 'black',
            alignment: 'left',
         },
         supeBigText: {
            bold: true,
            fontSize: 90,
            color: 'black',
            alignment: 'center',
         },
      },
      defaultStyle: {
         // alignment: 'justify'
      }
   }
}

exports.createPDFPT = async ({
   PTCODE,
   ORPRO,
   CLIENT,
   PRODUCT,
   TEST,
   SUSCRIP,
   OC,
   CANT,
   NUM_BULTO,
   UNI_BULL,
   T_PALL
}) => {
   try {
      const totPall = NUM_BULTO * UNI_BULL
      const divPall = Math.ceil(CANT / totPall)

      let array = [], num = 0

      var printer = new pdfMake(fonts)

      const date = ORPRO.slice(0, 1) === 'C' ? ORPRO.slice(1, 7).split('') : ORPRO.slice(2, 8).split('')

      for (let a = 0; a < divPall; a++) {
         const qrCode = `CARTONERA MANABI \n CARTOMANABI S.A. \n TICKET DE PRODUCTO TERMINADO \n NOMBRE DEL CLIENTE: ${CLIENT || 'S/D'} \n ORDEN DE PRODUCCION: ${ORPRO.toUpperCase()} \n DESCRIPCION DEL PRODUCTO: ${PRODUCT} \n TIPO: R \n OC: ${OC} \n FECHA_PRODUCCION: ${date[0]}${date[1]}/${date[2]}${date[3]}/20${date[4]}${date[5]} \n COD. PRODUCTO: ${PTCODE} \n TEST: ${TEST ? TEST.toUpperCase() : 'S/T'} \n CANTIDAD POR PALLET: ${(divPall === ++num) ? (CANT - (totPall * a)) : totPall} \n N° DE PALLET: #${num} \n N° DE BULTOS: ${divPall === num
            ? `${Math.trunc((CANT - totPall * a) / UNI_BULL)} ${(
               Math.trunc((((CANT - totPall * a) / UNI_BULL) - Math.trunc((CANT - totPall * a) / UNI_BULL)) * UNI_BULL) !== 0
                  ? `+ ${Math.round((((CANT - totPall * a) / UNI_BULL) - Math.trunc((CANT - totPall * a) / UNI_BULL)) * UNI_BULL)}U`
                  : ''
            )}`
            : NUM_BULTO
            } \n UNIDADES POR BULTO: ${UNI_BULL}`

         const qr_svg = qr.imageSync(qrCode, { type: 'png', options: { errorCorrectionLevel: 'H' } })
         const qr_str = 'data:image/png;base64,' + qr_svg.toString('base64')

         array.push({
            style: 'tableExample',
            color: '#444',
            table: {
               body: [
                  [
                     {
                        rowSpan: 2,
                        image: path.join(
                           __dirname,
                           '..',
                           'assets',
                           '/img/cartomanabi.png'
                        ),
                        width: 175,
                        alignment: 'center',
                        margin: [0, 13, 0, 10],
                     },
                     {
                        text: 'TICKET DE PRODUCTO TERMINADO',
                        style: 'tableHeader',
                        margin: [0, 10, 0, 10],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'PRODUCCIÓN',
                        style: 'tableHeader',
                        margin: [0, 18, 0, 10],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     '',
                     {
                        text: 'CM-PR-TR-F-09',
                        style: 'textCenter',
                        margin: [0, 13, 0, 10],
                     },
                     {
                        text: `Versión: 3 \nN° Página: ${num}/${divPall}`,
                        style: 'tableHeader',
                        margin: [5, 6, 5, 2],
                     },
                  ],
                  [
                     {
                        text: 'Nombre Cliente',
                        style: 'textDescp',
                        // margin: [0, 20, 0, 2],
                        margin: [
                           0,
                           CLIENT ? (CLIENT.length > 30 ? 13 : 20) : 20,
                           0,
                           2,
                        ],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: `${CLIENT || 'S/D'}`,
                        style: `${CLIENT
                           ? CLIENT.length < 12
                              ? 'smallText'
                              : CLIENT.length > 45
                                 ? 'smallTextVerDos'
                                 : 'bigText'
                           : 'smallText'
                           }`,
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        text: 'Orden de Producción',
                        style: 'textDescp',
                        margin: [0, 20, 0, 2],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: `${ORPRO.toUpperCase()}`,
                        style: 'smallText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        text: 'Descripción del Producto',
                        style: 'textDescp',
                        // margin: [0, 18, 0, 4],
                        margin: [0, PRODUCT.length >= 33 ? 18 : 20, 0, 4],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: `${PRODUCT}`,
                        style: PRODUCT.length >= 55 ? 'bigTextPT' : 'bigText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        text: 'OC',
                        style: 'text',
                        margin: [0, 7, 0, 7],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'Fecha de Producción',
                        style: 'text',
                        margin: [0, 7, 0, 7],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'Tipo',
                        style: 'text',
                        margin: [0, 7, 0, 7],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        text: `${OC}`,
                        style: 'bigText',
                        margin: [3, 10, 3, 10],
                     },
                     {
                        // text: `${new Date(
                        //    getOneT[0].InDate
                        // ).toLocaleDateString()}`,
                        text: `${date[0]}${date[1]}/${date[2]}${date[3]}/20${date[4]}${date[5]}`,
                        style: 'bigText',
                        margin: [3, 10, 3, 10],
                     },
                     { text: 'R', style: 'bigText', margin: [3, 10, 3, 10] },
                  ],
                  [
                     {
                        text: 'PT',
                        style: 'text',
                        margin: [0, 7, 0, 7],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: 'Test',
                        style: 'text',
                        margin: [0, 7, 0, 7],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        text: `${PTCODE}`,
                        style: 'bigText',
                        margin: [3, 10, 3, 10],
                     },
                     {
                        colSpan: 2,
                        text: `${TEST ? TEST.toUpperCase() : 'S/T'}`,
                        style: 'bgText',
                        margin: [3, 10, 3, 10],
                     },
                  ],
                  [
                     {
                        text: 'Cantidad por Pallet',
                        style: 'text',
                        margin: [0, 8, 0, 8],
                        fillColor: '#cccccc',
                     },
                     {
                        rowSpan: 4,
                        colSpan: 2,
                        image: qr_str,
                        width: 175,
                        alignment: 'center',
                        margin: [0, 10, 0, 10],
                     },
                  ],
                  [
                     {
                        text: `${divPall === num ? CANT - totPall * a : totPall
                           }`,
                        style: 'bgText',
                        margin: [0, 10, 0, 10],
                     },
                     '',
                     '',
                  ],
                  [
                     {
                        text: 'N° de Pallet',
                        style: 'text',
                        margin: [0, 8, 0, 8],
                        fillColor: '#cccccc',
                     },
                     '',
                     '',
                  ],
                  [
                     {
                        // text: `#${num}`,
                        text: `#${SUSCRIP++}`,
                        style: 'bgText',
                        margin: [0, 10, 0, 10],
                     },
                     '',
                     '',
                  ],
                  [
                     {
                        text: 'N° de Bultos',
                        style: 'text',
                        margin: [0, 7, 0, 7],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'Uds. por Bulto',
                        style: 'text',
                        margin: [0, 7, 0, 7],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'Tipo de Pallet',
                        style: 'text',
                        margin: [0, 7, 0, 7],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        text: `${divPall === num
                           ? `${Math.trunc((CANT - totPall * a) / UNI_BULL)} ${(
                              Math.trunc((((CANT - totPall * a) / UNI_BULL) - Math.trunc((CANT - totPall * a) / UNI_BULL)) * UNI_BULL) !== 0
                                 ? `+ ${Math.round((((CANT - totPall * a) / UNI_BULL) - Math.trunc((CANT - totPall * a) / UNI_BULL)) * UNI_BULL)}U`
                                 : ''
                           )}`
                           : NUM_BULTO
                           }`,
                        style: 'bigText',
                        margin: [3, 10, 3, 10],
                     },
                     {
                        text: `${UNI_BULL}`,
                        style: 'bigText',
                        margin: [3, 10, 3, 10],
                     },
                     {
                        text: `${T_PALL}`,
                        style: 'bigText',
                        margin: [3, 10, 3, 10],
                     },
                  ],
               ],
            },
         })
      }

      array.forEach((element, index) => {
         if (index !== array.length - 1) {
            element.pageBreak = 'after'
         }
      })

      var pdfDoc = printer.createPdfKitDocument(pdfContent(array, PTCODE))
      // PDFs de tickets son públicos (sin autenticación)
      pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, `../assets/tickets/PT-${ORPRO.toUpperCase()}.pdf`)))
      pdfDoc.end()

      return true
   } catch (e) {
      console.error(e)

      return false
   }
}

exports.createPDFLAM = async ({
   PTCODE, ORPRO, CLIENT, PRODUCT, TEST, SUSCRIP, LCOM1 = 0, MCOM1 = 0, LCOM2 = 0, MCOM2 = 0, MCOM22 = 0, LEDM = 0
}) => {
   try {
      let array = [], num = 0

      var printer = new pdfMake(fonts)

      const date = ORPRO.slice(1, 7).split('')

      for (let a = 0; a < SUSCRIP; a++) {
         const qrCode = `CARTONERA MANABI \n CARTOMANABI S.A. \n TICKET MATERIA PRIMA \n Orden de Produccion: ${ORPRO.toUpperCase()} \n Cliente: ${CLIENT || 'S/C'} \n Codigo de lamina: ${PTCODE || 'S/D'} \n Lamina: ${PRODUCT || 'S/D'} \n Test: ${TEST ? TEST.toUpperCase() : 'S/T'} \n Fecha de Produccion: ${date[0]}${date[1]}/${date[2]}${date[3]}/20${date[4]}${date[5]} \n L-COM1: ${LCOM1} \n M-COM1: ${MCOM1} \n L-COM2: ${LCOM2} \n M-COM2: ${MCOM2} \n M-COM2: ${MCOM22} \n LEDM: ${LEDM} \n N° de Pallet: ${++num}`

         const qr_svg = qr.imageSync(qrCode, { type: 'png', options: { errorCorrectionLevel: 'H' } })
         const qr_str = 'data:image/png;base64,' + qr_svg.toString('base64')

         array.push({
            style: 'tableExample',
            color: '#444',
            table: {
               widths: ['*', '*', '*'],
               body: [
                  [
                     {
                        rowSpan: 2,
                        image: path.join(
                           __dirname,
                           '..',
                           'assets',
                           '/img/cartomanabi.png'
                        ),
                        width: 150,
                        alignment: 'center',
                        margin: [0, 10, 0, 8],
                     },
                     {
                        text: 'TICKET MATERIA PRIMA',
                        style: 'tableHeader',
                        margin: [0, 8, 0, 8],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'N° de Pallet',
                        style: 'tableHeader',
                        margin: [0, 8, 0, 8],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     '',
                     {
                        text: 'CM-PR-TR-F-09',
                        style: 'textCenter',
                        margin: [0, 7, 0, 7],
                     },
                     {
                        text: `N° de Pallet: ${num}/${SUSCRIP}`,
                        style: 'tableHeader',
                        margin: [0, 7, 0, 7],
                     },
                  ],
                  [
                     {
                        text: 'Orden de Producción',
                        style: 'textDescp',
                        margin: [0, 20, 0, 2],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: `${ORPRO.toUpperCase()}`,
                        style: 'smallText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        colSpan: 3,
                        text: `${CLIENT}`,
                        style: 'bigText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        colSpan: 3,
                        text: `${PTCODE || 'S/D'}`,
                        style: 'smallText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        colSpan: 3,
                        text: `${PRODUCT}`,
                        style: 'bigText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        text: 'Fecha de Producción',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: 'Test',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        text: `${date[0]}${date[1]}/${date[2]}${date[3]}/20${date[4]}${date[5]}`,
                        style: 'bigText',
                        margin: [3, 12, 3, 4],
                     },
                     {
                        colSpan: 2,
                        text: `${TEST ? TEST.toUpperCase() : 'S/T'}`,
                        style: 'bgText',
                        margin: [3, 4, 3, 4],
                     },
                  ],
                  [
                     {
                        rowSpan: 4,
                        image: qr_str,
                        width: 125,
                        alignment: 'center',
                        margin: [0, 10, 0, 10],
                     },
                     {
                        rowSpan: 4,
                        colSpan: 2,
                        text: ' ',
                        alignment: 'center',
                        margin: [0, 10, 0, 10],
                     },
                  ],
                  [
                     '',
                     '',
                     '',
                  ],
                  [
                     '',
                     '',
                     '',
                  ],
                  [
                     '',
                     '',
                     '',
                  ],
                  [
                     {
                        text: 'L-COM1',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'M-COM1',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'L-COM2',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        text: `${LCOM1}`,
                        style: 'text',
                        margin: [0, 6, 0, 6],
                     },
                     {
                        text: `${MCOM1}`,
                        style: 'text',
                        margin: [0, 6, 0, 6],
                     },
                     {
                        text: `${LCOM2}`,
                        style: 'text',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        text: 'M-COM2',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'M-COM2',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'LEDM',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        text: `${MCOM2}`,
                        style: 'text',
                        margin: [0, 6, 0, 6],
                     },
                     {
                        text: `${MCOM22}`,
                        style: 'text',
                        margin: [0, 6, 0, 6],
                     },
                     {
                        text: `${LEDM}`,
                        style: 'text',
                        margin: [0, 6, 0, 6],
                     },
                  ],
               ],
            },
         })
      }

      array.forEach((element, index) => {
         if (index !== array.length - 1) {
            element.pageBreak = 'after'
         }
      })

      var pdfDoc = printer.createPdfKitDocument(pdfContent(array, PTCODE))
      // PDFs de tickets son públicos (sin autenticación)
      pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, `../assets/tickets/LAM-${ORPRO.toUpperCase()}.pdf`)))
      pdfDoc.end()

      return true
   } catch (e) {
      console.error(e)

      return false
   }
}

exports.createPDFBobAdu = async ({
   COD, DATE, DESCRIPCION, PROVEEDOR, LOTE, CODIGO, PESO, GRAMAJE, ANCHO
}) => {
   try {
      let array = [], num = 0

      var printer = new pdfMake(fonts)

      const qrCode = `CARTONERA MANABI \n CARTOMANABI S.A. \n TICKET DE BOBINA \n Codigo SAP: ${COD.toUpperCase()} \n Fecha Ingreso: ${moment(DATE).format('DD/MM/YYYY')} \n Descripcion bobina: ${DESCRIPCION || 'S/D'} \n Proveedor: ${PROVEEDOR || 'S/P'} \n Lote: ${LOTE || 'S/L'} \n Codigo: ${CODIGO || 'S/C'} \n Peso: ${PESO} \n Gramaje: ${GRAMAJE} \n Ancho: ${ANCHO}`

      const qr_svg = qr.imageSync(qrCode, { type: 'png', options: { errorCorrectionLevel: 'H' } })
      const qr_str = 'data:image/png;base64,' + qr_svg.toString('base64')

      array.push({
         style: 'tableExample',
         color: '#444',
         table: {
            widths: ['*', '*', '*'],
            body: [
               [
                  {
                     rowSpan: 2,
                     image: path.join(
                        __dirname,
                        '..',
                        'assets',
                        '/img/cartomanabi.png'
                     ),
                     width: 150,
                     alignment: 'center',
                     margin: [0, 10, 0, 8],
                  },
                  {
                     text: 'TICKET DE BOBINA',
                     style: 'tableHeader',
                     margin: [0, 8, 0, 8],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'LOGÍSTICA',
                     style: 'tableHeader',
                     margin: [0, 8, 0, 8],
                     fillColor: '#cccccc',
                  },
               ],
               [
                  '',
                  {
                     text: 'CM-BG-TR-F-02',
                     style: 'textCenter',
                     margin: [0, 7, 0, 7],
                  },
                  {
                     text: `Versión: 3 \nN° Página: ${++num}/${num}`,
                     style: 'tableHeader',
                     margin: [5, 6, 5, 2],
                  },
               ],
               [
                  {
                     text: 'Código SAP',
                     style: 'textDescp',
                     margin: [0, 20, 0, 2],
                     fillColor: '#cccccc',
                  },
                  {
                     colSpan: 2,
                     text: `${COD.toUpperCase()}`,
                     style: 'smallText',
                     margin: [0, 6, 0, 6],
                  },
               ],
               [
                  {
                     text: 'Fecha Ingreso',
                     style: 'textDescp',
                     margin: [0, 20, 0, 2],
                     fillColor: '#cccccc',
                  },
                  {
                     colSpan: 2,
                     text: `${moment(DATE).format('DD/MM/YYYY')}`,
                     style: 'smallText',
                     margin: [0, 6, 0, 6],
                  },
               ],
               [
                  {
                     colSpan: 3,
                     text: 'Descripción Bobina',
                     style: 'bigText',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
               ],
               [
                  {
                     colSpan: 3,
                     text: `${DESCRIPCION.toUpperCase()}`,
                     style: 'smallText',
                     margin: [0, 6, 0, 6],
                  },
               ],
               [
                  {
                     // colSpan: 2,
                     text: 'Proveedor',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'Lote',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'Código',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
               ],
               [
                  {
                     // colSpan: 2,
                     text: `${PROVEEDOR.toUpperCase()}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
                  {
                     text: `${LOTE.toUpperCase()}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
                  {
                     text: `${CODIGO}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
               ],
               [
                  {
                     text: 'PESO',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'GRAMAJE',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'ANCHO',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
               ],
               [
                  {
                     // colSpan: 2,
                     text: `${PESO}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
                  {
                     text: `${GRAMAJE}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
                  {
                     text: `${ANCHO}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
               ],
               [
                  {
                     colSpan: 3,
                     rowSpan: 4,
                     image: qr_str,
                     width: 200,
                     alignment: 'center',
                     margin: [0, 10, 0, 10],
                  },
               ],
               [
                  '',
                  '',
                  '',
               ],
               [
                  '',
                  '',
                  '',
               ],
               [
                  '',
                  '',
                  '',
               ],
            ],
         },
      })

      var pdfDoc = printer.createPdfKitDocument(pdfContent(array, 'PT_BOBINA'))
      pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, `../docs/pdf/BOB-${COD.toUpperCase()}.pdf`)))
      pdfDoc.end()

      return true
   } catch (e) {
      console.error(e)

      return false
   }
}

exports.createPDFBob = async ({
   COD, DATE, DESCRIPCION, PROVEEDOR, LOTE, CODIGO, PESO, GRAMAJE, ANCHO, CANTIDAD, LOTEPROV, RECICLADO, FSC
}) => {
   try {
      let array = [], num = 0

      var printer = new pdfMake(fonts)

      const qrCode = `CARTONERA MANABI \n CARTOMANABI S.A. \n TICKET DE BOBINA \n Codigo SAP: ${COD.toUpperCase()} \n Fecha Ingreso: ${moment(DATE).format('DD/MM/YYYY')} \n Descripcion bobina: ${DESCRIPCION || 'S/D'} \n Proveedor: ${PROVEEDOR || 'S/P'} \n Lote Proveedor: ${LOTEPROV} \n Lote: ${LOTE || 'S/L'} \n Codigo: ${CODIGO || 'S/C'} \n Peso: ${PESO} \n Gramaje: ${GRAMAJE} \n Ancho: ${ANCHO} \n Cantidad: ${CANTIDAD}`

      const qr_svg = qr.imageSync(qrCode, { type: 'png', options: { errorCorrectionLevel: 'H' } })
      const qr_str = 'data:image/png;base64,' + qr_svg.toString('base64')

      array.push({
         style: 'tableExample',
         color: '#444',
         table: {
            widths: [150, '*', '*'],
            body: [
               [
                  {
                     rowSpan: 2,
                     image: path.join(
                        __dirname,
                        '..',
                        'assets',
                        '/img/cartomanabi.png'
                     ),
                     width: 150,
                     alignment: 'center',
                     margin: [0, 10, 0, 8],
                  },
                  {
                     text: 'TICKET DE BOBINA',
                     style: 'tableHeader',
                     margin: [0, 8, 0, 8],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'LOGÍSTICA',
                     style: 'tableHeader',
                     margin: [0, 8, 0, 8],
                     fillColor: '#cccccc',
                  },
               ],
               [
                  '',
                  {
                     text: 'CM-BG-TR-F-02',
                     style: 'textCenter',
                     margin: [0, 7, 0, 7],
                  },
                  {
                     text: `Versión: 3 \nN° Página: ${++num}/${num}`,
                     style: 'tableHeader',
                     margin: [5, 6, 5, 2],
                  },
               ],
               [
                  {
                     text: 'Código SAP',
                     style: 'textDescp',
                     margin: [0, 20, 0, 2],
                     fillColor: '#cccccc',
                  },
                  {
                     colSpan: 2,
                     text: `${COD.toUpperCase()}`,
                     style: 'smallText',
                     margin: [0, 6, 0, 6],
                  },
               ],
               [
                  {
                     text: 'Fecha Ingreso',
                     style: 'textDescp',
                     margin: [0, 20, 0, 2],
                     fillColor: '#cccccc',
                  },
                  {
                     colSpan: 2,
                     text: `${moment(DATE).format('DD/MM/YYYY')}`,
                     style: 'smallText',
                     margin: [0, 6, 0, 6],
                  },
               ],
               [
                  {
                     text: 'FSC',
                     style: 'textDescp',
                     margin: [0, 20, 0, 2],
                     fillColor: '#cccccc',
                  },
                  {
                     colSpan: 2,
                     text: `${FSC}`,
                     style: 'smallText',
                     margin: [0, 6, 0, 6],
                  },
               ],
               [
                  {
                     colSpan: 3,
                     text: 'Descripción Bobina',
                     style: 'bigText',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
               ],
               [
                  {
                     colSpan: 3,
                     text: `${DESCRIPCION.toUpperCase()} ${RECICLADO}`,
                     style: 'smallText',
                     margin: [0, 6, 0, 6],
                  },
               ],
               [
                  {
                     // colSpan: 2,
                     text: 'Proveedor',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
                  {
                     // colSpan: 2,
                     text: 'Lote Prov.',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'Código',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
               ],
               [
                  {
                     // colSpan: 2,
                     text: `${PROVEEDOR.toUpperCase()}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
                  {
                     // colSpan: 2,
                     text: `${LOTEPROV.toUpperCase()}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
                  {
                     text: `${CODIGO}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
               ],
               [
                  {
                     text: 'Lote',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'GRAMAJE',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
                  {
                     text: 'ANCHO',
                     style: 'text',
                     margin: [0, 6, 0, 6],
                     fillColor: '#cccccc',
                  },
               ],
               [
                  {
                     text: `${LOTE.toUpperCase()}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
                  {
                     text: `${GRAMAJE}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
                  {
                     text: `${ANCHO}`,
                     style: 'bigText',
                     margin: [3, 7, 3, 7],
                  },
               ],
               [
                  {
                     colSpan: 1,
                     rowSpan: 4,
                     image: qr_str,
                     width: 130,
                     alignment: 'center',
                     // margin: [0, 10, 0, 10],
                  },
                  {
                     colSpan: 2,
                     rowSpan: 4,
                     text: `${CANTIDAD}`,
                     style: 'supeBigText',
                     alignment: 'center',
                     // margin: [0, 10, 0, 10],
                  },
               ],
               [
                  '',
                  '',
                  '',
               ],
               [
                  '',
                  '',
                  '',
               ],
               [
                  '',
                  '',
                  '',
               ],
            ],
         },
      })

      var pdfDoc = printer.createPdfKitDocument(pdfContent(array, 'PT_BOBINA'))
      pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, `../docs/pdf/BOB-CM-${COD.toUpperCase()}.pdf`)))
      pdfDoc.end()

      return true
   } catch (e) {
      console.error(e)

      return false
   }
}

exports.createPDFBobinas = async (data, NAME_DOC) => {
   try {
      let array = []

      var printer = new pdfMake(fonts)

      for (let a = 0; a < data.length; a++) {
         let num = 0

         const COD = data[a].LOTE,
            DATE = data[a].FECHA,
            DESCRIPCION = data[a].DESCRIPCION,
            PROVEEDOR = data[a]?.PROVEEDOR || '---',
            LOTE = data[a].LOTE,
            CODIGO = data[a].CODIGO,
            PESO = Number(data[a].PESO || 0),
            GRAMAJE = Number(data[a]?.GRAMAJE || 0),
            ANCHO = Number(data[a]?.ANCHO || 0),
            CANTIDAD = Number(data[a]?.PESO) || '',
            LOTEPROV = data[a]?.LOTEPROV || '---',
            RECICLADO = data[a]?.RECICLADO === 'SI' ? '(RECICLADO)' : data[a]?.RECICLADO === 'HP' ? '(HIGH PERFORMANCE)' : '',
            FSC = data[a]?.FSC || 'NO'

         const qrCode = `CARTONERA MANABI \n CARTOMANABI S.A. \n TICKET DE BOBINA \n Codigo SAP: ${COD.toUpperCase()} \n Fecha Ingreso: ${moment(DATE).format('DD/MM/YYYY')} \n Descripcion bobina: ${DESCRIPCION || 'S/D'} \n Proveedor: ${PROVEEDOR || 'S/P'} \n Lote Proveedor: ${LOTEPROV} \n Lote: ${LOTE || 'S/L'} \n Codigo: ${CODIGO || 'S/C'} \n Peso: ${PESO} \n Gramaje: ${GRAMAJE} \n Ancho: ${ANCHO} \n Cantidad: ${CANTIDAD}`

         const qr_svg = qr.imageSync(qrCode, { type: 'png', options: { errorCorrectionLevel: 'H' } })
         const qr_str = 'data:image/png;base64,' + qr_svg.toString('base64')

         array.push({
            unbreakable: true,
            style: 'tableExample',
            color: '#444',
            table: {
               widths: [150, '*', '*'],
               body: [
                  [
                     {
                        rowSpan: 2,
                        image: path.join(
                           __dirname,
                           '..',
                           'assets',
                           '/img/cartomanabi.png'
                        ),
                        width: 150,
                        alignment: 'center',
                        margin: [0, 10, 0, 8],
                     },
                     {
                        text: 'TICKET DE BOBINA',
                        style: 'tableHeader',
                        margin: [0, 8, 0, 8],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'LOGÍSTICA',
                        style: 'tableHeader',
                        margin: [0, 8, 0, 8],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     '',
                     {
                        text: 'CM-BG-TR-F-02',
                        style: 'textCenter',
                        margin: [0, 7, 0, 7],
                     },
                     {
                        text: `Versión: 3 \nN° Página: ${++num}/${num}`,
                        style: 'tableHeader',
                        margin: [5, 6, 5, 2],
                     },
                  ],
                  [
                     {
                        text: 'Código SAP',
                        style: 'textDescp',
                        margin: [0, 20, 0, 2],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: `${COD.toUpperCase()}`,
                        style: 'smallText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        text: 'Fecha Ingreso',
                        style: 'textDescp',
                        margin: [0, 20, 0, 2],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: `${moment(DATE).format('DD/MM/YYYY')}`,
                        style: 'smallText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        text: 'FSC',
                        style: 'textDescp',
                        margin: [0, 20, 0, 2],
                        fillColor: '#cccccc',
                     },
                     {
                        colSpan: 2,
                        text: `${FSC}`,
                        style: 'smallText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        colSpan: 3,
                        text: [
                           { text: 'Descripción Bobina ', style: 'bigText' }, // Texto normal
                           // { text: `${RECICLADO}`, color: RECICLADO ? '#FFFFFF' : '#000000' } // Cambia a blanco si es reciclado
                        ],
                        style: 'bigText',
                        margin: [0, 4, 0, 4],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        colSpan: 3,
                        text: `${DESCRIPCION.toUpperCase()} ${RECICLADO}`,
                        style: 'smallText',
                        margin: [0, 6, 0, 6],
                     },
                  ],
                  [
                     {
                        // colSpan: 2,
                        text: 'Proveedor',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        // colSpan: 2,
                        text: 'Lote Prov.',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'Código',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        // colSpan: 2,
                        text: `${PROVEEDOR ? PROVEEDOR.toUpperCase() : '---'}`,
                        style: 'bigText',
                        margin: [3, 7, 3, 7],
                     },
                     {
                        // colSpan: 2,
                        text: `${LOTEPROV ? LOTEPROV.toUpperCase() : '---'}`,
                        style: 'bigText',
                        margin: [3, 7, 3, 7],
                     },
                     {
                        text: `${CODIGO}`,
                        style: 'bigText',
                        margin: [3, 7, 3, 7],
                     },
                  ],
                  [
                     {
                        text: 'Lote',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'GRAMAJE',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                     {
                        text: 'ANCHO',
                        style: 'text',
                        margin: [0, 6, 0, 6],
                        fillColor: '#cccccc',
                     },
                  ],
                  [
                     {
                        text: `${LOTE.toUpperCase()}`,
                        style: 'bigText',
                        margin: [3, 7, 3, 7],
                     },
                     {
                        text: `${GRAMAJE}`,
                        style: 'bigText',
                        margin: [3, 7, 3, 7],
                     },
                     {
                        text: `${ANCHO}`,
                        style: 'bigText',
                        margin: [3, 7, 3, 7],
                     },
                  ],
                  [
                     {
                        image: qr_str,
                        width: 150,
                        alignment: 'center',
                        margin: [0, 10, 0, 10],
                     },
                     {
                        colSpan: 2,
                        text: `${CANTIDAD}`,
                        style: 'supeBigText',
                        alignment: 'center',
                        margin: [0, 10, 0, 10],
                     },
                     '' // placeholder por colSpan:2
                  ],
                  // [
                  //    {
                  //       colSpan: 1,
                  //       rowSpan: 4,
                  //       image: qr_str,
                  //       width: 150,
                  //       alignment: 'center',
                  //       margin: [0, 10, 0, 10],
                  //    },
                  //    {
                  //       colSpan: 2,
                  //       rowSpan: 4,
                  //       text: `${CANTIDAD}`,
                  //       style: 'supeBigText',
                  //       alignment: 'center',
                  //       margin: [0, 10, 0, 10],
                  //    },
                  // ],
                  // [
                  //    '',
                  //    '',
                  //    '',
                  // ],
                  // [
                  //    '',
                  //    '',
                  //    '',
                  // ],
                  // [
                  //    '',
                  //    '',
                  //    '',
                  // ],
               ],
            }
         })
      }

      var pdfDoc = printer.createPdfKitDocument(pdfContent(array, 'PT_BOBINA'))
      pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, `../docs/pdf/BOB-CM-${NAME_DOC.toUpperCase()}.pdf`)))
      pdfDoc.end()

      return true
   } catch (e) {
      console.error(e)

      return false
   }
}

exports.createPDFAccountStd = async (dataV, dataPV, client, NAME_DOC, srchPayments = {}, fecha) => {
   try {
      let array = []
      const printer = new pdfMake(fonts)

      // Filtrar pagos por tipo
      const pagos = srchPayments.PAGO || []
      const anticipos = srchPayments.ANTICIPO || []
      const retenciones = srchPayments.RETENCION || []

      // Encabezados de la tabla
      const tableHeadersV = [
         [
            { text: 'Tipo', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Documento', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Fecha Emisión', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Fecha Vencimiento', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Valor', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Abonos', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Saldo', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Corriente', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 1 a 30', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 31 a 60', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 61 a 90', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Más de 91', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Días de atraso', bold: true, style: 'tableHeader', alignment: 'center' },
         ],
      ]

      const tableHeadersPV = [
         [
            { text: 'Tipo', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Documento', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Fecha Emisión', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Fecha Vencimiento', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Valor', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Abonos', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Saldo', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Corriente', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 1 a 30', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 31 a 60', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 61 a 90', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Más de 91', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Días por vencer', bold: true, style: 'tableHeader', alignment: 'center' },
         ],
      ]

      // Construir filas para todas las facturas vencidas
      const tableBodyV = []

      if (dataV.length > 0) {
         for (let i = 0; i < dataV.length; i++) {
            const factura = dataV[i]

            tableBodyV.push([
               { text: factura.tipo, style: 'tableData', alignment: 'right' },
               { text: factura.documento, style: 'tableData', alignment: 'right' },
               { text: moment(factura.fecha, 'DD/MM/YYYY').format('DD/MM/YYYY'), style: 'tableData', alignment: 'right' },
               { text: moment(factura.fechaVenc, 'DD/MM/YYYY').format('DD/MM/YYYY'), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.valor, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.abonos, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.saldo, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.corriente, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de1a30, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de31a60, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de61a90, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.masDe91, 2), style: 'tableData', alignment: 'right' },
               { text: factura.diasAtraso, style: 'tableData' },
            ])
         }
      } else {
         tableBodyV.push([
            { text: 'No hay facturas vencidas', colSpan: 13, style: 'tableData', alignment: 'center' },
            {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
         ])
      }

      // Construir filas para todas las facturas vencidas
      const tableBodyPV = []

      if (dataPV.length > 0) {
         for (let i = 0; i < dataPV.length; i++) {
            const factura = dataPV[i]

            tableBodyPV.push([
               { text: factura.tipo, style: 'tableData', alignment: 'right' },
               { text: factura.documento, style: 'tableData', alignment: 'right' },
               { text: moment(factura.fecha, 'DD/MM/YYYY').format('DD/MM/YYYY'), style: 'tableData', alignment: 'right' },
               { text: moment(factura.fechaVenc, 'DD/MM/YYYY').format('DD/MM/YYYY'), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.valor, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.abonos, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.saldo, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.corriente, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de1a30, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de31a60, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de61a90, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.masDe91, 2), style: 'tableData', alignment: 'right' },
               { text: factura.diasAtraso, style: 'tableData' },
            ])
         }
      } else {
         tableBodyPV.push([
            { text: 'No hay facturas por vencer', colSpan: 13, style: 'tableData', alignment: 'center' },
            {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
         ])
      }

      // Crear tabla con encabezados y cuerpo
      array.push({
         stack: [
            // { text: 'Estado de Cuenta', style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
            {
               columns: [
                  {
                     text: 'Estado de cuenta',
                     style: 'header',
                     alignment: 'left',
                     margin: [0, 15, 0, 10],
                  },
                  {
                     image: path.join(__dirname, '..', 'assets', '/img/cartomanabi.png'),
                     width: 175,
                     alignment: 'right',
                     margin: [0, 0, 0, 10], // Espaciado alrededor de la imagen
                  },
               ]
            }, {
               style: 'tableSummary',
               table: {
                  widths: ['20%', '*', '*', '*'], // Ajusta los anchos según el contenido
                  body: [
                     [
                        {
                           text: 'Cliente',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `${client.nombre}`, alignment: 'left', style: 'tableDataS' },
                        {
                           text: 'Total Cartera',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `$ ${numberFormatToDecimals(client.totalCartera, 2)}`, alignment: 'left', style: 'tableDataS' },
                     ],
                     [
                        {
                           text: 'Días de crédito',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `${client.dcred}`, alignment: 'left', style: 'tableDataS' },
                        {
                           text: 'Por Vencer',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `$ ${numberFormatToDecimals(client.porVencer, 2)}`, alignment: 'left', style: 'tableDataS' },
                     ],
                     [
                        {
                           text: 'Vendedor',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `${client.vendedor}`, alignment: 'left', style: 'tableDataS' },
                        {
                           text: 'Vencido',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `$ ${numberFormatToDecimals(client.vencido, 2)}`, alignment: 'left', style: 'tableDataS' },
                     ],
                     [
                        {
                           text: 'Fecha de corte',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `${client.fechaCorte}`, alignment: 'left', style: 'tableDataS' },
                        {}, {}
                     ]
                  ],
               },
               margin: [0, 5, 0, 10],
               layout: 'noBorders', // Margen superior e inferior para separar la tabla
            },
            client.infoAdicional && client.infoAdicional.length > 0 ? {
               style: 'tableInfoAdicional',
               table: {
                  widths: ['50%', '50%'],
                  body: [
                     [
                        {
                           text: 'Información de Anexos y Compensaciones - Régimen 21',
                           colSpan: 2,
                           style: 'tableHeader',
                           alignment: 'center',
                           fillColor: '#cadff3'
                        },
                        {}
                     ],
                     [
                        { text: 'Anexos por Aceptar', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#e8f4fd' },
                        { text: `${client.infoAdicional[0].AnexosPorAceptar}`, alignment: 'right', style: 'tableDataS' }
                     ],
                     [
                        { text: 'Facturas por Aceptar', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#e8f4fd' },
                        { text: `${client.infoAdicional[0].FacturasPorAceptar}`, alignment: 'right', style: 'tableDataS' }
                     ],
                     [
                        { text: 'Unidades por Aceptar', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#e8f4fd' },
                        { text: `${numberFormatToDecimals(client.infoAdicional[0].UnidadesPorAceptar, 0)}`, alignment: 'right', style: 'tableDataS' }
                     ],
                     [
                        { text: 'Anexos Urgentes por Aceptar', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: client.infoAdicional[0].AnexosUrgentesAceptar > 0 ? '#f8d7da' : '#e8f4fd' },
                        { text: `${client.infoAdicional[0].AnexosUrgentesAceptar}`, alignment: 'right', style: 'tableDataS', fillColor: client.infoAdicional[0].AnexosUrgentesAceptar > 0 ? '#f8d7da' : '' }
                     ],
                     [
                        { text: 'Anexos por Compensar', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#e8f4fd' },
                        { text: `${client.infoAdicional[0].AnexosPorCompensar}`, alignment: 'right', style: 'tableDataS' }
                     ],
                     [
                        { text: 'Facturas por Compensar', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#e8f4fd' },
                        { text: `${client.infoAdicional[0].FacturasPorCompensar}`, alignment: 'right', style: 'tableDataS' }
                     ],
                     [
                        { text: 'Unidades por Compensar', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#e8f4fd' },
                        { text: `${numberFormatToDecimals(client.infoAdicional[0].UnidadesPorCompensar, 0)}`, alignment: 'right', style: 'tableDataS' }
                     ],
                     [
                        { text: 'Anexos Urgentes por Compensar', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: client.infoAdicional[0].AnexosUrgentesCompensar > 0 ? '#f8d7da' : '#e8f4fd' },
                        { text: `${client.infoAdicional[0].AnexosUrgentesCompensar}`, alignment: 'right', style: 'tableDataS', fillColor: client.infoAdicional[0].AnexosUrgentesCompensar > 0 ? '#f8d7da' : '' }
                     ],
                     [
                        { text: 'Total Anexos Pendientes', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#cadff3' },
                        { text: `${client.infoAdicional[0].TotalAnexosPendientes}`, alignment: 'right', style: 'tableDataS', bold: true }
                     ],
                     [
                        { text: 'Total Facturas Pendientes', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#cadff3' },
                        { text: `${client.infoAdicional[0].TotalFacturasPendientes}`, alignment: 'right', style: 'tableDataS', bold: true }
                     ],
                     [
                        { text: 'Total Unidades Pendientes', bold: true, alignment: 'left', style: 'tableHeaderS', fillColor: '#cadff3' },
                        { text: `${numberFormatToDecimals(client.infoAdicional[0].TotalUnidadesPendientes, 0)}`, alignment: 'right', style: 'tableDataS', bold: true }
                     ]
                  ]
               },
               margin: [0, 5, 0, 10],
               layout: 'lightHorizontalLines'
            } : {},
            {
               style: 'tableExampleV',
               table: {
                  widths: ['4%', '9.5%', '9%', '9%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '6%'],
                  body: [
                     [
                        {
                           text: 'Facturas vencidas',
                           colSpan: 13,
                           style: 'tableHeader',
                           alignment: 'center'
                        },
                        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
                     ],
                     ...tableHeadersV,
                     ...tableBodyV,
                     [
                        {
                           text: 'Total',
                           bold: true,
                           style: 'tableHeader',
                           colSpan: 4,
                           alignment: 'center'
                        },
                        {}, {}, {},
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.valor), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.abonos), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.saldo), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.corriente), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.de1a30), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.de31a60), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.de61a90), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.masDe91), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: '',
                           style: 'tableHeader',
                           alignment: 'right'
                        }
                     ]
                  ],
               },
               margin: [0, 5, 0, 10],
               layout: 'lightHorizontalLines', // Líneas horizontales claras
            }, {
               style: 'tableExamplePV',
               table: {
                  widths: ['4%', '9.5%', '9%', '9%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '6%'],
                  body: [
                     [
                        {
                           text: 'Facturas por vencer',
                           colSpan: 13,
                           style: 'tableHeader',
                           alignment: 'center'
                        },
                        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
                     ],
                     ...tableHeadersPV,
                     ...tableBodyPV,
                     [
                        {
                           text: 'Total',
                           bold: true,
                           style: 'tableHeader',
                           colSpan: 4,
                           alignment: 'center'
                        },
                        {}, {}, {},
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.valor), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.abonos), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.saldo), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.corriente), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.de1a30), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.de31a60), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.de61a90), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.masDe91), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: '',
                           style: 'tableHeader',
                           alignment: 'right'
                        }
                     ]
                  ],
               },
               margin: [0, 5, 0, 10],
               layout: 'lightHorizontalLines', // Líneas horizontales claras
            },
            // Período de Pagos
            fecha ? {
               style: 'tablePeriodo',
               table: {
                  widths: ['50%', '50%'],
                  body: [
                     [
                        {
                           text: 'Período de Pagos',
                           colSpan: 2,
                           style: 'tableHeader',
                           alignment: 'center',
                           fillColor: '#cadff3',
                           fontSize: 10,
                           bold: true
                        },
                        {}
                     ],
                     [
                        {
                           text: 'Desde',
                           bold: true,
                           style: 'tableHeaderS',
                           alignment: 'center',
                           fillColor: '#e8f4fd'
                        },
                        {
                           text: 'Hasta',
                           bold: true,
                           style: 'tableHeaderS',
                           alignment: 'center',
                           fillColor: '#e8f4fd'
                        }
                     ],
                     [
                        {
                           text: moment(fecha).subtract(7, 'days').format('DD/MM/YYYY'),
                           style: 'tableDataS',
                           alignment: 'center',
                           fontSize: 9
                        },
                        {
                           text: moment(fecha).format('DD/MM/YYYY'),
                           style: 'tableDataS',
                           alignment: 'center',
                           fontSize: 9
                        }
                     ]
                  ]
               },
               margin: [0, 10, 0, 5], // Margen: izquierda, arriba, derecha, abajo
               layout: 'lightHorizontalLines'
            } : {},
            // Tabla de PAGOS
            pagos.length > 0 ? {
               style: 'tablePayments',
               table: {
                  widths: ['33.33%', '33.33%', '33.34%'],
                  body: [
                     [
                        {
                           text: 'PAGOS',
                           colSpan: 3,
                           style: 'tableHeader',
                           alignment: 'center',
                           fillColor: '#cadff3'
                        },
                        {}, {}
                     ],
                     [
                        { text: 'Fecha Pago', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' },
                        { text: 'Facturas', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' },
                        { text: 'Total Pago', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' }
                     ],
                     ...pagos.map(p => [
                        { text: p.FechaPago ? moment(p.FechaPago).format('DD/MM/YYYY') : '--/--/----', style: 'tableData', alignment: 'center' },
                        { text: (p.Facturas || '').replace(/,/g, ' - '), style: 'tableData', alignment: 'center' },
                        { text: moneyAuto(p.TotalPago), style: 'tableData', alignment: 'right' }
                     ]),
                     [
                        { text: 'Total', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#cadff3', colSpan: 2 },
                        {},
                        { text: moneyAuto(pagos.reduce((acc, p) => acc + Number(p.TotalPago || 0), 0)), style: 'tableData', alignment: 'right', bold: true, fillColor: '#cadff3' }
                     ]
                  ]
               },
               margin: [0, 5, 0, 10],
               layout: 'lightHorizontalLines'
            } : {},
            // Tabla de ANTICIPOS
            anticipos.length > 0 ? {
               style: 'tablePayments',
               table: {
                  widths: ['33.33%', '33.33%', '33.34%'],
                  body: [
                     [
                        {
                           text: 'ANTICIPOS',
                           colSpan: 3,
                           style: 'tableHeader',
                           alignment: 'center',
                           fillColor: '#cadff3'
                        },
                        {}, {}
                     ],
                     [
                        { text: 'Fecha Pago', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' },
                        { text: 'Facturas', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' },
                        { text: 'Total Pago', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' }
                     ],
                     ...anticipos.map(p => [
                        { text: p.FechaPago ? moment(p.FechaPago).format('DD/MM/YYYY') : '--/--/----', style: 'tableData', alignment: 'center' },
                        { text: (p.Facturas || '').replace(/,/g, ' - '), style: 'tableData', alignment: 'center' },
                        { text: moneyAuto(p.TotalPago), style: 'tableData', alignment: 'right' }
                     ]),
                     [
                        { text: 'Total', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#cadff3', colSpan: 2 },
                        {},
                        { text: moneyAuto(anticipos.reduce((acc, p) => acc + Number(p.TotalPago || 0), 0)), style: 'tableData', alignment: 'right', bold: true, fillColor: '#cadff3' }
                     ]
                  ]
               },
               margin: [0, 5, 0, 10],
               layout: 'lightHorizontalLines'
            } : {},
            // Tabla de RETENCIONES
            retenciones.length > 0 ? {
               style: 'tablePayments',
               table: {
                  widths: ['33.33%', '33.33%', '33.34%'],
                  body: [
                     [
                        {
                           text: 'RETENCIONES',
                           colSpan: 3,
                           style: 'tableHeader',
                           alignment: 'center',
                           fillColor: '#cadff3'
                        },
                        {}, {}
                     ],
                     [
                        { text: 'Fecha Pago', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' },
                        { text: 'Facturas', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' },
                        { text: 'Total Pago', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#e8f4fd' }
                     ],
                     ...retenciones.map(p => [
                        { text: p.FechaPago ? moment(p.FechaPago).format('DD/MM/YYYY') : '--/--/----', style: 'tableData', alignment: 'center' },
                        { text: (p.Facturas || '').replace(/,/g, ' - '), style: 'tableData', alignment: 'center' },
                        { text: moneyAuto(p.TotalPago), style: 'tableData', alignment: 'right' }
                     ]),
                     [
                        { text: 'Total', bold: true, style: 'tableHeader', alignment: 'center', fillColor: '#cadff3', colSpan: 2 },
                        {},
                        { text: moneyAuto(retenciones.reduce((acc, p) => acc + Number(p.TotalPago || 0), 0)), style: 'tableData', alignment: 'right', bold: true, fillColor: '#cadff3' }
                     ]
                  ]
               },
               margin: [0, 5, 0, 10],
               layout: 'lightHorizontalLines'
            } : {},
         ],
      })

      // Definir contenido del documento
      const pdfContent = {
         background: (currentPage, pageSize) => {
            return {
               image: path.join(__dirname, '..', 'assets', '/img/cartomanabi.png'),
               width: 400, // Ajusta el tamaño de la imagen
               opacity: 0.2, // Ajusta la opacidad para que sea tenue como marca de agua
               alignment: 'center', // Centra la imagen en el fondo
               absolutePosition: {
                  x: (pageSize.width - 600) / 2, // Centra horizontalmente
                  y: (pageSize.height - 150) / 2 // Centra verticalmente
               }
            }
         },
         content: array,
         styles: {
            header: {
               fontSize: 19, // Reducir el tamaño de la cabecera
               bold: true,
               margin: [0, 0, 0, 10],
            },
            tableHeaderS: {
               fontSize: 9, // Tamaño pequeño para encabezados de tabla
               bold: true,
               alignment: 'center',
               // fillColor: '#ffcfa5',
            },
            tableHeader: {
               fontSize: 6.25, // Tamaño pequeño para encabezados de tabla
               bold: true,
               alignment: 'center',
               fillColor: '#cadff3',
            },
            tableDataS: {
               fontSize: 8, // Tamaño pequeño para datos de tabla
               alignment: 'center',
            },
            tableData: {
               fontSize: 5.5, // Tamaño pequeño para datos de tabla
               alignment: 'center',
            },
            tableExample: {
               margin: [0, 5, 0, 15],
            },
         },
         pageMargins: [10, 20, 10, 20], // Márgenes para ocupar casi todo el ancho de la página
      }

      // Crear y guardar el PDF
      const pdfDoc = printer.createPdfKitDocument(pdfContent)
      pdfDoc.pipe(
         fs.createWriteStream(
            path.join(__dirname, `../docs/accstates/${NAME_DOC.toUpperCase()}`)
         )
      )
      pdfDoc.end()

      return true
   } catch (e) {
      console.error(e)
      return false
   }
}

exports.createPDFAccountStdAu = async (dataV, dataPV, client, NAME_DOC) => {
   try {
      let array = []
      const printer = new pdfMake(fonts)

      // Encabezados de la tabla
      const tableHeadersV = [
         [
            { text: 'Tipo', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Documento', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Fecha Emisión', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Fecha Vencimiento', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Valor', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Abonos', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Saldo', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Corriente', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 1 a 30', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 31 a 60', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 61 a 90', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Más de 91', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Días de atraso', bold: true, style: 'tableHeader', alignment: 'center' },
         ],
      ]

      const tableHeadersPV = [
         [
            { text: 'Tipo', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Documento', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Fecha Emisión', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Fecha Vencimiento', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Valor', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Abonos', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Saldo', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Corriente', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 1 a 30', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 31 a 60', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'De 61 a 90', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Más de 91', bold: true, style: 'tableHeader', alignment: 'center' },
            { text: 'Días por vencer', bold: true, style: 'tableHeader', alignment: 'center' },
         ],
      ]

      // Construir filas para todas las facturas vencidas
      const tableBodyV = []

      if (dataV.length > 0) {
         for (let i = 0; i < dataV.length; i++) {
            const factura = dataV[i]

            tableBodyV.push([
               { text: factura.tipo, style: 'tableData', alignment: 'right' },
               { text: factura.documento, style: 'tableData', alignment: 'right' },
               { text: moment(factura.fecha, 'DD/MM/YYYY').format('DD/MM/YYYY'), style: 'tableData', alignment: 'right' },
               { text: moment(factura.fechaVenc, 'DD/MM/YYYY').format('DD/MM/YYYY'), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.valor, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.abonos, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.saldo, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.corriente, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de1a30, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de31a60, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de61a90, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.masDe91, 2), style: 'tableData', alignment: 'right' },
               { text: factura.diasAtraso, style: 'tableData' },
            ])
         }
      } else {
         tableBodyV.push([
            { text: 'No hay facturas vencidas', colSpan: 13, style: 'tableData', alignment: 'center' },
            {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
         ])
      }

      // Construir filas para todas las facturas vencidas
      const tableBodyPV = []

      if (dataPV.length > 0) {
         for (let i = 0; i < dataPV.length; i++) {
            const factura = dataPV[i]

            tableBodyPV.push([
               { text: factura.tipo, style: 'tableData', alignment: 'right' },
               { text: factura.documento, style: 'tableData', alignment: 'right' },
               { text: moment(factura.fecha, 'DD/MM/YYYY').format('DD/MM/YYYY'), style: 'tableData', alignment: 'right' },
               { text: moment(factura.fechaVenc, 'DD/MM/YYYY').format('DD/MM/YYYY'), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.valor, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.abonos, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.saldo, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.corriente, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de1a30, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de31a60, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.de61a90, 2), style: 'tableData', alignment: 'right' },
               { text: numberFormatToDecimals(factura.masDe91, 2), style: 'tableData', alignment: 'right' },
               { text: factura.diasAtraso, style: 'tableData' },
            ])
         }
      } else {
         tableBodyPV.push([
            { text: 'No hay facturas por vencer', colSpan: 13, style: 'tableData', alignment: 'center' },
            {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
         ])
      }

      // Crear tabla con encabezados y cuerpo
      array.push({
         stack: [
            // { text: 'Estado de Cuenta', style: 'header', alignment: 'center', margin: [0, 0, 0, 10] },
            {
               columns: [
                  {
                     text: 'Estado de cuenta',
                     style: 'header',
                     alignment: 'left',
                     margin: [0, 15, 0, 10],
                  },
                  {
                     image: path.join(__dirname, '..', 'assets', '/img/austrobox.png'),
                     width: 175,
                     alignment: 'right',
                     margin: [0, 0, 0, 10], // Espaciado alrededor de la imagen
                  },
               ]
            }, {
               style: 'tableSummary',
               table: {
                  widths: ['20%', '*', '*', '*'], // Ajusta los anchos según el contenido
                  body: [
                     [
                        {
                           text: 'Cliente',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `${client.nombre}`, alignment: 'left', style: 'tableDataS' },
                        {
                           text: 'Total Cartera',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `$ ${numberFormatToDecimals(client.totalCartera, 2)}`, alignment: 'left', style: 'tableDataS' },
                     ],
                     [
                        {
                           text: 'Días de crédito',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `${client.dcred}`, alignment: 'left', style: 'tableDataS' },
                        {
                           text: 'Por Vencer',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `$ ${numberFormatToDecimals(client.porVencer, 2)}`, alignment: 'left', style: 'tableDataS' },
                     ],
                     [
                        {
                           text: 'Vendedor',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `${client.vendedor}`, alignment: 'left', style: 'tableDataS' },
                        {
                           text: 'Vencido',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `$ ${numberFormatToDecimals(client.vencido, 2)}`, alignment: 'left', style: 'tableDataS' },
                     ],
                     [
                        {
                           text: 'Fecha de corte',
                           bold: true,
                           alignment: 'left',
                           style: 'tableHeaderS',
                           fillColor: '#cadff3'
                        },
                        { text: `${client.fechaCorte}`, alignment: 'left', style: 'tableDataS' },
                        {}, {}
                     ]
                  ],
               },
               margin: [0, 5, 0, 10],
               layout: 'noBorders', // Margen superior e inferior para separar la tabla
            }, {
               style: 'tableExampleV',
               table: {
                  widths: ['4%', '9.5%', '9%', '9%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '6%'],
                  body: [
                     [
                        {
                           text: 'Facturas vencidas',
                           colSpan: 13,
                           style: 'tableHeader',
                           alignment: 'center'
                        },
                        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
                     ],
                     ...tableHeadersV,
                     ...tableBodyV,
                     [
                        {
                           text: 'Total',
                           bold: true,
                           style: 'tableHeader',
                           colSpan: 4,
                           alignment: 'center'
                        },
                        {}, {}, {},
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.valor), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.abonos), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.saldo), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.corriente), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.de1a30), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.de31a60), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.de61a90), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataV.reduce((acc, item) => acc + Number(item.masDe91), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: '',
                           style: 'tableHeader',
                           alignment: 'right'
                        }
                     ]
                  ],
               },
               margin: [0, 5, 0, 10],
               layout: 'lightHorizontalLines', // Líneas horizontales claras
            }, {
               style: 'tableExamplePV',
               table: {
                  widths: ['4%', '9.5%', '9%', '9%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '7.75%', '6%'],
                  body: [
                     [
                        {
                           text: 'Facturas por vencer',
                           colSpan: 13,
                           style: 'tableHeader',
                           alignment: 'center'
                        },
                        {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
                     ],
                     ...tableHeadersPV,
                     ...tableBodyPV,
                     [
                        {
                           text: 'Total',
                           bold: true,
                           style: 'tableHeader',
                           colSpan: 4,
                           alignment: 'center'
                        },
                        {}, {}, {},
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.valor), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.abonos), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.saldo), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.corriente), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.de1a30), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.de31a60), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.de61a90), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: `${numberFormatToDecimals(dataPV.reduce((acc, item) => acc + Number(item.masDe91), 0), 2)}`,
                           style: 'tableHeader',
                           alignment: 'right'
                        },
                        {
                           text: '',
                           style: 'tableHeader',
                           alignment: 'right'
                        }
                     ]
                  ],
               },
               margin: [0, 5, 0, 10],
               layout: 'lightHorizontalLines', // Líneas horizontales claras
            },
         ],
      })

      // Definir contenido del documento
      const pdfContent = {
         background: (currentPage, pageSize) => {
            return {
               image: path.join(__dirname, '..', 'assets', '/img/austrobox.png'),
               width: 400, // Ajusta el tamaño de la imagen
               opacity: 0.2, // Ajusta la opacidad para que sea tenue como marca de agua
               alignment: 'center', // Centra la imagen en el fondo
               absolutePosition: {
                  x: (pageSize.width - 600) / 2, // Centra horizontalmente
                  y: (pageSize.height - 150) / 2 // Centra verticalmente
               }
            }
         },
         content: array,
         styles: {
            header: {
               fontSize: 19, // Reducir el tamaño de la cabecera
               bold: true,
               margin: [0, 0, 0, 10],
            },
            tableHeaderS: {
               fontSize: 9, // Tamaño pequeño para encabezados de tabla
               bold: true,
               alignment: 'center',
               // fillColor: '#ffcfa5',
            },
            tableHeader: {
               fontSize: 6.25, // Tamaño pequeño para encabezados de tabla
               bold: true,
               alignment: 'center',
               fillColor: '#cadff3',
            },
            tableDataS: {
               fontSize: 8, // Tamaño pequeño para datos de tabla
               alignment: 'center',
            },
            tableData: {
               fontSize: 5.5, // Tamaño pequeño para datos de tabla
               alignment: 'center',
            },
            tableExample: {
               margin: [0, 5, 0, 15],
            },
         },
         pageMargins: [10, 20, 10, 20], // Márgenes para ocupar casi todo el ancho de la página
      }

      // Crear y guardar el PDF
      const pdfDoc = printer.createPdfKitDocument(pdfContent)
      pdfDoc.pipe(
         fs.createWriteStream(
            path.join(__dirname, `../docs/accstates/${NAME_DOC.toUpperCase()}`)
         )
      )
      pdfDoc.end()

      return true
   } catch (e) {
      console.error(e)
      return false
   }
}

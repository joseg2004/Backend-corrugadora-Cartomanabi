const client = require('../connections/hana')
const path = require('path')
const fs = require('fs')
const pdfMake = require('pdfmake')
const moment = require('moment')
const { getAllItmBobinas, getGroupItmBobinas } = require('../models/hanaQBobinas')


const getCurrentDate = function() {
   return moment().utcOffset('-05:00').format('DD/MM/YYYY HH:mm:ss')
}

var fonts = {
   Roboto: {
      normal: path.join(__dirname, '..', 'assets', '/fonts/Roboto-Regular.ttf'),
      bold: path.join(__dirname, '..', 'assets', '/fonts/Roboto-Medium.ttf'),
      italics: path.join(__dirname, '..', 'assets', '/fonts/Roboto-Italic.ttf'),
      bolditalics: path.join(__dirname, '..', 'assets', '/fonts/Roboto-MediumItalic.ttf')
   }
}

exports.createItmPDFAdu = async (IDBOB) => {
   try {
      let allItm = [], groupItm = []

      allItm = await client.exec(getAllItmBobinas(IDBOB))
      groupItm = await client.exec(getGroupItmBobinas(IDBOB))

      const dataAllItm = allItm.map((itm) => {
         return [
            {
               text: itm.ITEMCODE,
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: itm.FECHA,
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: itm.LOTE,
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: Number(itm.GRAMAJE),
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: Number(itm.ANCHO),
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: (Number(itm.STOCK) * 1000).toFixed(0),
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: itm.ALMACEN,
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
         ]
      })

      const dataGroupItm = groupItm.map((itm) => {
         return [
            {
               text: itm.DAI,
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: itm.ITEMCODE,
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: Number(itm.GRAMAJE),
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: Number(itm.ANCHO),
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: Number(itm.KG) * 1000,
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
            {
               text: Number(itm.KG),
               style: 'textMedium',
               margin: [0 , 4, 0, 4],
            },
         ]
      })

      if (allItm && groupItm) {
         const tblHeaderOne = {
            style: 'tableExample',
            color: '#444',
            table: {
               widths: ['*', '*', '*', '*', '*'],
               body: [
                  [
                     {
                        colSpan: 5,
                        text: 'PAPEL AGRUPADO POR GRAMAJE Y ANCHO',
                        style: 'tableHeader',
                        fillColor: '#0f3443',
                        decorationStyle: 'double',
                        color: '#fff',
                        margin: [0 , 7, 0, 7]
                     },
                  ],
                  [
                     {
                        colSpan: 5,
                        text: 'DETALLE',
                        style: 'text',
                        margin: [0 , 4, 0, 4],
                        color: '#000000'
                     },
                  ]
               ],
            }
         }

         const tableOne = {
            style: 'tableBody',
            color: '#444',
            table: {
               widths: ['*', 60, 60, 60, 60, 60],
               body: [
                  [
                     {
                        text: 'DAI',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'TIPO',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'GRAMAJE',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'ANCHO',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'PESO',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'TM',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                  ],
                  ...dataGroupItm,
                  [
                     {
                        text: '-',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: '-',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: '-',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: '-',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: Number(groupItm.reduce((acc, itm) => acc + Number(itm.KG) * 1000, 0)).toFixed(0),
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: Number(groupItm.reduce((acc, itm) => acc + Number(itm.KG), 0)).toFixed(3),
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     }
                  ]
               ],
            },
         }

         const tblHeaderTwo = {
            style: 'tableExampleTwo',
            color: '#444',
            table: {
               widths: ['*', '*', '*', '*', '*', '*'],
               body: [
                  [
                     {
                        colSpan: 6,
                        text: 'LISTADO DE PAPEL EN INVENTARIO',
                        style: 'tableHeader',
                        fillColor: '#0f3443',
                        decorationStyle: 'double',
                        color: '#fff',
                        margin: [0 , 7, 0, 7]
                     },
                  ],
                  [
                     {
                        colSpan: 6,
                        text: 'DETALLE',
                        style: 'text',
                        margin: [0 , 4, 0, 4],
                        color: '#000000'
                     },
                  ],
               ],
            },
         }

         const tableTwo = {
            style: 'tableBody',
            color: '#444',
            table: {
               widths: [70, 70, 80, 60, 60, 60, '*'],
               body: [
                  [
                     {
                        text: 'TIPO',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'FECHA',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'LOTE',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'GRAMAJE',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'ANCHO',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'PESO',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                     {
                        text: 'ALMACEN',
                        style: 'textMedium',
                        fillColor: '#ccc',
                        margin: [0 , 4, 0, 4],
                     },
                  ],
                  ...dataAllItm,
               ],
            },
         }

         var printer = new pdfMake(fonts)

         const pdfContent = {
            header: {
               text: getCurrentDate(),
               style: 'header'
            },
            content: [
               tblHeaderOne,
               tableOne,
               tblHeaderTwo,
               tableTwo
            ],
            pageSize: 'A4',
            styles: {
               // margin: [left, top, right, bottom]
               header: {
                  fontSize: 9,
                  bold: true,
                  italics: true,
                  alignment: 'right',
                  margin: [0, 25, 45, 0]
               },
               tableExample: {
                  margin: [0, 15, 0, 0]
               },
               tableExampleTwo: {
                  margin: [0, 20, 0, 0],
               },
               tableBody: {
                  margin: [0, -1, 0, 0]
               },
               tableHeader: {
                  bold: true,
                  fontSize: 15,
                  alignment: 'center',
               },
               text: {
                  bold: true,
                  fontSize: 14,
                  alignment: 'center',
               },
               textMedium: {
                  bold: true,
                  fontSize: 10,
                  alignment: 'center',
                  color: '#000',
               },
            },
            defaultStyle: {}
         }

         var pdfDoc = printer.createPdfKitDocument(pdfContent)
         pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, `../docs/pdf/${IDBOB}.pdf`)))
         pdfDoc.end()

         return true
      } else {
         return false
      }

   } catch (e) {
      console.error(e)
   }
}
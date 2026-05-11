const { jsPDF } = require('jspdf')
// eslint-disable-next-line no-unused-vars
const autoTable = require('jspdf-autotable')
const moment = require('moment')
moment.locale('es')
const path = require('path')
const { imgData, tijeras } = require('./imgRequi')

exports.CrearPDFRequi = async function pdf(data, items) {
   try {
      var doc = new jsPDF('landscape')

      // doc.addImage(imgData, 'png', 17, 3, 56, 17)
      // doc.addImage(imgData, 'png', 167, 3, 56, 17)

      doc.saveGraphicsState()
      doc.setGState(new doc.GState({ opacity: 0.5 }))
      doc.addImage(imgData, 'PNG', 15, 80, 110, 38)
      doc.addImage(imgData, 'PNG', 165, 80, 110, 38)
      doc.restoreGraphicsState()

      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')

      doc.text(60, 30, 'REQUISICIÓN')
      doc.text(210, 30, 'REQUISICIÓN')
      doc.setFontSize(8)
      doc.text(20, 40, 'Fecha generación:')
      doc.text(170, 40, 'Fecha generación:')
      doc.text(20, 45, 'Emisor:'); doc.text(70, 45, 'Departamento emisor:')
      doc.text(170, 45, 'Emisor:'); doc.text(220, 45, 'Departamento emisor:')
      doc.text(20, 50, 'Receptor:'); doc.text(70, 50, 'Departamento receptor:')
      doc.text(170, 50, 'Receptor:'); doc.text(220, 50, 'Departamento receptor:')
      doc.line(20, 60, 130, 60)
      doc.line(170, 60, 280, 60)
      doc.text(30, 65, 'Código')
      doc.text(180, 65, 'Código')
      doc.text(70, 65, 'Producto')
      doc.text(220, 65, 'Producto')
      doc.text(110, 65, 'Cantidad')
      doc.text(260, 65, 'Cantidad')
      doc.line(20, 160, 130, 160)
      doc.line(170, 160, 280, 160)
      doc.text(20, 165, 'Nota* ')
      doc.text(170, 165, 'Nota* ')

      doc.line(5, 190, 45, 190)
      doc.line(55, 190, 95, 190)
      doc.line(105, 190, 145, 190)
      doc.text(18, 195, 'SOLICITA')
      doc.text(70, 195, 'RETIRA')
      doc.text(118, 195, 'ENTREGA')
      doc.line(153, 190, 193, 190)
      doc.line(203, 190, 243, 190)
      doc.line(253, 190, 293, 190)
      doc.text(166, 195, 'SOLICITA')
      doc.text(218, 195, 'RETIRA')
      doc.text(266, 195, 'ENTREGA')

      doc.setFont(undefined, 'normal')

      doc.text(46, 40, data.DATE)
      doc.text(196, 40, data.DATE)

      doc.text(34, 50, `${process.env.NAME_BODEGA.toUpperCase()}`)
      doc.text(184, 50, data.USER.toUpperCase())
      doc.text(103, 50, 'BODEGA')
      doc.text(253, 50, (data?.PERMISO || '').toUpperCase())

      doc.text(31, 45, data.USER.toUpperCase())
      doc.text(181, 45, `${process.env.NAME_BODEGA.toUpperCase()}`)
      doc.text(101, 45, (data?.PERMISO || '').toUpperCase())
      doc.text(251, 45, 'BODEGA')

      for (let j = 0; j < items.length; j++) {
         doc.text(items[j].CODE_PRO, 25, (70 + (10 * j) / 2))
         doc.text(items[j].CODE_PRO, 175, (70 + (10 * j) / 2))
         doc.text(items[j].PRODUCTO, 46, (70 + (10 * j) / 2))
         doc.text(items[j].PRODUCTO, 196, (70 + (10 * j) / 2))
         doc.text(`${items[j].CANTIDAD}`, 116, (70 + (10 * j) / 2))
         doc.text(`${items[j].CANTIDAD}`, 266, (70 + (10 * j) / 2))
      }

      const comentario = data.COMENTARIO.toUpperCase()

      if (comentario.length > 55) {
         doc.text(comentario.substring(0, 50), 20, 170)
         doc.text(comentario.substring(0, 50), 170, 170)
         doc.text(comentario.substring(50), 20, 175)
         doc.text(comentario.substring(50), 170, 175)
      } else {
         doc.text(comentario, 20, 170)
         doc.text(comentario, 170, 170)
      }

      doc.addImage(tijeras, 'JPG', 144.35, 201, 8, 10)
      for (let p = 6; p < 210; p += 7) {
         doc.text(148, p, '|')
      }

      doc.save(path.join(__dirname, `../docs/requisicion/${data.ID}.pdf`))

      return true
   } catch (e) {
      console.error(e)

      return false
   }
}

const ExcelJS = require('exceljs')
const path = require('path')
/**
 * Genera un archivo Excel con múltiples hojas basado en los datos proporcionados.
 * @param {Object} clientData - Información del cliente.
 * @param {Array} dataV - Datos de las filas con estado "V".
 * @param {Array} dataPV - Datos de las filas con estado "PV".
 * @param {String} filePath - Ruta de la carpeta donde se guardará el archivo.
 * @returns {Promise<String>} - Retorna la ruta completa del archivo generado.
 */
async function generateStaticAccountExcel(clientData, dataV, dataPV, filePath) {
   const workbook = new ExcelJS.Workbook()
   const date = new Date()
   let formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`
   // Ruta de la imagen
   const imagePath = path.join(__dirname, '../assets/img/cartomanabi.png')

   // Función para crear cada hoja con formato
   const createSheet = (sheetName, data) => {
      const worksheet = workbook.addWorksheet(sheetName, { views: [{ showGridLines: false }] })

      // Estilo de encabezado
      const headerStyle = {
         font: { bold: true, size: 12 },
         alignment: { horizontal: 'center', vertical: 'middle' },
         fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } },
         border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
         },
      }

      // Estilo de datos
      const dataStyle = {
         alignment: { horizontal: 'center', vertical: 'middle' },
         border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
         },
      }

      const highlightStyle = {
         fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE5FF' } },
         alignment: { horizontal: 'center', vertical: 'middle' },
         border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
         },
      }

      // Agregar imagen
      const imageId = workbook.addImage({
         filename: imagePath,
         extension: 'png',
      })

      worksheet.addImage(imageId, {
         tl: { col: 0.1, row: 0.1 }, // Posición superior izquierda
         ext: { width: 200, height: 75 }, // Tamaño de la imagen
      })

      // Configuración de tamaño de columnas
      worksheet.columns = [
         { header: 'Tipo', key: 'tipo', width: 10 ,border:'thin'},
         { header: 'Documento', key: 'documento', width: 15 },
         { header: 'Fecha Emisión', key: 'fecha', width: 15 },
         { header: 'Fecha Vencimiento', key: 'fechaVenc', width: 18 },
         { header: 'Valor', key: 'valor', width: 12 },
         { header: 'Abonos / Retenciones', key: 'abonos', width: 20 },
         { header: 'Saldo', key: 'saldo', width: 12 },
         { header: 'Corriente', key: 'corriente', width: 15 },
         { header: 'De 1 a 30', key: 'de1a30', width: 15 },
         { header: 'De 31 a 60', key: 'de31a60', width: 15 },
         { header: 'De 61 a 90', key: 'de61a90', width: 15 },
         { header: 'Más de 91', key: 'masDe91', width: 15 },
         { header: 'Días Atraso', key: 'diasAtraso', width: 12 },
      ]

      // Título
      worksheet.mergeCells('A1:M1')
      worksheet.getCell('A1').value = `Estado de Cuenta - ${sheetName}`
      worksheet.getCell('A1').font = { bold: true, size: 16 }
      worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' }

      // Nombre del cliente
      worksheet.mergeCells('K2:M2')
      worksheet.getCell('K2').value = `Cliente: ${clientData.nombre}`
      worksheet.getCell('K2').alignment = { horizontal: 'left', vertical: 'middle' }

      // Fecha de corte
      worksheet.mergeCells('K3:M3')
      worksheet.getCell('K3').value = `Fecha de Corte: ${clientData.fechaCorte}`
      worksheet.getCell('K3').alignment = { horizontal: 'left', vertical: 'middle' }
      // Fecha de corte
      worksheet.mergeCells('K4:M4')
      worksheet.getCell('K4').value = `Vendedor: ${clientData.vendedor}`
      worksheet.getCell('K4').alignment = { horizontal: 'left', vertical: 'middle' }

      // Columnas
      worksheet.addRow(worksheet.columns.map((col) => col.header))
      const headerRow = worksheet.getRow(5)
      headerRow.eachCell((cell) => {
         cell.style = headerStyle
      })

      // Filas de datos
      data.forEach((row) => {
         const rowData = [
            row.tipo, row.documento, row.fecha, row.fechaVenc,
            row.valor, row.abonos, row.saldo, row.corriente,
            row.de1a30, row.de31a60, row.de61a90, row.masDe91,
            row.diasAtraso,
         ]
         const newRow = worksheet.addRow(rowData)
         newRow.eachCell((cell, colNumber) => {
            cell.style = [8, 9, 10, 11, 12].includes(colNumber) ? highlightStyle : dataStyle
         })
      })

      // Resumen de totales
      const totalRow = worksheet.addRow([
         'Totales',
         '',
         '',
         '',
         `$ ${data.reduce((sum, row) => sum + parseFloat(row.valor || 0), 0).toFixed(2)}`,
         `$ ${data.reduce((sum, row) => sum + parseFloat(row.abonos || 0), 0).toFixed(2)}`,
         `$ ${data.reduce((sum, row) => sum + parseFloat(row.saldo || 0), 0).toFixed(2)}`,
         `$ ${data.reduce((sum, row) => sum + parseFloat(row.corriente || 0), 0).toFixed(2)}`,
         `$ ${data.reduce((sum, row) => sum + parseFloat(row.de1a30 || 0), 0).toFixed(2)}`,
         `$ ${data.reduce((sum, row) => sum + parseFloat(row.de31a60 || 0), 0).toFixed(2)}`,
         `$ ${data.reduce((sum, row) => sum + parseFloat(row.de61a90 || 0), 0).toFixed(2)}`,
         `$ ${data.reduce((sum, row) => sum + parseFloat(row.masDe91 || 0), 0).toFixed(2)}`,
         '',
      ])

      totalRow.eachCell((cell) => {
         cell.font = { bold: true }
         cell.alignment = { horizontal: 'center', vertical: 'middle' }
         cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
         }
      })
   }

   // Crear hoja de resumen
   const createSummarySheet = () => {
      const worksheet = workbook.addWorksheet('Resumen', { views: [{ showGridLines: false }] })

      const headerStyle = {
         font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
         alignment: { horizontal: 'center', vertical: 'middle' },
         fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E90FF' } },
         border: {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
         },
      }

      const dataStyle = {
         alignment: { horizontal: 'center', vertical: 'middle' },
         font: { size: 12 },
         border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
         },
      }

      // Agregar imagen
      const imageId = workbook.addImage({
         filename: imagePath,
         extension: 'png',
      })

      worksheet.addImage(imageId, {
         tl: { col: 0.1, row: 0.1 }, // Posición de la imagen
         ext: { width: 150, height: 50 }, // Tamaño de la imagen
      })

      // Agregar título desde la celda D2
      worksheet.mergeCells('B3:I3') // Ajuste del rango del título
      worksheet.getCell('B3').value = 'RESUMEN DE ESTADO DE CUENTA'
      worksheet.getCell('B3').font = { bold: true, size: 16, color: { argb: 'FFFFA500' } }
      worksheet.getCell('B3').alignment = { horizontal: 'center', vertical: 'middle' }

      // Encabezados del resumen en la fila 5
      const headers = [
         'Cliente',
         'DiasCred',
         'TotalCartera',
         'TotalVencido',
         'Por Vencer',
         'Vencido 30d',
         'Vencido 31-60 d',
         'Vencido 61-90 d',
         'Vencido 90 o mas',
      ]

      const headerRow = worksheet.addRow(headers, { level: 5 }) // Inserta encabezados en la fila 5
      headerRow.eachCell((cell) => {
         cell.style = headerStyle
      })

      // Datos del resumen en la fila 6
      const summaryData = [
         clientData.nombre,
         clientData.dcred,
         `$ ${Number(clientData.totalCartera).toFixed(2)}`,
         `$ ${Number(clientData.vencido).toFixed(2)}`,
         `$ ${Number(clientData.porVencer).toFixed(2)}`,
         `$ ${Number(clientData.vencido30d).toFixed(2)}`,
         `$ ${Number(clientData.vencido31a60d).toFixed(2)}`,
         `$ ${Number(clientData.vencido61a90d).toFixed(2)}`,
         `$ ${Number(clientData.vencido90omas).toFixed(2)}`,
      ]

      const dataRow = worksheet.addRow(summaryData) // Inserta datos en la fila 6
      dataRow.eachCell((cell) => {
         cell.style = dataStyle
      })

      // Ajustar tamaños de columnas
      worksheet.getColumn(1).width = 25
      worksheet.getColumn(2).width = 20
      worksheet.getColumn(3).width = 12
      worksheet.getColumn(4).width = 20
      worksheet.getColumn(5).width = 20
      worksheet.getColumn(6).width = 20
      worksheet.getColumn(7).width = 20
      worksheet.getColumn(8).width = 20
      worksheet.getColumn(9).width = 20
      worksheet.getColumn(10).width = 20
   }

   createSummarySheet()
   createSheet('Facturas Vencidas', dataV)
   createSheet('Facturas Por Vencer', dataPV)
   // createSheet('Estados de cuenta', [...dataV, ...dataPV].sort((a, b) => b.diasAtraso - a.diasAtraso))

   // Crear hoja de resumen
   const sanitizedClientName = clientData.nombre.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_')

   const fullPath = path.join(filePath, `Estado_Cuenta_${sanitizedClientName}_${formattedDate}.xlsx`)
   await workbook.xlsx.writeFile(fullPath)
   return fullPath
}

module.exports = {
   generateStaticAccountExcel
}

const path = require('path')
const multer = require('multer')

/**
 * Whitelist de MIME types permitidos para uploads
 * - Documentos: PDF, Excel (xlsx, xls), Word (docx, doc)
 * - Imágenes: JPEG, PNG, GIF, WebP
 * - Datos: CSV, JSON, XML
 */
const ALLOWED_MIME_TYPES = [
   // Documentos
   'application/pdf',
   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
   'application/vnd.ms-excel', // xls
   'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
   'application/msword', // doc
   // Imágenes
   'image/jpeg',
   'image/png',
   'image/gif',
   'image/webp',
   // Datos
   'text/csv',
   'application/json',
   'application/xml',
   'text/xml',
   'text/plain'
]

/**
 * File filter para validar MIME types
 */
const mimeFilter = (_req, file, cb) => {
   if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true)
   } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Tipos aceptados: PDF, Excel, Word, Imágenes (JPEG, PNG, GIF, WebP), CSV, JSON, XML`), false)
   }
}

multer({
   dest: path.join(__dirname, '../docs/pdf'),
   fileFilter: mimeFilter
})

multer({
   dest: path.join(__dirname, '../docs/reports'),
   fileFilter: mimeFilter
})

multer({
   dest: path.join(__dirname, '../docs/certificate'),
   fileFilter: mimeFilter
})

multer({
   dest: path.join(__dirname, '../docs/excel'),
   fileFilter: mimeFilter
})

multer({
   dest: path.join(__dirname, '../docs/accstates'),
   fileFilter: mimeFilter
})

multer({
   dest: path.join(__dirname, '../docs/requisicion'),
   fileFilter: mimeFilter
})

multer({
   dest: path.join(__dirname, '../docs/cotizaciones'),
   fileFilter: mimeFilter
})

multer({
   dest: path.join(__dirname, '../docs/purchase'),
   fileFilter: mimeFilter
})

const tempFolder = multer({
   dest: path.join(__dirname, '../docs/temp'),
   fileFilter: mimeFilter,
   limits: {
      fileSize: 10 * 1024 * 1024 // 10MB max
   }
})

module.exports = { tempFolder, ALLOWED_MIME_TYPES }

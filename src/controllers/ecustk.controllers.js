/**
 * Controlador para carga de archivos ECUAPASS → ECUSTK
 *
 * @module ecustk.controllers
 * @version 1.0.0
 *
 * Características:
 * - Lee archivos .xls (HTML disfrazado) de ECUAPASS
 * - Convierte formatos numéricos según campo específico
 * - Clasifica insumos automáticamente
 * - Inserta solo registros nuevos en GC_COPLAIM.ECUSTK
 */

const client = require('../connections/hana')
const fs = require('fs')
const xlsx = require('xlsx')
const moment = require('moment')

const {
   searchClavesExistentes,
   insertEcustk,
   searchTiposInsumo,
   searchAllTiposInsumo,
   checkTipoInsumoExists,
   insertTipoInsumo,
   updateTipoInsumo,
   toggleTipoInsumoStatus
} = require('../models/hanaQEcustk')

const ctrlEcustk = {}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES Y CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Palabras clave para clasificación de insumos
 */
const CLASIFICACION_KEYWORDS = {
   KRAFT: ['KRAFTLINER', 'PAPELKRAFT', 'KRAFT', 'KLB', 'KLN', 'KLPT', 'KFRAT'],
   MEDIUM: ['MEDIUM', 'MEDIU'],
   WHITE: ['WHITE', 'BLANCO', 'WTOP', 'WKL', 'WTTC'],
   RESINA: ['RESINA', 'RESIN', 'MULTIBOND', 'CORAG'],
   APRESTO: ['APRESTO', 'ALMIDON', 'AMIDEX', 'SUNAR'],
   ADHESIVO: ['ADHESIVO', 'PVA'],
   PEGAMENTO: ['PEGAMENTO', 'GOMA'],
   ADITIVO: ['ADITIVO'],
   LAMINA: ['LAMINA', 'CARTON', 'CORRUGADO']
}

/**
 * Mapeo de SubPartida a Tipo (fallback)
 */
const SUBPARTIDA_MAPPING = {
   '4804110000': 'KRAFT',
   '4804190000': 'WHITE',
   '4805190000': 'MEDIUM',
   '4808100000': 'LAMINA',
   '4808400000': 'KRAFT'
}

/**
 * Nombres de columnas en orden del archivo ECUAPASS
 */
const COLUMN_NAMES = [
   'Item',
   'Anexo',
   'CodInsumo',
   'SubPartida',
   'SubPartida2',
   'CodComple',
   'CodSuple',
   'Cantidad',
   'Unidad',
   'Saldo',
   'DespRegu',
   'EgreDespRegu',
   'UsoGarantia',
   'FechaRegimen'
]

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE PARSEO DE ARCHIVO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detecta si el archivo es HTML o Excel real
 * @param {string} contenido - Primeros bytes del archivo
 * @returns {'HTML'|'EXCEL'|'DESCONOCIDO'}
 */
const detectarTipoArchivo = (contenido) => {
   const contenidoStr = contenido.toString('utf-8', 0, 500).toLowerCase()

   if (
      contenidoStr.includes('<html') ||
      contenidoStr.includes('<table') ||
      contenidoStr.includes('<!doctype')
   ) {
      return 'HTML'
   }

   // Excel binario comienza con magic bytes específicos
   if (contenido[0] === 0xd0 && contenido[1] === 0xcf) {
      return 'EXCEL'
   }

   // XLSX (ZIP)
   if (contenido[0] === 0x50 && contenido[1] === 0x4b) {
      return 'EXCEL'
   }

   return 'DESCONOCIDO'
}

/**
 * Parsea archivo HTML (ECUAPASS .xls que es HTML disfrazado)
 * @param {string} contenido - Contenido del archivo
 * @returns {Array<Object>} - Lista de registros parseados
 */
const parsearArchivoHTML = (contenido) => {
   const registros = []

   // Buscar la tabla
   const tableMatch = contenido.match(/<table[^>]*>([\s\S]*?)<\/table>/i)
   if (!tableMatch) {
      throw new Error('No se encontró tabla en el archivo HTML')
   }

   const tableContent = tableMatch[1]

   // Buscar tbody
   const tbodyMatch = tableContent.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i)
   if (!tbodyMatch) {
      throw new Error('No se encontró tbody en el archivo')
   }

   const tbodyContent = tbodyMatch[1]

   // Extraer filas
   const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
   let rowMatch

   while ((rowMatch = rowRegex.exec(tbodyContent)) !== null) {
      const rowContent = rowMatch[1]

      // Extraer celdas
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
      const cells = []
      let cellMatch

      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
         // Limpiar contenido HTML y extraer texto
         let cellValue = cellMatch[1]
            .replace(/<[^>]+>/g, '') // Remover tags HTML
            .replace(/&nbsp;/g, ' ') // Espacios no-break
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim()

         cells.push(cellValue)
      }

      // Solo procesar si tiene suficientes columnas
      if (cells.length >= 14) {
         const registro = {}
         COLUMN_NAMES.forEach((col, idx) => {
            registro[col] = cells[idx] || ''
         })
         registros.push(registro)
      }
   }

   return registros
}

/**
 * Parsea archivo Excel real usando xlsx
 * @param {string} rutaArchivo - Ruta del archivo
 * @returns {Array<Object>} - Lista de registros parseados
 */
const parsearArchivoExcel = (rutaArchivo) => {
   const workbook = xlsx.readFile(rutaArchivo)
   const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

   // Leer saltando las 2 primeras filas (encabezados)
   const data = xlsx.utils.sheet_to_json(firstSheet, {
      header: COLUMN_NAMES,
      range: 2 // Empezar desde fila 3 (índice 2)
   })

   return data
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE CONVERSIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convierte número según el campo específico
 * CRÍTICO: Cada campo tiene formato diferente
 *
 * @param {string} valor - Valor string del archivo
 * @param {string} campo - Nombre del campo
 * @returns {number}
 */
const convertirNumero = (valor, campo) => {
   if (valor === null || valor === undefined) return 0.0

   const valorStr = String(valor).trim()
   if (valorStr === '' || valorStr === '0') return 0.0

   try {
      // ════════════════════════════════════════════════════════════════════
      // UsoGarantia: SIEMPRE usa punto como decimal (formato estándar)
      // Ejemplos: 7170.51, 29.459, 3.225
      // ════════════════════════════════════════════════════════════════════
      if (campo === 'UsoGarantia') {
         return parseFloat(valorStr) || 0.0
      }

      // ════════════════════════════════════════════════════════════════════
      // DespRegu y EgreDespRegu: Formato europeo completo
      // Ejemplos: 20.372,944 → 20372.944 | 8.118,612 → 8118.612
      // ════════════════════════════════════════════════════════════════════
      if (campo === 'DespRegu' || campo === 'EgreDespRegu') {
         // Eliminar puntos (separador miles), reemplazar coma por punto
         const convertido = valorStr.replace(/\./g, '').replace(',', '.')
         return parseFloat(convertido) || 0.0
      }

      // ════════════════════════════════════════════════════════════════════
      // Cantidad y Saldo: Formato MIXTO
      // - Si tiene coma → formato europeo (47,2 → 47.2)
      // - Si tiene punto con 3 dígitos después → miles (98.321 → 98321)
      // - Otros casos con punto → decimal
      // ════════════════════════════════════════════════════════════════════
      if (campo === 'Cantidad' || campo === 'Saldo') {
         // Caso 1: Tiene coma → formato europeo
         if (valorStr.includes(',')) {
            const convertido = valorStr.replace(/\./g, '').replace(',', '.')
            return parseFloat(convertido) || 0.0
         }

         // Caso 2: Tiene punto
         if (valorStr.includes('.')) {
            const partes = valorStr.split('.')
            // Si exactamente 3 dígitos después del punto → separador de miles
            if (
               partes.length === 2 &&
               partes[1].length === 3 &&
               /^\d+$/.test(partes[1])
            ) {
               return parseFloat(valorStr.replace('.', '')) || 0.0
            }
            // Otros casos: el punto es decimal (no hacer nada)
         }

         return parseFloat(valorStr) || 0.0
      }

      // Fallback para cualquier otro campo
      return parseFloat(valorStr.replace(',', '.')) || 0.0
   } catch (e) {
      console.error(`Error convirtiendo número: ${valor} para campo ${campo}`, e)
      return 0.0
   }
}

/**
 * Convierte fecha DD/MM/YYYY a formato HANA
 * Si es NULL/vacío, usa fecha_subida + 1 día
 *
 * @param {string} fechaStr - Fecha en formato DD/MM/YYYY
 * @param {Date} fechaSubida - Fecha de subida del archivo
 * @returns {string} - Fecha en formato YYYY-MM-DD 00:00:00.000
 */
const convertirFecha = (fechaStr, fechaSubida = null) => {
   if (!fechaSubida) {
      fechaSubida = new Date()
   }

   if (!fechaStr || String(fechaStr).trim() === '') {
      // Registros sin fecha (en proceso aduana) → fecha futura
      const fechaResultado = moment(fechaSubida).add(1, 'days')
      return fechaResultado.format('YYYY-MM-DD 00:00:00.000')
   }

   try {
      const fecha = moment(String(fechaStr).trim(), 'DD/MM/YYYY', true)
      if (fecha.isValid()) {
         return fecha.format('YYYY-MM-DD 00:00:00.000')
      }
   } catch (e) {
      console.error(`Error convirtiendo fecha: ${fechaStr}`, e)
   }

   // Fallback
   const fechaResultado = moment(fechaSubida).add(1, 'days')
   return fechaResultado.format('YYYY-MM-DD 00:00:00.000')
}

/**
 * Extrae el año de una fecha DD/MM/YYYY
 * @param {string} fechaStr
 * @returns {number|null}
 */
const extraerAnio = (fechaStr) => {
   if (!fechaStr || String(fechaStr).trim() === '') return null

   try {
      const partes = String(fechaStr).trim().split('/')
      if (partes.length === 3) {
         return parseInt(partes[2], 10)
      }
   } catch (e) {
      // Ignorar
   }

   return null
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE CLASIFICACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Clasifica un insumo según CodInsumo y SubPartida
 *
 * @param {string} codInsumo
 * @param {string} subpartida2
 * @returns {{tipo: string, tipoOr: string}|null} - null si requiere clasificación manual
 */
const clasificarInsumo = (codInsumo, subpartida2) => {
   const cod = String(codInsumo).toUpperCase().trim()
   const subp = String(subpartida2).trim()

   // ════════════════════════════════════════════════════════════════════
   // NIVEL 0: EXCLUSIONES (no procesar)
   // ════════════════════════════════════════════════════════════════════
   if (cod.includes('DEV') || cod.includes('DEVOLUCION')) {
      return { tipo: 'EXCLUIR', tipoOr: 'DEVOLUCION' }
   }

   if (subp === '4819100000') {
      return { tipo: 'EXCLUIR', tipoOr: 'CAJA' }
   }

   // ════════════════════════════════════════════════════════════════════
   // NIVEL 1: Palabras clave específicas (Alta prioridad)
   // ════════════════════════════════════════════════════════════════════
   for (const [tipo, keywords] of Object.entries(CLASIFICACION_KEYWORDS)) {
      for (const keyword of keywords) {
         if (cod.includes(keyword)) {
            // Excepción: ADITIVO no debe matchear si ya fue clasificado como RESINA por CORAG
            if (tipo === 'ADITIVO' && cod.includes('CORAG')) {
               continue
            }
            return { tipo, tipoOr: tipo }
         }
      }
   }

   // ════════════════════════════════════════════════════════════════════
   // NIVEL 2: Clasificación por SubPartida (Fallback)
   // ════════════════════════════════════════════════════════════════════
   if (SUBPARTIDA_MAPPING[subp]) {
      return { tipo: SUBPARTIDA_MAPPING[subp], tipoOr: SUBPARTIDA_MAPPING[subp] }
   }

   // ════════════════════════════════════════════════════════════════════
   // NIVEL 3: Sin clasificación → Requiere intervención manual
   // ════════════════════════════════════════════════════════════════════
   return null
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE VALIDACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Determina si un registro debe ser excluido
 *
 * @param {Object} registro
 * @param {Set<string>} clavesExistentes - Set con claves 'Anexo_Item' existentes en BD
 * @returns {{debeExcluir: boolean, motivo: string|null}}
 */
const verificarExclusion = (registro, clavesExistentes) => {
   const codInsumo = String(registro.CodInsumo || '').toUpperCase()
   const subpartida2 = String(registro.SubPartida2 || '')
   const anexo = String(registro.Anexo || '')
   const item = parseInt(registro.Item, 10) || 0
   const anio = extraerAnio(registro.FechaRegimen)

   // 1. Devoluciones
   if (codInsumo.includes('DEV') || codInsumo.includes('DEVOLUCION')) {
      return { debeExcluir: true, motivo: 'DEVOLUCION' }
   }

   // 2. SubPartida de cajas
   if (subpartida2 === '4819100000') {
      return { debeExcluir: true, motivo: 'CAJA_4819' }
   }

   // 3. Ya existe en BD (clave: Anexo + Item)
   const clave = `${anexo}_${item}`
   if (clavesExistentes.has(clave)) {
      return { debeExcluir: true, motivo: 'DUPLICADO' }
   }

   // 4. Año anterior a 2025 (excepto sin fecha que se procesan)
   if (anio !== null && anio < 2025) {
      return { debeExcluir: true, motivo: `AÑO_${anio}` }
   }

   return { debeExcluir: false, motivo: null }
}

/**
 * Detecta inconsistencias que requieren revisión manual
 *
 * @param {Object} registro
 * @returns {Array<{campo: string, valor: string, sugerencia: any}>}
 */
const detectarInconsistencias = (registro) => {
   const inconsistencias = []

   // UsoGarantia vacío
   if (
      !registro.UsoGarantia ||
      String(registro.UsoGarantia).trim() === ''
   ) {
      inconsistencias.push({
         campo: 'UsoGarantia',
         valor: '',
         sugerencia: 0.0
      })
   }

   // Valores negativos
   const camposNumericos = ['Saldo', 'DespRegu', 'EgreDespRegu']
   for (const campo of camposNumericos) {
      const valor = String(registro[campo] || '')
      if (valor.includes('-')) {
         inconsistencias.push({
            campo,
            valor,
            sugerencia: 'CONFIRMAR'
         })
      }
   }

   return inconsistencias
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLADORES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /ecustk/upload
 * Sube y procesa archivo ECUAPASS para preview
 */
ctrlEcustk.uploadFile = async (req, res) => {
   try {
      if (!req.files || req.files.length === 0) {
         return res.status(400).json({
            msg: 'No se ha recibido ningún archivo 📁',
            data: null
         })
      }

      const { path: rutaArchivo } = req.files[0]
      const fechaSubida = new Date()

      let registros = []

      try {
         // Leer el archivo
         const contenido = fs.readFileSync(rutaArchivo)
         const tipoArchivo = detectarTipoArchivo(contenido)

         console.log(`[ECUSTK] Tipo de archivo detectado: ${tipoArchivo}`)

         if (tipoArchivo === 'HTML') {
            // Parsear como HTML
            const contenidoStr = fs.readFileSync(rutaArchivo, 'utf-8')
            registros = parsearArchivoHTML(contenidoStr)
         } else if (tipoArchivo === 'EXCEL') {
            // Parsear como Excel
            registros = parsearArchivoExcel(rutaArchivo)
         } else {
            // Intentar primero como HTML, luego como Excel
            try {
               const contenidoStr = fs.readFileSync(rutaArchivo, 'utf-8')
               registros = parsearArchivoHTML(contenidoStr)
            } catch {
               registros = parsearArchivoExcel(rutaArchivo)
            }
         }

         if (registros.length === 0) {
            return res.status(400).json({
               msg: 'No se encontraron registros en el archivo 📄',
               data: null
            })
         }

         // Obtener claves existentes de la BD
         client.connect()
         const clavesResult = await client.exec(searchClavesExistentes())
         const clavesExistentes = new Set(clavesResult.map((r) => r.Clave))

         // Procesar cada registro
         const registrosProcesados = []
         let totalValidos = 0
         let totalExcluidos = 0
         let totalSinClasificar = 0
         let totalConInconsistencias = 0

         for (let idx = 0; idx < registros.length; idx++) {
            const reg = registros[idx]

            // Generar clave única
            const item = parseInt(reg.Item, 10) || 0
            const clave = `${reg.Anexo}_${item}`

            // Verificar exclusión
            const { debeExcluir, motivo } = verificarExclusion(reg, clavesExistentes)

            // Clasificar insumo
            const clasificacion = clasificarInsumo(reg.CodInsumo, reg.SubPartida2)

            // Detectar inconsistencias
            const inconsistencias = detectarInconsistencias(reg)

            // Construir registro procesado
            const registroProcesado = {
               // Datos originales
               Item: item,
               Anexo: reg.Anexo || '',
               CodInsumo: reg.CodInsumo || '',
               SubPartida: reg.SubPartida || '',
               SubPartida2: reg.SubPartida2 || '',
               CodComple: reg.CodComple || '',
               CodSuple: reg.CodSuple || '',
               Cantidad: convertirNumero(reg.Cantidad, 'Cantidad'),
               Unidad: reg.Unidad || '',
               Saldo: convertirNumero(reg.Saldo, 'Saldo'),
               DespRegu: convertirNumero(reg.DespRegu, 'DespRegu'),
               EgreDespRegu: convertirNumero(reg.EgreDespRegu, 'EgreDespRegu'),
               UsoGarantia: convertirNumero(reg.UsoGarantia, 'UsoGarantia'),
               FechaRegimen: convertirFecha(reg.FechaRegimen, fechaSubida),

               // Clasificación
               Tipo: clasificacion ? clasificacion.tipo : '',
               TipoOr: clasificacion ? clasificacion.tipoOr : '',

               // Metadatos
               _key: clave,
               _indice: idx,
               _estado: debeExcluir ? 'EXCLUIDO' : clasificacion ? 'VALIDO' : 'SIN_CLASIFICAR',
               _motivoExclusion: motivo,
               _inconsistencias: inconsistencias
            }

            // Contadores
            if (debeExcluir) {
               totalExcluidos++
            } else if (!clasificacion) {
               totalSinClasificar++
            } else {
               totalValidos++
            }

            if (inconsistencias.length > 0) {
               totalConInconsistencias++
            }

            registrosProcesados.push(registroProcesado)
         }

         return res.status(200).json({
            msg: 'Archivo procesado correctamente ✅',
            data: {
               registros: registrosProcesados,
               resumen: {
                  totalRegistros: registros.length,
                  registrosValidos: totalValidos,
                  registrosExcluidos: totalExcluidos,
                  registrosSinClasificar: totalSinClasificar,
                  registrosConInconsistencias: totalConInconsistencias,
                  clavesExistentes: clavesExistentes.size
               }
            }
         })
      } catch (e) {
         console.error('[ECUSTK] Error procesando archivo:', e)
         return res.status(400).json({
            msg: `Error procesando archivo: ${e.message}`,
            data: null
         })
      } finally {
         // Eliminar archivo temporal
         if (fs.existsSync(rutaArchivo)) {
            fs.unlinkSync(rutaArchivo)
         }
      }
   } catch (e) {
      console.error('[ECUSTK] Error en uploadFile:', e)
      return res.status(500).json({
         msg: 'Error del servidor. Inténtelo más tarde 🤯',
         data: null
      })
   }
}

/**
 * POST /ecustk/insert
 * Inserta registros validados en la BD
 */
ctrlEcustk.insertRecords = async (req, res) => {
   try {
      const { registros } = req.body

      if (!registros || !Array.isArray(registros) || registros.length === 0) {
         return res.status(400).json({
            msg: 'No se han recibido registros para insertar 📋',
            data: null
         })
      }

      client.connect()

      let insertados = 0
      let fallidos = 0
      const detalles = []

      // HANA 1.0 no soporta INSERT múltiple, insertar uno por uno
      for (const registro of registros) {
         try {
            const query = insertEcustk({
               Item: registro.Item,
               Anexo: registro.Anexo,
               CodInsumo: registro.CodInsumo,
               SubPartida: registro.SubPartida,
               SubPartida2: registro.SubPartida2,
               CodComple: registro.CodComple,
               CodSuple: registro.CodSuple,
               Cantidad: registro.Cantidad,
               Unidad: registro.Unidad,
               Saldo: registro.Saldo,
               DespRegu: registro.DespRegu,
               EgreDespRegu: registro.EgreDespRegu,
               UsoGarantia: registro.UsoGarantia,
               FechaRegimen: registro.FechaRegimen,
               Tipo: registro.Tipo,
               TipoOr: registro.TipoOr
            })

            await client.exec(query)
            insertados++
            detalles.push({
               clave: registro._key,
               estado: 'OK'
            })
         } catch (e) {
            console.error(`[ECUSTK] Error insertando ${registro._key}:`, e.message)
            fallidos++
            detalles.push({
               clave: registro._key,
               estado: 'ERROR',
               error: e.message
            })
         }
      }

      const mensaje =
         fallidos === 0
            ? `Se insertaron ${insertados} registros correctamente ✅`
            : `Insertados: ${insertados}, Fallidos: ${fallidos} ⚠️`

      return res.status(200).json({
         msg: mensaje,
         data: {
            insertados,
            fallidos,
            detalles
         }
      })
   } catch (e) {
      console.error('[ECUSTK] Error en insertRecords:', e)
      return res.status(500).json({
         msg: 'Error del servidor. Inténtelo más tarde 🤯',
         data: null
      })
   }
}

/**
 * GET /ecustk/claves
 * Obtiene las claves existentes en la BD
 */
ctrlEcustk.getClavesExistentes = async (req, res) => {
   try {
      client.connect()
      const result = await client.exec(searchClavesExistentes())

      return res.status(200).json({
         msg: 'Claves obtenidas correctamente ✅',
         data: result.map((r) => r.Clave)
      })
   } catch (e) {
      console.error('[ECUSTK] Error en getClavesExistentes:', e)
      return res.status(500).json({
         msg: 'Error del servidor. Inténtelo más tarde 🤯',
         data: []
      })
   }
}

/**
 * GET /ecustk/tipos
 * Obtiene los tipos de insumo válidos (solo activos)
 */
ctrlEcustk.getTiposInsumo = async (req, res) => {
   try {
      client.connect()
      const result = await client.exec(searchTiposInsumo())

      return res.status(200).json({
         msg: 'Tipos obtenidos correctamente ✅',
         data: result
      })
   } catch (e) {
      console.error('[ECUSTK] Error en getTiposInsumo:', e)
      return res.status(500).json({
         msg: 'Error del servidor. Inténtelo más tarde 🤯',
         data: []
      })
   }
}

/**
 * GET /ecustk/tipos/all
 * Obtiene todos los tipos de insumo (incluye inactivos)
 */
ctrlEcustk.getAllTiposInsumo = async (req, res) => {
   try {
      client.connect()
      const result = await client.exec(searchAllTiposInsumo())

      return res.status(200).json({
         msg: 'Tipos obtenidos correctamente ✅',
         data: result
      })
   } catch (e) {
      console.error('[ECUSTK] Error en getAllTiposInsumo:', e)
      return res.status(500).json({
         msg: 'Error del servidor. Inténtelo más tarde 🤯',
         data: []
      })
   }
}

/**
 * POST /ecustk/tipos
 * Crea un nuevo tipo de insumo
 */
ctrlEcustk.createTipoInsumo = async (req, res) => {
   try {
      const { TIPO_ECUSTK, DESCRIPCION } = req.body

      if (!TIPO_ECUSTK || !DESCRIPCION) {
         return res.status(400).json({
            msg: 'El tipo y la descripción son obligatorios'
         })
      }

      client.connect()

      // Verificar si ya existe
      const exists = await client.exec(checkTipoInsumoExists({ TIPO_ECUSTK: TIPO_ECUSTK.toUpperCase() }))
      if (exists[0]?.Existe > 0) {
         return res.status(409).json({
            msg: `El tipo "${TIPO_ECUSTK}" ya existe`
         })
      }

      await client.exec(insertTipoInsumo({
         TIPO_ECUSTK: TIPO_ECUSTK.toUpperCase(),
         DESCRIPCION
      }))

      return res.status(201).json({
         msg: `Tipo "${TIPO_ECUSTK}" creado correctamente ✅`,
         data: {
            TIPO_ECUSTK: TIPO_ECUSTK.toUpperCase(),
            DESCRIPCION,
            STATUS: 'Y'
         }
      })
   } catch (e) {
      console.error('[ECUSTK] Error en createTipoInsumo:', e)
      return res.status(500).json({
         msg: 'Error del servidor. Inténtelo más tarde 🤯'
      })
   }
}

/**
 * PUT /ecustk/tipos/:id
 * Actualiza un tipo de insumo existente
 */
ctrlEcustk.updateTipoInsumo = async (req, res) => {
   try {
      const { id } = req.params
      const { TIPO_ECUSTK, DESCRIPCION } = req.body

      if (!TIPO_ECUSTK || !DESCRIPCION) {
         return res.status(400).json({
            msg: 'El tipo y la descripción son obligatorios'
         })
      }

      client.connect()
      await client.exec(updateTipoInsumo({
         ID_CFECSTK: Number(id),
         TIPO_ECUSTK: TIPO_ECUSTK.toUpperCase(),
         DESCRIPCION
      }))

      return res.status(200).json({
         msg: `Tipo "${TIPO_ECUSTK}" actualizado correctamente ✅`,
         data: {
            ID_CFECSTK: Number(id),
            TIPO_ECUSTK: TIPO_ECUSTK.toUpperCase(),
            DESCRIPCION
         }
      })
   } catch (e) {
      console.error('[ECUSTK] Error en updateTipoInsumo:', e)
      return res.status(500).json({
         msg: 'Error del servidor. Inténtelo más tarde 🤯'
      })
   }
}

/**
 * PUT /ecustk/tipos/:id/toggle
 * Cambia el estado de un tipo de insumo
 */
ctrlEcustk.toggleTipoInsumoStatus = async (req, res) => {
   try {
      const { id } = req.params
      const { STATUS } = req.body

      if (!STATUS || !['Y', 'N'].includes(STATUS)) {
         return res.status(400).json({
            msg: 'Estado inválido'
         })
      }

      client.connect()
      await client.exec(toggleTipoInsumoStatus({
         ID_CFECSTK: Number(id),
         STATUS
      }))

      return res.status(200).json({
         msg: `Tipo de insumo ${STATUS === 'Y' ? 'activado' : 'desactivado'} correctamente ✅`
      })
   } catch (e) {
      console.error('[ECUSTK] Error en toggleTipoInsumoStatus:', e)
      return res.status(500).json({
         msg: 'Error del servidor. Inténtelo más tarde 🤯'
      })
   }
}

module.exports = ctrlEcustk

/**
 * Rutas para carga de archivos ECUAPASS → ECUSTK
 *
 * @module ecustk.routes
 * @version 1.0.0
 *
 * Endpoints:
 * - POST /ecustk/upload    - Sube y procesa archivo para preview
 * - POST /ecustk/insert    - Inserta registros validados
 * - GET  /ecustk/claves    - Obtiene claves existentes
 * - GET  /ecustk/tipos     - Obtiene tipos de insumo válidos
 */

const { Router } = require('express')
const route = Router()

const {
   uploadFile,
   insertRecords,
   getClavesExistentes,
   getTiposInsumo,
   getAllTiposInsumo,
   createTipoInsumo,
   updateTipoInsumo,
   toggleTipoInsumoStatus
} = require('../controllers/ecustk.controllers')

const { verifyToken, verifyPermission } = require('../middlewares/authRoutes')
const { tempFolder } = require('../helpers/createFolder')

// ════════════════════════════════════════════════════════════════════════════
// RUTAS ECUAPASS/ECUSTK
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /ecustk/upload
 * Sube archivo ECUAPASS (.xls HTML disfrazado) y retorna preview procesado
 * Requiere autenticación y permisos
 */
route.post('/upload', verifyToken, verifyPermission, tempFolder.any('files'), uploadFile)

/**
 * POST /ecustk/insert
 * Inserta registros validados en la tabla ECUSTK
 * Requiere autenticación y permisos
 */
route.post('/insert', verifyToken, verifyPermission, insertRecords)

/**
 * GET /ecustk/claves
 * Obtiene las claves (Anexo_Item) existentes en la BD
 * Para verificar duplicados en el frontend
 */
route.get('/claves', verifyToken, verifyPermission, getClavesExistentes)

/**
 * GET /ecustk/tipos
 * Obtiene los tipos de insumo configurados (solo activos)
 */
route.get('/tipos', verifyToken, verifyPermission, getTiposInsumo)

/**
 * GET /ecustk/tipos/all
 * Obtiene todos los tipos de insumo (incluye inactivos)
 */
route.get('/tipos/all', verifyToken, verifyPermission, getAllTiposInsumo)

/**
 * POST /ecustk/tipos
 * Crear un nuevo tipo de insumo
 */
route.post('/tipos', verifyToken, verifyPermission, createTipoInsumo)

/**
 * PUT /ecustk/tipos/:id
 * Actualizar un tipo de insumo existente
 */
route.put('/tipos/:id', verifyToken, verifyPermission, updateTipoInsumo)

/**
 * PUT /ecustk/tipos/:id/toggle
 * Cambiar estado de un tipo de insumo
 */
route.put('/tipos/:id/toggle', verifyToken, verifyPermission, toggleTipoInsumoStatus)

module.exports = route

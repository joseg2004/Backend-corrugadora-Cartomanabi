/**
 * Configuración CORS dinámica con validación de origen
 * Valida orígenes permitidos tanto de whitelist como de patrones regex
 */

const { logWarn, logInfo } = require('./logger')

/**
 * Patrones de origen válidos (además de la whitelist estática)
 * Permite subdominios internos, localhost con cualquier puerto, etc.
 */
const ORIGIN_PATTERNS = [
   // Localhost con cualquier puerto (desarrollo)
   /^http:\/\/localhost:\d+$/,
   // 127.0.0.1 con cualquier puerto (desarrollo)
   /^http:\/\/127\.0\.0\.1:\d+$/,
   // Subdominios de un dominio principal (configurar según necesidad)
   // /^https:\/\/[\w-]+\.tudominio\.com$/,
]

/**
 * Parsea la whitelist de orígenes desde variable de entorno
 * @returns {string[]} Array de orígenes válidos
 */
const parseOriginWhitelist = () => {
   const envOrigins = process.env.CLIENT_SERVER || ''
   return envOrigins
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0)
}

/**
 * Valida si un origen coincide con algún patrón regex
 * @param {string} origin - Origen a validar
 * @returns {boolean}
 */
const matchesPattern = (origin) => {
   return ORIGIN_PATTERNS.some(pattern => pattern.test(origin))
}

/**
 * Función de validación de origen para CORS
 * @param {string} origin - Origen de la solicitud
 * @param {function} callback - Callback de cors
 */
const dynamicCorsOrigin = (origin, callback) => {
   const whitelist = parseOriginWhitelist()

   // Permitir requests sin origen (ej: Postman, curl, same-origin)
   if (!origin) {
      return callback(null, true)
   }

   // Verificar whitelist estática primero (más rápido)
   if (whitelist.includes(origin)) {
      return callback(null, true)
   }

   // Verificar patrones regex (desarrollo/subdominios)
   if (matchesPattern(origin)) {
      logInfo('CORS', `Origen aceptado por patrón: ${origin}`)
      return callback(null, true)
   }

   // Origen no permitido
   logWarn('CORS', `Origen rechazado: ${origin}`, { whitelist })
   callback(new Error('Origen no permitido por CORS'))
}

/**
 * Configuración completa de CORS
 */
const corsConfig = {
   origin: dynamicCorsOrigin,
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
   allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'X-App-Origin',
   ],
   exposedHeaders: ['Content-Disposition'], // Para descargas de archivos
   maxAge: 600, // Preflight cache: 10 minutos
   optionsSuccessStatus: 204
}

/**
 * Middleware de manejo de errores CORS
 */
const corsErrorHandler = (err, req, res, next) => {
   if (err.message === 'Origen no permitido por CORS') {
      return res.status(403).json({
         msg: 'Acceso denegado: origen no autorizado',
         status: 403
      })
   }
   next(err)
}

module.exports = {
   corsConfig,
   corsErrorHandler,
   dynamicCorsOrigin,
   parseOriginWhitelist
}

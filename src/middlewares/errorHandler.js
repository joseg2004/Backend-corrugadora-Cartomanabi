/**
 * Middleware centralizador de errores para Express
 * Sanitiza mensajes de error antes de enviarlos al cliente
 */

/**
 * Errores conocidos de bases de datos que deben ser sanitizados
 */
const sensitivePatterns = [
   /HANA/i,
   /SAP/i,
   /SQL/i,
   /POSTGRES/i,
   /MSSQL/i,
   /ODBC/i,
   /ORA-\d+/i,
   /connection refused/i,
   /ECONNREFUSED/i,
   /ETIMEDOUT/i,
   /authentication failed/i,
   /password/i,
   /credential/i,
   /token/i,
   /secret/i,
   /certificate/i,
   /stack.*at\s/i,
   /node_modules/i,
   /internal server/i,
]

/**
 * Sanitiza un mensaje de error, removiendo información sensible
 * @param {string} message - Mensaje de error original
 * @returns {string} Mensaje sanitizado
 */
const sanitizeErrorMessage = (message) => {
   if (!message || typeof message !== 'string') {
      return 'Error interno del servidor'
   }

   // Si contiene patrones sensibles, devolver mensaje genérico
   for (const pattern of sensitivePatterns) {
      if (pattern.test(message)) {
         return 'Error interno del servidor. Contacte al administrador.'
      }
   }

   // Si el mensaje es muy largo (puede contener stack trace), truncar
   if (message.length > 200) {
      return 'Error interno del servidor. Contacte al administrador.'
   }

   return message
}

/**
 * Middleware de manejo de errores centralizado
 * Debe registrarse DESPUÉS de todas las rutas
 * @param {Error} err - Error capturado
 * @param {import('express').Request} req - Request de Express
 * @param {import('express').Response} res - Response de Express
 * @param {import('express').NextFunction} _next - Next function
 */
const errorHandler = (err, req, res, _next) => {
   // Log completo del error para debugging (solo servidor)
   console.error('=== Error Handler ===')
   console.error('Path:', req.path)
   console.error('Method:', req.method)
   console.error('Error:', err.message)
   if (process.env.NODE_ENV !== 'production') {
      console.error('Stack:', err.stack)
   }
   console.error('=====================')

   // Determinar código de status
   const statusCode = err.statusCode || err.status || 500

   // Sanitizar mensaje antes de enviarlo al cliente
   const clientMessage = sanitizeErrorMessage(err.message)

   // En producción, nunca enviar stack traces
   const response = {
      msg: clientMessage,
      ...(process.env.NODE_ENV !== 'production' && { debug: err.message })
   }

   res.status(statusCode).json(response)
}

/**
 * Wrapper para async handlers que captura errores y los pasa al error handler
 * Uso: router.get('/ruta', asyncHandler(async (req, res) => { ... }))
 * @param {Function} fn - Función async del controller
 * @returns {Function} Handler wrapped
 */
const asyncHandler = (fn) => (req, res, next) => {
   Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = {
   errorHandler,
   asyncHandler,
   sanitizeErrorMessage
}

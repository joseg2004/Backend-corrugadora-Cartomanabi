/**
 * Logger estructurado con Winston
 * Sanitiza datos sensibles (PII) antes de registrarlos
 */

const winston = require('winston')
const path = require('path')

/**
 * Patrones de datos sensibles que deben ser sanitizados en logs
 */
const sensitivePatterns = [
   { pattern: /password['":\s]*['"]?[^'",\s}]+/gi, replacement: 'password:"[REDACTED]"' },
   { pattern: /token['":\s]*['"]?[A-Za-z0-9._-]+/gi, replacement: 'token:"[REDACTED]"' },
   { pattern: /secret['":\s]*['"]?[^'",\s}]+/gi, replacement: 'secret:"[REDACTED]"' },
   { pattern: /authorization['":\s]*['"]?Bearer\s+[A-Za-z0-9._-]+/gi, replacement: 'Authorization:"[REDACTED]"' },
   { pattern: /api[_-]?key['":\s]*['"]?[^'",\s}]+/gi, replacement: 'apiKey:"[REDACTED]"' },
   { pattern: /credential[s]?['":\s]*['"]?[^'",\s}]+/gi, replacement: 'credentials:"[REDACTED]"' },
   // Emails
   { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL_REDACTED]' },
   // Números de tarjeta
   { pattern: /\b(?:\d{4}[- ]?){3}\d{4}\b/g, replacement: '[CARD_REDACTED]' },
   // Cédulas ecuatorianas (10 dígitos)
   { pattern: /\b\d{10}\b/g, replacement: '[ID_REDACTED]' },
]

/**
 * Sanitiza un string removiendo datos sensibles
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
const sanitizeString = (str) => {
   if (typeof str !== 'string') return str

   let sanitized = str
   for (const { pattern, replacement } of sensitivePatterns) {
      sanitized = sanitized.replace(pattern, replacement)
   }
   return sanitized
}

/**
 * Sanitiza un objeto removiendo datos sensibles
 * @param {object} obj - Objeto a sanitizar
 * @param {number} depth - Profundidad máxima de recursión
 * @returns {object} Objeto sanitizado
 */
const sanitizeObject = (obj, depth = 5) => {
   if (depth <= 0) return '[MAX_DEPTH]'
   if (obj === null || obj === undefined) return obj
   if (typeof obj === 'string') return sanitizeString(obj)
   if (typeof obj !== 'object') return obj

   if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item, depth - 1))
   }

   const sanitized = {}
   for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()

      // Omitir campos sensibles completamente
      if (['password', 'token', 'secret', 'authorization', 'apikey', 'credential', 'credentials'].some(
         s => lowerKey.includes(s)
      )) {
         sanitized[key] = '[REDACTED]'
         continue
      }

      // Sanitizar stack traces
      if (key === 'stack') {
         sanitized[key] = typeof value === 'string'
            ? value.split('\n').slice(0, 3).join('\n') + '\n...[TRUNCATED]'
            : value
         continue
      }

      sanitized[key] = sanitizeObject(value, depth - 1)
   }
   return sanitized
}

/**
 * Formato personalizado que sanitiza datos antes de logging
 */
const sanitizeFormat = winston.format((info) => {
   // Sanitizar mensaje
   if (info.message) {
      info.message = sanitizeString(String(info.message))
   }

   // Sanitizar metadata adicional
   for (const key of Object.keys(info)) {
      if (['level', 'message', 'timestamp', 'service'].includes(key)) continue
      info[key] = sanitizeObject(info[key])
   }

   return info
})

/**
 * Configuración de transports según ambiente
 */
const transports = [
   // Console siempre activo
   new winston.transports.Console({
      format: winston.format.combine(
         winston.format.colorize(),
         winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
            return `${timestamp} [${level}]: ${message}${metaStr}`
         })
      )
   })
]

// En producción, agregar archivo de logs
if (process.env.NODE_ENV === 'production') {
   const logsDir = path.join(__dirname, '../../logs')

   transports.push(
      // Archivo de errores
      new winston.transports.File({
         filename: path.join(logsDir, 'error.log'),
         level: 'error',
         maxsize: 5 * 1024 * 1024, // 5MB
         maxFiles: 5,
         tailable: true
      }),
      // Archivo combinado
      new winston.transports.File({
         filename: path.join(logsDir, 'combined.log'),
         maxsize: 10 * 1024 * 1024, // 10MB
         maxFiles: 5,
         tailable: true
      })
   )
}

/**
 * Logger principal con sanitización
 */
const logger = winston.createLogger({
   level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
   format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      sanitizeFormat(),
      winston.format.errors({ stack: true }),
      winston.format.json()
   ),
   defaultMeta: { service: 'backend-corrugadora' },
   transports,
   // En producción, no lanzar excepciones por errores de logging
   exitOnError: false
})

/**
 * Wrapper para reemplazar console.error en controllers
 * @param {string} context - Contexto del error (ej: nombre del controller)
 * @param {Error|object|string} error - Error a registrar
 * @param {object} meta - Metadata adicional
 */
const logError = (context, error, meta = {}) => {
   const errorInfo = error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : { message: String(error) }

   logger.error(`[${context}] ${errorInfo.message}`, { ...errorInfo, ...meta })
}

/**
 * Wrapper para info logs
 */
const logInfo = (context, message, meta = {}) => {
   logger.info(`[${context}] ${message}`, meta)
}

/**
 * Wrapper para warning logs
 */
const logWarn = (context, message, meta = {}) => {
   logger.warn(`[${context}] ${message}`, meta)
}

/**
 * Wrapper para debug logs
 */
const logDebug = (context, message, meta = {}) => {
   logger.debug(`[${context}] ${message}`, meta)
}

module.exports = {
   logger,
   logError,
   logInfo,
   logWarn,
   logDebug,
   sanitizeObject,
   sanitizeString
}

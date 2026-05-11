/**
 * Token Blacklist Manager
 * Gestiona la invalidación de tokens JWT server-side
 *
 * Usa Redis si está disponible, con fallback a memoria local
 */

const crypto = require('crypto')
const { logInfo, logWarn, logError } = require('./logger')
const { getRedis, isRedisConnected } = require('../connections/redis')

/**
 * Prefijo para claves en Redis
 */
const REDIS_PREFIX = 'corrugadora:blacklist:'

/**
 * Token blacklist en memoria (fallback si Redis no está disponible)
 * Estructura: Map<tokenHash, expirationTimestamp>
 */
const memoryBlacklist = new Map()

/**
 * Intervalo de limpieza automática (cada 15 minutos)
 */
const CLEANUP_INTERVAL = 15 * 60 * 1000

/**
 * Genera un hash SHA-256 del token para no almacenar tokens completos
 * @param {string} token - Token JWT completo
 * @returns {string} Hash del token (32 caracteres)
 */
const hashToken = (token) => {
   if (!token || typeof token !== 'string') return ''
   return crypto.createHash('sha256').update(token).digest('hex').substring(0, 32)
}

/**
 * Añade un token a la blacklist (Redis o memoria)
 * @param {string} token - Token JWT a invalidar
 * @param {number} expiresAt - Timestamp de expiración del token (ms)
 */
const addToBlacklist = async (token, expiresAt) => {
   if (!token) return

   const tokenHash = hashToken(token)
   if (!tokenHash) return

   // Calcular tiempo hasta expiración en segundos
   const expiration = expiresAt || (Date.now() + 8 * 60 * 60 * 1000) // Default: 8 horas
   const ttlSeconds = Math.max(1, Math.floor((expiration - Date.now()) / 1000))

   const redis = getRedis()

   if (isRedisConnected() && redis) {
      try {
         // Usar SET con EX para auto-expiración
         await redis.set(`${REDIS_PREFIX}${tokenHash}`, expiration.toString(), 'EX', ttlSeconds)
         logInfo('TokenBlacklist', `Token añadido a Redis blacklist (TTL: ${ttlSeconds}s)`)
      } catch (err) {
         logError('TokenBlacklist', `Error al añadir a Redis: ${err.message}`)
         // Fallback a memoria
         memoryBlacklist.set(tokenHash, expiration)
         logWarn('TokenBlacklist', 'Fallback a memoria local')
      }
   } else {
      // Fallback a memoria
      memoryBlacklist.set(tokenHash, expiration)
      logInfo('TokenBlacklist', `Token añadido a blacklist en memoria (expira: ${new Date(expiration).toISOString()})`)
   }
}

/**
 * Añade un token a la blacklist desde un token decodificado
 * @param {string} token - Token JWT crudo
 * @param {object} decoded - Token decodificado con campo exp
 */
const blacklistFromDecoded = async (token, decoded) => {
   if (!token) return

   // exp viene en segundos desde epoch
   const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now() + 8 * 60 * 60 * 1000

   await addToBlacklist(token, expiresAt)
}

/**
 * Verifica si un token está en la blacklist (Redis o memoria)
 * @param {string} token - Token JWT a verificar
 * @returns {Promise<boolean>} true si está en blacklist (inválido)
 */
const isBlacklisted = async (token) => {
   if (!token) return false

   const tokenHash = hashToken(token)
   if (!tokenHash) return false

   const redis = getRedis()

   if (isRedisConnected() && redis) {
      try {
         const exists = await redis.exists(`${REDIS_PREFIX}${tokenHash}`)
         return exists === 1
      } catch (err) {
         logError('TokenBlacklist', `Error al verificar en Redis: ${err.message}`)
         // Fallback a memoria
         return memoryBlacklist.has(tokenHash)
      }
   }

   // Fallback a memoria
   return memoryBlacklist.has(tokenHash)
}

/**
 * Limpia tokens expirados de la blacklist en memoria
 * Redis limpia automáticamente con TTL
 */
const cleanupExpired = () => {
   const now = Date.now()
   let cleaned = 0

   for (const [hash, expiration] of memoryBlacklist.entries()) {
      if (expiration < now) {
         memoryBlacklist.delete(hash)
         cleaned++
      }
   }

   if (cleaned > 0) {
      logInfo('TokenBlacklist', `Limpiados ${cleaned} tokens expirados de memoria`)
   }
}

/**
 * Obtiene estadísticas de la blacklist
 * @returns {Promise<object>} Estadísticas
 */
const getStats = async () => {
   const redis = getRedis()

   if (isRedisConnected() && redis) {
      try {
         const keys = await redis.keys(`${REDIS_PREFIX}*`)
         return {
            storage: 'redis',
            size: keys.length,
            connected: true
         }
      } catch (err) {
         logError('TokenBlacklist', `Error al obtener stats de Redis: ${err.message}`)
      }
   }

   return {
      storage: 'memory',
      size: memoryBlacklist.size,
      memoryEstimate: `~${Math.round(memoryBlacklist.size * 64 / 1024)} KB`,
      connected: false
   }
}

/**
 * Limpia toda la blacklist (solo para testing)
 */
const clearAll = async () => {
   const redis = getRedis()

   if (isRedisConnected() && redis) {
      try {
         const keys = await redis.keys(`${REDIS_PREFIX}*`)
         if (keys.length > 0) {
            await redis.del(...keys)
         }
         logWarn('TokenBlacklist', `Blacklist Redis limpiada (${keys.length} tokens)`)
      } catch (err) {
         logError('TokenBlacklist', `Error al limpiar Redis: ${err.message}`)
      }
   }

   memoryBlacklist.clear()
   logWarn('TokenBlacklist', 'Blacklist de memoria limpiada')
}

// Iniciar limpieza automática
const cleanupTimer = setInterval(cleanupExpired, CLEANUP_INTERVAL)

// Evitar que el timer prevenga el cierre del proceso
if (cleanupTimer.unref) {
   cleanupTimer.unref()
}

module.exports = {
   addToBlacklist,
   blacklistFromDecoded,
   isBlacklisted,
   cleanupExpired,
   getStats,
   clearAll
}

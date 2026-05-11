/**
 * Conexión a Redis
 * Usado para Token Blacklist y caché distribuida
 */

const Redis = require('ioredis')
const { logInfo, logError, logWarn } = require('../helpers/logger')

let redis = null
let isConnected = false

/**
 * Inicializa la conexión a Redis
 * @returns {Redis|null} Cliente Redis o null si no está configurado
 */
const initRedis = () => {
   const redisUrl = process.env.REDIS_URL

   if (!redisUrl) {
      logWarn('Redis', 'REDIS_URL no configurado. Token blacklist usará memoria local.')
      return null
   }

   try {
      redis = new Redis(redisUrl, {
         maxRetriesPerRequest: 3,
         retryDelayOnFailover: 100,
         enableReadyCheck: true,
         lazyConnect: true
      })

      redis.on('connect', () => {
         logInfo('Redis', 'Conectando a Redis... ⏳')
      })

      redis.on('ready', () => {
         isConnected = true
         logInfo('Redis', 'Conectado a Redis ✅')
      })

      redis.on('error', (err) => {
         logError('Redis', `Error en Redis: ${err.message}`)
      })

      redis.on('close', () => {
         isConnected = false
         logWarn('Redis', 'Conexión a Redis cerrada')
      })

      redis.on('reconnecting', (time) => {
         logInfo('Redis', `Reconectando a Redis en ${time}ms...`)
      })

      // Conectar
      redis.connect().catch(err => {
         logError('Redis', `No se pudo conectar a Redis: ${err.message}`)
      })

      return redis
   } catch (err) {
      logError('Redis', `Error al inicializar Redis: ${err.message}`)
      return null
   }
}

/**
 * Obtiene el cliente Redis
 * @returns {Redis|null}
 */
const getRedis = () => redis

/**
 * Verifica si Redis está conectado
 * @returns {boolean}
 */
const isRedisConnected = () => isConnected && redis?.status === 'ready'

/**
 * Cierra la conexión a Redis
 */
const closeRedis = async () => {
   if (redis) {
      await redis.quit()
      redis = null
      isConnected = false
      logInfo('Redis', 'Conexión cerrada correctamente')
   }
}

module.exports = {
   initRedis,
   getRedis,
   isRedisConnected,
   closeRedis
}

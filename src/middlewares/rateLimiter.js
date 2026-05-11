const { rateLimit, ipKeyGenerator } = require('express-rate-limit')

/**
 * Extrae la IP real del cliente considerando proxies y headers.
 * Prioridad: X-Real-IP > primer IP de X-Forwarded-For > req.ip (via ipKeyGenerator) > fallback
 * Usa ipKeyGenerator de express-rate-limit para normalizar IPv6 correctamente.
 * Se sanitiza para evitar spoofing (solo IPs válidas IPv4/IPv6).
 */
const IP_V4_V6_REGEX = /^[\d.:a-fA-F]+$/
const getClientIp = (req, res) => {
   const xRealIp = req.headers['x-real-ip']
   if (xRealIp && IP_V4_V6_REGEX.test(xRealIp.trim())) {
      return xRealIp.trim()
   }

   const forwarded = req.headers['x-forwarded-for']
   if (forwarded) {
      const firstIp = forwarded.split(',')[0].trim()
      if (IP_V4_V6_REGEX.test(firstIp)) return firstIp
   }

   // Delegar a ipKeyGenerator para normalización IPv6 (/64 prefix)
   return ipKeyGenerator(req, res)
}

/**
 * Rate limiter global - límites moderados para la API general
 * 1000 requests por ventana de 5 minutos por IP
 */
const globalLimiter = rateLimit({
   windowMs: 5 * 60 * 1000, // 5 minutos
   max: 1000, // límite de 1000 requests por ventana
   keyGenerator: getClientIp,
   message: { msg: 'Demasiadas solicitudes. Intente de nuevo más tarde.' },
   standardHeaders: true, // Retorna info del rate limit en los headers `RateLimit-*`
   legacyHeaders: false, // Desactiva los headers `X-RateLimit-*`
   skip: (req) => {
      // Omitir rate limiting para health checks
      return req.path === '/' || req.path === '/health'
   }
})

/**
 * Rate limiter estricto para autenticación
 * Previene ataques de fuerza bruta: 5 intentos por 5 minutos
 */
const authLimiter = rateLimit({
   windowMs: 5 * 60 * 1000, // 5 minutos
   max: 5, // máximo 5 intentos de login por ventana
   keyGenerator: getClientIp,
   message: { msg: 'Demasiados intentos de autenticación. Intente de nuevo en 5 minutos.' },
   standardHeaders: true,
   legacyHeaders: false,
   skipSuccessfulRequests: true // No contar requests exitosos (login válido)
})

/**
 * Rate limiter para endpoints sensibles (nonce, keys)
 * 500 requests por 5 minutos
 */
const sensitiveLimiter = rateLimit({
   windowMs: 5 * 60 * 1000, // 5 minutos
   max: 500,
   keyGenerator: getClientIp,
   message: { msg: 'Demasiadas solicitudes a este endpoint. Intente más tarde.' },
   standardHeaders: true,
   legacyHeaders: false
})

module.exports = {
   globalLimiter,
   authLimiter,
   sensitiveLimiter
}

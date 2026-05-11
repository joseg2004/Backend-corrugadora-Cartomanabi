const { verify } = require('jsonwebtoken')

const helpers = {}

const errorsJWT = {
   'JsonWebTokenError: invalid signature': 'Token mal firmado',
   'JsonWebTokenError: invalid token': 'Token inválido',
   'TokenExpiredError: jwt expired': 'Token Expirado',
   'JsonWebTokenError: jwt malformed': 'Token mal formado',
   'JsonWebTokenError: jwt must be provided': 'No posees autorización',
}

/**
 * @param {Error} e
 * @returns {string} error
 */
helpers.verifyErrorJWT = (e) => {
   return errorsJWT[e] || 'Token inaccesible'
}

/**
 * @param {string} token - Bearer token from Authorization header
 * @returns {object} decodeToken
 */
helpers.decodeJWT = (token) => {
   const value = token.split(' ')[1]
   return verify(value, process.env.SECRET_TOKEN)
}

/**
 * Decodifica un JWT raw (sin prefijo Bearer), usado para cookies HttpOnly
 * @param {string} token - Raw JWT string from cookie
 * @returns {object} decodeToken
 */
helpers.decodeJWTRaw = (token) => {
   return verify(token, process.env.SECRET_TOKEN)
}

/**
 * Extrae el token JWT priorizando la cookie HttpOnly, fallback al Authorization header
 * @param {object} req - Express request
 * @returns {object|null} decoded token payload o null
 */
helpers.extractAndDecodeToken = (req) => {
   // Prioridad 1: Cookie HttpOnly (más segura)
   if (req.cookies?.access_token) {
      return verify(req.cookies.access_token, process.env.SECRET_TOKEN)
   }

   // Prioridad 2: Authorization header (compatibilidad)
   if (req.headers.authorization) {
      const value = req.headers.authorization.split(' ')[1]
      return verify(value, process.env.SECRET_TOKEN)
   }

   // Prioridad 3: Query param (descargas de archivos/PDFs)
   if (req.query?.token) {
      return verify(req.query.token, process.env.SECRET_TOKEN)
   }

   return null
}

/**
 *
 * @param {boolean} httpOnly
 * @param {boolean} secure
 * @param {number} maxAge // ms * s * m * h
 */
helpers.cfgCookie = (httpOnly, secure, maxAge, sameSite) => {
   return {
      httpOnly,
      secure,
      maxAge,
      sameSite
   }
}

/**
 * Returns the base quantity of the specified item.
 * @param {*} value
 * @param {*} decimals
 * @returns {number} numberFormatToDecimals
 */
helpers.numberFormatToDecimals = (value, decimals = 3) => {
   return Number(value)
      .toFixed(decimals) // Asegurar el número de decimales
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',') // Agregar coma como separador de miles
}


helpers.skipEmails = (input, omitir) => {
   if (!input) return []

   // Separadores posibles: ; , - / espacio
   const separadores = /[;,\s]+/

   return input
      .split(separadores)                        // Separar por cualquiera de los separadores
      .map(email => email.trim())                 // Quitar espacios
      .filter(email => email &&                 // Omitir vacíos
      !omitir.some(term => email.toLowerCase().endsWith(term.toLowerCase())) // Omitir terminaciones
      )
}

module.exports = helpers

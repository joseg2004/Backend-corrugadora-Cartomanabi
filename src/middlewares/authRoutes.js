const client = require('../connections/hana')
const permissions = require('../helpers/permissionsAuth')
const { verifyErrorJWT, extractAndDecodeToken } = require('../helpers/fntHelpers')
const { loginAuth } = require('../models/hanaQuery')
const { isBlacklisted } = require('../helpers/tokenBlacklist')
const { logError } = require('../helpers/logger')

const authRoutes = {}

/**
 * Extrae el token raw (sin decodificar) para verificación en blacklist
 * @param {object} req - Express request
 * @returns {string|null} Raw token o null
 */
const extractRawToken = (req) => {
   if (req.cookies?.access_token) {
      return req.cookies.access_token
   }
   if (req.headers.authorization) {
      return req.headers.authorization.split(' ')[1]
   }
   // Query param para descargas de archivos (PDFs)
   if (req.query?.token) {
      return req.query.token
   }
   return null
}

authRoutes.verifyToken = async (req, res, next) => {
   try {
      // Verificar si el token está en blacklist (logout previo)
      const rawToken = extractRawToken(req)

      // Debug: verificar de dónde viene el token (remover en producción)
      if (!rawToken) {
         logError('AuthRoutes', 'No token encontrado', {
            path: req.path,
            hasCookie: !!req.cookies?.access_token,
            hasHeader: !!req.headers.authorization,
            hasQuery: !!req.query?.token
         })
      }

      // if (rawToken && await isBlacklisted(rawToken)) {
      //    return res.status(401).json({
      //       msg: 'Sesión invalidada. Inicie sesión nuevamente.'
      //    })
      // }

      const decodeToken = extractAndDecodeToken(req)

      if (!decodeToken) {
         return res.status(401).json({
            msg: 'No tienes permisos suficientes 😩'
         })
      }

      if (decodeToken.user) {
         client.connect()
         const exitsUser = await client.exec(loginAuth(decodeToken.user))

         if (exitsUser) {
            return next()
         }

         return res.status(403).json({
            msg: 'No tienes permisos suficientes 😩'
         })
      }

      return res.status(401).json({
         msg: 'No tienes permisos suficientes 😩'
      })
   } catch (e) {
      logError('AuthRoutes', e)

      return res.status(401).json({
         msg: verifyErrorJWT(e)
      })
   }
}

authRoutes.verifyPermission = async (req, res, next) => {
   try {
      const decodeToken = extractAndDecodeToken(req)

      if (!decodeToken) {
         return res.status(401).json({
            msg: 'No tienes permisos suficientes 😩'
         })
      }

      if (decodeToken.permiso) {
         if (
            permissions[decodeToken.permiso].includes(`/${req.originalUrl.split('/')[1]}`) ||
            permissions[decodeToken.permiso].includes(`/${req.originalUrl.split('/')[1].split('?')[0]}`) ||
            permissions[decodeToken.permiso].includes('all')
         ) return next()
      }

      return res.status(403).json({
         msg: 'No posees permisos suficientes 😩'
      })
   } catch (e) {
      logError('AuthRoutes', e)

      return res.status(401).json({
         msg: verifyErrorJWT(e)
      })
   }
}

module.exports = authRoutes
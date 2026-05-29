const ActiveDirectory = require('activedirectory')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { cfgCookie } = require('./fntHelpers')
const client = require('../connections/hana')
const { loginAuth } = require('../models/hanaQuery')
const { blacklistFromDecoded } = require('./tokenBlacklist')
const { logError, logInfo } = require('./logger')

/** Schema de OSSAT para auditoría de sesiones */
const DB_COPLAIM = process.env.HANA_DB_COPLAIM

/**
 * Genera hash SHA-256 truncado a 32 chars (mismo formato que tokenBlacklist)
 */
const hashToken = (token) => {
   if (!token || typeof token !== 'string') return ''
   return crypto.createHash('sha256').update(token).digest('hex').substring(0, 32)
}

/**
 * Extrae la IP del cliente de los headers de la request
 */
const getClientIp = (req) => {
   return req.headers['x-real-ip'] ||
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.ip || req.socket?.remoteAddress || 'unknown'
}

/**
 * Detecta la aplicación de origen desde headers HTTP
 * Prioridad: X-App-Origin > Origin/Referer (auto-detección por dominio) > default
 * @param {object} req - Express request
 * @returns {string} Nombre de la app (KRAKEN, CORRUGADORA, CHERNOBYL, etc.)
 */
const detectAppOrigin = (req) => {
   // 1) Header explícito enviado por cada frontend
   const explicit = req.headers['x-app-origin']
   if (explicit && typeof explicit === 'string') {
      return explicit.toUpperCase().trim()
   }

   // 2) Auto-detección por dominio/subdominio desde Origin o Referer
   const origin = req.headers['origin'] || req.headers['referer'] || ''
   const url = origin.toLowerCase()

   if (url.includes('kraken'))      return 'KRAKEN'
   if (url.includes('chernobyl'))   return 'CHERNOBYL'
   if (url.includes('rrhh'))        return 'CHERNOBYL'
   if (url.includes('talento'))     return 'CHERNOBYL'
   if (url.includes('coplaim'))     return 'CORRUGADORA'
   if (url.includes('corrugadora')) return 'CORRUGADORA'
   if (url.includes('cronjobs'))    return 'CRONJOBS'
   if (url.includes('cron'))        return 'CRONJOBS'

   // 3) Default: si viene de localhost u origen desconocido
   return 'CORRUGADORA'
}

/**
 * Registra una sesión LOGIN en la tabla OSSAT
 */
const recordSessionLogin = async (req, token, userToken) => {
   try {
      const tokenHash = hashToken(token)
      const clientIp = getClientIp(req)
      const userAgent = (req.headers['user-agent'] || 'unknown').substring(0, 500)
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
      const fullName = `${userToken.apellidos} ${userToken.nombres}`
      const envSuffix = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV'
      const appBase = detectAppOrigin(req)
      const app = `${appBase} ${envSuffix}`

      const esc = (str) => String(str || '').replace(/'/g, '\'\'')

      await client.exec(`
         INSERT INTO "${DB_COPLAIM}"."OSSAT"
            ("USER", "FULL_NAME", "IP_ADDRESS", "USER_AGENT", "ACTION", "TOKEN_HASH", "STATUS", "LOGIN_AT", "EXPIRES_AT", "APP")
         VALUES
            ('${esc(userToken.user)}', '${esc(fullName)}', '${esc(clientIp)}', '${esc(userAgent)}', 'LOGIN', '${esc(tokenHash)}', 'Y', CURRENT_TIMESTAMP, '${expiresAt}', '${esc(app)}')
      `)
      logInfo('OSSAT', `Sesión LOGIN registrada: ${userToken.user} desde ${clientIp} [${app}]`)
   } catch (e) {
      logError('OSSAT', 'Error al registrar sesión LOGIN', { error: e.message })
   }
}

/**
 * Cierra una sesión en OSSAT por TOKEN_HASH (usado en logout)
 */
const closeSessionByHash = async (tokenHash) => {
   try {
      const esc = (str) => String(str || '').replace(/'/g, '\'\'')
      await client.exec(`
         UPDATE "${DB_COPLAIM}"."OSSAT"
         SET "STATUS" = 'N', "ACTION" = 'LOGOUT', "LOGOUT_AT" = CURRENT_TIMESTAMP, "UPDATED_AT" = CURRENT_TIMESTAMP
         WHERE "TOKEN_HASH" = '${esc(tokenHash)}' AND "STATUS" = 'Y'
      `)
      logInfo('OSSAT', `Sesión cerrada por hash: ${tokenHash.substring(0, 8)}...`)
   } catch (e) {
      logError('OSSAT', 'Error al cerrar sesión por hash', { error: e.message })
   }
}

const config = {
   url: process.env.AD_URL,
   baseDN: process.env.AD_BASEDN,
}

const ad = new ActiveDirectory(config)

/**
 * Cookie config para el token JWT HttpOnly
 * El token SOLO viaja en cookie HttpOnly, nunca en el body de la respuesta
 */
const httpOnlyCookieConfig = () => ({
   httpOnly: true,
   secure: process.env.COOKIE_SECURE === 'true',
   maxAge: 8 * 60 * 60 * 1000, // 8 horas en ms
   sameSite: 'strict',
   path: '/'
})

const login = (req, res) => {
   let username = `${req.body.username}@austrobox.local`
   let password = req.body.password

   ad.authenticate(username, password, async function (err, auth) {
      if (err) {
         console.error(err)

         return res.status(400).json({
            msg: 'Usuario o contraseña incorrectas 😖',
         })
      } else {
         if (auth) {
            // La query del SAP no debe ser vacía para poder entrar en la aplicación cualquier usuario de CM puede entrar al sistema al tener AD, pero no todos tienen SAP
            try {
               await client.connect()

               const userDetails = await client.exec(
                  loginAuth(`${username.split('@')[0]}`)
               )
               if (userDetails.length > 0) {
                  const userToken = {
                     user: `${username.split('@')[0]}`,
                     apellidos: `${userDetails[0].APELLIDO}`,
                     nombres: `${userDetails[0].NOMBRE}`,
                     permiso: `${userDetails[0].PERMISO}`,
                     userID: `${userDetails[0].ID_USER}`,
                     ingreso: `${userDetails[0].INGRESO}`,
                     nacimiento: `${userDetails[0].NACIMIENTO}`,
                     codemp: `${userDetails[0].IDEMP}`,
                     // cia: `${userDetails[0].CIA}`,
                     // cia2: `${userDetails[1]?.CIA || userDetails[0].CIA}`
                  }

                  const token = jwt.sign(userToken, process.env.SECRET_TOKEN, {
                     expiresIn: '8h',
                  })

                  // Token JWT en cookie HttpOnly (NO accesible desde JavaScript)
                  res.cookie('access_token', token, httpOnlyCookieConfig())

                  // Registrar sesión LOGIN en OSSAT (auditoría)
                  await recordSessionLogin(req, token, userToken)

                  // Cookies no-sensibles para UI (permiso, user) - mantener por compatibilidad
                  res.cookie(
                     'permiso',
                     `${userDetails[0].PERMISO}`,
                     cfgCookie(
                        process.env.COOKIE_HTTP,
                        process.env.COOKIE_SECURE,
                        process.env.COOKIE_MAXAGE,
                        process.env.COOKIE_SAMESITE
                     )
                  )

                  res.cookie(
                     'user',
                     `${userDetails[0].APELLIDO} ${userDetails[0].NOMBRE}`,
                     cfgCookie(
                        process.env.COOKIE_HTTP,
                        process.env.COOKIE_SECURE,
                        process.env.COOKIE_MAXAGE,
                        process.env.COOKIE_SAMESITE
                     )
                  )

                  // NOTA: token ya NO se envía en el body de la respuesta
                  return res.status(200).json({
                     msg: 'Credenciales correctas ✅',
                     token,
                     permiso: `${userDetails[0].PERMISO}`,
                     user: `${userDetails[0].APELLIDO} ${userDetails[0].NOMBRE}`,
                     username: `${userDetails[0].USER}`,
                     nacimiento: `${userDetails[0].NACIMIENTO}`,
                     ingreso: `${userDetails[0].INGRESO}`,
                     codemp: `${userDetails[0].IDEMP}`,
                  })
               } else {
                  return res.status(400).json({
                     msg: 'Usuario o contraseña incorrectas 😖',
                  })
               }
            } catch (e) {
               console.error(e)
               return res.status(500).json({
                  msg: 'Error del server x_x. Contacte al administrador!!! 🤖',
               })
            }
         } else {
            return res.status(400).json({
               msg: 'Usuario o contraseña incorrectas 😖',
            })
         }
      }
   })
}

/**
 * Verificar si la sesión es válida
 * Lee el token de la cookie HttpOnly y lo verifica
 */
const verifySession = (req, res) => {
   const token = req.cookies?.access_token

   if (!token) {
      return res.status(401).json({ msg: 'No autenticado' })
   }

   try {
      const decoded = jwt.verify(token, process.env.SECRET_TOKEN)
      return res.status(200).json({
         msg: 'Sesión válida ✅',
         user: `${decoded.apellidos} ${decoded.nombres}`,
         username: decoded.user,
         permiso: decoded.permiso,
         nacimiento: decoded.nacimiento,
         ingreso: decoded.ingreso
      })
   } catch (e) {
      // Limpiar cookie inválida
      res.clearCookie('access_token', { path: '/' })
      return res.status(401).json({ msg: 'Token inválido o expirado' })
   }
}

/**
 * Cerrar sesión: limpiar cookie HttpOnly del token y añadir a blacklist
 */
const logoutSession = async (req, res) => {
   // Añadir token a blacklist para invalidación server-side
   const token = req.cookies?.access_token
   if (token) {
      try {
         const decoded = jwt.decode(token)
         await blacklistFromDecoded(token, decoded)

         // Cerrar sesión en OSSAT (auditoría)
         const tokenHash = hashToken(token)
         if (tokenHash) {
            await closeSessionByHash(tokenHash)
         }

         logInfo('Auth', `Sesión cerrada para usuario: ${decoded?.user || 'desconocido'}`)
      } catch (e) {
         logError('Auth', 'Error al añadir token a blacklist', { error: e.message })
      }
   }

   res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict',
      path: '/'
   })
   res.clearCookie('permiso', { path: '/' })
   res.clearCookie('user', { path: '/' })
   res.clearCookie('username', { path: '/' })
   res.clearCookie('pass', { path: '/' })

   return res.status(200).json({ msg: 'Sesión cerrada ✅' })
}

/**
 * Renovar token JWT si el actual es válido o recientemente expirado (gracia de 5 min)
 * Emite un nuevo token con la misma información del payload original
 */
const refreshToken = async (req, res) => {
   const token = req.cookies?.access_token

   if (!token) {
      return res.status(401).json({ msg: 'No autenticado', refreshed: false })
   }

   try {
      // Intentar verificar el token (puede lanzar TokenExpiredError)
      let decoded
      try {
         decoded = jwt.verify(token, process.env.SECRET_TOKEN)
      } catch (verifyError) {
         // Si expiró hace menos de 5 minutos, permitir refresh
         if (verifyError.name === 'TokenExpiredError') {
            const expiredAt = verifyError.expiredAt
            const now = new Date()
            const graceMs = 5 * 60 * 1000 // 5 minutos de gracia

            if (now - expiredAt > graceMs) {
               // Expiró hace más de 5 minutos, no renovar
               res.clearCookie('access_token', { path: '/' })
               return res.status(401).json({ msg: 'Sesión expirada. Inicie sesión nuevamente.', refreshed: false })
            }

            // Dentro del periodo de gracia, decodificar sin verificar para obtener payload
            decoded = jwt.decode(token)
         } else {
            // Otro error de verificación (firma inválida, etc.)
            res.clearCookie('access_token', { path: '/' })
            return res.status(401).json({ msg: 'Token inválido', refreshed: false })
         }
      }

      // Verificar que el usuario aún existe en la base de datos
      await client.connect()
      const userExists = await client.exec(loginAuth(decoded.user))

      if (!userExists || userExists.length === 0) {
         res.clearCookie('access_token', { path: '/' })
         return res.status(401).json({ msg: 'Usuario no encontrado', refreshed: false })
      }

      // Crear nuevo payload con datos actualizados
      const userToken = {
         user: decoded.user,
         apellidos: userExists[0].APELLIDO,
         nombres: userExists[0].NOMBRE,
         permiso: userExists[0].PERMISO,
         userID: userExists[0].ID_USER,
         ingreso: userExists[0].INGRESO,
         nacimiento: userExists[0].NACIMIENTO,
         codemp: userExists[0].IDEMP,
      }

      // Generar nuevo token
      const newToken = jwt.sign(userToken, process.env.SECRET_TOKEN, {
         expiresIn: '8h',
      })

      // Establecer nuevo token en cookie HttpOnly
      res.cookie('access_token', newToken, httpOnlyCookieConfig())

      return res.status(200).json({
         msg: 'Token renovado ✅',
         refreshed: true,
         user: `${userExists[0].APELLIDO} ${userExists[0].NOMBRE}`,
         username: decoded.user,
         permiso: userExists[0].PERMISO,
      })
   } catch (e) {
      logError('Auth', 'Error en refreshToken:', e)
      return res.status(500).json({ msg: 'Error al renovar sesión', refreshed: false })
   }
}

module.exports = { login, verifySession, logoutSession, refreshToken }

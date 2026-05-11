const { validateAndConsumeNonce } = require('../helpers/nonceManager')
const { decryptSapPassword } = require('../helpers/decryptPassword')

/**
 * Campos que pueden contener la contraseña SAP cifrada.
 */
const PASS_FIELDS = ['PASS', 'password', 'pass']

/**
 * Middleware que descifra la contraseña SAP del body o query params.
 * El cliente envía { PASS: "iv:ciphertext:authTag", _nonce: "nonce_value" }
 * Este middleware valida el nonce, descifra y reemplaza el campo en el body/query.
 *
 * Si no hay contraseña o nonce, deja pasar (no todas las rutas lo usan).
 */
const decryptSapPassMiddleware = (req, res, next) => {
   try {
      // Descifrar en body (POST/PUT/PATCH)
      if (req.body && req.body._nonce) {
         const nonce = req.body._nonce

         if (!validateAndConsumeNonce(nonce)) {
            return res.status(400).json({
               msg: 'Nonce inválido o expirado. Reintente la operación.',
               status: 400,
               data: []
            })
         }

         for (const field of PASS_FIELDS) {
            if (req.body[field] && typeof req.body[field] === 'string' && req.body[field].includes(':')) {
               req.body[field] = decryptSapPassword(req.body[field], nonce)
            }
         }

         delete req.body._nonce
      }

      // Descifrar en query params (GET/DELETE)
      if (req.query && req.query._nonce) {
         const nonce = req.query._nonce

         if (!validateAndConsumeNonce(nonce)) {
            return res.status(400).json({
               msg: 'Nonce inválido o expirado. Reintente la operación.',
               status: 400,
               data: []
            })
         }

         for (const field of PASS_FIELDS) {
            if (req.query[field] && typeof req.query[field] === 'string' && req.query[field].includes(':')) {
               req.query[field] = decryptSapPassword(req.query[field], nonce)
            }
         }

         delete req.query._nonce
      }

      next()
   } catch (e) {
      console.error('[decryptSapPass] Error al descifrar:', e.message)
      return res.status(400).json({
         msg: 'Error al procesar credenciales cifradas',
         status: 400,
         data: []
      })
   }
}

module.exports = { decryptSapPassMiddleware }

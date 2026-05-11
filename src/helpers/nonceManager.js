const crypto = require('crypto')

/**
 * Gestor de nonces para cifrado de contraseña SAP por petición.
 * Cada nonce es de un solo uso y expira en 60 segundos.
 */

// Store temporal de nonces en memoria
const nonceStore = new Map()

// Limpiar nonces expirados cada 5 minutos
setInterval(() => {
   const now = Date.now()
   for (const [key, value] of nonceStore) {
      if (value.expiresAt < now) nonceStore.delete(key)
   }
}, 5 * 60 * 1000)

/**
 * Genera un nonce criptográficamente seguro
 * @returns {string} nonce hex de 32 bytes
 */
const generateNonce = () => {
   const nonce = crypto.randomBytes(32).toString('hex')
   nonceStore.set(nonce, { expiresAt: Date.now() + 60_000 }) // Expira en 60s
   return nonce
}

/**
 * Valida y consume un nonce (uso único)
 * @param {string} nonce
 * @returns {boolean} true si el nonce es válido
 */
const validateAndConsumeNonce = (nonce) => {
   const entry = nonceStore.get(nonce)
   if (!entry || entry.expiresAt < Date.now()) {
      nonceStore.delete(nonce)
      return false
   }
   nonceStore.delete(nonce) // Usar solo una vez
   return true
}

module.exports = { generateNonce, validateAndConsumeNonce }

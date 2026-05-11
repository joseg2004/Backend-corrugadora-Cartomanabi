const crypto = require('crypto')

/**
 * Descifra una contraseña SAP cifrada desde el cliente con AES-256-GCM.
 * El cifrado usa una clave derivada de SAP_ENCRYPTION_KEY + nonce.
 *
 * @param {string} encryptedData - Datos cifrados en formato "iv_hex:encrypted_hex:authTag_hex"
 * @param {string} nonce - Nonce de un solo uso
 * @returns {string} Contraseña descifrada en texto plano
 * @throws {Error} Si el descifrado falla
 */
const decryptSapPassword = (encryptedData, nonce) => {
   const serverKey = process.env.SAP_ENCRYPTION_KEY

   if (!serverKey) {
      throw new Error('SAP_ENCRYPTION_KEY no configurada en variables de entorno')
   }

   // Derivar clave usando SHA-256(serverKey + nonce) — misma derivación que el cliente
   const derivedKey = crypto
      .createHash('sha256')
      .update(serverKey + nonce)
      .digest()

   const parts = encryptedData.split(':')
   if (parts.length !== 3) {
      throw new Error('Formato de datos cifrados inválido')
   }

   const [ivHex, encrypted, authTagHex] = parts
   const iv = Buffer.from(ivHex, 'hex')
   const authTag = Buffer.from(authTagHex, 'hex')

   const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv)
   decipher.setAuthTag(authTag)

   let decrypted = decipher.update(encrypted, 'hex', 'utf8')
   decrypted += decipher.final('utf8')

   return decrypted
}

module.exports = { decryptSapPassword }

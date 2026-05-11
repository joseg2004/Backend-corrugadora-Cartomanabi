/**
 * JWT Secret Rotation Policy
 *
 * Este módulo implementa la verificación y gestión de rotación del JWT_SECRET
 * según la política de seguridad de 90 días.
 *
 * CONFIGURACIÓN REQUERIDA EN .env:
 * - JWT_SECRET_CREATED: Fecha ISO de creación del secret actual (ej: 2024-01-15)
 * - JWT_SECRET_ROTATION_DAYS: Días para rotación (default: 90)
 */

const { logWarn, logInfo, logError } = require('./logger')

/**
 * Días por defecto para rotación del secret
 */
const DEFAULT_ROTATION_DAYS = 90

/**
 * Días de advertencia antes de la expiración
 */
const WARNING_DAYS = 14

/**
 * Calcula los días restantes antes de que el secret deba ser rotado
 * @returns {object} { daysRemaining, shouldRotate, isWarning, createdDate, expirationDate }
 */
const checkSecretRotation = () => {
   const createdStr = process.env.JWT_SECRET_CREATED
   const rotationDays = parseInt(process.env.JWT_SECRET_ROTATION_DAYS) || DEFAULT_ROTATION_DAYS

   if (!createdStr) {
      logWarn('JWT Rotation', 'JWT_SECRET_CREATED no configurado. Configura la fecha de creación del secret.')
      return {
         daysRemaining: -1,
         shouldRotate: true,
         isWarning: true,
         createdDate: null,
         expirationDate: null,
         message: 'JWT_SECRET_CREATED no configurado'
      }
   }

   try {
      const createdDate = new Date(createdStr)
      const now = new Date()
      const expirationDate = new Date(createdDate)
      expirationDate.setDate(expirationDate.getDate() + rotationDays)

      const msRemaining = expirationDate.getTime() - now.getTime()
      const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))

      const shouldRotate = daysRemaining <= 0
      const isWarning = daysRemaining <= WARNING_DAYS && daysRemaining > 0

      return {
         daysRemaining,
         shouldRotate,
         isWarning,
         createdDate: createdDate.toISOString().split('T')[0],
         expirationDate: expirationDate.toISOString().split('T')[0],
         message: shouldRotate
            ? '⚠️ JWT_SECRET ha EXPIRADO. Debe ser rotado INMEDIATAMENTE.'
            : isWarning
               ? `⚠️ JWT_SECRET expira en ${daysRemaining} días (${expirationDate.toISOString().split('T')[0]})`
               : `✅ JWT_SECRET válido por ${daysRemaining} días más`
      }
   } catch (e) {
      logError('JWT Rotation', 'Error al parsear JWT_SECRET_CREATED', { error: e.message })
      return {
         daysRemaining: -1,
         shouldRotate: true,
         isWarning: true,
         createdDate: null,
         expirationDate: null,
         message: 'Error: formato de fecha inválido en JWT_SECRET_CREATED'
      }
   }
}

/**
 * Verifica la rotación al iniciar el servidor y loguea advertencias
 */
const validateSecretOnStartup = () => {
   const status = checkSecretRotation()

   if (status.shouldRotate) {
      logError('JWT Rotation', status.message)
      console.error('\n' + '='.repeat(70))
      console.error('🚨 ALERTA DE SEGURIDAD: JWT_SECRET EXPIRADO')
      console.error('Debe generar un nuevo JWT_SECRET y actualizar JWT_SECRET_CREATED')
      console.error('Ver documentación: SECURITY_IMPLEMENTATION.md')
      console.error('='.repeat(70) + '\n')
   } else if (status.isWarning) {
      logWarn('JWT Rotation', status.message)
      console.warn('\n' + '='.repeat(70))
      console.warn(`⚠️ ADVERTENCIA: ${status.message}`)
      console.warn('Planifique la rotación del JWT_SECRET pronto.')
      console.warn('='.repeat(70) + '\n')
   } else {
      logInfo('JWT Rotation', status.message)
   }

   return status
}

/**
 * Genera instrucciones para la rotación del secret
 * @returns {string} Instrucciones de rotación
 */
const getRotationInstructions = () => {
   return `
=== INSTRUCCIONES DE ROTACIÓN JWT_SECRET ===

1. Generar nuevo secret seguro:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

2. Actualizar .env:
   SECRET_TOKEN=<nuevo_secret_generado>
   JWT_SECRET_CREATED=${new Date().toISOString().split('T')[0]}

3. Reiniciar todos los servicios del backend

4. NOTA: Todos los tokens activos serán invalidados.
   Los usuarios deberán iniciar sesión nuevamente.

================================================
`
}

module.exports = {
   checkSecretRotation,
   validateSecretOnStartup,
   getRotationInstructions,
   DEFAULT_ROTATION_DAYS,
   WARNING_DAYS
}

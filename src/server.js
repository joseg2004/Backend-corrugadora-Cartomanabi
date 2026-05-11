const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cors = require('cors')
const respTime = require('response-time')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const { globalLimiter, sensitiveLimiter } = require('./middlewares/rateLimiter')
const { corsConfig, corsErrorHandler } = require('./helpers/corsConfig')

const app = express()

app.set('port', process.env.APP_PORT || 3001)
// Trust proxy para rate limiting correcto detrás de reverse proxy
app.set('trust proxy', 1)
// Deshabilitar header X-Powered-By que expone el stack tecnológico
app.disable('x-powered-by')

// Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, CSP, etc.)
app.use(helmet({
   contentSecurityPolicy: {
      directives: {
         defaultSrc: ['\'self\''],
         scriptSrc: ['\'none\''], // API backend no ejecuta scripts
         styleSrc: ['\'self\'', '\'unsafe-inline\''], // Para estilos en PDFs
         imgSrc: ['\'self\'', 'data:', 'blob:'], // Imágenes propias y data URIs
         fontSrc: ['\'self\''],
         objectSrc: ['\'self\''], // Permitir PDFs embebidos
         frameAncestors: ['\'none\''], // Prevenir clickjacking
         baseUri: ['\'self\''],
         formAction: ['\'self\'']
      }
   },
   crossOriginResourcePolicy: { policy: 'cross-origin' } // Permitir carga de recursos cross-origin (PDFs, imágenes)
}))

app.use(cookieParser())
app.use(cors(corsConfig))
app.use(corsErrorHandler)

// Rate limiting global
app.use(globalLimiter)

// Middleware de compatibilidad: si el token viene en cookie HttpOnly, query param o header,
// inyectar el header Authorization para que los controllers existentes funcionen sin cambios.
// Prioridad: header > cookie > query param (?token=xxx para descargas de archivos)
app.use((req, _res, next) => {
   if (!req.headers.authorization) {
      if (req.cookies?.access_token) {
         req.headers.authorization = `Bearer ${req.cookies.access_token}`
      } else if (req.query?.token) {
         req.headers.authorization = `Bearer ${req.query.token}`
      }
   }
   next()
})
app.use(respTime())

app.use(morgan('dev'))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }))

// Endpoint para obtener nonce de cifrado SAP (antes de rutas protegidas)
const { generateNonce } = require('./helpers/nonceManager')
app.get('/auth/nonce', sensitiveLimiter, (_req, res) => {
   res.json({ nonce: generateNonce() })
})

// Descifrar contraseñas SAP cifradas en body/query
const { decryptSapPassMiddleware } = require('./middlewares/decryptSapPass')
app.use(decryptSapPassMiddleware)

app.use(require('./routes/login.routes'))
app.use('/bobinas', require('./routes/bobinas.routes'))
app.use('/importacion', require('./routes/importaciones.routes'))
app.use('/tickets', require('./routes/tickets.routes'))
app.use('/calidad', require('./routes/calidad.routes'))
app.use('/produccion', require('./routes/proterm.routes'))
app.use('/bodega', require('./routes/bodega.routes'))
app.use('/cotizador', require('./routes/cotizador.routes'))
app.use('/insumos', require('./routes/insumos.routes'))
app.use('/cuentas', require('./routes/accounts.routes'))
app.use('/anexoscomp', require('./routes/anexoscomp.routes'))
app.use('/ordrcompra', require('./routes/ordrcompra.routes'))
app.use('/general', require('./routes/general.routes'))
app.use('/ecustk', require('./routes/ecustk.routes'))

// Assets públicos (imágenes, fuentes)
app.use(express.static(path.join(__dirname + '/assets')))

// Documentos protegidos: requieren autenticación
const { verifyToken } = require('./middlewares/authRoutes')
app.use(verifyToken, (req, res, next) => {
   // Prevenir directory traversal
   const safePath = path.normalize(req.path)
   if (safePath.includes('..')) {
      return res.status(403).json({ msg: 'Acceso denegado' })
   }
   next()
}, express.static(path.join(__dirname + '/docs'), {
   dotfiles: 'deny',
   index: false,
}))

// Error handler centralizado - DEBE ir después de todas las rutas
const { errorHandler } = require('./middlewares/errorHandler')
app.use(errorHandler)

module.exports = app
const { Router } = require('express')
const route = Router()

const { login, verifySession, logoutSession, refreshToken } = require('../helpers/loginAuth')
const { authLimiter } = require('../middlewares/rateLimiter')

const {
   welcome,
   getAllCountries,
   getAllProvincias,
   getAllCantones,
   getAllLoteDespPDFCal,
   generatePDFCalidad,
   uploadFile
} = require('../controllers/login.controller')

const {
   getTimeWeekPaper
} = require('../controllers/ordrcompra.controllers')

const {
   verifyToken, verifyPermission
} = require('../middlewares/authRoutes')
const { tempFolder } = require('../helpers/createFolder')

route.get('/', welcome)
route.post('/login', authLimiter, login)
route.get('/auth/verify', verifySession)
route.post('/auth/logout', logoutSession)
route.post('/auth/refresh', refreshToken)

route.get('/allcountries', verifyToken, getAllCountries)
route.get('/allprovincias', verifyToken, getAllProvincias)
route.get('/allcantones', verifyToken, getAllCantones)

route.get('/pdfcalidad', verifyToken, verifyPermission, getAllLoteDespPDFCal)
route.post('/generatepdf', verifyToken, verifyPermission, generatePDFCalidad)

route.post('/upload', verifyToken, verifyPermission, tempFolder.any('files'), uploadFile)

route.get('/weekpaper', verifyToken, verifyPermission, getTimeWeekPaper)

module.exports = route

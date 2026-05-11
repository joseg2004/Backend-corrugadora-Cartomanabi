const { Router } = require('express')
const route = Router()

const {
   getBobinas,
   getAllBobinas,
   postItmBobinas,
   getAllLaminas,
   getGeneratePDFBobAdu,
   getBobinasAduana,
   postItmBobinasAdu,
   getGeneratePDFBob,
   getGeneratePDFBobinas,
   getBobinasDays,
} = require('../controllers/bobinas.controller')

const { verifyToken, verifyPermission } = require('../middlewares/authRoutes')

route.get('/', verifyToken, verifyPermission, getBobinas)
route.get('/all', verifyToken, verifyPermission, getAllBobinas)
route.get('/days', verifyToken, verifyPermission, getBobinasDays)
route.post('/saveItm', verifyToken, verifyPermission, postItmBobinas)
route.get('/laminas', verifyToken, verifyPermission, getAllLaminas)

route.get('/aduana', verifyToken, verifyPermission, getBobinasAduana)
route.post('/saveItmAdu', verifyToken, verifyPermission, postItmBobinasAdu)
route.post('/pdfbobinaadu', verifyToken, verifyPermission, getGeneratePDFBobAdu)
route.post('/pdfbobina', verifyToken, verifyPermission, getGeneratePDFBob)
route.post('/pdfbobinas', verifyToken, verifyPermission, getGeneratePDFBobinas)

module.exports = route

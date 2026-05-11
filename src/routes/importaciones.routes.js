const { Router } = require('express')
const route = Router()

const {
   getPapelSAP,
   // postTPapel,
   // getAllTPapel,
   postPuerto,
   getAllPuertos,
   getAllTipImp,
   postTipImp,
   postImportacion,
   getAllImportacion,
   getAllTipFact,
   postTipFact,
   getAllFacturas,
   postFacturas
} = require('../controllers/importaciones.controller')

const {
   verifyToken,
   verifyPermission
} = require('../middlewares/authRoutes')

route.get('/allpapel', verifyToken, verifyPermission, getPapelSAP)

// route.post('/savetpapel', verifyToken, verifyPermission, postTPapel)
// route.get('/alltpapel', verifyToken, verifyPermission, getAllTPapel)

route.post('/savepuerto', verifyToken, verifyPermission, postPuerto)
route.get('/allpuerto', verifyToken, verifyPermission, getAllPuertos)

route.post('/savetipimport', verifyToken, verifyPermission, postTipImp)
route.get('/alltipimport', verifyToken, verifyPermission, getAllTipImp)

route.post('/saveimport', verifyToken, verifyPermission, postImportacion)
route.get('/allimport', verifyToken, verifyPermission, getAllImportacion)

route.get('/alltipfact', verifyToken, verifyPermission, getAllTipFact)
route.post('/savetipfact', verifyToken, verifyPermission, postTipFact)

route.post('/savefactura', verifyToken, verifyPermission, postFacturas)
route.get('/allfactura', verifyToken, verifyPermission, getAllFacturas)

module.exports = route

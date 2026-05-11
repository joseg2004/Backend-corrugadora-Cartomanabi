const { Router } = require('express')
const route = Router()

const {
   verifyToken,
   verifyPermission
} = require('../middlewares/authRoutes')

const {
   getSearchLotePT,
   getMaterialesInsumoSAP,
   getInsumosG104,
   getDetailsPTSAP,
   getDetailsLamSAP,
   getDetailsPapSAP,
   getCocAlmidonSAP,
   getCocAlmidonDetSAP,
   getAllInsumosTraInv,
   getTraInvLote,
   getTraInvCompra,
   postGeneratePDFTrazInv,
   postGeneratePDFTrazInvLote
} = require('../controllers/calidad.controllers')
const {
   getListPaper
} = require('../controllers/ordrcompra.controllers')
const {
   getAllFact21,
   getDescpFact21,
   getListSenaeEmail,
   postMailClient,
   postMailMasClient
} = require('../controllers/anexoscomp.controllers')
const { getAllEmployeesChern, postSaveAsistEmployee } = require('../controllers/login.controller')

route.get('/trazabilidad', verifyToken, verifyPermission, getSearchLotePT)
route.get('/detailspt', verifyToken, verifyPermission, getDetailsPTSAP)
route.get('/insumos', verifyToken, verifyPermission, getMaterialesInsumoSAP)
route.get('/insumos104', verifyToken, verifyPermission, getInsumosG104)
route.get('/detailslam', verifyToken, verifyPermission, getDetailsLamSAP)
route.get('/detailspap', verifyToken, verifyPermission, getDetailsPapSAP)
route.get('/almidon', verifyToken, verifyPermission, getCocAlmidonSAP)
route.get('/almidondet', verifyToken, verifyPermission, getCocAlmidonDetSAP)

route.get('/trazabilidad/inversa', verifyToken, verifyPermission, getAllInsumosTraInv)
route.get('/trazabilidad/inversa/lote', verifyToken, verifyPermission, getTraInvLote)
route.get('/trazabilidad/inversa/compra', verifyToken, verifyPermission, getTraInvCompra)
route.post('/trazabilidad/inversa/pdf', verifyToken, verifyPermission, postGeneratePDFTrazInv)
route.post('/trazabilidad/inversa/lote/pdf', verifyToken, verifyPermission, postGeneratePDFTrazInvLote)

route.get('/anexoscomp/list', verifyToken, verifyPermission, getAllFact21)
route.get('/anexoscomp/details/all', verifyToken, verifyPermission, getDescpFact21)
route.get('/anexoscomp/senaemail', verifyToken, verifyPermission, getListSenaeEmail)
route.post('/anexoscomp/notmail', verifyToken, verifyPermission, postMailClient)
route.post('/anexoscomp/notmail/all', verifyToken, verifyPermission, postMailMasClient)

route.get('/paper', verifyToken, verifyPermission, getListPaper)

route.get('/employees', verifyToken, verifyPermission, getAllEmployeesChern)
route.post('/employees', verifyToken, verifyPermission, postSaveAsistEmployee)

module.exports = route
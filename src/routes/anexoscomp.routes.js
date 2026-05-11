const { Router } = require('express')
const route = Router()

const {
   getListAnexos,
   getDescpFact,
   postSaveFact21,
   getCabFact21,
   getProFact21,
   getMatPriFact21,
   putCabFact21,
   getAllBusinesPartners,
   putBusinessPartners,
   getListStockSenae,
   uploadFileUpdStd,
   getFacturasPapel,
   postSaveFact21Bob,
   getDetailsFacturasPapel,
   putCabFact21Papel,
   postNacionalizarPaper,
   getFacturasClienteByMonth
} = require('../controllers/anexoscomp.controllers')
const {
   verifyToken,
   verifyPermission
} = require('../middlewares/authRoutes')
const {
   tempFolder
} = require('../helpers/createFolder')

route.get('/', verifyToken, verifyPermission, getListAnexos)
route.get('/details', verifyToken, verifyPermission, getDescpFact)
route.post('/saveFact', verifyToken, verifyPermission, postSaveFact21)
route.put('/putFact', verifyToken, verifyPermission, putCabFact21)

route.get('/details/cab', verifyToken, verifyPermission, getCabFact21)
route.get('/details/prod', verifyToken, verifyPermission, getProFact21)
route.get('/details/matpri', verifyToken, verifyPermission, getMatPriFact21)

route.get('/facturas/papel', verifyToken, verifyPermission, getFacturasPapel)
route.post('/facturas/papel/save', verifyToken, verifyPermission, postSaveFact21Bob)
route.get('/facturas/papel/details', verifyToken, verifyPermission, getDetailsFacturasPapel)
route.put('/facturas/papel/update', verifyToken, verifyPermission, putCabFact21Papel)

// Nueva ruta para obtener facturas del cliente por año/mes
route.get('/facturas/cliente', verifyToken, verifyPermission, getFacturasClienteByMonth)

route.get('/bsnpartner', verifyToken, verifyPermission, getAllBusinesPartners)
route.put('/bsnpartner', verifyToken, verifyPermission, putBusinessPartners)

route.get('/stock', verifyToken, verifyPermission, getListStockSenae)

route.post('/updatestd', verifyToken, verifyPermission, tempFolder.any('files'), uploadFileUpdStd)

route.post('/nacionalizar', verifyToken, verifyPermission, postNacionalizarPaper)

module.exports = route
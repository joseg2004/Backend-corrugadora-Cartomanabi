const { Router } = require('express')
const route = Router()

const {
   verifyToken,
   verifyPermission
} = require('../middlewares/authRoutes')

const {
   getListProveedores,
   getListPaper,
   postPurchaseOrdr,
   getListOrdPurchase,
   getListDirectionsBP,
   getDetailsOrdPurchase,
   putPurchaseOrdr,
   getListPayments,
   generatePDFPurchaseOrders
} = require('../controllers/ordrcompra.controllers')

route.get('/proveedor', verifyToken, verifyPermission, getListProveedores)
route.get('/paper', verifyToken, verifyPermission, getListPaper)
route.get('/payments', verifyToken, verifyPermission, getListPayments)
route.get('/listDirections', verifyToken, verifyPermission, getListDirectionsBP)

route.get('/details', verifyToken, verifyPermission, getDetailsOrdPurchase)
route.get('/list', verifyToken, verifyPermission, getListOrdPurchase)
route.post('/save', verifyToken, verifyPermission, postPurchaseOrdr)
route.put('/update', verifyToken, verifyPermission, putPurchaseOrdr)
route.post('/genpdf', verifyToken, verifyPermission, generatePDFPurchaseOrders)
/**
 *
 *
 */
module.exports = route
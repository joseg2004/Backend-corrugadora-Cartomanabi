const { Router } = require('express')
const route = Router()

const {
   getAllTintas,
   getAllTintasProv,
   getAllTypeArt,
   getTiposSelect,
   getDetailsSolBuy
} = require('../controllers/insumos.controller')

const { verifyToken, verifyPermission } = require('../middlewares/authRoutes')

route.get('/', verifyToken, verifyPermission, getAllTintas)
route.get('/alltintas', verifyToken, verifyPermission, getAllTintasProv)
route.get('/typearticulo', verifyToken, verifyPermission, getAllTypeArt)

route.get('/tipos', verifyToken, verifyPermission, getTiposSelect)

route.get('/solicitudes', verifyToken, verifyPermission, getDetailsSolBuy)

module.exports = route
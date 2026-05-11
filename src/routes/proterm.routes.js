const { Router } = require('express')
const route = Router()

const { verifyToken, verifyPermission } = require('../middlewares/authRoutes')

const {
   allOrderLibPT,
   saveOrderPos,
   putStatusPT,
   allDetailsIns,
} = require('../controllers/proterm.controllers')

route.get('/', verifyToken, verifyPermission, allOrderLibPT)
route.post('/order', verifyToken, verifyPermission, saveOrderPos)

route.put('/status', verifyToken, verifyPermission, putStatusPT)
route.get('/insumos', verifyToken, verifyPermission, allDetailsIns)

module.exports = route

const { Router } = require('express')
const route = Router()

const {
   allAccountState,
   postMailClient,
   getDetailsAcc,
   postMailClientConfAcc
} = require('../controllers/accounts.controllers')
const {
   postMailClientAu
} = require('../controllers/accounts.au.controllers')

const { verifyToken, verifyPermission } = require('../middlewares/authRoutes')

route.get('/', verifyToken, verifyPermission, allAccountState)
route.post('/', verifyToken, verifyPermission, postMailClient)
route.post('/new', verifyToken, verifyPermission, postMailClientConfAcc)
route.get('/details', verifyToken, verifyPermission, getDetailsAcc)

// Rutas Austrobox - Estados de cuenta
route.post('/au', verifyToken, verifyPermission, postMailClientAu)

module.exports = route
const { Router } = require('express')
const route = Router()

const {
   allProductsBod, saveRequision
} = require('../controllers/bodega.controllers')

const { verifyToken } = require('../middlewares/authRoutes')

route.get('/', verifyToken, allProductsBod)
route.post('/save', verifyToken, saveRequision)

module.exports = route
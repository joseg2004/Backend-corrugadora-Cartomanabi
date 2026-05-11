const { Router } = require('express')
const route = Router()

const {
   getAllClients,
   getAllProdCliVend,
   saveCotizacion,
   getCotizaciones,
   getItemsCotizaciones,
   getAllProdCompany,
   postAssignProdCli,
   getClientsCotizaciones,
   getDetailsCotizaciones
} = require('../controllers/cotizador.controller')
const { verifyToken } = require('../middlewares/authRoutes')

route.get('/clients', verifyToken, getAllClients)
route.get('/clients/cotizaciones', verifyToken, getClientsCotizaciones)

route.get('/products', verifyToken, getAllProdCliVend)
route.get('/products/assign', verifyToken, getAllProdCompany)
route.post('/products/assign', verifyToken, postAssignProdCli)

route.post('/saveCotizacion', verifyToken, saveCotizacion)

route.get('/cotizaciones', verifyToken, getCotizaciones)
route.get('/itemsCotizaciones', verifyToken, getItemsCotizaciones)
route.get('/allCotizacion', verifyToken, getDetailsCotizaciones)

module.exports = route
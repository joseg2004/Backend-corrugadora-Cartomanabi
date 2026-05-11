const { Router } = require('express')
const route = Router()

const {
   allTickets,
   generatePDF,
   allInfo,
} = require('../controllers/tickets.controllers')

route.get('/', allTickets)
route.get('/pdf', generatePDF)
route.post('/pdf', generatePDF)
route.get('/allInfo', allInfo)

module.exports = route
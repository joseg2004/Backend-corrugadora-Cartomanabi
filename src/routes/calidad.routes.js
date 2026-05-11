const { Router } = require('express')
const route = Router()

const {
   verifyToken,
   verifyPermission
} = require('../middlewares/authRoutes')

const {
   getTintas,
   getTintasSAP,
   postTintas,
   putTintas,
   getTintasCop,
   postSaveTestTinta,
   getTintasSAPTest,
   getTintasSAPProo,
   postDocTestTinta,
   getControlProcesoSAP,
   postControlProceso,
   getCtrlProcesoColImp,
   postControlProcesoDoc,
   getUsersPositions,
   getTestTintasCOP,
   getTestCtrlProcessCOP,
   postCopyCtrlProcessCOP,
   putLoteSAPCOP,
   getDetailsTestCOP,
   putTestCtrlProCab,
   putTestCtrlProDoc,
   getProvedoresSAP,
} = require('../controllers/calidad.controllers')

route.get('/tintas', verifyToken, verifyPermission, getTintas)
route.get('/tintas/sap', verifyToken, verifyPermission, getTintasSAP)
route.post('/tintas', verifyToken, verifyPermission, postTintas)
route.put('/tintas', verifyToken, verifyPermission, putTintas)

route.get('/tintascab', verifyToken, verifyPermission, getTintasCop)
route.post('/savetincab', verifyToken, verifyPermission, postSaveTestTinta)
route.get('/alltintas', verifyToken, verifyPermission, getTintasSAPTest)
route.get('/tinprov', verifyToken, verifyPermission, getTintasSAPProo)
route.post('/savetindoc', verifyToken, verifyPermission, postDocTestTinta)
route.get('/userspos', verifyToken, verifyPermission, getUsersPositions)
route.get('/listtesttintas', verifyToken, verifyPermission, getTestTintasCOP)
route.get('/proveedores', verifyToken, verifyPermission, getProvedoresSAP)

route.get('/controlprocesosap', verifyToken, verifyPermission, getControlProcesoSAP)
route.post('/savectrproceso', verifyToken, verifyPermission, postControlProceso)
route.get('/searchtintaop', verifyToken, verifyPermission, getCtrlProcesoColImp)
route.post('/savectrlprocesodoc', verifyToken, verifyPermission, postControlProcesoDoc)
route.get('/listtestctrlproc', verifyToken, verifyPermission, getTestCtrlProcessCOP)

route.post('/copyctrlproceso', verifyToken, verifyPermission, postCopyCtrlProcessCOP)
route.put('/updatelotesap', verifyToken, verifyPermission, putLoteSAPCOP)

route.get('/detailstestcp', verifyToken, verifyPermission, getDetailsTestCOP)
route.put('/putcabeceractrl', verifyToken, verifyPermission, putTestCtrlProCab)
route.put('/putdocumentoctrl', verifyToken, verifyPermission, putTestCtrlProDoc)

module.exports = route
const ctrlCalidad = {}

const moment = require('moment')
moment.locale('es')
const client = require('../connections/hana')
const { decodeJWT } = require('../helpers/fntHelpers')
const {
   getAllTintasSAP,
   getAllTintas,
   postSaveTintas,
   putUpdateTintas,
   getOPLoteItmCode,
   getTintasCabecera,
   postTestTintaCab,
   getProoveedores,
   getMaterialesInsumo,
   getInsumos104,
   getDetailsPT,
   getDetailsLAM,
   getDetailsPapel,
   getCocinaAlmidon,
   getAlmidonIns,
   getListTintasSAP,
   getTintasXProveedor,
   postSaveDocTintas,
   getAllProcesoControl,
   postSaveCabCtrlProc,
   getSearchCabCtrlProc,
   getColorsImpresion,
   getDetailsEmbaje,
   postSaveDocCtrlProc,
   getLoteSAPCtrlProc,
   getTintasOC,
   getPositionUsers,
   getListTestTintas,
   getListCtrlProcess,
   getCabCtrlProc,
   postCopyCabCtrlProc,
   putCabCtrlProc,
   getDocCtrlProc,
   postCopyDocCtrlProc,
   getDetailsTestCOPLAIM,
   putDocCtrlProc,
   searchLoteSAP,
   getListInsTraInv,
   getListLoteTraInv,
   getCompraTraInv,
} = require('../models/hanaQCalidad')

ctrlCalidad.getTintasSAP = async (req, res) => {
   try {
      client.connect()
      const allTintasSAP = await client.exec(getAllTintasSAP())

      if (allTintasSAP.length > 0) {
         return res.status(200).json({
            msg: 'Tintas obtenidas correctamente 🖖',
            data: allTintasSAP,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay tintas registradas 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getTintas = async (req, res) => {
   try {
      client.connect()
      const allTintas = await client.exec(getAllTintas())

      if (allTintas.length > 0) {
         return res.status(200).json({
            msg: 'Tintas obtenidas correctamente 🖖',
            data: allTintas,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay tintas registradas 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.postTintas = async (req, res) => {
   try {
      const { ID_TINTA, NAME_TINTA, GCMI, PMS, HEX } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const searchTinta = await client.exec(getAllTintas(ID_TINTA))

      if (searchTinta.length > 0) {
         return res.status(400).json({
            msg: 'La tinta ya se encuentra registrada 💯',
            data: [],
         })
      } else {
         const saveTinta = await client.exec(
            postSaveTintas({
               CODE_TINTA: ID_TINTA,
               NAME_TINTA: NAME_TINTA.toUpperCase(),
               GCMI: GCMI.toUpperCase(),
               PMS: PMS.toUpperCase(),
               HEX: HEX.toUpperCase(),
               USER
            })
         )

         if (saveTinta) {
            return res.status(200).json({
               msg: 'Información guardada con éxito 🖖',
               data: req.body,
            })
         } else {
            return res.status(200).json({
               msg: 'No se ha podido guardar la información 😫',
               data: [],
            })
         }
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

/**
 * Actualizar una tinta existente
 */
ctrlCalidad.putTintas = async (req, res) => {
   try {
      const { ID_TINTA, NAME_TINTA, GCMI, PMS, HEX } = req.body

      if (!ID_TINTA) {
         return res.status(400).json({
            msg: 'El ID de la tinta es requerido 🔢',
         })
      }

      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const searchTinta = await client.exec(getAllTintas(ID_TINTA))

      if (searchTinta.length === 0) {
         return res.status(404).json({
            msg: 'La tinta no existe en el sistema 🤷‍♂️',
         })
      }

      const updateTinta = await client.exec(
         putUpdateTintas({
            ID_TINTA,
            NAME_TINTA: NAME_TINTA.toUpperCase(),
            GCMI: GCMI.toUpperCase(),
            PMS: PMS.toUpperCase(),
            HEX: HEX.toUpperCase(),
            USER
         })
      )

      if (updateTinta) {
         return res.status(200).json({
            msg: 'Tinta actualizada con éxito 🎉',
            data: req.body,
         })
      } else {
         return res.status(400).json({
            msg: 'No se ha podido actualizar la tinta 😫',
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

/**
 * Informe de trazabilidad de PT - Calidad
 */
ctrlCalidad.getSearchLotePT = async (req, res) => {
   try {
      const FECHA_START =
         req.query.FECHA_START === '' ? '' : req.query.FECHA_START
      const FECHA_END = req.query.FECHA_END === '' ? '' : req.query.FECHA_END
      const LOTE =
         req.query.LOTE === ''
            ? ''
            : req.query.LOTE.includes('*')
               ? req.query.LOTE.replace('*', '%')
               : req.query.LOTE
      const ITEM =
         req.query.ITEM === ''
            ? ''
            : req.query.ITEM.includes('*')
               ? req.query.ITEM.replace('*', '%')
               : req.query.ITEM

      client.connect()
      const allDataTra = await client.exec(
         getOPLoteItmCode({ FECHA_START, FECHA_END, LOTE, ITEM, TYPE: req.query.TYPE })
      )

      if (allDataTra.length > 0) {
         return res.status(200).json({
            msg: 'Datos obtenidos correctamente 🖖',
            data: allDataTra,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay ningún dato disponible 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getTintasCop = async (req, res) => {
   try {
      client.connect()
      const allTintas = await client.exec(getTintasCabecera())

      if (allTintas.length > 0) {
         return res.status(200).json({
            msg: 'Tintas obtenidas correctamente 🖖',
            data: allTintas,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay tintas registradas 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getProvedoresSAP = async (req, res) => {
   try {
      client.connect()
      const allProveedores = await client.exec(getProoveedores())

      if (allProveedores.length > 0) {
         return res.status(200).json({
            msg: 'Proveedores obtenidos correctamente 🖖',
            data: allProveedores,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay proveedores registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getMaterialesInsumoSAP = async (req, res) => {
   try {
      client.connect()
      const allInsumos = await client.exec(
         getMaterialesInsumo(req.query.BASE_REF, req.query.TYPE)
      )

      if (allInsumos.length > 0) {
         return res.status(200).json({
            msg: 'Insumos obtenidos correctamente 🖖',
            data: allInsumos,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay insumos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getInsumosG104 = async (req, res) => {
   try {
      client.connect()
      const allInsumos = await client.exec(
         getInsumos104(req.query.CODE, req.query.PTCODE, req.query.LOTE)
      )

      if (allInsumos.length > 0) {
         return res.status(200).json({
            msg: 'Insumos obtenidos correctamente 🖖',
            data: allInsumos,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay insumos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getDetailsPTSAP = async (req, res) => {
   try {
      client.connect()
      const allDetails = await client.exec(getDetailsPT(req.query.CODE, req.query.TYPE))

      if (allDetails.length > 0) {
         return res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allDetails,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay información registrada 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getDetailsLamSAP = async (req, res) => {
   try {
      client.connect()
      const allInsumosLam = await client.exec(getDetailsLAM(req.query.LAMCODE))

      if (allInsumosLam.length > 0) {
         return res.status(200).json({
            msg: 'Insumos obtenidos correctamente 🖖',
            data: allInsumosLam,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay insumos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getDetailsPapSAP = async (req, res) => {
   try {
      client.connect()
      const allInsumosPap = await client.exec(
         getDetailsPapel(req.query.PAPCODE)
      )

      if (allInsumosPap.length > 0) {
         return res.status(200).json({
            msg: 'Insumos papel obtenidos correctamente 🖖',
            data: allInsumosPap,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay insumos de papel registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getCocAlmidonSAP = async (req, res) => {
   try {
      client.connect()
      const allCocAlmidon = await client.exec(getCocinaAlmidon(req.query.DATE))

      if (allCocAlmidon.length > 0) {
         return res.status(200).json({
            msg: 'Almidón obtenidos correctamente 🖖',
            data: allCocAlmidon,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay almidón registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getCocAlmidonDetSAP = async (req, res) => {
   try {
      client.connect()
      const allCocAlmDet = await client.exec(getAlmidonIns(req.query.DOC_SAP))

      if (allCocAlmDet.length > 0) {
         return res.status(200).json({
            msg: 'Detalle de almidón obtenidos correctamente 🖖',
            data: allCocAlmDet,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay detalles del almidón registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

/**
 * Test para las tintas - Calidad
 */
ctrlCalidad.getTintasSAPTest = async (req, res) => {
   try {
      client.connect()
      const allTintas = await client.exec(
         getListTintasSAP({ ID: req.query.ID_OC })
      )

      if (allTintas.length > 0) {
         return res.status(200).json({
            msg: 'Tintas obtenidas correctamente 🖖',
            data: allTintas,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay tintas registradas 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getTintasSAPProo = async (req, res) => {
   try {
      client.connect()
      const allTintas = await client.exec(
         getTintasXProveedor({
            OC: req.query.OC,
            FECHA_START: req.query.DESDE_FECHA,
            FECHA_END: req.query.HASTA_FECHA,
         })
      )

      if (allTintas.length > 0) {
         return res.status(200).json({
            msg: 'Tintas obtenidas correctamente 🖖',
            data: allTintas,
         })
      } else {
         return res.status(200).json({
            msg: 'No hay tintas registradas 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.postSaveTestTinta = async (req, res) => {
   try {
      const {
         ORD_COMP,
         PROVEEDOR,
         RESPONSABLE,
         TIEMPO,
         MONTACARGUISTA,
         OBSERVACIONES,
         ESTADO,
      } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const searchOC = await client.exec(getTintasOC(ORD_COMP))

      if (searchOC.length > 0) {
         return res.status(400).json({
            msg: 'Información ya registrada 🚫',
         })
      } else {
         const saveTestTinta = await client.exec(
            postTestTintaCab(
               ORD_COMP,
               PROVEEDOR,
               RESPONSABLE,
               moment(TIEMPO).format('YYYY-MM-DD HH:mm:ss'),
               MONTACARGUISTA,
               OBSERVACIONES,
               USER,
               ESTADO
            )
         )

         if (saveTestTinta) {
            return res.status(200).json({
               msg: 'Información guardada con éxito 🖖',
               data: { ...req.body, ANALISTA: USER },
            })
         } else {
            return res.status(200).json({
               msg: 'No se ha podido guardar la información 😫',
               data: [],
            })
         }
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.postDocTestTinta = async (req, res) => {
   try {
      const {
         ORD_COMP,
         LOTE,
         ID_TINTA,
         CANTIDAD,
         TONALIDAD,
         VISCOSIDAD,
         PH,
         ESPECTROFOTOMETRO,
         RESISTENCIA,
         SUSTRATO,
         ESTADO,
         OBSERVACIONES,
      } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const searchOC = await client.exec(getTintasOC(ORD_COMP))

      if (searchOC.length === 0) {
         return res.status(204).json({
            msg: 'Información no registrada 🚫',
         })
      } else {
         const saveTestTinta = await client.exec(
            postSaveDocTintas({
               ORD_COMP,
               LOTE,
               ID_TINTA,
               CANTIDAD,
               TONALIDAD,
               VISCOSIDAD,
               PH,
               ESPECTROFOTOMETRO,
               RESISTENCIA,
               SUSTRATO,
               ESTADO,
               OBSERVACIONES,
               USER,
            })
         )

         if (saveTestTinta) {
            return res.status(200).json({
               msg: 'Información guardada con éxito 🖖',
               data: { ...req.body, ANALISTA: USER },
            })
         } else {
            return res.status(200).json({
               msg: 'No se ha podido guardar la información 😫',
               data: [],
            })
         }
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getTestTintasCOP = async (req, res) => {
   try {
      client.connect()
      const allTest = await client.exec(getListTestTintas())

      if (allTest.length > 0) {
         return res.status(200).json({
            msg: 'Test obtenidos correctamente 🖖',
            data: allTest,
         })
      } else {
         return res.status(400).json({
            msg: 'No hay test registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      return res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

/**
 * Control proceso - Calidad
 */
ctrlCalidad.getControlProcesoSAP = async (req, res) => {
   try {
      await client.connect()

      const allData = await client.exec(
         getAllProcesoControl({
            OC: req.query.OC,
            FECHA_START: req.query.DESDE_FECHA,
            FECHA_END: req.query.HASTA_FECHA,
         })
      )

      if (allData.length > 0) {
         res.status(200).json({
            msg: 'Datos obtenidos correctamente 🖖',
            data: allData,
         })
      } else {
         res.status(200).json({
            msg: 'No hay datos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.postControlProceso = async (req, res) => {
   try {
      const {
         LOTE_SAP,
         LOTE_CAL,
         ORD_PRODUC,
         ORD_COMP,
         ORD_VEN,
         PT_CODE,
         ECT: ECT_STD,
         PESO,
         TIEMPO,
         OBSERVACIONES,
         DISPOSICION,
      } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const searchOP = await client.exec(
         getSearchCabCtrlProc({
            ORD_PRODUC,
            PT_CODE,
         })
      )

      if (searchOP.length > 0) {
         res.status(400).json({
            msg: 'Información ya registrada 🚫',
         })
      } else {
         const saveCtrlPro = await client.exec(
            postSaveCabCtrlProc({
               LOTE_SAP,
               LOTE_CAL,
               ORD_PRODUC,
               ORD_COMP,
               ORD_VEN,
               PT_CODE,
               ECT_STD,
               USER,
               TIEMPO,
               PESO,
               OBSERVACIONES,
               DISPOSICION
            })
         )

         if (saveCtrlPro) {
            res.status(200).json({
               msg: 'Información guardada con éxito 🖖',
               data: { ...req.body, ANALISTA: USER },
            })
         } else {
            res.status(200).json({
               msg: 'No se ha podido guardar la información 😫',
               data: [],
            })
         }
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getCtrlProcesoColImp = async (req, res) => {
   try {
      client.connect()
      const allTintas = await client.exec(
         getColorsImpresion({
            OP: req.query.OP,
         })
      )

      const detailsPT = await client.exec(
         getDetailsEmbaje({
            PT_CODE: req.query.PT_CODE,
         })
      )

      const detailsLote = await client.exec(
         getLoteSAPCtrlProc({
            OP: req.query.OP,
         })
      )

      const usersDep = await client.exec(
         getPositionUsers()
      )

      res.status(200).json({
         msg: 'Tintas obtenidas correctamente 🖖',
         data: { allTintas, detailsPT, detailsLote, usersDep },
      })
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.postControlProcesoDoc = async (req, res) => {
   try {
      const {
         OP,
         ECT,
         CALIBREM,
         CALIBREIN,
         PATB,
         PATC,
         FCTC,
         GRAMAJE,
         COBB,
         BCTTEORICO,
         BCTREALUNO,
         BCTREALDOS,
         BCTREALTRES,
         BCTREALPRO,
         CARGA,
         LARGO,
         ANCHO,
         ALTO,
         PERIMETRO,
         UNI_BULTO,
         OBSERVACIONES,
         CHECK_COLOR_IMP,
         CHECK_PALETIZADO,
         CHECK_RECUBRIMIENTO,
         CHECK_IMP_TEXT,
         CHECK_IMP_IMG,
         CHECK_IMP_COBA,
         REQUERIMIENTO,
         HUMEDAD
      } = req.body

      const { user: USER } = await decodeJWT(req.headers.authorization)

      client.connect()
      const saveDocCP = await client.exec(
         postSaveDocCtrlProc({
            OP,
            ECT,
            CALIBREM,
            CALIBREIN,
            PATB,
            PATC,
            FCTC,
            GRAMAJE,
            COBB,
            BCTTEORICO,
            BCTREALUNO,
            BCTREALDOS,
            BCTREALTRES,
            BCTREALPRO,
            CARGA,
            LARGO,
            ANCHO,
            ALTO,
            PERIMETRO,
            UNI_BULTO,
            OBSERVACIONES,
            USER,
            CHECK_COLOR_IMP,
            CHECK_PALETIZADO,
            CHECK_RECUBRIMIENTO,
            CHECK_IMP_TEXT,
            CHECK_IMP_IMG,
            CHECK_IMP_COBA,
            REQUERIMIENTO,
            HUMEDAD
         })
      )

      if (saveDocCP) {
         res.status(200).json({
            msg: 'Información guardada con éxito 🖖',
            data: { ...req.body, ANALISTA: USER },
         })
      } else {
         res.status(200).json({
            msg: 'No se ha podido guardar la información 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getUsersPositions = async (req, res) => {
   try {
      client.connect()
      const usersDep = await client.exec(
         getPositionUsers()
      )

      if (usersDep.length > 0) {
         res.status(200).json({
            msg: 'Usuarios obtenidos correctamente 🖖',
            data: usersDep,
         })
      } else {
         res.status(400).json({
            msg: 'No hay datos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getTestCtrlProcessCOP = async (req, res) => {
   try {
      client.connect()
      const allTest = await client.exec(getListCtrlProcess(req.query.DATE))

      if (allTest.length > 0) {
         res.status(200).json({
            msg: 'Test obtenidos correctamente 🖖',
            data: allTest,
         })
      } else {
         res.status(204).json({
            msg: 'No hay test registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.postCopyCtrlProcessCOP = async (req, res) => {
   try {
      const {
         DOC_SAP_DES,
         DOC_SAP_NEW
      } = req.body

      client.connect()
      const allCabCtrlPro = await client.exec(getCabCtrlProc({ ORDEN_PROD: DOC_SAP_DES }))

      if (allCabCtrlPro.length > 0) {
         const allCabCtrlProNew = await client.exec(getCabCtrlProc({ ORDEN_PROD: DOC_SAP_NEW }))
         const loteSAP = await client.exec(searchLoteSAP({ OP: DOC_SAP_NEW }))

         if (allCabCtrlProNew.length <= 0) {
            const copyCab = await client.exec(postCopyCabCtrlProc({
               LOTE_SAP: loteSAP[0].DistNumber || allCabCtrlPro[0].LOTE_SAP,
               LOTE_CAL: allCabCtrlPro[0].LOTE_CAL,
               ORDEN_PROD: DOC_SAP_NEW,
               ORD_COMP: allCabCtrlPro[0].ORDEN_COMP,
               ORD_VEN: allCabCtrlPro[0].ORDEN_VENT,
               PT_CODE: allCabCtrlPro[0].PT_CODE,
               ECT_STD: allCabCtrlPro[0].ECT_STD,
               USER: allCabCtrlPro[0].ANALISTA,
               TIEMPO: allCabCtrlPro[0].TIEMPO,
               DISPOSICION: allCabCtrlPro[0].ESTADO,
               OBSERVACIONES: allCabCtrlPro[0].OBSERVACIONES,
               STATUS: allCabCtrlPro[0].STATUS,
               PESO: allCabCtrlPro[0].PESO,
            }))

            if (copyCab) {
               await client.exec(putCabCtrlProc({ ORDEN_PROD: DOC_SAP_DES, STATUS: 'C' }))

               const allDocCtrlPro = await client.exec(getDocCtrlProc({ ORDEN_PROD: DOC_SAP_DES }))

               if (allDocCtrlPro.length > 0) {
                  const copyDoc = await client.exec(postCopyDocCtrlProc({
                     ORDEN_PROD: DOC_SAP_NEW,
                     ECT: allDocCtrlPro[0].ECT,
                     CALIBRE_MM: allDocCtrlPro[0].CALIBRE_MM,
                     CALIBRE_IN: allDocCtrlPro[0].CALIBRE_IN,
                     PAT_B: allDocCtrlPro[0].PAT_B,
                     PAT_C: allDocCtrlPro[0].PAT_C,
                     FCTC: allDocCtrlPro[0].FCTC,
                     GRAMAJE: allDocCtrlPro[0].GRAMAJE,
                     COBB: allDocCtrlPro[0].COBB,
                     BCT_TEO: allDocCtrlPro[0].BCT_TEO,
                     BCTRE_ONE: allDocCtrlPro[0].BCTRE_ONE,
                     BCTRE_TWO: allDocCtrlPro[0].BCTRE_TWO,
                     BCTRE_TREE: allDocCtrlPro[0].BCTRE_TREE,
                     BCTREPRO_LBF: allDocCtrlPro[0].BCTREPRO_LBF,
                     CARGA_EST: allDocCtrlPro[0].CARGA_EST,
                     LARGO: allDocCtrlPro[0].LARGO,
                     ANCHO: allDocCtrlPro[0].ANCHO,
                     ALTO: allDocCtrlPro[0].ALTO,
                     PERIMETRO: allDocCtrlPro[0].PERIMETRO,
                     UNI_BULTO: allDocCtrlPro[0].UNI_BULTO,
                     CHECK_CIMP: allDocCtrlPro[0].CHECK_CIMP === 1 ? true : false,
                     CHECK_PAL: allDocCtrlPro[0].CHECK_PAL === 1 ? true : false,
                     CHECK_RECINT: allDocCtrlPro[0].CHECK_RECINT === 1 ? true : false,
                     CHECK_IMPTXT: allDocCtrlPro[0].CHECK_IMPTXT === 1 ? true : false,
                     CHECK_IMPIMG: allDocCtrlPro[0].CHECK_IMPIMG === 1 ? true : false,
                     CHECK_IMPCOD: allDocCtrlPro[0].CHECK_IMPCOD === 1 ? true : false,
                     REQUERIMIENTO: allDocCtrlPro[0].REQUERIMIENTO,
                     OBSERVACIONES: allDocCtrlPro[0].OBSERVACIONES,
                     ANALISTA: allDocCtrlPro[0].ANALISTA,
                     HUMEDAD: allDocCtrlPro[0].HUMEDAD,
                  }))

                  if (copyDoc) {
                     res.status(200).json({
                        msg: 'Orden de producción copiado con éxito 🥳',
                        data: [],
                     })
                  } else {
                     res.status(400).json({
                        msg: 'No se ha podido copiar la orden de producción 😫',
                        data: [],
                     })
                  }
               } else {
                  res.status(200).json({
                     msg: 'Cabecera de OP copiada con éxito 🥳',
                     data: [],
                  })
               }
            } else {
               res.status(400).json({
                  msg: 'No se ha podido copiar la orden de producción 😫',
                  data: [],
               })
            }
         } else {
            res.status(400).json({
               msg: 'La orden de producción a copiar ya existe 😫',
               data: [],
            })
         }
      } else {
         res.status(400).json({
            msg: 'La orden de producción a duplicar no existe 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.putLoteSAPCOP = async (req, res) => {
   try {
      const {
         ORD_PROD,
         LOTE
      } = req.body

      client.connect()
      const updateCabLote = await client.exec(putCabCtrlProc({ ORDEN_PROD: ORD_PROD, LOTE_SAP: LOTE }))

      if (updateCabLote) {
         res.status(200).json({
            msg: 'Lote actualizado con éxito 🥳',
            data: [],
         })
      } else {
         res.status(400).json({
            msg: 'No se pudo actualizar el lote 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getDetailsTestCOP = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(getDetailsTestCOPLAIM({
         ORDEN_PROD: req.query.ORD_PROD,
      }))

      if (allInfo.length > 0) {
         res.status(200).json({
            msg: 'Test obtenidos correctamente 🖖',
            data: allInfo,
         })
      } else {
         res.status(204).json({
            msg: 'No hay test registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.putTestCtrlProCab = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(putCabCtrlProc({
         ORDEN_PROD: req.body.ORD_PRODUC,
         ORDEN_COMP: req.body.ORD_COMP,
         LOTE_SAP: req.body.LOTE_SAP,
         LOTE_CAL: req.body.LOTE_CAL,
         ORDEN_VENT: req.body.ORD_VEN,
         PT_CODE: req.body.PT_CODE,
         ECT_STD: req.body.ECT,
         TIEMPO: req.body.TIEMPO,
         ESTADO: req.body.DISPOSICION,
         OBSERVACIONES: req.body.OBSERVACIONES,
         PESO: req.body.PESO,
      }))

      if (allInfo) {
         res.status(200).json({
            msg: 'Información actualizada correctamente 🖖',
            data: allInfo,
         })
      } else {
         res.status(400).json({
            msg: 'No se pudo actualizar la información 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.putTestCtrlProDoc = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(putDocCtrlProc({
         ORDEN_PROD: req.body.OP,
         ECT: req.body.ECT,
         CALIBRE_MM: req.body.CALIBREM,
         CALIBRE_IN: req.body.CALIBREIN,
         PAT_B: req.body.PATB,
         PAT_C: req.body.PATC,
         FCTC: req.body.FCTC,
         GRAMAJE: req.body.GRAMAJE,
         COBB: req.body.COBB,
         BCT_TEO: req.body.BCTTEORICO,
         BCTRE_ONE: req.body.BCTREALUNO,
         BCTRE_TWO: req.body.BCTREALDOS,
         BCTRE_TREE: req.body.BCTREALTRES,
         BCTREPRO_LBF: req.body.BCTREALPRO,
         CARGA_EST: req.body.CARGA,
         LARGO: req.body.LARGO,
         ANCHO: req.body.ANCHO,
         ALTO: req.body.ALTO,
         PERIMETRO: req.body.PERIMETRO,
         UNI_BULTO: req.body.UNI_BULTO,
         CHECK_CIMP: req.body.CHECK_COLOR_IMP,
         CHECK_PAL: req.body.CHECK_PALETIZADO,
         CHECK_RECINT: req.body.CHECK_RECUBRIMIENTO,
         CHECK_IMPTXT: req.body.CHECK_IMP_TEXT,
         CHECK_IMPIMG: req.body.CHECK_IMP_IMG,
         CHECK_IMPCOD: req.body.CHECK_IMP_COBA,
         REQUERIMIENTO: req.body.REQUERIMIENTO ,
         OBSERVACIONES: req.body.OBSERVACIONES ,
         HUMEDAD: req.body.HUMEDAD
      }))

      if (allInfo) {
         res.status(200).json({
            msg: 'Información actualizada correctamente 🖖',
            data: allInfo,
         })
      } else {
         res.status(400).json({
            msg: 'No se pudo actualizar la información 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

/**
 * Trazabilidad Inversa (Insumos) - Calidad
 */
ctrlCalidad.getAllInsumosTraInv = async (req, res) => {
   try {
      client.connect()
      const allInsumos = await client.exec(getListInsTraInv())

      if (allInsumos.length > 0) {
         res.status(200).json({
            msg: 'Insumos obtenidos correctamente 🖖',
            data: allInsumos,
         })
      } else {
         res.status(200).json({
            msg: 'No hay insumos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)
      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getTraInvLote = async (req, res) => {
   try {
      const { LOTE } = req.query

      client.connect()
      const allInsumos = await client.exec(getListLoteTraInv({ LOTE }))

      if (allInsumos.length > 0) {
         res.status(200).json({
            msg: 'Insumos obtenidos correctamente 🖖',
            data: allInsumos,
         })
      } else {
         res.status(200).json({
            msg: 'No hay insumos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)
      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.getTraInvCompra = async (req, res) => {
   try {
      const { LOTE, COD } = req.query

      client.connect()
      const allInsumos = await client.exec(getCompraTraInv({ LOTE, COD }))

      if (allInsumos.length > 0) {
         res.status(200).json({
            msg: 'Insumos obtenidos correctamente 🖖',
            data: allInsumos,
         })
      } else {
         res.status(200).json({
            msg: 'No hay insumos registrados 😫',
            data: [],
         })
      }
   } catch (e) {
      console.error(e)
      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

/**
 * Generación de PDF - Trazabilidad Inversa
 */
ctrlCalidad.postGeneratePDFTrazInv = async (req, res) => {
   try {
      const { data } = req.body
      const pdf = require('html-pdf')
      // const path = require('path')

      if (!data || data.length === 0) {
         return res.status(400).json({
            msg: 'No hay datos para generar el PDF 📋',
         })
      }

      const fechaActual = moment().format('DD/MM/YYYY HH:mm')

      // Generar filas de la tabla
      const tableRows = data
         .map(
            (item, index) => `
         <tr>
            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
            <td>${item.PT_CODE || '---'}</td>
            <td>${item.INSUMO || '---'}</td>
            <td style="text-align: center;">${item.LOTE || '---'}</td>
         </tr>
      `
         )
         .join('')

      const htmlTemplate = `
         <!DOCTYPE html>
         <html>
         <head>
            <meta charset="UTF-8">
            <title>Reporte Trazabilidad Insumos</title>
            <style>
               @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');

               * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
               }

               body {
                  font-family: 'PT Sans', Arial, sans-serif;
                  font-size: 10px;
                  color: #333;
                  padding: 20px;
               }

               .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 2px solid #667eea;
                  padding-bottom: 15px;
                  margin-bottom: 20px;
               }

               .logo {
                  width: 120px;
               }

               .header-info {
                  text-align: right;
               }

               .header-info h1 {
                  color: #667eea;
                  font-size: 18px;
                  margin-bottom: 5px;
               }

               .header-info p {
                  color: #666;
                  font-size: 10px;
               }

               .title {
                  text-align: center;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 12px;
                  border-radius: 6px;
                  margin-bottom: 20px;
               }

               .title h2 {
                  font-size: 14px;
                  margin: 0;
               }

               .summary {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 15px;
               }

               .summary-item {
                  background: #f5f7fa;
                  padding: 10px 15px;
                  border-radius: 6px;
                  text-align: center;
                  flex: 1;
                  margin: 0 5px;
               }

               .summary-item span {
                  display: block;
                  font-size: 9px;
                  color: #666;
               }

               .summary-item strong {
                  font-size: 16px;
                  color: #667eea;
               }

               table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 10px;
               }

               th {
                  background: #667eea;
                  color: white;
                  padding: 10px 8px;
                  text-align: left;
                  font-size: 10px;
                  font-weight: 600;
               }

               td {
                  padding: 8px;
                  border-bottom: 1px solid #e8e8e8;
                  font-size: 9px;
               }

               tr:nth-child(even) {
                  background: #f9f9f9;
               }

               tr:hover {
                  background: #e6f7ff;
               }

               .footer {
                  margin-top: 30px;
                  padding-top: 15px;
                  border-top: 1px solid #ddd;
                  display: flex;
                  justify-content: space-between;
                  font-size: 8px;
                  color: #999;
               }

               .page-number {
                  text-align: right;
               }
            </style>
         </head>
         <body>
            <div class="header">
               <img src="https://drive.google.com/uc?export=view&id=1ee98he6OsfWPJuBQHGy2mknGrgpnMt1n" class="logo" alt="Logo">
               <div class="header-info">
                  <h1>CARTOMANABI S.A.</h1>
                  <p>Sistema de Calidad - Trazabilidad</p>
                  <p>Generado: ${fechaActual}</p>
               </div>
            </div>

            <div class="title">
               <h2>🔍 REPORTE DE TRAZABILIDAD DE INSUMOS</h2>
            </div>

            <div class="summary">
               <div class="summary-item">
                  <span>Total Registros</span>
                  <strong>${data.length}</strong>
               </div>
               <div class="summary-item">
                  <span>Lotes Únicos</span>
                  <strong>${new Set(data.map((d) => d.LOTE)).size}</strong>
               </div>
               <div class="summary-item">
                  <span>Productos</span>
                  <strong>${new Set(data.map((d) => d.PT_CODE)).size}</strong>
               </div>
            </div>

            <table>
               <thead>
                  <tr>
                     <th style="width: 40px; text-align: center;">#</th>
                     <th style="width: 120px;">CODE PT</th>
                     <th>INSUMO</th>
                     <th style="width: 100px; text-align: center;">LOTE</th>
                  </tr>
               </thead>
               <tbody>
                  ${tableRows}
               </tbody>
            </table>

            <div class="footer">
               <span>CARTOMANABI S.A. - Sistema de Calidad</span>
               <span class="page-number">Página 1</span>
            </div>
         </body>
         </html>
      `

      const options = {
         format: 'A4',
         orientation: 'portrait',
         border: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm',
         },
         timeout: 60000,
      }

      pdf.create(htmlTemplate, options).toBuffer((err, buffer) => {
         if (err) {
            console.error('Error generando PDF:', err)
            return res.status(500).json({
               msg: 'Error al generar el PDF 😫',
            })
         }

         res.setHeader('Content-Type', 'application/pdf')
         res.setHeader(
            'Content-Disposition',
            `attachment; filename=Trazabilidad_Insumos_${moment().format('YYYYMMDD_HHmmss')}.pdf`
         )
         res.send(buffer)
      })
   } catch (e) {
      console.error(e)
      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlCalidad.postGeneratePDFTrazInvLote = async (req, res) => {
   try {
      const { lote, producto, data } = req.body
      const pdf = require('html-pdf')

      if (!data || data.length === 0) {
         return res.status(400).json({
            msg: 'No hay datos para generar el PDF 📋',
         })
      }

      const fechaActual = moment().format('DD/MM/YYYY HH:mm')
      const totalConsumo = data.reduce((acc, item) => acc + Number(item.CONSUMO || 0), 0)

      // Generar filas de la tabla
      const tableRows = data
         .map(
            (item, index) => `
         <tr>
            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
            <td style="text-align: center;">${Number(item.DOC_SAP) || '---'}</td>
            <td style="text-align: right; color: ${Number(item.CONSUMO) < 0 ? '#ff4d4f' : '#52c41a'}; font-weight: bold;">
               ${Number(item.CONSUMO) < 0 ? item.CONSUMO : '+' + item.CONSUMO}
            </td>
            <td>${item.CODE_PT || '---'}</td>
            <td>${item.PRODUCTO || '---'}</td>
            <td style="text-align: center;">${item.LOTE || '---'}</td>
            <td>
               <span style="background: ${item.DOCUMENTO === 'OrdenProduccion' ? '#52c41a' : '#fa8c16'}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 8px;">
                  ${item.DOCUMENTO || '---'}
               </span>
            </td>
         </tr>
      `
         )
         .join('')

      const htmlTemplate = `
         <!DOCTYPE html>
         <html>
         <head>
            <meta charset="UTF-8">
            <title>Reporte Trazabilidad - Lote ${lote}</title>
            <style>
               @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');

               * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
               }

               body {
                  font-family: 'PT Sans', Arial, sans-serif;
                  font-size: 10px;
                  color: #333;
                  padding: 20px;
               }

               .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-bottom: 2px solid #667eea;
                  padding-bottom: 15px;
                  margin-bottom: 20px;
               }

               .logo {
                  width: 120px;
               }

               .header-info {
                  text-align: right;
               }

               .header-info h1 {
                  color: #667eea;
                  font-size: 18px;
                  margin-bottom: 5px;
               }

               .header-info p {
                  color: #666;
                  font-size: 10px;
               }

               .title {
                  text-align: center;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 12px;
                  border-radius: 6px;
                  margin-bottom: 15px;
               }

               .title h2 {
                  font-size: 14px;
                  margin: 0;
               }

               .lote-info {
                  background: #f5f7fa;
                  padding: 12px;
                  border-radius: 6px;
                  margin-bottom: 15px;
                  display: flex;
                  justify-content: space-between;
               }

               .lote-info div {
                  flex: 1;
               }

               .lote-info label {
                  font-size: 9px;
                  color: #666;
                  display: block;
               }

               .lote-info strong {
                  font-size: 12px;
                  color: #1890ff;
               }

               .summary {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 15px;
               }

               .summary-item {
                  background: #f5f7fa;
                  padding: 10px 15px;
                  border-radius: 6px;
                  text-align: center;
                  flex: 1;
                  margin: 0 5px;
               }

               .summary-item span {
                  display: block;
                  font-size: 9px;
                  color: #666;
               }

               .summary-item strong {
                  font-size: 14px;
                  color: #667eea;
               }

               table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 10px;
               }

               th {
                  background: #667eea;
                  color: white;
                  padding: 8px 6px;
                  text-align: left;
                  font-size: 9px;
                  font-weight: 600;
               }

               td {
                  padding: 6px;
                  border-bottom: 1px solid #e8e8e8;
                  font-size: 8px;
               }

               tr:nth-child(even) {
                  background: #f9f9f9;
               }

               .total-row {
                  background: #e6f7ff !important;
                  font-weight: bold;
               }

               .footer {
                  margin-top: 30px;
                  padding-top: 15px;
                  border-top: 1px solid #ddd;
                  display: flex;
                  justify-content: space-between;
                  font-size: 8px;
                  color: #999;
               }
            </style>
         </head>
         <body>
            <div class="header">
               <img src="https://drive.google.com/uc?export=view&id=1ee98he6OsfWPJuBQHGy2mknGrgpnMt1n" class="logo" alt="Logo">
               <div class="header-info">
                  <h1>CARTOMANABI S.A.</h1>
                  <p>Sistema de Calidad - Trazabilidad</p>
                  <p>Generado: ${fechaActual}</p>
               </div>
            </div>

            <div class="title">
               <h2>📦 REPORTE DE TRAZABILIDAD - LOTE: ${lote}</h2>
            </div>

            <div class="lote-info">
               <div>
                  <label>Insumo / Producto</label>
                  <strong>${producto}</strong>
               </div>
               <div>
                  <label>Lote</label>
                  <strong>${lote}</strong>
               </div>
            </div>

            <div class="summary">
               <div class="summary-item">
                  <span>Total Registros</span>
                  <strong>${data.length}</strong>
               </div>
               <div class="summary-item">
                  <span>Total Consumo</span>
                  <strong style="color: ${totalConsumo < 0 ? '#ff4d4f' : '#52c41a'}">${totalConsumo}</strong>
               </div>
               <div class="summary-item">
                  <span>Documentos SAP</span>
                  <strong>${new Set(data.map((d) => d.DOC_SAP)).size}</strong>
               </div>
            </div>

            <table>
               <thead>
                  <tr>
                     <th style="width: 30px; text-align: center;">#</th>
                     <th style="width: 70px; text-align: center;">DOC SAP</th>
                     <th style="width: 70px; text-align: right;">CONSUMO</th>
                     <th style="width: 90px;">CODE PRO.</th>
                     <th>PRODUCTO</th>
                     <th style="width: 70px; text-align: center;">LOTE</th>
                     <th style="width: 90px;">DOCUMENTO</th>
                  </tr>
               </thead>
               <tbody>
                  ${tableRows}
                  <tr class="total-row">
                     <td colspan="2" style="text-align: right;">TOTAL:</td>
                     <td style="text-align: right; color: ${totalConsumo < 0 ? '#ff4d4f' : '#52c41a'};">${totalConsumo}</td>
                     <td colspan="4"></td>
                  </tr>
               </tbody>
            </table>

            <div class="footer">
               <span>CARTOMANABI S.A. - Sistema de Calidad</span>
               <span>Página 1</span>
            </div>
         </body>
         </html>
      `

      const options = {
         format: 'A4',
         orientation: 'landscape',
         border: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm',
         },
         timeout: 60000,
      }

      pdf.create(htmlTemplate, options).toBuffer((err, buffer) => {
         if (err) {
            console.error('Error generando PDF:', err)
            return res.status(500).json({
               msg: 'Error al generar el PDF 😫',
            })
         }

         res.setHeader('Content-Type', 'application/pdf')
         res.setHeader(
            'Content-Disposition',
            `attachment; filename=Trazabilidad_Lote_${lote}_${moment().format('YYYYMMDD_HHmmss')}.pdf`
         )
         res.send(buffer)
      })
   } catch (e) {
      console.error(e)
      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

module.exports = ctrlCalidad

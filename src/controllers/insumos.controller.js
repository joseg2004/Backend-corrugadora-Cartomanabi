const moment = require('moment')
moment.locale('es')

const ctrlInsumos = {}

const client = require('../connections/hana')

const {
   getListInsumos,
   searchAllTintasProv,
   searchTypeArticulo,
   searchTypeFilter,
   searchItemsProdcts,
   searchDetSolBuy,
   searchAllPallet
} = require('../models/hanaQInsumos')

const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

ctrlInsumos.getAllTintas = async (req, res) => {
   try {
      client.connect()
      const allBobinas = await client.exec(getListInsumos())

      if (allBobinas.length > 0) {
         res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allBobinas,
         })
      } else {
         res.status(204).json({
            msg: 'No hay información registrada 😫',
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

ctrlInsumos.getAllTintasProv = async (req, res) => {
   try {
      const {
         NUM_MONTH,
         CODE,
         OPT,
         GRP1,
         GRP2,
         GRP3,
         NUM_BOD
      } = req.query

      const
         START =
               moment()
                  .utcOffset('-05:00')
                  .date(1)
                  .subtract(NUM_MONTH, 'months')
                  .format('YYYY-MM-DD'),
         END =
            moment(moment().subtract(1, 'months').format('YYYY-MM-DD'))
               .utcOffset('-05:00')
               .date(months[Number(moment().subtract(1, 'months').format('MM')) - 1])
               .format('YYYY-MM-DD'),
         START_ONE =
               moment()
                  .utcOffset('-05:00')
                  .date(1)
                  .subtract(1, 'months')
                  .format('YYYY-MM-DD'),
         END_ONE =
               moment(`${START_ONE}`)
                  .date(months[Number(moment(START_ONE).format('MM')) - 1])
                  .format('YYYY-MM-DD'),
         START_TWO =
               moment()
                  .utcOffset('-05:00')
                  .date(1)
                  .subtract(2, 'months')
                  .format('YYYY-MM-DD'),
         END_TWO =
               moment(`${START_TWO}`)
                  .date(months[Number(moment(START_TWO).format('MM')) - 1])
                  .format('YYYY-MM-DD'),
         START_MONTH =
               moment()
                  .utcOffset('-05:00')
                  .date(1)
                  .format('YYYY-MM-DD'),
         END_MONTH = moment().utcOffset('-05:00').format('YYYY-MM-DD')

      console.table({
         START,
         END,
         START_ONE,
         END_ONE,
         START_TWO,
         END_TWO,
         START_MONTH,
         END_MONTH,
         GRP1,
         GRP2,
         GRP3,
         NUM_BOD
      })

      client.connect()
      let allTintas = []

      if (OPT === 'TINTA') {
         // console.log(searchAllTintasProv({
         //    START,
         //    END,
         //    NUM_MONTH,
         //    CODE,
         //    START_ONE,
         //    END_ONE,
         //    START_TWO,
         //    END_TWO
         // }))

         allTintas = await client.exec(searchAllTintasProv({
            START,
            END,
            NUM_MONTH,
            CODE,
            START_ONE,
            END_ONE,
            START_TWO,
            END_TWO
         }))
      }

      if (OPT === 'PALLET') {
         allTintas = await client.exec(searchAllPallet())
      }

      if (OPT === 'INSUMOS') {
         // console.log(searchItemsProdcts({
         //    START,
         //    END,
         //    NUM_MONTH,
         //    CODE,
         //    START_ONE,
         //    END_ONE,
         //    START_TWO,
         //    END_TWO,
         //    START_MONTH,
         //    END_MONTH,
         //    GRP1,
         //    GRP2,
         //    GRP3,
         //    NUM_BOD
         // }))

         allTintas = await client.exec(searchItemsProdcts({
            START,
            END,
            NUM_MONTH,
            CODE,
            START_ONE,
            END_ONE,
            START_TWO,
            END_TWO,
            START_MONTH,
            END_MONTH,
            GRP1,
            GRP2,
            GRP3,
            NUM_BOD
         }))
      }

      res.status(200).json(allTintas)
   } catch (e) {
      console.error(e)

      res.status(500).json({
         msg: 'Error del server. Intentelo más luego x_x 🤯',
      })
   }
}

ctrlInsumos.getAllTypeArt = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(searchTypeArticulo({ CODE: req.query.CODE }))

      if (allInfo.length > 0) {
         res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo,
         })
      } else {
         res.status(204).json({
            msg: 'No hay información registrada 😫',
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

ctrlInsumos.getTiposSelect = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(searchTypeFilter({ TOP: req.query.TOP }))

      if (allInfo.length > 0) {
         res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo,
         })
      } else {
         res.status(204).json({
            msg: 'No hay información registrada 😫',
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

ctrlInsumos.getDetailsSolBuy = async (req, res) => {
   try {
      client.connect()
      const allInfo = await client.exec(searchDetSolBuy({ PT: req.query.PT }))

      if (allInfo.length > 0) {
         res.status(200).json({
            msg: 'Información obtenida correctamente 🖖',
            data: allInfo,
         })
      } else {
         res.status(200).json({
            msg: 'No hay información registrada 😫',
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

module.exports = ctrlInsumos
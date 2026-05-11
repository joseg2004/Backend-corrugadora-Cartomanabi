const client = require('../connections/hana')
const { searchAsignVend } = require('../models/hanaQuery')

/**
 * Extraer las asignaciones de los vendedores
 * @param {*} vend string
 * @returns venedores[] string, id_vend[] string
 */
const assignSellers = async ({ vend }) => {
   let vendedores = ''
   let id_vend

   client.connect()
   const resp = await client.exec(searchAsignVend({ USERNAME: vend }))

   const ID_VEND = resp[0]?.ID || null
   const ID_ASIGN = resp[0]?.VEND_IDS || null
   const VEND_ASIGN = resp[0]?.VEND_ASIGNADOS || null

   if (VEND_ASIGN !== null && ID_ASIGN !== null) {
      const asing = VEND_ASIGN.replace(/, /g, '\', \'')

      vendedores = `'${asing}', '${vend}'`
      id_vend = `${ID_ASIGN}, ${ID_VEND}`
   } else {
      vendedores = `'${vend}'`
      id_vend = `${ID_VEND}`
   }

   return { vendedores, id_vend }
}

module.exports = { assignSellers }
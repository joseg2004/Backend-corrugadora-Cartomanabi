const client = require('../connections/hana')
const { searchVendAssign, searchVendAssignRestc } = require('../models/hanaQAccounts')

const asigVendedor = async ({ VEND, ID }) => {
   let vendedores = ''
   const resp = await client.exec(searchVendAssign({ ID }))

   if (resp.length > 0 && resp[0]?.VEND_ASIGNADOS !== null) {
      const asing = resp[0].VEND_ASIGNADOS.replace(/, /g, '\', \'')
      vendedores = `'${asing}', '${VEND}'`
   } else {
      vendedores = `'${VEND}'`
   }

   return vendedores
}

const asigVendedorRest = async ({ VEND, ID }) => {
   let vendedores = ''
   const resp = await client.exec(searchVendAssignRestc({ ID }))

   if (resp.length > 0 && resp[0]?.VEND_ASIGNADOS !== null) {
      const asing = resp[0].VEND_ASIGNADOS.replace(/, /g, '\', \'')
      vendedores = `'${asing}', '${VEND}'`
   } else {
      vendedores = `'${VEND}'`
   }

   return vendedores
}

module.exports = { asigVendedor, asigVendedorRest }
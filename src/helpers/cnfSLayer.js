const axios = require('axios')
const https = require('https')

const httpsAgent = new https.Agent({
   rejectUnauthorized: false,
   secureProtocol: 'TLSv1_method',
})

/**
 * Iniciar sesión en SAP Business One
 * @param {string} user
 * @param {string} pass
 * @returns {string} SessionId
 * @returns {boolean} false
 *
 * @example
 * const SessionId = await SignInSL('admin', '*****')
 *
 * if (SessionId) {
 *   console.log(SessionId)
 * } else {
 *  console.log('Error al iniciar sesión')
 * }
 * */
const SignInSL = async (user, pass) => {
   try {
      const sapCredentials = {
         'CompanyDB': `${process.env.HANA_DATABASE}`,
         'UserName': `${user || process.env.SL_USER}`,
         'Password': `${pass || process.env.SL_PASS}`,
      }

      const resp = await axios.post(`${process.env.SL_URL}/Login`, sapCredentials, {
         httpsAgent: httpsAgent
      })

      if (resp.status === 200) {
         const { SessionId } = resp.data
         return SessionId
      }

      if (resp.status === 400) {
         return false
      }

      return false
   } catch (e) {
      console.error(e.message)

      return false
   }
}

/**
 * Cerrar sesión en SAP Business One
 * @param {string} SessionId
 * @returns
 */
const SignOutSL = async (SessionId) => {
   try {
      await axios.post(`${process.env.SL_URL}/Logout`, {}, {
         headers: {
            Cookie: `${SessionId}`,
         },
         httpsAgent: httpsAgent
      })
   } catch (e) {
      console.error(e)
   }
}

module.exports = { httpsAgent, SignInSL, SignOutSL }
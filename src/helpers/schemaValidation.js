/**
 * @param {[string]} schema
 * @param {*} objeto
 * @returns {boolean}
 * @description Valida que el objeto tenga las propiedades del schema
 * @example
 * const schema = ['nombre', 'apellido', 'edad']
 * const objeto = [{ nombre: 'Juan', apellido: 'Perez', edad: 20 }, { nombre: 'Pedro', apellido: 'Gomez', edad: 30 }]
 * validationSchema(schema, objeto) // true
 */
const validationSchema = (schema, objeto) => {
   let notEquals = 0

   for (const item of objeto) {
      const resp = schema.filter(clave => !Object.prototype.hasOwnProperty.call(item, clave))
      resp.length !== 0 ? ++notEquals : 0
   }

   return notEquals === 0
}

module.exports = { validationSchema }
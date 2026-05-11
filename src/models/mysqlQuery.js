const queryMySQL = {}

queryMySQL.searchTBobina = (id, abre) => {
   return ` SELECT
               ID_TIPO,
               ABREVIATURA
            FROM tipo_bobina
            WHERE
               ID_TIPO = '${id}' OR
               ABREVIATURA = '${abre}'`
}

queryMySQL.allCountries = (cod, pais) => {
   if (cod || pais) {
      return ` SELECT
                  ID_PAIS,
                  COD_PAIS,
                  PAIS
               FROM paises
               WHERE
                  COD_PAIS = '${cod}' OR
                  PAIS = '${pais}'
               ORDER BY PAIS ASC`
   } else {
      return ` SELECT
                  ID_PAIS,
                  COD_PAIS,
                  PAIS
               FROM paises
               ORDER BY PAIS ASC`
   }
}

queryMySQL.saveTPapel = (id, cod, det) => {
   return ` INSERT INTO tipo_papel (
               ID_TPAPEL,
               CODIGO,
               DETALLE
            ) VALUES (
               '${id}',
               '${cod}',
               '${det}'
            )`
}

queryMySQL.searchTPapel = (id, cod) => {
   if (id || cod) {
      return ` SELECT
                  ID_TPAPEL,
                  COD_PAPEL,
                  DETALLE
               FROM tipo_papel
               WHERE
                  ID_TPAPEL = '${id}' OR
                  CODIGO = '${cod}'
               ORDER BY DETALLE ASC`
   } else {
      return ` SELECT
                  ID_TPAPEL,
                  COD_PAPEL,
                  DETALLE
               FROM tipo_papel
               ORDER BY DETALLE ASC`
   }
}

queryMySQL.savePuerto = ({
   idPuerto,
   idCanton,
   nombre,
   direccion,
   email,
   duenio,
   telOne,
   telTwo,
}) => {
   return ` INSERT INTO puertos (
               ID_PUERTO,
               ID_CANTON,
               NOMBRE,
               DIRECCION,
               EMAIL,
               DUENIO,
               TELEFONO_ONE,
               TELEFONO_TWO
            ) VALUES (
               '${idPuerto}',
               '${idCanton}',
               '${nombre}',
               '${direccion}',
               '${email}',
               '${duenio}',
               '${telOne}',
               '${telTwo}'
            )`
}

queryMySQL.searchPuerto = (id, nom, ciu, pro) => {
   if (id || nom || ciu) {
      return ` SELECT
                  puertos.ID_PUERTO,
                  puertos.NOMBRE,
                  puertos.DIRECCION,
                  puertos.EMAIL,
                  puertos.DUENIO,
                  puertos.TELEFONO_ONE,
                  puertos.TELEFONO_TWO,
                  cantones.ID_CANTON,
                  cantones.CANTON,
                  provincias.ID_PROVINCIA,
                  provincias.PROVINCIA
               FROM
                  puertos
                  INNER JOIN
                  cantones
                  ON
                     puertos.ID_CANTON = cantones.ID_CANTON
                  INNER JOIN
                  provincias
                  ON
                     cantones.ID_PROVINCIA = provincias.ID_PROVINCIA
               WHERE
                  puertos.ID_PUERTO = '${id}' OR
                  puertos.NOMBRE = '${nom}' OR
                  cantones.CANTON = '${ciu}' OR
                  provincias.PROVINCIA = '${pro}'`
   } else {
      return ` SELECT
                  puertos.ID_PUERTO,
                  puertos.NOMBRE,
                  puertos.DIRECCION,
                  puertos.EMAIL,
                  puertos.DUENIO,
                  puertos.TELEFONO_ONE,
                  puertos.TELEFONO_TWO,
                  cantones.ID_CANTON,
                  cantones.CANTON,
                  provincias.ID_PROVINCIA,
                  provincias.PROVINCIA
               FROM
                  puertos
                  INNER JOIN
                  cantones
                  ON
                     puertos.ID_CANTON = cantones.ID_CANTON
                  INNER JOIN
                  provincias
                  ON
                     cantones.ID_PROVINCIA = provincias.ID_PROVINCIA
               ORDER BY
                  puertos.NOMBRE ASC`
   }
}

queryMySQL.saveTipImp = (id, num, tip) => {
   return ` INSERT INTO tip_import (
               ID_TIPIMPORT,
               NUM_IMP,
               TIPO_IMPORT
            ) VALUES (
               '${id}',
               '${num}',
               '${tip}'
            )`
}

queryMySQL.searchTipImp = (id, nom) => {
   if (id || nom) {
      return ` SELECT
                  ID_TIPIMPORT,
                  NUM_IMP,
                  TIPO_IMPORT
               FROM tip_import
               WHERE
                  ID_TIPIMPORT = '${id}' OR
                  TIPO_IMPORT = '${nom}'
               ORDER BY TIPO_IMPORT ASC`
   } else {
      return ` SELECT
                  ID_TIPIMPORT,
                  NUM_IMP,
                  TIPO_IMPORT
               FROM tip_import
               ORDER BY TIPO_IMPORT ASC`
   }
}

queryMySQL.allProvincias = (nom) => {
   if (nom) {
      return ` SELECT
                  ID_PROVINCIA,
                  PROVINCIA
               FROM provincias
               WHERE
                  PROVINCIA = '${nom}'
               ORDER BY PROVINCIA ASC`
   } else {
      return ` SELECT
                  ID_PROVINCIA,
                  PROVINCIA
               FROM provincias
               ORDER BY PROVINCIA ASC`
   }
}

queryMySQL.allCantones = ({ nom, idProv }) => {
   if (nom || idProv) {
      return ` SELECT
                  ID_CANTON,
                  ID_PROVINCIA,
                  CANTON
               FROM cantones
               WHERE
                  CANTON = '${nom}' OR
                  ID_PROVINCIA = '${idProv}'
               ORDER BY CANTON ASC`
   } else {
      return ` SELECT
                  ID_CANTON,
                  ID_PROVINCIA,
                  CANTON
               FROM cantones
               ORDER BY CANTON ASC`
   }
}

queryMySQL.searchImport = (id, dai) => {
   if (id || dai) {
      return ` SELECT
                  ID_IMPPAPEL,
                  DAI
               FROM importacion_pap
               WHERE
                  ID_IMPPAPEL = '${id}' OR
                  DAI = '${dai}'
               ORDER BY ID_IMPPAPEL ASC`
   } else {
      return ` SELECT *
               FROM importacion_pap
               ORDER BY ID_IMPPAPEL ASC`
   }
}

queryMySQL.saveImport = ({
   ID_IMPORT,
   ID_PAIS,
   ID_PUERTO,
   ID_TIPIMPORT,
   ORDEN_COMPRA,
   FACTURA,
   DAI,
   MRN,
   BL,
   PROVEEDOR,
   DATE_ARRIBO,
   VENC_ECAS,
   REGIMEN,
   COMENTARIO
}) => {
   return ` INSERT INTO importacion_pap (
               ID_IMPPAPEL,
               ID_PAIS,
               ID_PUERTO,
               ID_TIPIMPORT,
               ID_FIMPORTA,
               ORDEN_COMPRA,
               FACTURA,
               DAI,
               MRN,
               BL,
               PROVEEDOR,
               DATE_ARRIBO,
               VENC_ECAS,
               REGIMEN,
               COMENTARIO
            ) VALUES (
               '${ID_IMPORT}',
               '${ID_PAIS}',
               '${ID_PUERTO}',
               '${ID_TIPIMPORT}',
               '${DAI}',
               '${Number(ORDEN_COMPRA)}',
               '${FACTURA}',
               '${DAI}',
               '${MRN}',
               '${BL}',
               '${PROVEEDOR}',
               '${DATE_ARRIBO}',
               '${VENC_ECAS}',
               '${REGIMEN}',
               '${COMENTARIO}'
            )`
}

queryMySQL.searchTipFact = (id, nom) => {
   if (id || nom) {
      return ` SELECT
                  ID_TIPFACT,
                  TIPO
               FROM tip_factura
               WHERE
                  ID_TIPFACT = '${id}' OR
                  TIPO = '${nom}'
               ORDER BY TIPO ASC`
   } else {
      return ` SELECT
                  ID_TIPFACT,
                  TIPO
               FROM tip_factura
               ORDER BY TIPO ASC`
   }
}

queryMySQL.saveTipFact = (id, tip) => {
   return ` INSERT INTO tip_factura (
               ID_TIPFACT,
               TIPO
            ) VALUES (
               '${id}',
               '${tip}'
            )`
}

queryMySQL.searchFactura = (id, imp) => {
   if (id || imp) {
      return ` SELECT
                  facturas.ID_FACTURA,
                  facturas.ID_TIPFACT,
                  tip_factura.TIPO,
                  facturas.ID_IMPPAPEL,
                  facturas.COMENTARIO
               FROM
                  facturas
                  INNER JOIN
                  tip_factura
                  ON
                     facturas.ID_TIPFACT = tip_factura.ID_TIPFACT
               WHERE
                  ${id ? `facturas.ID_FACTURA = '${id}'` : ''}
                  ${imp ? `AND facturas.ID_IMPPAPEL = '${imp}'` : ''}
               ORDER BY
                  facturas.ID_FACTURA ASC`
   } else {
      return ` SELECT
                  facturas.ID_FACTURA,
                  facturas.ID_TIPFACT,
                  tip_factura.TIPO,
                  facturas.ID_IMPPAPEL,
                  facturas.COMENTARIO
               FROM
                  facturas
                  INNER JOIN
                  tip_factura
                  ON
                     facturas.ID_TIPFACT = tip_factura.ID_TIPFACT
               ORDER BY
                  facturas.ID_FACTURA ASC`

   }
}

queryMySQL.saveFactura = ({
   ID_FACTURA,
   ID_TIPFACT,
   ID_IMPPAPEL,
   COMENTARIO
}) => {
   return ` INSERT INTO facturas (
               ID_FACTURA,
               ID_TIPFACT,
               ID_IMPPAPEL,
               COMENTARIO
            ) VALUES (
               '${ID_FACTURA}',
               '${ID_TIPFACT}',
               '${ID_IMPPAPEL}',
               '${COMENTARIO}'
            )`
}

module.exports = queryMySQL

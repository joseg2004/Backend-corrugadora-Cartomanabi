/**
 * Queries para operaciones CRUD de la tabla ECUSTK
 * Carga de archivos ECUAPASS → GC_COPLAIM.ECUSTK
 *
 * @module hanaQEcustk
 * @version 1.0.0
 */

const queryQEcustk = {}

/**
 * Obtiene todas las claves (Anexo_Item) existentes en la BD
 * para verificar duplicados antes de insertar
 */
queryQEcustk.searchClavesExistentes = () => {
   return ` SELECT
               T0."Anexo" || '_' || CAST(T0."Item" AS VARCHAR) AS "Clave"
            FROM
               ${process.env.HANA_DB_COPLAIM}.ECUSTK T0
            WHERE
               YEAR(T0."FechaRegimen") >= 2025
               OR T0."FechaRegimen" IS NULL`
}

/**
 * Obtiene el stock actual de ECUSTK con información de consumo
 * para preview y verificación
 */
queryQEcustk.searchStockEcustk = ({ TIPO = '', YEAR = '' }) => {
   return ` SELECT
               T0."ID_ECUSTK",
               T0."Item",
               T0."Anexo",
               T0."CodInsumo",
               T0."SubPartida",
               T0."SubPartida2",
               T0."CodComple",
               T0."CodSuple",
               T0."Cantidad",
               T0."Unidad",
               T0."Saldo",
               T0."DespRegu",
               T0."EgreDespRegu",
               T0."UsoGarantia",
               T0."FechaRegimen",
               T0."Tipo",
               T0."TipoOr",
               T0."CREATED_AT",
               T0."UPDATED_AT"
            FROM
               ${process.env.HANA_DB_COPLAIM}.ECUSTK T0
            WHERE
               1 = 1
               ${TIPO !== '' ? `AND T0."Tipo" = '${TIPO}'` : ''}
               ${YEAR !== '' ? `AND YEAR(T0."FechaRegimen") = ${YEAR}` : ''}
            ORDER BY
               T0."FechaRegimen" DESC,
               T0."Anexo" ASC,
               T0."Item" ASC`
}

/**
 * Inserta un nuevo registro en ECUSTK
 * NOTA: HANA 1.0 no soporta INSERT múltiple, usar en loop individual
 *
 * @param {Object} params - Parámetros del registro
 */
queryQEcustk.insertEcustk = ({
   Item = 0,
   Anexo = '',
   CodInsumo = '',
   SubPartida = '',
   SubPartida2 = '',
   CodComple = '',
   CodSuple = '',
   Cantidad = 0,
   Unidad = '',
   Saldo = 0,
   DespRegu = 0,
   EgreDespRegu = 0,
   UsoGarantia = 0,
   FechaRegimen = '',
   Tipo = '',
   TipoOr = ''
}) => {
   // Escapar comillas simples en strings
   const escapeStr = (str) => String(str).replace(/'/g, '\'\'')

   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.ECUSTK (
               "Item",
               "Anexo",
               "CodInsumo",
               "SubPartida",
               "SubPartida2",
               "CodComple",
               "CodSuple",
               "Cantidad",
               "Unidad",
               "Saldo",
               "DespRegu",
               "EgreDespRegu",
               "UsoGarantia",
               "FechaRegimen",
               "Tipo",
               "TipoOr"
            ) VALUES (
               ${Number(Item) || 0},
               '${escapeStr(Anexo)}',
               '${escapeStr(CodInsumo)}',
               '${escapeStr(SubPartida)}',
               '${escapeStr(SubPartida2)}',
               '${escapeStr(CodComple)}',
               '${escapeStr(CodSuple)}',
               ${Number(Cantidad) || 0},
               '${escapeStr(Unidad)}',
               ${Number(Saldo) || 0},
               ${Number(DespRegu) || 0},
               ${Number(EgreDespRegu) || 0},
               ${Number(UsoGarantia) || 0},
               '${FechaRegimen}',
               '${escapeStr(Tipo)}',
               '${escapeStr(TipoOr)}'
            )`
}

/**
 * Verifica si un registro específico ya existe (para validación previa)
 */
queryQEcustk.checkExistente = ({ Anexo = '', Item = 0 }) => {
   return ` SELECT COUNT(*) AS "Existe"
            FROM ${process.env.HANA_DB_COPLAIM}.ECUSTK T0
            WHERE
               T0."Anexo" = '${Anexo}'
               AND T0."Item" = ${Number(Item) || 0}`
}

/**
 * Obtiene los tipos de insumo válidos desde la tabla de configuración (solo activos)
 */
queryQEcustk.searchTiposInsumo = () => {
   return ` SELECT
               T0."ID_CFECSTK",
               T0.TIPO_ECUSTK AS "Tipo",
               T0.DESCRIPCION AS "Descripcion",
               T0.STATUS
            FROM
               ${process.env.HANA_DB_COPLAIM}.CFECSTK T0
            WHERE
               T0.STATUS = 'Y'
            ORDER BY
               T0.TIPO_ECUSTK ASC`
}

/**
 * Obtiene TODOS los tipos de insumo (incluye inactivos) para el modal de configuración
 */
queryQEcustk.searchAllTiposInsumo = () => {
   return ` SELECT
               T0."ID_CFECSTK",
               T0.TIPO_ECUSTK AS "Tipo",
               T0.DESCRIPCION AS "Descripcion",
               T0.STATUS
            FROM
               ${process.env.HANA_DB_COPLAIM}.CFECSTK T0
            ORDER BY
               T0.TIPO_ECUSTK ASC`
}

/**
 * Verifica si un tipo de insumo ya existe por código
 */
queryQEcustk.checkTipoInsumoExists = ({ TIPO_ECUSTK = '' }) => {
   return ` SELECT COUNT(*) AS "Existe"
            FROM ${process.env.HANA_DB_COPLAIM}.CFECSTK T0
            WHERE T0.TIPO_ECUSTK = '${TIPO_ECUSTK}'`
}

/**
 * Inserta un nuevo tipo de insumo en CFECSTK
 */
queryQEcustk.insertTipoInsumo = ({ TIPO_ECUSTK = '', DESCRIPCION = '' }) => {
   const escapeStr = (str) => String(str).replace(/'/g, '\'\'')
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.CFECSTK
               (TIPO_ECUSTK, DESCRIPCION, STATUS)
            VALUES
               ('${escapeStr(TIPO_ECUSTK)}', '${escapeStr(DESCRIPCION)}', 'Y')`
}

/**
 * Actualiza un tipo de insumo existente
 */
queryQEcustk.updateTipoInsumo = ({ ID_CFECSTK = 0, TIPO_ECUSTK = '', DESCRIPCION = '' }) => {
   const escapeStr = (str) => String(str).replace(/'/g, '\'\'')
   return ` UPDATE ${process.env.HANA_DB_COPLAIM}.CFECSTK
            SET
               TIPO_ECUSTK = '${escapeStr(TIPO_ECUSTK)}',
               DESCRIPCION = '${escapeStr(DESCRIPCION)}',
               UPDATED_AT = CURRENT_TIMESTAMP
            WHERE
               "ID_CFECSTK" = ${Number(ID_CFECSTK)}`
}

/**
 * Cambia el estado (activar/desactivar) de un tipo de insumo
 */
queryQEcustk.toggleTipoInsumoStatus = ({ ID_CFECSTK = 0, STATUS = 'Y' }) => {
   return ` UPDATE ${process.env.HANA_DB_COPLAIM}.CFECSTK
            SET
               STATUS = '${STATUS}',
               UPDATED_AT = CURRENT_TIMESTAMP
            WHERE
               "ID_CFECSTK" = ${Number(ID_CFECSTK)}`
}

/**
 * Obtiene estadísticas de registros por tipo y año
 */
queryQEcustk.searchEstadisticas = ({ YEAR = '' }) => {
   return ` SELECT
               T0."Tipo",
               COUNT(*) AS "Total",
               SUM(T0."Cantidad") AS "CantidadTotal",
               SUM(T0."Saldo") AS "SaldoTotal"
            FROM
               ${process.env.HANA_DB_COPLAIM}.ECUSTK T0
            WHERE
               1 = 1
               ${YEAR !== '' ? `AND YEAR(T0."FechaRegimen") = ${YEAR}` : ''}
            GROUP BY
               T0."Tipo"
            ORDER BY
               T0."Tipo" ASC`
}

module.exports = queryQEcustk

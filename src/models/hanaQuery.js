const queryHana = {}

/**
 * Escapa caracteres peligrosos para prevenir SQL injection en HANA
 * @param {string} str - String a escapar
 * @returns {string} String escapado seguro para SQL
 */
const escapeHanaSql = (str) => {
   if (typeof str !== 'string') return ''
   // Escapar comillas simples duplicándolas (estándar SQL)
   // Remover caracteres de control y null bytes
   return str
      .replace(/'/g, '\'\'')
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x7f]/g, '')
      .replace(/--/g, '')
      .replace(/;/g, '')
}

queryHana.loginAuth = (username) => {
   const safeUsername = escapeHanaSql(username)
   return ` SELECT
               T0."empID" AS COD_EMP,
               T0."firstName" AS NOMBRE,
               T0."lastName" AS APELLIDO,
               T0."U_GC_PERMISOS" AS PERMISO,
               T2.USER_CODE AS "USER",
               T0."salesPrson" AS ID_USER,
               LCASE(T2."E_Mail") AS MAIL_USER,
               CAST(T4."ENTRY" AS DATE) AS "INGRESO",
               CAST(T3."BORN" AS DATE) AS "NACIMIENTO",
               'CartomanabiSA' AS CIA,
               T3.ID_ODBE AS IDEMP
            FROM
               "${process.env.HANA_DATABASE}"."OHEM" T0
               INNER JOIN "${process.env.HANA_DATABASE}"."OUSR" T2 ON
                  T0."userId" = T2."USERID"
               LEFT JOIN ${process.env.HANA_DB_CHERNO}."ODBE" T3 ON
                  T2."USER_CODE" = T3."USERCODE"
               LEFT JOIN "${process.env.HANA_DB_CHERNO}"."ESEM" T4 ON
                  T3."ID_ODBE" = T4."ID_ODBE"
            WHERE
               T0."Active" = 'Y'
               AND T2."USER_CODE" = '${safeUsername}'
            UNION
            SELECT
               T0."empID" AS COD_EMP,
               T0."firstName" AS NOMBRE,
               T0."lastName" AS APELLIDO,
               T0."U_GC_PERMISOS" AS PERMISO,
               T2.USER_CODE AS "USER",
               T0."salesPrson" AS ID_USER,
               LCASE(T2."E_Mail") AS MAIL_USER,
               CAST(T4."ENTRY" AS DATE) AS "INGRESO",
               CAST(T3."BORN" AS DATE) AS "NACIMIENTO",
               'AustroboxSA' AS CIA,
                T3.ID_ODBE AS IDEMP
            FROM
               ${process.env.HANA_DATABASE_AU}."OHEM" T0
               INNER JOIN ${process.env.HANA_DATABASE_AU}."OUSR" T2 ON
                  T0."userId" = T2."USERID"
               LEFT JOIN ${process.env.HANA_DB_CHERNO}."ODBE" T3 ON
                  T2."USER_CODE" = T3."USERCODE"
               LEFT JOIN ${process.env.HANA_DB_CHERNO}."ESEM" T4 ON
                  T3."ID_ODBE" = T4."ID_ODBE"
            WHERE
               T0."Active" = 'Y'
               AND T2."USER_CODE" = '${safeUsername}'`
}

queryHana.getAllBobinas = () => {
   return `SELECT DISTINCT
               T0."ItemCode" AS Codigo,
               T2."ItemName" AS Articulo,
               T0."DistNumber" AS Lote,
               T0."MnfSerial" AS Atributo1,
               T0."LotNumber" AS Atributo2,
               T0."InDate",
               T0."U_GC_LOTEPROV",
               T0."U_GC_NUMBO",
               T0."U_GC_COD_BOB",
               T0."U_GC_TIPOP",
               T0."U_GC_GRAMAJE",
               T0."U_GC_ANCHO",
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN t4."WhsCode"
               END AS Almacen,
               T8."WhsName" AS N_Almacen,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END AS Ubicacion,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                  WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
               END AS Stock
            FROM
               ${process.env.HANA_DATABASE}.OBTN T0
            LEFT JOIN ${process.env.HANA_DATABASE}.OBTQ T1 ON
               T0."ItemCode" = T1."ItemCode"
               AND T0."SysNumber" = T1."SysNumber"
            LEFT JOIN ${process.env.HANA_DATABASE}.OITM T2 ON
               T0."ItemCode" = T2."ItemCode"
            LEFT JOIN ${process.env.HANA_DATABASE}.OITW T7 ON
               T1."ItemCode" = T7."ItemCode"
               AND T7."WhsCode" = T1."WhsCode"
            LEFT JOIN ${process.env.HANA_DATABASE}.OBBQ T3 ON
               T0."ItemCode" = T3."ItemCode"
               AND T0."AbsEntry" = T3."SnBMDAbs"
            LEFT JOIN ${process.env.HANA_DATABASE}.OBIN T4 ON
               T3."BinAbs" = T4."AbsEntry"
            LEFT JOIN ${process.env.HANA_DATABASE}.OWHS T8 ON
               T8."WhsCode" = T1."WhsCode"
            WHERE
               (
                  CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                     WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
                  END
               ) > 0
               AND
            T1."Quantity" > 0
               AND
            T2."ItmsGrpCod" = '101'
            ORDER BY
               T0."ItemCode"`
}

queryHana.getPapel = () => {
   return ` SELECT
               T0."ItemCode" AS Papel
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            WHERE
               T0."ItmsGrpCod" = 101 AND
               T0."Canceled" = 'N'`
}

queryHana.saveLogs = ({
   CODE = '',
   MOTIVO = '',
   USER = '',
   STATUS = 0
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.LOGS (
               CODE,
               MOTIVO,
               USER,
               STATUS,
               CREATED_AT,
               UPDATED_AT
            ) VALUES(
               '${CODE}',
               '${MOTIVO}',
               '${USER}',
               ${STATUS},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryHana.searchAsignVend = ({ USERNAME = '' }) => {
   return ` SELECT
               T0.ID_USER AS ID,
               T0.VEND_IDS AS VEND_IDS,
               T0.VEND_ASIGNADOS
            FROM
               ${process.env.HANA_DB_COPLAIM}.GCASGVD T0
            WHERE
               T0.COD_USER = '${USERNAME}'`
}

module.exports = queryHana

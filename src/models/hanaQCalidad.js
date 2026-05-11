const hanaQCalidad = {}

hanaQCalidad.getAllTintasSAP = () => {
   return ` SELECT
               S0.*
            FROM
               (
                  SELECT
                     T0."ItemCode" AS ID_TINTA,
                     T0."ItemName" AS NAME_TINTA,
                     T1.TINTA
                  FROM
                     ${process.env.HANA_DATABASE}."OITM" T0
                     LEFT JOIN ${process.env.HANA_DB_COPLAIM}.COCA T1 ON
                        T0."ItemCode" = T1.ID_TINTA
                  WHERE
                     T0."ItmsGrpCod" = '104'
                     AND T0."validFor" = 'Y'
                     AND T0."ItemCode" LIKE '%TIN%'
                  GROUP BY
                     T0."ItemCode",
                     T0."ItemName",
                     T1.TINTA
                  ORDER BY
                     T0."ItemCode" ASC
               ) S0
            WHERE
               S0.TINTA IS NULL`
}

hanaQCalidad.getAllTintas = (ID_TINTA) => {
   if (ID_TINTA) {
      return ` SELECT
                  T0.ID_TINTA
               FROM
                  "${process.env.HANA_DB_COPLAIM}".COCA T0
               WHERE
                  T0.ID_TINTA = '${ID_TINTA}'`
   } else {
      return ` SELECT
                  T0.ID_TINTA AS ID_TINTA,
                  (
                     SELECT
                        T10."ItemName"
                     FROM
                        "${process.env.HANA_DATABASE}"."OITM" T10
                     WHERE
                        T10."ItmsGrpCod" = '104'
                        AND T10."ItemCode" = T0.ID_TINTA
                  ) AS NAME_SAP,
                  T0.TINTA AS NAME_TINTA,
                  T0.GCMI AS GCMI,
                  T0.PMS AS PMS,
                  T0.HEX AS HEX,
                  T0.CREATED_AT,
                  T0.UPDATED_AT
               FROM
                  "${process.env.HANA_DB_COPLAIM}".COCA T0
               ORDER BY
                  T0.CREATED_AT ASC`
   }
}

hanaQCalidad.postSaveTintas = ({
   CODE_TINTA = '',
   NAME_TINTA = '',
   GCMI = '',
   PMS = '',
   HEX = '',
   USER = ''
}) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}"."COCA" (
               "ID_TINTA",
               "TINTA",
               "GCMI",
               "PMS",
               "HEX",
               "USER",
               "CREATED_AT",
               "UPDATED_AT"
            ) VALUES (
               '${CODE_TINTA}',
               '${NAME_TINTA}',
               '${GCMI}',
               '${PMS}',
               '${HEX}',
               '${USER}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

hanaQCalidad.putUpdateTintas = ({
   ID_TINTA = '',
   NAME_TINTA = '',
   GCMI = '',
   PMS = '',
   HEX = '',
   USER = ''
}) => {
   return ` UPDATE "${process.env.HANA_DB_COPLAIM}"."COCA"
            SET
               "TINTA" = '${NAME_TINTA}',
               "GCMI" = '${GCMI}',
               "PMS" = '${PMS}',
               "HEX" = '${HEX}',
               "USER" = '${USER}',
               "UPDATED_AT" = CURRENT_TIMESTAMP
            WHERE
               "ID_TINTA" = '${ID_TINTA}'`
}

hanaQCalidad.getListTintasSAP = ({ ID = '' }) => {
   return ` SELECT
               (
                  SELECT TICA.ID_TICA
                  FROM
                     "${process.env.HANA_DB_COPLAIM}".TICA TICA
                  WHERE TICA.OC = ${ID}
               ) AS ID_TICA,
               T0."DocNum" AS ORD_COMP,
               T0."DocDate" AS FECHA,
               T0."CardCode" AS COD_PROV,
               T2."CardName" AS PROVEEDOR,
               (
                  SELECT
                     T6.ID_TINTA
                  FROM
                     "${process.env.HANA_DB_COPLAIM}".COCA T6
                  WHERE
                     T6.ID_TINTA = T0."ItemCode"
               ) AS ID_TINTA,
               (
                  SELECT
                     T6.TINTA
                  FROM
                     "${process.env.HANA_DB_COPLAIM}".COCA T6
                  WHERE
                     T6.ID_TINTA = T0."ItemCode"
               ) AS TINTA,
               T0."ItemCode" AS ID_TINTASAP,
               T0."ItemName" AS TINTASAP,
               T4."DistNumber" AS LOTE,
               T3."Quantity" AS CANTIDAD,
               CASE
                  T0."DocType"
                  WHEN 20 THEN 'ENTRADA'
                  WHEN 21 THEN 'DEVOLUCION'
                  WHEN 18 THEN 'FACTCOMPRAS'
                  WHEN 19 THEN 'COMPRAS+NC'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS GRUPO_ARTICULO
            FROM ${process.env.HANA_DATABASE}.OITL T0
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON T0."ItemCode" = T1."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T2 ON T0."CardCode" = T2."CardCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON T0."LogEntry" = T3."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON T1."U_GC_TEST" = T5."Code"
            WHERE T0."DocType" IN (20, 18)
               AND T1."ItmsGrpCod" = '104'
               AND T1."ItemCode" LIKE '%TIN%'
               ${ID !== '' ? `AND T0."DocNum" = ${ID}` : ''}
               ORDER BY T0."DocNum" ASC`

   // ${ID !== '' ? `AND T0."DocNum" = (
   //    SELECT TICA.OC
   //    FROM
   //       "${process.env.HANA_DB_COPLAIM}".TICA TICA
   //    WHERE TICA.ID_TICA = ${ID}
   // )` : ''}
}

// Solo busquedas por entrada de mercadería (20)
// No por factura directa (18)
hanaQCalidad.getTintasXProveedor = ({ OC = '', FECHA_START = '', FECHA_END = '' }) => {
   return ` SELECT DISTINCT
               T0."DocNum" AS ORD_COMP,
               T0."DocDate" AS FECHA,
               T0."CardCode" AS COD_PROV,
               T2."CardName" AS PROVEEDOR,
               (
                  SELECT COUNT(*)
                  FROM "${process.env.HANA_DB_COPLAIM}".TICA T20
                  WHERE T20.OC = T0."DocNum"
               ) AS ESTADO_CAB
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T2 ON
               T0."CardCode" = T2."CardCode"
            WHERE
               T0."DocType" = 20
               AND T1."ItmsGrpCod" = '104'
               AND T1."ItemCode" LIKE '%TIN%'
               ${OC !== '' ? `AND T0."DocNum" = '${OC}'` : ''}
               ${FECHA_START !== '' ? `AND T0."DocDate" BETWEEN '${FECHA_START} 00:00:00.000' AND '${FECHA_END} 00:00:00.000'` : ''}
            ORDER BY T0."DocNum" DESC`
}

hanaQCalidad.getOPLoteItmCode = ({ FECHA_START = '', FECHA_END = '', LOTE = '', ITEM = '', TYPE = '103' }) => {
   return ` SELECT
               T0."DocDate" AS FECHA,
               T7."DocEntry" AS ENTRY,
               T7."DocNum" AS DOCNUM,
               T2."BaseRef" AS ORDEN_PROD,
               T0."ItemCode" AS COD_PROD,
               T0."ItemName" AS PRODUCTO,
               T4."DistNumber" AS LOTE,
               T3."Quantity" AS CANTIDAD,
               CASE
                  T0."ApplyType"
                  WHEN 60 THEN 'Desembalaje'
                  WHEN 59 THEN 'OrdenProduccion'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS GRUPO_ARTICULO
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
                  T0."ItemCode" = T1."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
                  T0."LogEntry" = T3."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."IGE1" T2 ON
                  T0."DocEntry" = T2."DocEntry"
                  AND T0."ItemCode" = T2."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
                  T3."ItemCode" = T4."ItemCode"
                  AND T3."MdAbsEntry" = T4."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
                  T1."U_GC_TEST" = T5."Code"
               LEFT JOIN ${process.env.HANA_DATABASE}.OWOR T7 ON
                  TO_NVARCHAR(T2."BaseRef") = TO_NVARCHAR(T7."DocNum")
            WHERE
               T0."DocType" = '60'
               AND T0."BaseType" = '202'
               AND T1."ItmsGrpCod" IN ('${TYPE}')
               AND T0."DefinedQty" > 0
               ${FECHA_START !== '' ? `AND T0."DocDate" BETWEEN '${FECHA_START} 00:00:00.000' AND '${FECHA_END} 00:00:00.000'` : ''}
               ${LOTE !== '' ? `AND T4."DistNumber" LIKE '${LOTE}%'` : ''}
               ${ITEM !== '' ? `AND T0."ItemCode" LIKE '${ITEM}%'` : ''}
            UNION
            SELECT
               T0."DocDate" AS FECHA,
               T7."DocEntry" AS ENTRY,
               T7."DocNum" AS DOCNUM,
               T2."BaseRef" AS ORDEN_PROD,
               T0."ItemCode" AS COD_PROD,
               T0."ItemName" AS PRODUCTO,
               T4."DistNumber" AS LOTE,
               T3."Quantity" as CANTIDAD,
               CASE
                  T0."ApplyType"
                  WHEN 60 THEN 'Desembalaje'
                  WHEN 59 THEN 'OrdenProduccion'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS GRUPO_ARTICULO
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
                  T0."ItemCode" = T1."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
                  T0."LogEntry" = T3."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T2 ON
                  T0."DocEntry" = T2."DocEntry"
                  AND T0."ItemCode" = T2."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
                  T3."ItemCode" = T4."ItemCode"
                  AND T3."MdAbsEntry" = T4."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
                  T1."U_GC_TEST" = T5."Code"
               LEFT JOIN ${process.env.HANA_DATABASE}.OWOR T7 ON
                  TO_NVARCHAR(T2."BaseRef") = TO_NVARCHAR(T7."DocNum")
            WHERE
               T0."DocType" = 59
               AND T0."ApplyType" = 59
               AND T0."BaseType" = 202
               AND T1."ItmsGrpCod" IN ('${TYPE}')
               ${FECHA_START !== '' ? `AND T0."DocDate" BETWEEN '${FECHA_START} 00:00:00.000' AND '${FECHA_END} 00:00:00.000'` : ''}
               ${LOTE !== '' ? `AND T4."DistNumber" LIKE '${LOTE}%'` : ''}
               ${ITEM !== '' ? `AND T0."ItemCode" LIKE '${ITEM}%'` : ''}`
}

hanaQCalidad.getTintasCabecera = () => {
   return ` SELECT
               ID_TICA,
               OC AS ORD_COMP,
               PROVEEDOR,
               RESPONSABLE,
               TIEMPO,
               MONTACARGA,
               OBSERVACIONES,
               ANALISTA,
               ESTADO,
               CREATED_AT,
               UPDATED_AT
            FROM
               "${process.env.HANA_DB_COPLAIM}".TICA`
}

hanaQCalidad.postTestTintaCab = (
   OC,
   PROVEEDOR,
   RESPONSABLE,
   TIEMPO,
   MONTACARGA,
   OBSERVACIONES,
   ANALISTA,
   ESTADO
) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}"."TICA" (
               OC,
               PROVEEDOR,
               RESPONSABLE,
               TIEMPO,
               MONTACARGA,
               OBSERVACIONES,
               ANALISTA,
               ESTADO,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               '${OC}',
               '${PROVEEDOR}',
               ${RESPONSABLE},
               '${TIEMPO}',
               ${MONTACARGA},
               '${OBSERVACIONES}',
               '${ANALISTA}',
               '${ESTADO}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

hanaQCalidad.getProoveedores = () => {
   return ` SELECT
               T0."CardCode" AS ID_PROVEEDOR,
               T2."CardName" AS PROVEEDOR
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T2 ON
               T0."CardCode" = T2."CardCode"
            WHERE
               T0."DocType" IN(20, 18)
               AND T1."ItmsGrpCod" = '104'
               AND T1."ItemCode" LIKE '%TIN%'
            GROUP BY
               T0."CardCode",
               T2."CardName"`
}

hanaQCalidad.getMaterialesInsumo = (BASE_REF, TYPE) => {
   return ` SELECT
               T0."DocDate" AS DOCDATE,
               T2."BaseRef" AS BASEREF,
               T0."ItemCode" AS ITEMCODE,
               T0."ItemName" AS ITEMNAME,
               T4."DistNumber" AS DISTNUMBER,
               T3."Quantity" AS QUANTITY,
               CASE
                     T0."ApplyType"
                  WHEN 60 THEN 'OrdenProduccion'
                  WHEN 59 THEN 'Desembalaje'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS ITMSGRPCOD,
               T0."DocLine" AS DOCLINE,
               T0."DocEntry" AS DOCENTRY,
               T4.U_GC_GRAMAJE AS GRAMAJE,
               T4.U_GC_ANCHO AS ANCHO
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
               T0."LogEntry" = T3."LogEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."IGE1" T2 ON
               T0."DocEntry" = T2."DocEntry"
               AND T0."ItemCode" = T2."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
               T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
               T1."U_GC_TEST" = T5."Code"
            WHERE
               T0."DocType" = '60'
               AND T0."BaseType" = '202'
               AND T0."DefinedQty" > 0
               AND T1."ItmsGrpCod" <> ${TYPE}
               AND T4."DistNumber" <> 'NULL'
               AND T2."BaseRef" = '${BASE_REF}'
            UNION
            SELECT
               T0."DocDate" AS DOCDATE,
               T2."BaseRef" AS BASEREF,
               T0."ItemCode" AS ITEMCODE,
               T0."ItemName" AS ITEMNAME,
               T4."DistNumber" AS DISTNUMBER,
               T3."Quantity" AS QUANTITY,
               CASE
                     T0."ApplyType"
                  WHEN 60 THEN 'OrdenProduccion'
                  WHEN 59 THEN 'Desembalaje'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS ITMSGRPCOD,
               T0."DocLine" AS DOCLINE,
               T0."DocEntry" AS DOCENTRY,
               T4.U_GC_GRAMAJE AS GRAMAJE,
               T4.U_GC_ANCHO AS ANCHO
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
               T0."LogEntry" = T3."LogEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T2 ON
               T0."DocEntry" = T2."DocEntry"
               AND T0."ItemCode" = T2."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
               T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
               T1."U_GC_TEST" = T5."Code"
            WHERE
               T0."DocType" = 59
               AND T0."ApplyType" = 59
               AND T0."BaseType" = 202
               AND T1."ItmsGrpCod" <> ${TYPE}
               AND T4."DistNumber" <> 'NULL'
               AND T2."BaseRef" = '${BASE_REF}'`
}

hanaQCalidad.getInsumos104 = (CODE, PTCODE, LOTE) => {
   if (CODE === '124') {
      return ` SELECT
                  T0."DocDate" AS FECHA,
                  T2."BaseRef" AS ORDEN_PROD,
                  T0."ItemCode" AS COD_PROD,
                  T0."ItemName" AS PRODUCTO,
                  T4."DistNumber" AS LOTE,
                  T3."Quantity"  AS CANTIDAD,
                  CASE
                     T0."ApplyType"
                     WHEN 60 THEN 'Desembalaje'
                     WHEN 59 THEN 'OrdenProduccion'
                  END AS DOCUMENTO,
                  T1."ItmsGrpCod" AS GRUPO_ARTICULO,
                  T0."DocEntry" AS DOCENTRY
               FROM ${process.env.HANA_DATABASE}.OITL T0
                  LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON T0."ItemCode" = T1."ItemCode"
                  LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON T0."LogEntry" = T3."LogEntry"
                  LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T2 ON T0."DocEntry" = T2."DocEntry"
                  AND T0."ItemCode" = T2."ItemCode"
                  LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON T3."ItemCode" = T4."ItemCode"
                  AND T3."MdAbsEntry" = T4."AbsEntry"
                  LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON T1."U_GC_TEST" = T5."Code"
               WHERE
                  T0."DocType" = 59
                  AND T0."ApplyType" = 59
                  AND T0."BaseType" = 202
                  AND T1."ItmsGrpCod" = 124
                  AND T0."LocCode" = '16'
                  AND T4."DistNumber" = '${LOTE}'
               ORDER BY T0."DocDate" DESC
               LIMIT 1`
   } else {
      return ` SELECT DISTINCT
                  T0."DocDate",
                  T0."DocNum",
                  T2."CardName",
                  T0."ItemCode",
                  T0."ItemName",
                  T4."DistNumber",
                  T3."Quantity",
                  T0."CreateDate",
                  ((T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)) * T3."Quantity" AS AreaTotal,
                  CASE
                     WHEN T1."ItmsGrpCod" = '101' THEN T3."Quantity"
                     WHEN T1."ItmsGrpCod" = '102' THEN ((T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)) * T5."U_GC_PAPEL_KRAFT" *(T3."Quantity")
                  END AS KRAFT_KG,
                  ((T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)) * T5."U_GC_PAPEL_MEDIUM" *((T3."Quantity")) AS MEDIUM_KG,
                  ((T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)) * T5."U_GC_PAPEL_WHITE" *((T3."Quantity")) AS WHITE_KG,
                  (
                     ((T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)) * T5."U_GC_PAPEL_KRAFT" *(T3."Quantity")
                  ) + (
                     ((T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)) * T5."U_GC_PAPEL_MEDIUM" *((T3."Quantity"))
                  ) + (
                     ((T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)) * T5."U_GC_PAPEL_WHITE" *((T3."Quantity"))
                  ) AS "Peso Total",
                  CASE
                     T0."DocType"
                     WHEN 20 THEN 'ENTRADA'
                     WHEN 21 THEN 'DEVOLUCION'
                     WHEN 18 THEN 'FACTCOMPRAS'
                     WHEN 19 THEN 'COMPRAS+NC'
                  END AS Documento,
                  T1."ItmsGrpCod",
                  T0."DocEntry" AS DOCENTRY
               FROM
                  ${process.env.HANA_DATABASE}.OITL T0
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
                  T0."ItemCode" = T1."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T2 ON
                  T0."CardCode" = T2."CardCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
                  T0."LogEntry" = T3."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
                  T3."ItemCode" = T4."ItemCode"
                  AND T3."MdAbsEntry" = T4."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
                  T1."U_GC_TEST" = T5."Code"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OPDN" T6 ON
                  T0."DocNum" = T6."DocNum"
               WHERE
                  T0."DocType" = 20
                  AND T6.CANCELED = 'N'
                  AND T1."ItmsGrpCod" = '${CODE}'
                  AND T0."ItemCode" = '${PTCODE}'
                  AND T4."DistNumber" = '${LOTE}'
               UNION
               SELECT DISTINCT
                  T0."DocDate",
                  T0."DocNum",
                  T2."CardName",
                  T0."ItemCode",
                  T0."ItemName",
                  T4."DistNumber",
                  T3."Quantity",
                  T0."CreateDate",
                  (
                     (T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)
                  ) * T3."Quantity" AS AreaTotal,
                  CASE
                     WHEN T1."ItmsGrpCod" = '101' THEN T3."Quantity"
                     WHEN T1."ItmsGrpCod" = '102' THEN (
                        (T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)
                     ) * T5."U_GC_PAPEL_KRAFT" *(T3."Quantity")
                  END AS KRAFT_KG,
                  (
                     (T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)
                  ) * T5."U_GC_PAPEL_MEDIUM" *((T3."Quantity")) AS MEDIUM_KG,
                  (
                     (T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)
                  ) * T5."U_GC_PAPEL_WHITE" *((T3."Quantity")) AS WHITE_KG,
                  (
                     (
                        (T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)
                     ) * T5."U_GC_PAPEL_KRAFT" *(T3."Quantity")
                  ) + (
                     (
                        (T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)
                     ) * T5."U_GC_PAPEL_MEDIUM" *((T3."Quantity"))
                  ) + (
                     (
                        (T1."U_EXX_LARGO" / 1000) *(T1."U_EXX_ANCHO" / 1000)
                     ) * T5."U_GC_PAPEL_WHITE" *((T3."Quantity"))
                  ) AS "Peso Total",
                  CASE
                     T0."DocType"
                     WHEN 20 THEN 'ENTRADA'
                     WHEN 21 THEN 'DEVOLUCION'
                     WHEN 18 THEN 'FACTCOMPRAS'
                     WHEN 19 THEN 'COMPRAS+NC'
                  END AS Documento,
                  T1."ItmsGrpCod",
                  T0."DocEntry" AS DOCENTRY
               FROM
                  ${process.env.HANA_DATABASE}.OITL T0
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
                  T0."ItemCode" = T1."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T2 ON
                  T0."CardCode" = T2."CardCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
                  T0."LogEntry" = T3."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
                  T3."ItemCode" = T4."ItemCode"
                  AND T3."MdAbsEntry" = T4."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
                  T1."U_GC_TEST" = T5."Code"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OPDN" T6 ON
                  T0."DocNum" = T6."DocNum"
               WHERE
                  T0."DocType" = 18
                  AND T6.CANCELED = 'N'
                  AND T1."ItmsGrpCod" = '${CODE}'
                  AND T0."ItemCode" = '${PTCODE}'
                  AND T4."DistNumber" = '${LOTE}'`
   }
}

hanaQCalidad.getDetailsPT = (PTCODE, TYPE) => {
   return ` SELECT
               T0."ItemCode",
               T0."ItemName",
               T1."Name" ,
               T0.U_EXX_RECUBRIMIENTO ,
               T0.U_GC_IMP_TEXTO ,
               T0.U_GC_TIPO_CAJA ,
               T0.U_GC_TEXTO_BARRA ,
               T0.U_GC_IMP_IMG ,
               T0.U_GC_PLANOO,
               T0."U_GC_PALETIZADO" ,
               T0.U_GC_MERCADO_SEG ,
               T0.U_GC_TROQUEL ,
               T0.U_GC_CLISE ,
               T0.U_GC_ESTADO_PT ,
               T0.U_GC_MUESTRA ,
               T0.U_GC_ACOPLE
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T1 ON
               T0.U_GC_TEST = T1."Code"
            WHERE
               T0."ItmsGrpCod" IN ('${TYPE}')
               AND T0."ItemCode" = '${PTCODE}'`
}

hanaQCalidad.getDetailsLAM = (LAMCODE) => {
   return ` SELECT
               T0."DocDate" AS FECHA,
               T2."BaseRef" AS ORDEN_PROD,
               T0."ItemCode" AS COD_PROD,
               T0."ItemName" AS PRODUCTO,
               T4."DistNumber" AS LOTE,
               T3."Quantity" AS CANTIDAD,
               T4.U_GC_LOTEPROV AS LOTE_PROVEEDOR,
               TO_NVARCHAR(T4."Notes") AS PROVEEDOR,
               T4.U_GC_GRAMAJE AS GRAMAJE,
               T4.U_GC_ANCHO AS ANCHO,
               CASE
                  T0."ApplyType"
                  WHEN 60 THEN 'OrdenProduccion'
                  WHEN 59 THEN 'Desembalaje'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS GRUPO_ARTICULO,
               T0."DocLine" AS DOC_LINE,
               T0."DocEntry" AS DOCENTRY
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
               T0."LogEntry" = T3."LogEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."IGE1" T2 ON
               T0."DocEntry" = T2."DocEntry"
               AND T0."ItemCode" = T2."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
               T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
               T1."U_GC_TEST" = T5."Code"
            WHERE
               T0."DocType" = '60'
               AND T0."BaseType" = '202'
               AND T0."DefinedQty" > 0
               AND T1."ItmsGrpCod" <> 124
               AND T4."DistNumber" <> 'NULL'
               AND T2."BaseRef" = '${LAMCODE}'
            UNION
            SELECT
               T0."DocDate" AS FECHA,
               T2."BaseRef" AS ORDEN_PROD,
               T0."ItemCode" AS COD_PROD,
               T0."ItemName" AS PRODUCTO,
               T4."DistNumber" AS LOTE,
               T3."Quantity" AS CANTIDAD,
               T4.U_GC_LOTEPROV AS LOTE_PROVEEDOR,
               TO_NVARCHAR(T4."Notes") AS PROVEEDOR,
               T4.U_GC_GRAMAJE AS GRAMAJE,
               T4.U_GC_ANCHO AS ANCHO,
               CASE
                  T0."ApplyType"
                  WHEN 60 THEN 'OrdenProduccion'
                  WHEN 59 THEN 'Desembalaje'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS GRUPO_ARTICULO,
               T0."DocLine" AS DOC_LINE,
               T0."DocEntry" AS DOCENTRY
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
               T0."LogEntry" = T3."LogEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T2 ON
               T0."DocEntry" = T2."DocEntry"
               AND T0."ItemCode" = T2."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
               T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
               T1."U_GC_TEST" = T5."Code"
            WHERE
               T0."DocType" = 59
               AND T0."ApplyType" = 59
               AND T0."BaseType" = 202
               AND T1."ItmsGrpCod" <> 124
               AND T4."DistNumber" <> 'NULL'
               AND T2."BaseRef" = '${LAMCODE}'
            ORDER BY
               FECHA ASC`
}

hanaQCalidad.getDetailsPapel = (PAPCODE) => {
   return ` SELECT
               T0."DocDate" AS FECHA,
               T0."DocNum" AS DOC_SAP,
               T2."CardName" AS IMPORTADOR,
               T0."ItemCode" AS CODE_PROD,
               T0."ItemName" AS PRODUCTO,
               T4."DistNumber" AS BOBINA,
               T0."DocType" AS TYP_DOC,
               T1."ItmsGrpCod" AS GRUPO_ARTICULO,
               T0."DocEntry" AS DOCENTRY,
               T4.U_GC_LOTEPROV || ' ' || T4.U_GC_COD_BOB AS LOTE_PROV
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T2 ON
               T0."CardCode" = T2."CardCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
               T0."LogEntry" = T3."LogEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
               T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
               T1."U_GC_TEST" = T5."Code"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OPDN" T6 ON
               T0."DocNum" = T6."DocNum"
            WHERE
               T0."DocType" = 20
               AND T1."ItmsGrpCod" = '101'
               AND T6.CANCELED = 'N'
               AND T4."DistNumber" = '${PAPCODE}'
            UNION
            SELECT
               T0."DocDate" AS FECHA,
               T0."DocNum" AS DOC_SAP,
               T2."CardName" AS IMPORTADOR,
               T0."ItemCode" AS CODE_PROD,
               T0."ItemName" AS PRODUCTO,
               T4."DistNumber" AS BOBINA,
               T0."DocType" AS TYP_DOC,
               T1."ItmsGrpCod" AS GRUPO_ARTICULO,
               T0."DocEntry" AS DOCENTRY,
               T4.U_GC_LOTEPROV || ' ' || T4.U_GC_COD_BOB AS LOTE_PROV
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T2 ON
               T0."CardCode" = T2."CardCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
               T0."LogEntry" = T3."LogEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
               T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
               T1."U_GC_TEST" = T5."Code"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OPDN" T6 ON
               T0."DocNum" = T6."DocNum"
            WHERE
               T0."DocType" = 18
               AND T1."ItmsGrpCod" = '101'
               AND T6.CANCELED = 'N'
               AND T4."DistNumber" = '${PAPCODE}'
            ORDER BY DOC_SAP DESC
            LIMIT 1`
}

hanaQCalidad.getCocinaAlmidon = (DATE) => {
   return ` SELECT
               T0."DocDate" AS FECHA,
               T2."BaseRef" AS ORDEN_PROD,
               T0."ItemCode" AS COD_PROD,
               T0."ItemName" AS PRODUCTO,
               T4."DistNumber" AS LOTE,
               T3."Quantity" AS CANTIDAD,
               CASE
                  T0."ApplyType"
                  WHEN 60 THEN 'Desembalaje'
                  WHEN 59 THEN 'OrdenProduccion'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS GRUPO_ARTICULO,
               T0."DocEntry" AS DOCENTRY
            FROM ${process.env.HANA_DATABASE}.OITL T0
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON T0."ItemCode" = T1."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON T0."LogEntry" = T3."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T2 ON T0."DocEntry" = T2."DocEntry"
               AND T0."ItemCode" = T2."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON T1."U_GC_TEST" = T5."Code"
            WHERE
               T0."DocType" = 59
               AND T0."ApplyType" = 59
               AND T0."BaseType" = 202
               AND T1."ItmsGrpCod" = 125
               AND T0."DocDate" <= '${DATE}'
            ORDER BY T0."DocDate" DESC
            LIMIT 1`
}

hanaQCalidad.getAlmidonIns = (ID_ALM) => {
   return ` SELECT
               T0."DocDate" AS DOCDATE,
               T2."BaseRef" AS BASEREF,
               T0."ItemCode" AS ITEMCODE,
               T0."ItemName" AS ITEMNAME,
               T4."DistNumber" AS DISTNUMBER,
               T3."Quantity" AS QUANTITY,
               CASE
                  T0."ApplyType"
               WHEN 60 THEN 'OrdenProduccion'
                  WHEN 59 THEN 'Desembalaje'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS ITMSGRPCOD,
               T0."DocLine" AS DOCLINE,
               T0."DocEntry" AS DOCENTRY
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
               T0."LogEntry" = T3."LogEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."IGE1" T2 ON
               T0."DocEntry" = T2."DocEntry"
               AND T0."ItemCode" = T2."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
               T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
               T1."U_GC_TEST" = T5."Code"
            WHERE
               T0."DocType" = '60'
               AND T0."BaseType" = '202'
               AND T0."DefinedQty" >0
               AND T1."ItmsGrpCod" <> 125
               AND T4."DistNumber" <> 'NULL'
               AND T2."BaseRef" = '${ID_ALM}'
            UNION
            SELECT
               T0."DocDate" AS DOCDATE,
               T2."BaseRef" AS BASEREF,
               T0."ItemCode" AS ITEMCODE,
               T0."ItemName" AS ITEMNAME,
               T4."DistNumber" AS DISTNUMBER,
               T3."Quantity" AS QUANTITY,
               CASE
                  T0."ApplyType"
               WHEN 60 THEN 'OrdenProduccion'
                  WHEN 59 THEN 'Desembalaje'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS ITMSGRPCOD,
               T0."DocLine" AS DOCLINE,
               T0."DocEntry" AS DOCENTRY
            FROM
               ${process.env.HANA_DATABASE}.OITL T0
            LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
               T0."ItemCode" = T1."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
               T0."LogEntry" = T3."LogEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T2 ON
               T0."DocEntry" = T2."DocEntry"
               AND T0."ItemCode" = T2."ItemCode"
            LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
               T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
            LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
               T1."U_GC_TEST" = T5."Code"
            WHERE
               T0."DocType" = 59
               AND T0."ApplyType" = 59
               AND T0."BaseType" = 202
               AND T1."ItmsGrpCod" <> 125
               AND T4."DistNumber" <> 'NULL'
               AND T2."BaseRef" = '${ID_ALM}'
            ORDER BY DOCDATE ASC`
}

hanaQCalidad.getTintasOC = (OC) => {
   return ` SELECT *
            FROM
               "${process.env.HANA_DB_COPLAIM}".TICA T0
            WHERE
               T0.OC = ${OC}`
}

hanaQCalidad.postSaveDocTintas = ({
   ORD_COMP = '',
   LOTE = '',
   ID_TINTA = '',
   CANTIDAD = '',
   TONALIDAD = '',
   VISCOSIDAD = '',
   PH = '',
   ESPECTROFOTOMETRO = '',
   RESISTENCIA = '',
   SUSTRATO = '',
   ESTADO = '',
   OBSERVACIONES = '',
   USER = ''
}) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}".DOTI (
               ID_TICA,
               ID_TINTA,
               LOTE,
               CANTIDAD,
               TONALIDAD,
               VISCOSIDAD,
               PH,
               ESPECTROFOTOMETRO,
               RESISTENCIA,
               SUSTRATO,
               ESTADO,
               OBSERVACIONES,
               ANALISTA,
               CREATED_AT,
               UPDATED_AT
            ) VALUES(
               (
                  SELECT
                     T0.ID_TICA
                  FROM
                     "${process.env.HANA_DB_COPLAIM}".TICA T0
                  WHERE
                     T0.OC = ${ORD_COMP}
               ),
               '${ID_TINTA}',
               '${LOTE}',
               ${CANTIDAD},
               '${TONALIDAD}',
               ${VISCOSIDAD},
               ${PH},
               ${ESPECTROFOTOMETRO},
               '${RESISTENCIA}',
               '${SUSTRATO}',
               '${ESTADO}',
               '${OBSERVACIONES}',
               '${USER}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            );`
}

hanaQCalidad.getAllProcesoControl = ({ OC = '', FECHA_START = '', FECHA_END = '' }) => {
   return ` SELECT DISTINCT
               T0."DocNum" AS DOC_SAP,
               (
                  SELECT COUNT(*)
                  FROM "${process.env.HANA_DB_COPLAIM}".CPCA T20
                  WHERE T20.ORDEN_PROD = T0."DocNum"
               ) AS ESTADO_CAB,
               T0."DocEntry" AS DOC_ENTRY,
               T0."StartDate" AS FECH_PLAN,
               T0."CloseDate" AS FECH_CLOSE,
               T0."DueDate" AS FECH_VENC,
               T0."ItemCode" AS PT_CODE,
               T3."ItemName" AS CAJA,
               T0."PlannedQty" AS PLANNED_PT,
               T0."CmpltQty" AS COMPLETED_PT,
               T6."CardName" AS CLIENTE,
               T7."SlpName" AS VENDEDOR,
               T5."DocNum" AS ORDEN_VSAP,
               T5."NumAtCard" AS ORDEN_CCLI,
               T8.U_GC_TEST AS TEST,
               T8.U_GC_PAPEL1 AS SUSTRATO,
               T8.U_GC_FLAUTA AS FLAUTA,
               T8.U_GC_ECT AS ECT_STD,
               (
                  SELECT
                     CASE
                        MAX(T10."ItemCode")
                        WHEN 'IMP.  MACARBOX 1' THEN 'TECASA'
                        WHEN 'IMP.  MACARBOX 2' THEN 'MACARBOX 1300'
                        WHEN 'IMP.  MACARBOX 3' THEN 'MACARBOX 970'
                        WHEN 'MAQ. DE PADS 1' THEN 'MÁQUINA PAD'
                     END
                  FROM
                     ${process.env.HANA_DATABASE}.WOR1 T10
                  LEFT JOIN ${process.env.HANA_DATABASE}.OITM T11
                     ON T10."ItemCode" = T11."ItemCode"
                  WHERE
                     T11."ItmsGrpCod" IS NULL
                     AND T10."DocEntry" = T0."DocEntry"
               ) AS MACHINE
            FROM ${process.env.HANA_DATABASE}.OWOR T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OITM T3 ON T3."ItemCode" = T0."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.ORDR T5 ON T0."OriginNum" = T5."DocNum"
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T6 ON T0."CardCode" = T6."CardCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OSLP T7 ON T6."SlpCode" = T7."SlpCode"
               LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T8 ON T3.U_GC_TEST = T8."Code"
            WHERE T0."Type" = 'S'
               AND T3."ItmsGrpCod" = 103
               AND T0."Status" <> 'C'
               ${OC !== '' ? `AND T0."DocNum" LIKE '%${OC}%'` : ''}
               ${FECHA_START !== '' ? `AND T0."StartDate" BETWEEN '${FECHA_START} 00:00:00.000' AND '${FECHA_END} 00:00:00.000'` : ''}
            ORDER
               BY T0."StartDate" DESC`
}

hanaQCalidad.getSearchCabCtrlProc = ({ ORD_PRODUC = '', PT_CODE = '' }) => {
   return ` SELECT
               *
            FROM
               "${process.env.HANA_DB_COPLAIM}".CPCA T0
            WHERE
               T0.ORDEN_PROD = ${ORD_PRODUC}
               AND T0.PT_CODE = '${PT_CODE}'`
}

hanaQCalidad.postSaveCabCtrlProc = ({
   LOTE_SAP = '',
   LOTE_CAL = '',
   ORD_PRODUC = '',
   ORD_COMP = '',
   ORD_VEN = 0,
   PT_CODE = '',
   ECT_STD = '',
   PESO = 0,
   USER = '',
   TIEMPO = '',
   DISPOSICION = '',
   OBSERVACIONES = ''
}) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}".CPCA (
               LOTE_SAP,
               LOTE_CAL,
               ORDEN_PROD,
               ORDEN_COMP,
               ORDEN_VENT,
               PT_CODE,
               ECT_STD,
               ANALISTA,
               TIEMPO,
               ESTADO,
               PESO,
               OBSERVACIONES,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               '${LOTE_SAP}',
               '${LOTE_CAL}',
               ${ORD_PRODUC},
               '${ORD_COMP}',
               ${ORD_VEN},
               '${PT_CODE}',
               ${ECT_STD},
               '${USER}',
               '${TIEMPO}',
               '${DISPOSICION.toUpperCase()}',
               ${PESO},
               '${OBSERVACIONES}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

hanaQCalidad.getColorsImpresion = ({ OP = '' }) => {
   return ` SELECT
               T10."ItemCode" AS COD_TINTA,
               T11."ItemName" AS TINTA_SAP,
               T12."DocNum" AS DOC_SAP,
               (
                  SELECT T0.TINTA
                  FROM "${process.env.HANA_DB_COPLAIM}".COCA T0
                  WHERE T0.ID_TINTA = T10."ItemCode"
               ) AS TINTA
            FROM
               ${process.env.HANA_DATABASE}.WOR1 T10
            LEFT JOIN ${process.env.HANA_DATABASE}.OITM T11
               ON T10."ItemCode" = T11."ItemCode"
            LEFT  JOIN ${process.env.HANA_DATABASE}.OWOR T12
               ON T10."DocEntry" = T12."DocEntry"
            WHERE
               T11."ItmsGrpCod" = 104
               AND T11."ItemCode" LIKE 'TIN%'
               ${OP !== '' ? `AND T12."DocNum" = ${OP}` : ''}`
}

hanaQCalidad.getDetailsEmbaje = ({ PT_CODE = '' }) => {
   return ` SELECT
               T10.U_GC_PALETIZADO AS PALETIZADO,
               T10.U_GC_IMP_TEXTO AS IMP_TEXT,
               T10.U_GC_IMP_IMG AS IMP_IMG,
               T10.U_GC_TEXTO_BARRA AS IMP_COBA,
               T10.U_EXX_RECUBRIMIENTO AS RECUBRIMIENTO,
               T10."BHeight1" AS ALTO,
               T10."BWidth1" AS ANCHO,
               T10."BLength1" AS LARGO,
               T11."Name" AS TEST
            FROM
               ${process.env.HANA_DATABASE}.OITM T10
               LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T11
                  ON T10.U_GC_TEST = T11."Code"
            WHERE T10."ItmsGrpCod" = 103
               AND T10."ItemCode" = '${PT_CODE}'`
}

hanaQCalidad.postSaveDocCtrlProc = ({
   OP = '',
   ECT = '',
   CALIBREM = '',
   CALIBREIN = '',
   PATB = '',
   PATC = '',
   FCTC = '',
   GRAMAJE = '',
   COBB = '',
   BCTTEORICO = '',
   BCTREALUNO = '',
   BCTREALDOS = '',
   BCTREALTRES = '',
   BCTREALPRO = '',
   CARGA = '',
   LARGO = '',
   ANCHO = '',
   ALTO = '',
   PERIMETRO = '',
   UNI_BULTO = '',
   OBSERVACIONES = '',
   USER = '',
   CHECK_COLOR_IMP = '',
   CHECK_PALETIZADO = '',
   CHECK_RECUBRIMIENTO = '',
   CHECK_IMP_TEXT = '',
   CHECK_IMP_IMG = '',
   CHECK_IMP_COBA = '',
   REQUERIMIENTO = '',
   HUMEDAD = ''
}) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}".DOCP (
               ORDEN_PROD,
               ECT,
               CALIBRE_MM,
               CALIBRE_IN,
               PAT_B,
               PAT_C,
               FCTC,
               GRAMAJE,
               COBB,
               BCT_TEO,
               BCTRE_ONE,
               BCTRE_TWO,
               BCTRE_TREE,
               BCTREPRO_LBF,
               CARGA_EST,
               LARGO,
               ANCHO,
               ALTO,
               PERIMETRO,
               UNI_BULTO,
               OBSERVACIONES,
               ANALISTA,
               CHECK_CIMP,
               CHECK_PAL,
               CHECK_RECINT,
               CHECK_IMPTXT,
               CHECK_IMPIMG,
               CHECK_IMPCOD,
               REQUERIMIENTO,
               HUMEDAD,
               CREATED_AT,
               UPDATED_AT
            ) VALUES(
               ${OP},
               ${ECT},
               ${CALIBREM},
               ${CALIBREIN},
               ${PATB},
               ${PATC},
               ${FCTC},
               ${GRAMAJE},
               ${COBB},
               ${BCTTEORICO},
               ${BCTREALUNO},
               ${BCTREALDOS},
               ${BCTREALTRES},
               ${BCTREALPRO},
               ${CARGA},
               ${LARGO},
               ${ANCHO},
               ${ALTO},
               ${PERIMETRO},
               ${UNI_BULTO},
               '${OBSERVACIONES}',
               '${USER}',
               ${CHECK_COLOR_IMP},
               ${CHECK_PALETIZADO},
               ${CHECK_RECUBRIMIENTO},
               ${CHECK_IMP_TEXT},
               ${CHECK_IMP_IMG},
               ${CHECK_IMP_COBA},
               '${REQUERIMIENTO}',
               ${HUMEDAD},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            );`
}

hanaQCalidad.getLoteSAPCtrlProc = ({ OP = '' }) => {
   return ` SELECT
               T2."BaseRef" AS ORDEN_PROD,
               T4."DistNumber" AS LOTE_SAP
            FROM ${process.env.HANA_DATABASE}.OITL T0
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON T0."ItemCode" = T1."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON T0."LogEntry" = T3."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T2 ON T0."DocEntry" = T2."DocEntry"
               AND T0."ItemCode" = T2."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON T3."ItemCode" = T4."ItemCode"
               AND T3."MdAbsEntry" = T4."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON T1."U_GC_TEST" = T5."Code"
            WHERE
               T0."DocType" = 59
               AND T0."ApplyType" = 59
               AND T0."BaseType" = 202
               AND T1."ItmsGrpCod" = 103
               AND T2."BaseRef" = '${OP}'`
}

hanaQCalidad.getPositionUsers = () => {
   return ` SELECT
               T0."empID" AS ID_USER,
               T0."firstName" || ' ' || T0."lastName" AS PERSON,
               'MONTACARGUISTA' AS POSITION
            FROM
               ${process.env.HANA_DATABASE}.OHEM T0
            WHERE
               T0."Active" = 'Y'
               AND T0."position" = 23
            UNION
            SELECT
               T0."empID" AS ID_USER,
               T0."firstName" || ' ' || T0."lastName" AS PERSON,
               'COMPRAS' AS POSITION
            FROM
               ${process.env.HANA_DATABASE}.OHEM T0
            WHERE
               T0."Active" = 'Y'
               AND T0."dept" = 14`
}

hanaQCalidad.getListTestTintas = () => {
   return ` SELECT
               T0.OC AS ORDEN_COMPRA,
               T0.PROVEEDOR AS PROVEEDOR,
               (
                  SELECT T10."firstName" || ' ' || T10."lastName"
                  FROM ${process.env.HANA_DATABASE}.OHEM T10
                  WHERE T10."Active" = 'Y'
                     AND T10."dept" = 14
                     AND T10."empID" = T0.RESPONSABLE
               ) AS RESPONSABLE,
               T0.TIEMPO AS TIEMPO,
               (
                  SELECT T10."firstName" || ' ' || T10."lastName"
                  FROM ${process.env.HANA_DATABASE}.OHEM T10
                  WHERE T10."Active" = 'Y'
                     AND T10."position" = 23
                     AND T10."empID" = T0.MONTACARGA
               ) AS MONTACARGA,
               T1.ID_TINTA AS ID_TINTA,
               T1.LOTE AS LOTE,
               T1.CANTIDAD AS CANTIDAD,
               T1.TONALIDAD AS TONALIDAD,
               T1.VISCOSIDAD AS VISCOSIDAD,
               T1.PH AS PH,
               T1.ESPECTROFOTOMETRO AS ESPECTROFOTOMETRO,
               T1.RESISTENCIA AS RESISTENCIA,
               T1.SUSTRATO AS SUSTRATO,
               T1.ESTADO AS ESTADO
            FROM "${process.env.HANA_DB_COPLAIM}".TICA T0
               LEFT JOIN "${process.env.HANA_DB_COPLAIM}".DOTI T1 ON T0.ID_TICA = T1.ID_TICA`
}

hanaQCalidad.getListCtrlProcess = (DATE) => {
   return ` SELECT
               T0.ORDEN_PROD AS ORDEN_PROD,
               T0.PT_CODE AS PT_CODE,
               (
                  SELECT T11."ItemName"
                  FROM ${process.env.HANA_DATABASE}.OWOR T10
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T11 ON T10."ItemCode" = T11."ItemCode"
                  WHERE T10."DocNum" = T0.ORDEN_PROD
               ) AS CAJA,
               T0.LOTE_SAP AS LOTE_SAP,
               (
                  SELECT MAX(T14."DistNumber")
                  FROM ${process.env.HANA_DATABASE}.OITL T10
                     LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T11 ON T10."ItemCode" = T11."ItemCode"
                     LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T13 ON T10."LogEntry" = T13."LogEntry"
                     LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T12 ON T10."DocEntry" = T12."DocEntry"
                     AND T10."ItemCode" = T12."ItemCode"
                     LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T14 ON T13."ItemCode" = T14."ItemCode"
                     AND T13."MdAbsEntry" = T14."AbsEntry"
                     LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T15 ON T11."U_GC_TEST" = T15."Code"
                  WHERE T10."DocType" = 59
                     AND T10."ApplyType" = 59
                     AND T10."BaseType" = 202
                     AND T11."ItmsGrpCod" = 103
                     AND T12."BaseRef" = T0.ORDEN_PROD
               ) AS LOTESAP,
               T0.LOTE_CAL AS LOTE_CAL,
               T0.ECT_STD AS ECT_STD,
               T1.ECT AS ECT,
               T1.CALIBRE_IN AS CALIBRE_IN,
               T1.BCT_TEO AS BCT_TEO,
               T1.BCTREPRO_LBF AS BCTREPRO_LBF,
               T1.CARGA_EST AS CARGA_EST,
               T1.PERIMETRO AS PERIMETRO,
               T0.ESTADO AS ESTADO
            FROM "${process.env.HANA_DB_COPLAIM}".CPCA T0
               LEFT JOIN "${process.env.HANA_DB_COPLAIM}".DOCP T1 ON T1.ORDEN_PROD = T0.ORDEN_PROD
            WHERE T0.STATUS = 'Y'
               ${DATE ? `AND T0.TIEMPO LIKE '${DATE}%'` : ''}`
}

hanaQCalidad.getCabCtrlProc = ({ ORDEN_PROD = '' }) => {
   return ` SELECT
               ORDEN_PROD,
               ${ORDEN_PROD !== '' ? `(
                     SELECT T14."DistNumber"
                     FROM ${process.env.HANA_DATABASE}.OITL T10
                        LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T11 ON T10."ItemCode" = T11."ItemCode"
                        LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T13 ON T10."LogEntry" = T13."LogEntry"
                        LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T12 ON T10."DocEntry" = T12."DocEntry"
                        AND T10."ItemCode" = T12."ItemCode"
                        LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T14 ON T13."ItemCode" = T14."ItemCode"
                        AND T13."MdAbsEntry" = T14."AbsEntry"
                        LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T15 ON T11."U_GC_TEST" = T15."Code"
                     WHERE T10."DocType" = 59
                        AND T10."ApplyType" = 59
                        AND T10."BaseType" = 202
                        AND T11."ItmsGrpCod" = 103
                        AND T12."BaseRef" = '${ORDEN_PROD}'
                  ) AS LOTE_SAP` : 'LOTE_SAP'},
               LOTE_CAL,
               ORDEN_COMP,
               ORDEN_VENT,
               PT_CODE,
               ECT_STD,
               ANALISTA,
               TIEMPO,
               PESO,
               ESTADO,
               OBSERVACIONES,
               STATUS
            FROM "${process.env.HANA_DB_COPLAIM}".CPCA
            ${ORDEN_PROD !== '' ? `WHERE ORDEN_PROD = ${ORDEN_PROD}` : ''}`
}

hanaQCalidad.putCabCtrlProc = ({
   ORDEN_PROD = '',
   ORDEN_COMP = '',
   LOTE_SAP = '',
   LOTE_CAL = '',
   ORDEN_VENT = '',
   PT_CODE = '',
   ECT_STD = '',
   ANALISTA = '',
   TIEMPO = '',
   ESTADO = '',
   OBSERVACIONES = '',
   STATUS = '',
   PESO = 0
}) => {
   return ` UPDATE "${process.env.HANA_DB_COPLAIM}".CPCA
            SET
               ${LOTE_SAP !== '' ? `LOTE_SAP = '${LOTE_SAP}',` : ''}
               ${LOTE_CAL !== '' ? `LOTE_CAL = '${LOTE_CAL}',` : ''}
               ${ORDEN_COMP !== '' ? `ORDEN_COMP = '${ORDEN_COMP}',` : ''}
               ${ORDEN_VENT !== '' ? `ORDEN_VENT = ${ORDEN_VENT},` : ''}
               ${PT_CODE !== '' ? `PT_CODE = '${PT_CODE}',` : ''}
               ${ECT_STD !== '' ? `ECT_STD = ${ECT_STD},` : ''}
               ${ANALISTA !== '' ? `ANALISTA = '${ANALISTA}',` : ''}
               ${TIEMPO !== '' ? `TIEMPO = '${TIEMPO}',` : ''}
               ${ESTADO !== '' ? `ESTADO = '${ESTADO}',` : ''}
               ${OBSERVACIONES !== '' ? `OBSERVACIONES = '${OBSERVACIONES}',` : ''}
               ${STATUS !== '' ? `STATUS = '${STATUS}',` : ''}
               ${PESO !== 0 ? `PESO = ${PESO},` : ''}
               UPDATED_AT = CURRENT_TIMESTAMP
            WHERE ORDEN_PROD = ${ORDEN_PROD}
               AND STATUS = 'Y'`
}

hanaQCalidad.postCopyCabCtrlProc = ({
   LOTE_SAP = '',
   LOTE_CAL = '',
   ORDEN_PROD = '',
   ORD_COMP = '',
   ORD_VEN = 0,
   PT_CODE = '',
   ECT_STD = '',
   USER = '',
   TIEMPO = '',
   DISPOSICION = '',
   PESO = 0,
   OBSERVACIONES = '',
   STATUS = ''
}) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}".CPCA (
               LOTE_SAP,
               LOTE_CAL,
               ORDEN_PROD,
               ORDEN_COMP,
               ORDEN_VENT,
               PT_CODE,
               ECT_STD,
               ANALISTA,
               TIEMPO,
               ESTADO,
               OBSERVACIONES,
               STATUS,
               PESO,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               '${LOTE_SAP}',
               '${LOTE_CAL}',
               ${ORDEN_PROD},
               '${ORD_COMP}',
               ${ORD_VEN},
               '${PT_CODE}',
               ${ECT_STD},
               '${USER}',
               '${TIEMPO}',
               '${DISPOSICION.toUpperCase()}',
               '${OBSERVACIONES}',
               '${STATUS}',
               ${PESO},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

hanaQCalidad.getDocCtrlProc = ({ ORDEN_PROD = '' }) => {
   return ` SELECT
               ORDEN_PROD,
               ECT,
               CALIBRE_MM,
               CALIBRE_IN,
               PAT_B,
               PAT_C,
               FCTC,
               GRAMAJE,
               COBB,
               BCT_TEO,
               BCTRE_ONE,
               BCTRE_TWO,
               BCTRE_TREE,
               BCTREPRO_LBF,
               CARGA_EST,
               LARGO,
               ANCHO,
               ALTO,
               PERIMETRO,
               UNI_BULTO,
               CHECK_CIMP,
               CHECK_PAL,
               CHECK_RECINT,
               CHECK_IMPTXT,
               CHECK_IMPIMG,
               CHECK_IMPCOD,
               REQUERIMIENTO,
               OBSERVACIONES,
               ANALISTA,
               HUMEDAD
            FROM "${process.env.HANA_DB_COPLAIM}".DOCP
            ${ORDEN_PROD !== '' ? `WHERE ORDEN_PROD = ${ORDEN_PROD}` : ''}`
}

hanaQCalidad.putDocCtrlProc = ({
   ORDEN_PROD = '',
   ECT = '',
   CALIBRE_MM = '',
   CALIBRE_IN = '',
   PAT_B = '',
   PAT_C = '',
   FCTC = '',
   GRAMAJE = '',
   COBB = '',
   BCT_TEO = '',
   BCTRE_ONE = '',
   BCTRE_TWO = '',
   BCTRE_TREE = '',
   BCTREPRO_LBF = '',
   CARGA_EST = '',
   LARGO = '',
   ANCHO = '',
   ALTO = '',
   PERIMETRO = '',
   UNI_BULTO = '',
   CHECK_CIMP = '',
   CHECK_PAL = '',
   CHECK_RECINT = '',
   CHECK_IMPTXT = '',
   CHECK_IMPIMG = '',
   CHECK_IMPCOD = '',
   REQUERIMIENTO = '',
   OBSERVACIONES = '',
   ANALISTA = '',
   HUMEDAD = '',
}) => {
   return ` UPDATE "${process.env.HANA_DB_COPLAIM}".DOCP
            SET
               ${ECT !== '' ? `ECT = ${ECT},` : ''}
               ${CALIBRE_MM !== '' ? `CALIBRE_MM = ${CALIBRE_MM},` : ''}
               ${CALIBRE_IN !== '' ? `CALIBRE_IN = ${CALIBRE_IN},` : ''}
               ${PAT_B !== '' ? `PAT_B = ${PAT_B},` : ''}
               ${PAT_C !== '' ? `PAT_C = ${PAT_C},` : ''}
               ${FCTC !== '' ? `FCTC = ${FCTC},` : ''}
               ${GRAMAJE !== '' ? `GRAMAJE = ${GRAMAJE},` : ''}
               ${COBB !== '' ? `COBB = ${COBB},` : ''}
               ${BCT_TEO !== '' ? `BCT_TEO = ${BCT_TEO},` : ''}
               ${BCTRE_ONE !== '' ? `BCTRE_ONE = ${BCTRE_ONE},` : ''}
               ${BCTRE_TWO !== '' ? `BCTRE_TWO = ${BCTRE_TWO},` : ''}
               ${BCTRE_TREE !== '' ? `BCTRE_TREE = ${BCTRE_TREE},` : ''}
               ${BCTREPRO_LBF !== '' ? `BCTREPRO_LBF = ${BCTREPRO_LBF},` : ''}
               ${CARGA_EST !== '' ? `CARGA_EST = ${CARGA_EST},` : ''}
               ${LARGO !== '' ? `LARGO = ${LARGO},` : ''}
               ${ANCHO !== '' ? `ANCHO = ${ANCHO},` : ''}
               ${ALTO !== '' ? `ALTO = ${ALTO},` : ''}
               ${PERIMETRO !== '' ? `PERIMETRO = ${PERIMETRO},` : ''}
               ${UNI_BULTO !== '' ? `UNI_BULTO = ${UNI_BULTO},` : ''}
               ${CHECK_CIMP !== '' ? `CHECK_CIMP = ${CHECK_CIMP},` : ''}
               ${CHECK_PAL !== '' ? `CHECK_PAL = ${CHECK_PAL},` : ''}
               ${CHECK_RECINT !== '' ? `CHECK_RECINT = ${CHECK_RECINT},` : ''}
               ${CHECK_IMPTXT !== '' ? `CHECK_IMPTXT = ${CHECK_IMPTXT},` : ''}
               ${CHECK_IMPIMG !== '' ? `CHECK_IMPIMG = ${CHECK_IMPIMG},` : ''}
               ${CHECK_IMPCOD !== '' ? `CHECK_IMPCOD = ${CHECK_IMPCOD},` : ''}
               ${REQUERIMIENTO !== '' ? `REQUERIMIENTO = '${REQUERIMIENTO}',` : ''}
               ${OBSERVACIONES !== '' ? `OBSERVACIONES = '${OBSERVACIONES}',` : ''}
               ${ANALISTA !== '' ? `ANALISTA = '${ANALISTA}',` : ''}
               ${HUMEDAD !== '' ? `HUMEDAD = ${HUMEDAD},` : ''}
               UPDATED_AT = CURRENT_TIMESTAMP
            WHERE ORDEN_PROD = ${ORDEN_PROD}`
}

hanaQCalidad.postCopyDocCtrlProc = ({
   ORDEN_PROD = '',
   ECT = '',
   CALIBRE_MM = '',
   CALIBRE_IN = '',
   PAT_B = '',
   PAT_C = '',
   FCTC = '',
   GRAMAJE = '',
   COBB = '',
   BCT_TEO = '',
   BCTRE_ONE = '',
   BCTRE_TWO = '',
   BCTRE_TREE = '',
   BCTREPRO_LBF = '',
   CARGA_EST = '',
   LARGO = '',
   ANCHO = '',
   ALTO = '',
   PERIMETRO = '',
   UNI_BULTO = '',
   CHECK_CIMP = '',
   CHECK_PAL = '',
   CHECK_RECINT = '',
   CHECK_IMPTXT = '',
   CHECK_IMPIMG = '',
   CHECK_IMPCOD = '',
   REQUERIMIENTO = '',
   OBSERVACIONES = '',
   ANALISTA = '',
   HUMEDAD = ''
}) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}".DOCP (
               ORDEN_PROD,
               ECT,
               CALIBRE_MM,
               CALIBRE_IN,
               PAT_B,
               PAT_C,
               FCTC,
               GRAMAJE,
               COBB,
               BCT_TEO,
               BCTRE_ONE,
               BCTRE_TWO,
               BCTRE_TREE,
               BCTREPRO_LBF,
               CARGA_EST,
               LARGO,
               ANCHO,
               ALTO,
               PERIMETRO,
               UNI_BULTO,
               CHECK_CIMP,
               CHECK_PAL,
               CHECK_RECINT,
               CHECK_IMPTXT,
               CHECK_IMPIMG,
               CHECK_IMPCOD,
               REQUERIMIENTO,
               OBSERVACIONES,
               ANALISTA,
               HUMEDAD,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               ${ORDEN_PROD},
               ${ECT},
               ${CALIBRE_MM},
               ${CALIBRE_IN},
               ${PAT_B},
               ${PAT_C},
               ${FCTC},
               ${GRAMAJE},
               ${COBB},
               ${BCT_TEO},
               ${BCTRE_ONE},
               ${BCTRE_TWO},
               ${BCTRE_TREE},
               ${BCTREPRO_LBF},
               ${CARGA_EST},
               ${LARGO},
               ${ANCHO},
               ${ALTO},
               ${PERIMETRO},
               ${UNI_BULTO},
               ${CHECK_CIMP},
               ${CHECK_PAL},
               ${CHECK_RECINT},
               ${CHECK_IMPTXT},
               ${CHECK_IMPIMG},
               ${CHECK_IMPCOD},
               '${REQUERIMIENTO}',
               '${OBSERVACIONES}',
               '${ANALISTA}',
               ${HUMEDAD},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

hanaQCalidad.getAllLotesDespachoPDFCal = ({
   FECHA = '',
   CLIENTE = '',
   VENDEDOR = '',
   FOLIO = '',
   LOTE = '',
   DOC_SAP = '',
}) => {
   return ` SELECT DISTINCT
               (
                  SELECT COUNT(*)
                  FROM "${process.env.HANA_DB_COPLAIM}".PDFCA T20
                  WHERE
                     --T20."GUIA" = T10."FolioNum" AND
                     T20."DOC_SAP" = T0."DocNum"
                     AND T20."LOTE" = T4."DistNumber"
               ) AS PDF,
               T0."DocDate" AS FECH_DESP,
               T1."U_GC_TIPO_CAJA" AS PRODUCTO,
               T10."FolioNum" AS GUIA,
               T2."CardCode" AS COD_CLI,
               T2."CardName" AS CLIENTE,
               --T2."E_Mail" AS EMAIL,
               COALESCE(NULLIF(TRIM(T14."E_MailL"), ''), NULLIF(TRIM(T2."E_Mail"), '')) AS EMAIL,
               T12."SlpName" AS VENDEDOR,
               T0."DocNum" AS DOC_SAP,
               T0."ItemCode" AS PT_CODE,
               T0."ItemName" AS CAJA,
               T4."DistNumber" AS LOTE,
               T3."Quantity" * (-1) AS CANTIDAD,
               T7."Qauntity" AS CABIDA,
               T4."InDate" AS FECH_PROD,
               CASE
                  T0."DocType"
                  WHEN 13 THEN 'FACTURA+ENTREGA'
                  WHEN 15 THEN 'GUIA'
                  WHEN 16 THEN 'DEVOLUCION'
                  WHEN 14 THEN 'NC+DEVOLUCION'
               END AS DOCUMENTO,
               T1."ItmsGrpCod" AS GRUP_ART,
               T9."U_GC_FLAUTA" AS FLAUTA,
               T13.AUTH_SRI AS AUTH_SRI
            FROM ${process.env.HANA_DATABASE}.OITL T0
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T1 ON
                  T0."ItemCode" = T1."ItemCode"
                  AND T1."ItmsGrpCod" = 103
               LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T2 ON
                  T0."CardCode" = T2."CardCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T3 ON
                  T0."LogEntry" = T3."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T4 ON
                  T3."ItemCode" = T4."ItemCode"
                  AND T3."MdAbsEntry" = T4."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITT1" T6 ON
                  T0."ItemCode" = T6."Father"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITT" T7 ON
                  T6."Father" = T7."Code"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T8 ON
                  T6."Code" = T8."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T5 ON
                  T8."U_GC_TEST" = T5."Code"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T9 ON
                  T1."U_GC_TEST" = T9."Code"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ODLN" T10 ON
                  T0."DocNum" = T10."DocNum"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OCRD" T11 ON
                  T10."CardCode" = T11."CardCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OSLP" T12 ON
                  T11."SlpCode" = T12."SlpCode"
               LEFT JOIN "${process.env.HANA_DB_DATOS}".GCGUIAS T13 ON
                  T10."DocNum" = T13.DOC_SAP
               LEFT JOIN "${process.env.HANA_DATABASE}".OCPR T14 ON
                  T2."CardCode" = T14."CardCode"
                  AND T14."Name" IN ('PRODUCCION-CALIDAD')
            WHERE T0."DocType" = 15
               AND T10."CANCELED" = 'N'
               AND T4."DistNumber" IS NOT NULL
               --AND T8."ItmsGrpCod" IN ('102', '124')
               ${FECHA !== '' ? `AND T0."DocDate" = '${FECHA}'` : 'AND T0."DocDate" > \'2023-04-30\''}
               ${VENDEDOR !== '' ? `AND T12."SlpName" = '${VENDEDOR}'` : ''}
               ${CLIENTE !== '' ? `AND T2."CardName" = '${CLIENTE}'` : ''}
               ${FOLIO !== '' ? `AND T10."FolioNum" = '${FOLIO}'` : ''}
               ${LOTE !== '' ? `AND T4."DistNumber" = '${LOTE}'` : ''}
               ${DOC_SAP !== '' ? `AND T0."DocNum" = '${DOC_SAP}'` : ''}
            ORDER BY T0."DocDate" DESC`
}

hanaQCalidad.getAllDataCabDespachoPDFCal = ({
   LOTE = '',
   PT_CODE = '',
}) => {
   return ` SELECT
               T0.LOTE_SAP,
               T0.LOTE_CAL,
               T0.ORDEN_PROD,
               T0.ORDEN_COMP,
               T0.ORDEN_VENT,
               T0.PT_CODE,
               T1.ECT,
               T1.CALIBRE_IN,
               T1.FCTC,
               T1.COBB,
               T1.CARGA_EST,
               T1.LARGO,
               T1.ANCHO,
               T1.ALTO,
               T1.HUMEDAD,
               T1.UNI_BULTO,
               T1.BCTREPRO_LBF,
               T1.PAT_B,
               T1.PAT_C,
               T1.REQUERIMIENTO
            FROM "${process.env.HANA_DB_COPLAIM}".CPCA T0
               INNER JOIN "${process.env.HANA_DB_COPLAIM}".DOCP T1
                  ON T0.ORDEN_PROD = T1.ORDEN_PROD
            WHERE
               T0.LOTE_SAP = '${LOTE}'
               AND T0.PT_CODE = '${PT_CODE}'
               AND T0.STATUS = 'Y'`
}

hanaQCalidad.getCodePDFCal = ({
   GUIA = '',
   DOC_SAP = '',
   LOTE = '',
}) => {
   return ` SELECT
               ${GUIA !== '' && DOC_SAP !== '' && LOTE !== '' ? 'T0.ID_PDFCA AS CODE' : 'MAX(T0.ID_PDFCA) AS CODE'}
            FROM "${process.env.HANA_DB_COPLAIM}".PDFCA T0
            ${GUIA !== '' && DOC_SAP !== '' && LOTE !== '' ? `WHERE T0.GUIA = '${GUIA}' AND T0.DOC_SAP = '${DOC_SAP}' AND T0.LOTE = '${LOTE}'` : ''}`
}

hanaQCalidad.insertPDFCal = ({
   ID_PDFCA = '',
   GUIA = '',
   DOC_SAP = '',
   LOTE = '',
}) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}".PDFCA (
               ID_PDFCA,
               GUIA,
               DOC_SAP,
               LOTE,
               CREATED_AT,
               UPDATED_AT
            ) VALUES(
               ${ID_PDFCA},
               '${GUIA}',
               '${DOC_SAP}',
               '${LOTE}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

hanaQCalidad.getDetailsTestCOPLAIM = ({
   ORDEN_PROD = '',
}) => {
   return ` SELECT T0.ORDEN_PROD,
               T0.LOTE_SAP,
               T0.LOTE_CAL,
               T0.ORDEN_COMP,
               T0.ORDEN_VENT,
               T0.PT_CODE,
               T0.ECT_STD,
               T0.TIEMPO,
               T0.ESTADO,
               T0.OBSERVACIONES,
               T0.PESO,
               T1.ORDEN_PROD AS ORD_PRO_DOC,
               T1.ECT,
               T1.CALIBRE_MM,
               T1.CALIBRE_IN,
               T1.PAT_B,
               T1.PAT_C,
               T1.FCTC,
               T1.GRAMAJE,
               T1.COBB,
               T1.BCT_TEO,
               T1.BCTRE_ONE,
               T1.BCTRE_TWO,
               T1.BCTRE_TREE,
               T1.BCTREPRO_LBF,
               T1.CARGA_EST,
               T1.LARGO,
               T1.ANCHO,
               T1.ALTO,
               T1.PERIMETRO,
               T1.UNI_BULTO,
               T1.CHECK_CIMP,
               T1.CHECK_PAL,
               T1.CHECK_RECINT,
               T1.CHECK_IMPTXT,
               T1.CHECK_IMPIMG,
               T1.CHECK_IMPCOD,
               T1.REQUERIMIENTO,
               T1.OBSERVACIONES AS OB_DOC,
               T1.HUMEDAD
            FROM "${process.env.HANA_DB_COPLAIM}".CPCA T0
               LEFT JOIN "${process.env.HANA_DB_COPLAIM}".DOCP T1 ON T0.ORDEN_PROD = T1.ORDEN_PROD
            WHERE T0.ORDEN_PROD = ${ORDEN_PROD}`
}

hanaQCalidad.searchLoteSAP = ({ OP = '' }) => {
   return ` SELECT T14."DistNumber"
            FROM "${process.env.HANA_DATABASE}"."OITL" T10
               LEFT JOIN "${process.env.HANA_DATABASE}"."OITM" T11 ON T10."ItemCode" = T11."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."ITL1" T13 ON T10."LogEntry" = T13."LogEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."IGN1" T12 ON T10."DocEntry" = T12."DocEntry"
               AND T10."ItemCode" = T12."ItemCode"
               LEFT JOIN "${process.env.HANA_DATABASE}"."OBTN" T14 ON T13."ItemCode" = T14."ItemCode"
               AND T13."MdAbsEntry" = T14."AbsEntry"
               LEFT JOIN "${process.env.HANA_DATABASE}"."@GC_CARTON" T15 ON T11."U_GC_TEST" = T15."Code"
            WHERE T10."DocType" = 59
               AND T10."ApplyType" = 59
               AND T10."BaseType" = 202
               AND T11."ItmsGrpCod" = 103
               AND T12."BaseRef" = '${OP}'`
}

hanaQCalidad.getListInsTraInv = () => {
   return ` SELECT DISTINCT
               T0.ITEMCODE AS PT_CODE,
               T0.ITEMNAME AS INSUMO,
               T0.DISTNUMBER AS LOTE
            FROM
               ${process.env.HANA_DB_DATOS}.GCINSM T0
            WHERE
               T0.DOCUMENTO = 'OrdenProduccion'`
}

hanaQCalidad.getListLoteTraInv = ({ LOTE = '' }) => {
   return ` -- =============================================================================
            -- VERSIÓN: 2.1
            -- FECHA: 20/01/2026
            -- AUTOR: Comité Consultor BI
            -- BASE DE DATOS: SAP Business One 9.3 sobre HANA 1.0
            --
            -- PROPÓSITO:
            -- Trazabilidad de insumos: ¿En qué producto (caja o lámina) se utilizó cada insumo?
            -- Usado por la app para mostrar "Detalle de los insumos" al hacer clic en VER
            --
            -- CAMBIOS v2.1:
            -- - CRÍTICO: Excluye registros donde el insumo = producto fabricado de la orden
            --   (evita mostrar la producción del artículo como si fuera un consumo/desembalaje)
            -- - Elimina duplicados con ROW_NUMBER en GCPROT
            -- - Mantiene desembalajes reales (errores humanos en cajas)
            -- - Mantiene compatibilidad con campos originales de la app
            --
            -- VALIDACIÓN REALIZADA:
            -- - Lote C270625L8829-1: ANTES mostraba 2 registros, DESPUÉS muestra 1 (correcto)
            -- - Orden 45749 (producción lámina): EXCLUIDA correctamente
            -- - Orden 45624 (consumo para caja): MOSTRADA correctamente
            -- =============================================================================

            WITH
            -- =============================================================================
            -- CTE 1: GCPROT deduplicado (un registro por orden para cajas grupo 103)
            -- =============================================================================
            GCPROT_UNICO AS (
               SELECT
                  "BASEREF",
                  "ITEMCODE",
                  "ITEMNAME",
                  "DISTNUMBER",
                  ROW_NUMBER() OVER (
                     PARTITION BY "BASEREF"
                     ORDER BY "DISTNUMBER" ASC
                  ) AS "RN"
               FROM ${process.env.HANA_DB_DATOS}.GCPROT
            ),

            -- =============================================================================
            -- CTE 2: Producción de LÁMINAS deduplicado (para órdenes grupo 124)
            -- =============================================================================
            LAMINAS_UNICO AS (
               SELECT
                  CAST("OrdenProduccion" AS NVARCHAR(20)) AS "OrdenProd",
                  "Articulo" AS "CodFabricado",
                  "Descripcion" AS "Producto",
                  "Lote",
                  ROW_NUMBER() OVER (
                     PARTITION BY "OrdenProduccion"
                     ORDER BY "Lote" ASC
                  ) AS "RN"
               FROM ${process.env.HANA_DB_DATOS}.LPEPAD_LOTES
               WHERE "TipoMovimiento" = 'Fabricación'
            )

            -- =============================================================================
            -- SELECT PRINCIPAL
            -- =============================================================================
            SELECT
               T0."BASEREF" AS "DOC_SAP",                                    -- numero orden produccion
               T0."QUANTITY" AS "CONSUMO",                                   -- cantidad (negativo=consumo, positivo=desembalaje real)
               T0."DOCUMENTO" AS "DOCUMENTO",                                -- tipo: OrdenProduccion o Desembalaje
               T0."DOCDATE" AS "FECHA",                                      -- fecha del movimiento

               -- Producto fabricado: primero GCPROT (cajas 103), luego LPEPAD_LOTES (láminas 124)
               COALESCE(T1."ITEMCODE", T2."CodFabricado") AS "CODE_PT",      -- codigo producto fabricado
               COALESCE(T1."ITEMNAME", T2."Producto") AS "PRODUCTO",         -- nombre producto fabricado
               COALESCE(T1."DISTNUMBER", T2."Lote") AS "LOTE"                -- lote del producto fabricado

            FROM ${process.env.HANA_DB_DATOS}.GCINSM T0

            -- =============================================================================
            -- JOIN con OWOR para saber qué producto se fabrica en cada orden
            -- Esto permite filtrar la "producción propia"
            -- =============================================================================
            LEFT JOIN "SBO_CARTOMANABI_PROD"."OWOR" W0 ON
               CAST(T0."BASEREF" AS INTEGER) = W0."DocNum"

            -- JOIN con GCPROT deduplicado (cajas grupo 103)
            LEFT JOIN GCPROT_UNICO T1 ON
               T0."BASEREF" = T1."BASEREF"
               AND T1."RN" = 1

            -- JOIN con LÁMINAS deduplicado (láminas grupo 124, solo si no hay GCPROT)
            LEFT JOIN LAMINAS_UNICO T2 ON
               T0."BASEREF" = T2."OrdenProd"
               AND T2."RN" = 1
               AND T1."BASEREF" IS NULL

            -- =============================================================================
            -- FILTRO CRÍTICO: Excluir cuando el insumo = producto fabricado de la orden
            -- =============================================================================
            -- Ejemplo: Si orden 45749 fabrica LPE0008829 y el insumo es LPE0008829
            --          → EXCLUIR (es la producción, no un consumo)
            -- Ejemplo: Si orden 45624 fabrica PT0009266 y el insumo es LPE0008829
            --          → MOSTRAR (es consumo de lámina para hacer caja)
            -- =============================================================================
            WHERE
               T0."ITEMCODE" <> COALESCE(W0."ItemCode", '')
               ${LOTE !== '' ? `AND T0.DISTNUMBER = '${LOTE}'` : ''}

            -- =============================================================================
            -- FILTRO DE LA APP: Descomentar según cómo la app pase el parámetro
            -- =============================================================================
            -- AND T0."DISTNUMBER" = :lote_insumo                            -- parámetro de la app

            ORDER BY
               T0."DOCDATE" DESC,
               T0."BASEREF";`
}

hanaQCalidad.getCompraTraInv = ({ LOTE = '', COD = '' }) => {
   return ` SELECT
               *
            FROM
               ${process.env.HANA_DB_DATOS}.GCCMPTZ T0
            ${LOTE !== '' || COD !== '' ? 'WHERE' : ''}
               ${LOTE !== '' ? `T0.LOTE = '${LOTE}'` : ''}
               ${LOTE !== '' && COD !== '' ? 'AND' : ''}
               ${COD !== '' ? `T0.CODE_PT = '${COD}'` : ''}`
}

module.exports = hanaQCalidad
const queryQInsumos = {}

queryQInsumos.getListInsumos = () => {
   return ` SELECT
               T0."ItemCode" AS CODE,
               T0."ItemName" AS NAME
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            WHERE
               T0."ItmsGrpCod" = 104
               AND T0."ItemCode" LIKE 'TIN%'
               AND T0."validFor" = 'Y'`
}

queryQInsumos.searchAllTintasProv = ({
   START = '',
   END = '',
   NUM_MONTH = 1,
   CODE = '',
   START_ONE = '',
   END_ONE = '',
   START_TWO = '',
   END_TWO = ''
}) => {
   return ` SELECT
               T0."ItemCode" AS CODTINTA,
               T0."ItemName" AS DESCRIPCION,
               CASE
                  WHEN T1.LOTE IS NULL THEN 'N/A'
                  WHEN T2.CARDNAME IS NULL THEN 'CARTOMANABI S.A.'
                  WHEN T2.CARDNAME = 'PRODUCTOS Y SERVICIOS LATINOAMERICANOS PROYSA S.A.' THEN 'PROYSA S.A.'
                  WHEN T2.CARDNAME IS NOT NULL THEN T2.CARDNAME
               END AS PROVEEDOR,
               COALESCE(SUM(T1.STOCK), 0) AS STOCK,
               CASE
                  WHEN T1.BODEGA IS NULL THEN '04'
                  WHEN T1.BODEGA IS NOT NULL THEN T1.BODEGA
               END AS NUM_BOD,
               CASE
                  WHEN T3."WhsName" IS NULL THEN 'BODEGA DE INSUMOS DE PRODUCCION'
                  WHEN T3."WhsName" IS NOT NULL THEN T3."WhsName"
               END AS BODEGA,
               COALESCE((
                  SELECT
                     SUM(T10."Quantity")
                  FROM
                     ${process.env.HANA_DATABASE}.GCLCON T10
                  WHERE
                     T10.GROUPCODE IN (104, 106)
                     AND T10.SUPPLIES = T0."ItemCode"
                     AND T10."CloseDate" BETWEEN '${START_ONE}' AND '${END_ONE}'
               ), 0) AS ConsumoOne,
               COALESCE((
                  SELECT
                     SUM(T10."Quantity")
                  FROM
                     ${process.env.HANA_DATABASE}.GCLCON T10
                  WHERE
                     T10.GROUPCODE IN (104, 106)
                     AND T10.SUPPLIES = T0."ItemCode"
                     AND T10."CloseDate" BETWEEN '${START_TWO}' AND '${END_TWO}'
               ), 0) AS ConsumoTwo,
               COALESCE((
                  SELECT
                     SUM(T10."Quantity") / ${NUM_MONTH} AS CANTIDAD
                  FROM
                     ${process.env.HANA_DATABASE}.GCLCON T10
                  WHERE
                     T10.GROUPCODE = 104
                     AND T10.SUPPLIES = T0."ItemCode"
                     AND T10."CloseDate" BETWEEN '${START}' AND '${END}'
               ), 0) AS CONSUMO,
               (
                  SELECT T20."MinStock"
                  FROM ${process.env.HANA_DATABASE}.OITW T20
                  WHERE
                     T20."ItemCode" = T0."ItemCode"
                     AND T20."WhsCode" IN ('04')
               ) AS MIN,
               (
                  SELECT T20."MaxStock"
                  FROM ${process.env.HANA_DATABASE}.OITW T20
                  WHERE
                     T20."ItemCode" = T0."ItemCode"
                     AND T20."WhsCode" IN ('04')
               ) AS MAX,
               (
                  SELECT
						SUM(T20.CANTIDAD)
                  FROM
                     ${process.env.HANA_DATABASE}.GCSOLC T20
                  WHERE
                     T20.CODE_PT = T0."ItemCode"
               ) AS SOL_COMP
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            LEFT JOIN
               "${process.env.HANA_DATABASE}"."GC_STOCK_LOTES_TINTA" T1 ON
               T0."ItemCode" = T1.CODTINTA
            LEFT JOIN "${process.env.HANA_DATABASE}"."GCLCO" T2 ON
               T1.LOTE = T2.LOTE
            LEFT JOIN ${process.env.HANA_DATABASE}.OWHS T3 ON
               T1.BODEGA = T3."WhsCode"
            WHERE
               T0."ItmsGrpCod" = 104
               AND T0."ItemCode" LIKE 'TIN%'
               AND T0."validFor" = 'Y'
               ${CODE !== 'ALL' ? `AND T0."ItemCode" = '${CODE}'` : ''}
            GROUP BY
               T0."ItemCode",
               T0."ItemName",
               CASE
                  WHEN T1.LOTE IS NULL THEN 'N/A'
                  WHEN T2.CARDNAME IS NULL THEN 'CARTOMANABI S.A.'
                  WHEN T2.CARDNAME = 'PRODUCTOS Y SERVICIOS LATINOAMERICANOS PROYSA S.A.' THEN 'PROYSA S.A.'
                  WHEN T2.CARDNAME IS NOT NULL THEN T2.CARDNAME
               END,
               CASE
                  WHEN T1.BODEGA IS NULL THEN '04'
                  WHEN T1.BODEGA IS NOT NULL THEN T1.BODEGA
               END,
               CASE
                  WHEN T3."WhsName" IS NULL THEN 'BODEGA DE INSUMOS DE PRODUCCION'
                  WHEN T3."WhsName" IS NOT NULL THEN T3."WhsName"
               END
            ORDER BY CONSUMO DESC`
}

queryQInsumos.searchAllCorruProv = ({
   START = '',
   END = '',
   NUM_MONTH = 1,
   CODE = '',
   START_ONE = '',
   END_ONE = '',
   START_TWO = '',
   END_TWO = '',
   OPT = ''
}) => {
   return ` SELECT
               T0."ItemCode" AS CODTINTA,
               T0."ItemName" AS DESCRIPCION,
               CASE
                  WHEN T1.LOTE IS NULL THEN 'N/A'
                  WHEN T2.CARDNAME IS NULL THEN 'CARTOMANABI S.A.'
                  WHEN T2.CARDNAME = 'PRODUCTOS Y SERVICIOS LATINOAMERICANOS PROYSA S.A.' THEN 'PROYSA S.A.'
                  WHEN T2.CARDNAME IS NOT NULL THEN T2.CARDNAME
               END AS PROVEEDOR,
               COALESCE(SUM(T1.STOCK), 0) AS STOCK,
               CASE
                  WHEN T1.BODEGA IS NULL THEN '15'
                  WHEN T1.BODEGA IS NOT NULL THEN T1.BODEGA
               END AS NUM_BOD,
               CASE
                  WHEN T3."WhsName" IS NULL THEN 'BODEGA DE INSUMOS DE PRODUCCION'
                  WHEN T3."WhsName" IS NOT NULL THEN T3."WhsName"
               END AS BODEGA,
               COALESCE((
                  SELECT
                     SUM(T10."Quantity")
                  FROM
                     ${process.env.HANA_DATABASE}.GCLCON T10
                  WHERE
                     T10.GROUPCODE IN (104, 106)
                     AND T10.SUPPLIES = T0."ItemCode"
                     AND T10."CloseDate" BETWEEN '${START_ONE}' AND '${END_ONE}'
               ), 0) AS ConsumoOne,
               COALESCE((
                  SELECT
                     SUM(T10."Quantity")
                  FROM
                     ${process.env.HANA_DATABASE}.GCLCON T10
                  WHERE
                     T10.GROUPCODE IN (104, 106)
                     AND T10.SUPPLIES = T0."ItemCode"
                     AND T10."CloseDate" BETWEEN '${START_TWO}' AND '${END_TWO}'
               ), 0) AS ConsumoTwo,
               COALESCE((
                  SELECT
                     SUM(T10."Quantity") / ${NUM_MONTH}
                  FROM
                     ${process.env.HANA_DATABASE}.GCLCON T10
                  WHERE
                     T10.GROUPCODE IN (104, 106)
                     AND T10.SUPPLIES = T0."ItemCode"
                     AND T10."CloseDate" BETWEEN '${START}' AND '${END}'
               ), 0) AS CONSUMO,
               (
                  SELECT T20."MinStock"
                  FROM ${process.env.HANA_DATABASE}.OITW T20
                  WHERE
                     T20."ItemCode" = T0."ItemCode"
                     AND T20."WhsCode" IN ('15')
               ) AS MIN,
               (
                  SELECT T20."MaxStock"
                  FROM ${process.env.HANA_DATABASE}.OITW T20
                  WHERE
                     T20."ItemCode" = T0."ItemCode"
                     AND T20."WhsCode" IN ('15')
               ) AS MAX,
               (
                  SELECT
						SUM(T20.CANTIDAD)
                  FROM
                     ${process.env.HANA_DATABASE}.GCSOLC T20
                  WHERE
                     T20.CODE_PT = T0."ItemCode"
               ) AS SOL_COMP
            FROM
               ${process.env.HANA_DB_COPLAIM}.INSMT S0
            LEFT JOIN
               ${process.env.HANA_DATABASE}.OITM T0 ON
                  S0.CODE_PT = T0."ItemCode"
            LEFT JOIN
               "${process.env.HANA_DATABASE}"."GCSTKL" T1 ON
               T0."ItemCode" = T1.CODTINTA
               AND T1.BODEGA IN ('15', '18')
            LEFT JOIN "${process.env.HANA_DATABASE}"."GCLCO" T2 ON
               T1."LOTE" = T2.LOTE
            LEFT JOIN ${process.env.HANA_DATABASE}.OWHS T3 ON
               T1.BODEGA = T3."WhsCode"
            WHERE
               T0."ItmsGrpCod" IN (104, 106)
               --AND T0."ItemCode" LIKE 'TIN%'
               AND T0."validFor" = 'Y'
               --AND T0."ItemCode" IN ('INS00006', 'QUI000008', 'QUI000009', 'INS00008')
               ${CODE !== 'ALL' ? `AND T0."ItemCode" = '${CODE}'` : `AND S0.TIPO = '${OPT}'`}
            GROUP BY
               T0."ItemCode",
               T0."ItemName",
               CASE
                  WHEN T1.LOTE IS NULL THEN 'N/A'
                  WHEN T2.CARDNAME IS NULL THEN 'CARTOMANABI S.A.'
                  WHEN T2.CARDNAME = 'PRODUCTOS Y SERVICIOS LATINOAMERICANOS PROYSA S.A.' THEN 'PROYSA S.A.'
                  WHEN T2.CARDNAME IS NOT NULL THEN T2.CARDNAME
               END,
               CASE
                  WHEN T1.BODEGA IS NULL THEN '15'
                  WHEN T1.BODEGA IS NOT NULL THEN T1.BODEGA
               END,
               CASE
                  WHEN T3."WhsName" IS NULL THEN 'BODEGA DE INSUMOS DE PRODUCCION'
                  WHEN T3."WhsName" IS NOT NULL THEN T3."WhsName"
               END
            ORDER BY CONSUMO DESC`
}

queryQInsumos.searchTypeArticulo = ({ CODE = '' }) => {
   return ` SELECT
               T0.CODE_PT AS CODE,
               T1."ItemName" AS NAME,
               T0.TIPO AS TIPO
            FROM
               ${process.env.HANA_DB_COPLAIM}.INSMT T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OITM T1 ON
                  T0.CODE_PT = T1."ItemCode"
            WHERE
               T0.TIPO = '${CODE}'`
}

queryQInsumos.searchProductsTem = ({
   START = '',
   END = '',
   NUM_MONTH = 3,
   CODE = '',
   TIPO = '',
   START_ONE = '',
   END_ONE = '',
   START_TWO = '',
   END_TWO = ''
}) => {
   return ` SELECT
               T1."ItemCode" AS CodArticulo,
               T1."ItemName" AS Nombre,
               COALESCE((
                  SELECT
                     SUM(T11."Quantity")
                  FROM
                     ${process.env.HANA_DATABASE}.OIGE T10
                        LEFT JOIN ${process.env.HANA_DATABASE}.IGE1 T11 ON
                           T10."DocEntry" = T11."DocEntry"
                  WHERE
                     T11."ItemCode" = T1."ItemCode"
                     AND T10."DocDate" BETWEEN '${START_ONE}' AND '${END_ONE}'
               ), 0) AS ConsumoOne,
               COALESCE((
                  SELECT
                     SUM(T11."Quantity")
                  FROM
                     ${process.env.HANA_DATABASE}.OIGE T10
                        LEFT JOIN ${process.env.HANA_DATABASE}.IGE1 T11 ON
                           T10."DocEntry" = T11."DocEntry"
                  WHERE
                     T11."ItemCode" = T1."ItemCode"
                     AND T10."DocDate" BETWEEN '${START_TWO}' AND '${END_TWO}'
               ), 0) AS ConsumoTwo,
               COALESCE((
                  SELECT
                     SUM(T11."Quantity") / ${NUM_MONTH}
                  FROM
                     ${process.env.HANA_DATABASE}.OIGE T10
                        LEFT JOIN ${process.env.HANA_DATABASE}.IGE1 T11 ON
                           T10."DocEntry" = T11."DocEntry"
                  WHERE
                     T11."ItemCode" = T1."ItemCode"
                     AND T10."DocDate" BETWEEN '${START}' AND '${END}'
               ), 0) AS Consumo,
               T1."ItmsGrpCod" AS GroupCode,
               T2."OnHand" AS Stock,
               T2."MinStock" AS MIN,
               T2."MaxStock" AS MAX,
               T3."CardName" AS Proveedor,
               T3."PrecioCompra" AS EndPrice,
               T3."FechaUltimaCompra" AS LastPurchase,
               (
                  SELECT
						SUM(T20.CANTIDAD)
                  FROM
                     ${process.env.HANA_DATABASE}.GCSOLC T20
                  WHERE
                     T20.CODE_PT = T1."ItemCode"
               ) AS SOL_COMP
            FROM ${process.env.HANA_DB_COPLAIM}.INSMT T0
            LEFT JOIN ${process.env.HANA_DATABASE}.OITM T1 ON
               T0.CODE_PT = T1."ItemCode"
            LEFT JOIN ${process.env.HANA_DATABASE}.OITW T2 ON
               T1."ItemCode" = T2."ItemCode" AND T2."WhsCode" IN ('05')
            LEFT JOIN ${process.env.HANA_DATABASE}.GCULTC T3 ON
               T1."ItemCode" = T3."ItemCode"
            WHERE T0.TIPO = '${TIPO}'
               ${CODE !== 'ALL' ? `AND T1."ItemCode" = '${CODE}'` : ''}
            ORDER BY Consumo DESC`
}

queryQInsumos.searchTypeFilter = ({ TOP = '' }) => {
   return ` SELECT
               T1."ItmsTypCod" AS CODE,
               T1."ItmsGrpNam" AS NAME
            FROM
               ${process.env.HANA_DB_COPLAIM}.CFSTOCK T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OITG T1 ON
                  T0.ID_OITG = T1."ItmsTypCod"
            WHERE T0.ID_FILTER IN (${TOP})
            ORDER BY
               T1."ItmsTypCod" ASC`
}

queryQInsumos.searchItemsProdcts = ({
   START = '',
   END = '',
   NUM_MONTH = 3,
   CODE = '',
   START_ONE = '',
   END_ONE = '',
   START_TWO = '',
   END_TWO = '',
   START_MONTH = '',
   END_MONTH = '',
   GRP1 = '',
   GRP2 = '',
   GRP3 = '',
   NUM_BOD = ''
}) => {
   return ` SELECT
               T1."ItemCode" AS CodArticulo,
               T1."ItemName" AS Nombre,
               T1."LeadTime" AS DiasEntrega,
               COALESCE(T6.CANTIDAD, 0) AS ConsumoOne,
               COALESCE(T7.CANTIDAD, 0) AS ConsumoTwo,
               COALESCE(T8.CANTIDAD, 0) AS ConsumoThree,
               COALESCE(T9.CANTIDAD / ${NUM_MONTH}, 0) AS Consumo,
               T1."ItmsGrpCod" AS GroupCode,
               --T2."WhsCode" AS NUM_BOD,
               --T4."WhsName" AS BODEGA,
               SUM(T2."OnHand") AS Stock,
               SUM(T2."MinStock") AS MIN,
               SUM(T2."MaxStock") AS MAX,
               T3."CardName" AS Proveedor,
               T3."PrecioCompra" AS EndPrice,
               T3."FechaUltimaCompra" AS LastPurchase,
               COALESCE(T5.CANTIDAD, 0) AS SOL_COMP,
               T1."ManBtchNum" AS ISBATCH
            FROM ${process.env.HANA_DATABASE}.OITM T1
               LEFT JOIN ${process.env.HANA_DATABASE}.OITW T2 ON
                  T1."ItemCode" = T2."ItemCode"
                  ${NUM_BOD !== '' ? `AND T2."WhsCode" IN (${NUM_BOD})` : ''}
                  /*AND T2."WhsCode" IN (
                     SELECT T20.BODEGA
                     FROM ${process.env.HANA_DB_COPLAIM}.CFBODG T20
                     WHERE T20.GRPCODE = T1."ItmsGrpCod"
                  )*/
               LEFT JOIN ${process.env.HANA_DATABASE}.GCULTC T3 ON
                  T1."ItemCode" = T3."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OWHS T4 ON
                  T2."WhsCode" = T4."WhsCode"
               LEFT JOIN (
                  SELECT
                     T20.CODE_PT,
                     SUM(COALESCE(T20.CANTIDAD, 0)) AS CANTIDAD
                  FROM
                     ${process.env.HANA_DATABASE}.GCSOLC T20
                  GROUP BY
                     T20.CODE_PT
               ) T5 ON
                  T5.CODE_PT = T1."ItemCode"
               LEFT JOIN (
                  SELECT
                     T11."ItemCode" AS CODE_PT,
                     SUM(T11."Quantity") AS CANTIDAD
                  FROM
                     ${process.env.HANA_DATABASE}.OIGE T10
                        LEFT JOIN ${process.env.HANA_DATABASE}.IGE1 T11 ON
                           T10."DocEntry" = T11."DocEntry"
                  WHERE
                     T10."DocDate" BETWEEN '${START_ONE}' AND '${END_ONE}'
                  GROUP BY
                     T11."ItemCode"
               ) T6 ON
                  T6.CODE_PT = T1."ItemCode"
               LEFT JOIN (
                  SELECT
                     T11."ItemCode" AS CODE_PT,
                     SUM(T11."Quantity") AS CANTIDAD
                  FROM
                     ${process.env.HANA_DATABASE}.OIGE T10
                        LEFT JOIN ${process.env.HANA_DATABASE}.IGE1 T11 ON
                           T10."DocEntry" = T11."DocEntry"
                  WHERE
                     T10."DocDate" BETWEEN '${START_TWO}' AND '${END_TWO}'
                  GROUP BY
                     T11."ItemCode"
               ) T7 ON
                  T7.CODE_PT = T1."ItemCode"
               LEFT JOIN (
                  SELECT
                     T11."ItemCode" AS CODE_PT,
                     SUM(T11."Quantity") AS CANTIDAD
                  FROM
                     ${process.env.HANA_DATABASE}.OIGE T10
                        LEFT JOIN ${process.env.HANA_DATABASE}.IGE1 T11 ON
                           T10."DocEntry" = T11."DocEntry"
                  WHERE
                     T10."DocDate" BETWEEN '${START_MONTH}' AND '${END_MONTH}'
                  GROUP BY
                     T11."ItemCode"
               ) T8 ON
                  T8.CODE_PT = T1."ItemCode"
               LEFT JOIN (
                  SELECT
                     T11."ItemCode" AS CODE_PT,
                     SUM(T11."Quantity") AS CANTIDAD
                  FROM
                     ${process.env.HANA_DATABASE}.OIGE T10
                        LEFT JOIN ${process.env.HANA_DATABASE}.IGE1 T11 ON
                           T10."DocEntry" = T11."DocEntry"
                  WHERE
                     T10."DocDate" BETWEEN '${START}' AND '${END}'
                  GROUP BY
                     T11."ItemCode"
               ) T9 ON
                  T9.CODE_PT = T1."ItemCode"
            WHERE
               T1."validFor" = 'Y'
               ${GRP1 !== 'ALL' ? `AND T1."QryGroup${GRP1}" = 'Y'` : ''}
               ${GRP2 !== 'ALL' ? `AND T1."QryGroup${GRP2}" = 'Y'` : ''}
               ${GRP3 !== 'ALL' ? `AND T1."QryGroup${GRP3}" = 'Y'` : ''}
               ${CODE !== 'ALL' ? `AND T1."ItemCode" = '${CODE}'` : ''}
            GROUP BY
               T1."ItemCode",
               T1."ItemName",
               T1."LeadTime",
               T1."ItmsGrpCod",
               T3."CardName",
               T3."PrecioCompra",
               T3."FechaUltimaCompra",
               T1."ManBtchNum",
               T5.CANTIDAD,
               T6.CANTIDAD,
               T7.CANTIDAD,
               T8.CANTIDAD,
               T9.CANTIDAD
            ORDER BY
               Consumo DESC`
}

queryQInsumos.searchDetSolBuy = ({
   PT = ''
}) => {
   return ` SELECT
               *
            FROM
               ${process.env.HANA_DATABASE}.GCSOLC T0
            WHERE
               T0.CODE_PT = '${PT}'`
}

queryQInsumos.searchAllPallet = () => {
   return ` SELECT
               T3."WhsName" AS BODEGA,
               SUBSTR_AFTER(T2."BinCode", '19-') AS NAME_UBI,
               T1."ItemCode" AS CODE_ITM,
               T1."ItemName" AS PALLET,
               TO_INT(T0."OnHandQty") AS CANTIDAD
            FROM
               ${process.env.HANA_DATABASE}.OIBQ T0
            LEFT JOIN
               ${process.env.HANA_DATABASE}.OITM T1 ON
                  T0."ItemCode" = T1."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OBIN T2 ON
                  T0."BinAbs" = T2."AbsEntry"
               LEFT JOIN ${process.env.HANA_DATABASE}.OWHS T3 ON
                  T0."WhsCode" = T3."WhsCode"
            WHERE
               T0."WhsCode" = '19'`
}

module.exports = queryQInsumos
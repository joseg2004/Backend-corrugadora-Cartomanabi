const queryQBobinas = {}

queryQBobinas.getStockBobinas = ({ bod = '', cod = '', prov = '' }) => {
   return ` SELECT
               DISTINCT
               T0."ItemCode" AS Codigo,
               ${prov ? 'TO_NVARCHAR(T0."Notes") As Proveedor,' : ''}
               COUNT(T0."ItemCode") AS Cantidad,
               AVG(T2."AvgPrice" * 1000) AS Precio,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
               END AS Almacen,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END AS Ubicacion,
               (
                  SUM(CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                     WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
                  END) / 1000
               ) AS Stock
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
               ) > 0 AND
               T1."Quantity" > 0 AND
               T2."ItmsGrpCod" = '101'
               ${bod !== '' ? `AND (
                  CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                     WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
                  END
                  ) IN (${bod})` : ''}
               ${cod !== '' ? `AND T0."ItemCode" = '${cod}'` : ''}
               ${prov ? `AND TO_NVARCHAR(T0."Notes") ${prov === '\'\'' ? 'IS NULL' : `IN (${prov})`}` : ''}
            GROUP BY
               T0."ItemCode",
               ${prov ? 'TO_NVARCHAR(T0."Notes"),' : ''}
               T2."ItemName",
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN t4."WhsCode"
               END,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END
            ORDER BY
               T0."ItemCode" ASC`
}

queryQBobinas.getGramAnchBob = ({ bod = '', cod = '', prov = '' }) => {
   return ` SELECT
               DISTINCT
               T0."ItemCode" AS Codigo,
               ${prov ? 'TO_NVARCHAR(T0."Notes") As Proveedor,' : ''}
               COUNT(T0."ItemCode") AS Cantidad,
               AVG(T2."AvgPrice" * 1000) AS Precio,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
               END AS Almacen,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END AS Ubicacion,
               (
                  SUM(CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                     WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
                  END) / 1000
               ) AS Stock,
               T0."U_GC_GRAMAJE",
               T0."U_GC_ANCHO"
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
               ) > 0 AND
               T1."Quantity" > 0 AND
               T2."ItmsGrpCod" = '101'
               ${bod !== '' ? `AND (
                  CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                     WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
                  END
                  ) IN (${bod})` : ''}
               ${cod !== '' ? `AND T0."ItemCode" = '${cod}'` : ''}
               ${prov ? `AND TO_NVARCHAR(T0."Notes") ${prov === '\'\'' ? 'IS NULL' : `IN (${prov})`}` : ''}
            GROUP BY
               T0."ItemCode",
               ${prov ? 'TO_NVARCHAR(T0."Notes"),' : ''}
               T2."ItemName",
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN t4."WhsCode"
               END,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END,
               T0."U_GC_GRAMAJE",
               T0."U_GC_ANCHO"
            ORDER BY
               T0."U_GC_GRAMAJE" ASC`
}

queryQBobinas.getDescBobinas = ({ bod = '', cod = '', prov = '' }) => {
   return ` SELECT DISTINCT
               T0."ItemCode" AS Codigo,
               TO_NVARCHAR(T0."Notes") AS Proveedor,
               T2."AvgPrice" * 1000 AS Precio,
               T0."DistNumber" AS Lote,
               T0."InDate",
               T0."U_GC_GRAMAJE",
               T0."U_GC_ANCHO",
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN t4."WhsCode"
               END AS Almacen,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END AS Ubicacion,
               (CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                  WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
               END) / 1000 AS Stock,
               T2."FrgnName" AS DESCRIPCION,
               --T0.U_GC_LOTEPROV || '-' || T0.U_GC_COD_BOB
               (
                  CASE
                     WHEN T0.U_GC_LOTEPROV IS NULL THEN T0.U_GC_COD_BOB
                     WHEN T0.U_GC_COD_BOB IS NULL THEN T0.U_GC_LOTEPROV
                     ELSE T0.U_GC_LOTEPROV || '-' || T0.U_GC_COD_BOB
                  END
               ) AS LOTEPROV,
               T0.U_GC_RECICLADO AS RECICLADO,
               (CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                     WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
               END) AS STOCK_KG,
               T0."U_GC_COD_IMPORT" AS DAE
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
               AND T1."Quantity" > 0
               AND T2."ItmsGrpCod" = '101'
               ${bod !== '' ? `AND (
                  CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                     WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
                  END
                  ) IN (${bod})` : ''}
               ${cod !== '' ? `AND T0."ItemCode" = '${cod}'` : ''}
               ${prov ? `AND TO_NVARCHAR(T0."Notes") ${prov === '\'\'' ? 'IS NULL' : `IN (${prov})`}` : ''}
            ORDER BY
               T0."U_GC_GRAMAJE" ASC`
}

queryQBobinas.saveItmBobinas = (
   ID,
   CODIGO,
   LOTE,
   ALMACEN,
   GRAMAJE,
   ANCHO,
   STOCK,
   FECHA
) => {
   return ` INSERT INTO "${process.env.HANA_DB_COPLAIM}"."QBOB" (
               "IDBOB",
               "ITEMCODE",
               "LOTE",
               "ALMACEN",
               "GRAMAJE",
               "ANCHO",
               "STOCK",
               "FECHA",
               "CREATED_AT",
               "UPDATED_AT"
            ) VALUES (
               '${ID}',
               '${CODIGO}',
               '${LOTE}',
               '${ALMACEN}',
               ${GRAMAJE},
               ${ANCHO},
               ${STOCK},
               '${FECHA}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQBobinas.getAllItmBobinas = (ID) => {
   return ` SELECT
               T0.*,
               T1.DAI
            FROM
               ${process.env.HANA_DB_COPLAIM}."QBOB" T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.ADANA T1 ON
                  T0.LOTE = T1.LOTE
                  AND T0.ITEMCODE = T1.TIPO
            ${ID ? `WHERE T0."IDBOB" = '${ID}'` : ''}`
}

queryQBobinas.getGroupItmBobinas = (ID) => {
   return ` SELECT
               T0.ITEMCODE,
               T0.GRAMAJE,
               T0.ANCHO,
               T0.ALMACEN,
               T1.DAI,
               SUM(T0.STOCK) AS KG
            FROM
               ${process.env.HANA_DB_COPLAIM}.QBOB T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.ADANA T1 ON
                  T0.LOTE = T1.LOTE
                  AND T0.ITEMCODE = T1.TIPO
            ${ID ? `WHERE "IDBOB" = '${ID}'` : ''}
            GROUP BY
               T0.ITEMCODE,
               T0.GRAMAJE,
               T0.ANCHO,
               T0.ALMACEN,
               T1.DAI`
}

queryQBobinas.getStockLaminas = ({ alm = '', art = '' }) => {
   return ` SELECT DISTINCT
               T0."ItemCode" AS CODIGO,
               TO_NVARCHAR(T0."Notes") AS PROVEEDOR,
               T2."ItemName" AS ARTICULO,
               T0."DistNumber" AS LOTE,
               T0."InDate" AS FECHA,
               T2.U_EXX_LARGO AS LARGO,
               T2.U_EXX_ANCHO AS ANCHO,
               T9."Name" AS TEST,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN t4."WhsCode"
               END AS ALMACEN,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END AS UBICACION,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                  WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
               END AS STOCK
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
            LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T9 ON
               T9."Code" = T2.U_GC_TEST
            WHERE
               (
                  CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                     WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
                  END
               ) > 0
               AND T1."Quantity" > 0
               AND T2."ItmsGrpCod" IN ('102', '124')
               ${alm !== '' ? `AND (
                     CASE
                        WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                        WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
                     END
                  ) IN (${alm})` : ''}
               ${art !== '' ? `AND T0."ItemCode" LIKE '${art}%'` : ''}
            ORDER BY
               T0."ItemCode"`
}

queryQBobinas.searchBobADUANA = ({
   LOTE = '',
   date = '',
   cod = '',
   prov = '',
   std = ''
}) => {
   return ` SELECT
               ID_ADANA,
               DESCRIPCION,
               TIP_PAPEL,
               TIPO,
               LOTE,
               PESO,
               GRAMAJE,
               ANCHO,
               PROVEEDOR,
               ALMACEN,
               FECHA,
               CM,
               STATUS,
               DAI
            FROM ${process.env.HANA_DB_COPLAIM}.ADANA
               ${LOTE || date || cod || prov || std ? 'WHERE' : ''}
               ${LOTE !== '' ? `LOTE = '${LOTE}'` : ''}
               ${LOTE && date ? 'AND' : ''}
               ${date !== '' ? `FECHA = '${date}'` : ''}
               ${date && cod ? 'AND' : ''}
               ${cod !== '' ? `TIPO = '${cod}'` : ''}
               ${(date || cod) && prov ? 'AND' : ''}
               ${prov !== '' ? `PROVEEDOR = '${prov}'` : ''}
               ${(date || cod || prov) && std ? 'AND' : ''}
               ${std !== '' ? `STATUS = '${std}'` : ''}`
}

queryQBobinas.getInfoBobinas = ({ LOTE = '' }) => {
   return ` SELECT DISTINCT
               T0."DistNumber" AS LOTE,
               T0."InDate" AS FECHA,
               T2."FrgnName" AS DESCRIPCION,
               TO_NVARCHAR(T0."Notes") AS PROVEEDOR,
               T0."ItemCode" AS CODIGO,
               T0."U_GC_GRAMAJE" AS GRAMAJE,
               T0."U_GC_ANCHO" AS ANCHO,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN t4."WhsCode"
               END AS Almacen,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END AS Ubicacion,
               (CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                  WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
               END) AS PESO,
               --T0.U_GC_LOTEPROV || '-' || T0.U_GC_COD_BOB
               (
                  CASE
                     WHEN T0.U_GC_LOTEPROV IS NULL THEN T0.U_GC_COD_BOB
                     WHEN T0.U_GC_COD_BOB IS NULL THEN T0.U_GC_LOTEPROV
                     ELSE T0.U_GC_LOTEPROV || '-' || T0.U_GC_COD_BOB
                  END
               ) AS LOTEPROV,
                T0.U_GC_RECICLADO AS RECICLADO,
                T0."U_U_FSC_DeclInsumo" AS FSC
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
               AND T1."Quantity" > 0
               AND T2."ItmsGrpCod" = '101'
               AND T0."DistNumber" = '${LOTE}'
            ORDER BY
               T0."U_GC_GRAMAJE" ASC`
}

queryQBobinas.getAllInfoBobinas = (LOTE) => {
   return ` SELECT DISTINCT
               T0."DistNumber" AS LOTE,
               T0."InDate" AS FECHA,
               T2."FrgnName" AS DESCRIPCION,
               TO_NVARCHAR(T0."Notes") AS PROVEEDOR,
               T0."ItemCode" AS CODIGO,
               T0."U_GC_GRAMAJE" AS GRAMAJE,
               T0."U_GC_ANCHO" AS ANCHO,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN t4."WhsCode"
               END AS Almacen,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END AS Ubicacion,
               (CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                  WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
               END) AS PESO,
               --T0.U_GC_LOTEPROV || '-' || T0.U_GC_COD_BOB
               (
                  CASE
                     WHEN T0.U_GC_LOTEPROV IS NULL THEN T0.U_GC_COD_BOB
                     WHEN T0.U_GC_COD_BOB IS NULL THEN T0.U_GC_LOTEPROV
                     ELSE T0.U_GC_LOTEPROV || '-' || T0.U_GC_COD_BOB
                  END
               ) AS LOTEPROV,
                T0.U_GC_RECICLADO AS RECICLADO,
                T0."U_U_FSC_DeclInsumo" AS FSC
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
               AND T1."Quantity" > 0
               AND T2."ItmsGrpCod" = '101'
               AND T0."ItemCode" || ' - ' || T0."DistNumber" IN ('${LOTE}')
            ORDER BY
               T0."DistNumber" ASC`
}

queryQBobinas.getStockBobinasDays = ({
   START = '',
   END = '',
   NUM_MONTH = 1,
   START_ONE = '',
   END_ONE = '',
   START_TWO = '',
   END_TWO = '',
   START_THREE = '',
   END_THREE = '',
   START_ACTUAL = '',
   END_ACTUAL = '',
   bod = '',
   cod = ''
}) => {
   return ` SELECT DISTINCT
               T0."ItemCode" AS Codigo,
               SUM(
                  --T0."ItemCode"
                  CASE
                     WHEN T1."Quantity" > 0 THEN 1
                     ELSE 0
                  END
               ) AS Cantidad,
               AVG(T2."AvgPrice" * 1000) AS Precio,
               /*CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
               END AS Almacen,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END AS Ubicacion,*/
               (
                  SUM(CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."Quantity"
                     WHEN T8."BinActivat" = 'Y' THEN T3."OnHandQty"
                  END) / 1000
               ) AS Stock,
               T0."U_GC_GRAMAJE",
               T0."U_GC_ANCHO",
               COALESCE((
                  SELECT
                     SUM(COALESCE(T10."CantConsumo", 0)) AS CANTIDAD
                  FROM
                     ${process.env.HANA_DB_DATOS}.GC_CONSPAPELSAP T10
                  WHERE
                     T10."TipoPapel" = T0."ItemCode"
                     AND T10."Gramaje" = T0."U_GC_GRAMAJE"
                     AND T10."Ancho" = T0."U_GC_ANCHO"
                     AND T10."FechaCierre" BETWEEN '${START_ONE}' AND '${END_ONE}'
               ), 0) AS ConsumoOne,
               COALESCE((
                  SELECT
                     SUM(COALESCE(T10."CantConsumo", 0)) AS CANTIDAD
                  FROM
                     ${process.env.HANA_DB_DATOS}.GC_CONSPAPELSAP T10
                  WHERE
                     T10."TipoPapel" = T0."ItemCode"
                     AND T10."Gramaje" = T0."U_GC_GRAMAJE"
                     AND T10."Ancho" = T0."U_GC_ANCHO"
                     AND T10."FechaCierre" BETWEEN '${START_TWO}' AND '${END_TWO}'
               ), 0) AS ConsumoTwo,
               COALESCE((
                  SELECT
                     SUM(COALESCE(T10."CantConsumo", 0)) AS CANTIDAD
                  FROM
                     ${process.env.HANA_DB_DATOS}.GC_CONSPAPELSAP T10
                  WHERE
                     T10."TipoPapel" = T0."ItemCode"
                     AND T10."Gramaje" = T0."U_GC_GRAMAJE"
                     AND T10."Ancho" = T0."U_GC_ANCHO"
                     AND T10."FechaCierre" BETWEEN '${START_THREE}' AND '${END_THREE}'
               ), 0) AS ConsumoThree,
               COALESCE((
                  SELECT
                     SUM(COALESCE(T10."CantConsumo", 0)) AS CANTIDAD
                  FROM
                     ${process.env.HANA_DB_DATOS}.GC_CONSPAPELSAP T10
                  WHERE
                     T10."TipoPapel" = T0."ItemCode"
                     AND T10."Gramaje" = T0."U_GC_GRAMAJE"
                     AND T10."Ancho" = T0."U_GC_ANCHO"
                     AND T10."FechaCierre" BETWEEN '${START_ACTUAL}' AND '${END_ACTUAL}'
               ), 0) AS ConsumoActual,
               COALESCE((
                  SELECT
                     SUM(COALESCE(T10."CantConsumo", 0) / ${NUM_MONTH}) AS CANTIDAD
                  FROM
                     ${process.env.HANA_DB_DATOS}.GC_CONSPAPELSAP T10
                  WHERE
                     T10."TipoPapel" = T0."ItemCode"
                     AND T10."Gramaje" = T0."U_GC_GRAMAJE"
                     AND T10."Ancho" = T0."U_GC_ANCHO"
                     AND T10."FechaCierre" BETWEEN '${START}' AND '${END}'
               ), 0) AS ConsumoProm,
               AVG(DAYS_BETWEEN(T0."InDate", CURRENT_DATE)) AS PromDias
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
               ) >= 0 AND
               T1."Quantity" >= 0 AND
               T2."ItmsGrpCod" = '101'
               ${bod !== '' ? `AND (
                  CASE
                     WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                     WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
                  END
                  ) IN (${bod})` : ''}
               ${cod !== '' ? `AND T0."ItemCode" = '${cod}'` : ''}
            GROUP BY
               T0."ItemCode",
               T2."ItemName",
               /*CASE
                  WHEN T8."BinActivat" = 'N' THEN T1."WhsCode"
                  WHEN T8."BinActivat" = 'Y' THEN T4."WhsCode"
               END,
               CASE
                  WHEN T8."BinActivat" = 'N' THEN ''
                  WHEN T8."BinActivat" = 'Y' THEN T4."BinCode"
               END,*/
               T0."U_GC_GRAMAJE",
               T0."U_GC_ANCHO"
            ORDER BY
               T0."ItemCode" ASC`
}

module.exports = queryQBobinas
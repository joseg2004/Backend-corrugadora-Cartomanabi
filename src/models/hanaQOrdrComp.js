const hanaQOrdrComp = {}

hanaQOrdrComp.searchListProveedores = () => {
   return ` SELECT
               T0."CardCode" AS RUC,
               T0."CardName" AS CLIENTE,
               T0."GroupNum" AS PAYMENT,
               T0."BillToDef" AS DIRECCION
            FROM
               ${process.env.HANA_DATABASE}.OCRD T0
            WHERE
               T0."CardType" = 'S'
               AND T0."GroupCode" IN (101, 112)
            ORDER BY T0."CardName"`
}

hanaQOrdrComp.searchListProvRepuestos = () => {
   return ` SELECT
               T0."CardCode" AS RUC,
               T0."CardName" AS CLIENTE,
               T0."GroupNum" AS PAYMENT,
               T0."BillToDef" AS DIRECCION
            FROM
               ${process.env.HANA_DATABASE}.OCRD T0
            WHERE
               T0."CardType" = 'S'
               AND T0."GroupCode" = 112
            ORDER BY T0."CardName"`
}

hanaQOrdrComp.searchListPayments = () => {
   return ` SELECT
               T0."GroupNum" AS ID_PAYMENT,
               T0."PymntGroup" AS PAYMENTS,
               T0."ExtraDays" AS EXTRA_DAYS
            FROM
               ${process.env.HANA_DATABASE}.OCTG T0
            WHERE
               T0."PymntGroup" LIKE 'PR%'`
}

hanaQOrdrComp.searchListItm = () => {
   return ` SELECT
               T0."ItemCode" AS ITM_CODE,
               T0."FrgnName" AS DESCRIPTION,
               SUM(
                  COALESCE(T1.TM, 0)
               ) AS TM
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
               LEFT JOIN ${process.env.HANA_DB_DATOS}.GCDASHPAP T1 ON
                  T0."ItemCode" = T1.CODE_PT
            WHERE
               T0."ItmsGrpCod" = 101
               AND T0."validFor" = 'Y'
            GROUP BY
               T0."ItemCode",
               T0."FrgnName"`
}

hanaQOrdrComp.searchListItmRep = () => {
   return ` SELECT
               T0."ItemCode" AS ITM_CODE,
               T0."ItemName" AS DESCRIPTION
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            WHERE
               (
                  T0."ItemType" = 'F'
                  OR T0."ItmsGrpCod" = 120
               )
               AND T0."validFor" = 'Y'
            UNION
            SELECT
               T0."ItemCode" AS ITM_CODE,
               T0."ItemName" AS DESCRIPTION
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            WHERE
               --T0."ItemCode" IN ('INS00006', 'INS00008', 'SAV0002190')
               T0."QryGroup64" = 'Y'
               AND T0."validFor" = 'Y'`
}

hanaQOrdrComp.searchOrdcComp = (ID) => {
   return ` SELECT
               T0.ID_ORDC AS ID_ORDC,
               T0."DocEntry" AS DOC_ENTRY,
               T0."DocNum" AS DOC_NUM,
               T0."USER" AS USUARIO,
               T0.ESTADO AS ESTADO,
               T0.TIPO_DOC AS TIPO_DOC,
               T0.CREATED_AT AS CREADO,
               T0.UPDATED_AT AS ACTUALIZADO,
               T2."CardName" AS PROVEDOR,
               T3."Name" AS ORIGEN,
               (
                  SELECT
                     SUM(T10."Quantity")
                  FROM
                     ${process.env.HANA_DATABASE}.POR1 T10
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T11 ON
                        T10."ItemCode" = T11."ItemCode"
                  WHERE
                     T10."DocEntry" = T0."DocEntry"
                     AND T11."ItmsGrpCod" = 101
               ) / 1000 AS TM
            FROM
               ${process.env.HANA_DB_COPLAIM}.ORDC T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OPOR T1 ON
                  T0."DocEntry" = T1."DocEntry"
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T2 ON
                  T1."CardCode" = T2."CardCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRY T3 ON
                  T2."Country" = T3."Code"
            ${ID !== '' ? `WHERE T0.TIPO_DOC = ${ID}` : ''}
            ORDER BY T0.CREATED_AT DESC`
}

hanaQOrdrComp.saveOrdcComp = ({
   DOC_ENTRY = '',
   DOC_NUM = '',
   USER = '',
   ESTADO = 'R',
   TIPO_DOC = '3O'
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.ORDC (
               "DocEntry",
               "DocNum",
               "USER",
               ESTADO,
               TIPO_DOC,
               CREATED_AT,
               UPDATED_AT
            ) VALUES(
               ${DOC_ENTRY},
               ${DOC_NUM},
               '${USER}',
               '${ESTADO}',
               ${TIPO_DOC},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

hanaQOrdrComp.searchDirSocio = ({ RUC = '' }) => {
   return ` SELECT
               T1."CardCode" AS COD_CLI,
               T1."Address" AS PRINCIPAL,
               T1."Street" AS DIRECCION
            FROM
               ${process.env.HANA_DATABASE}.OCRD T0
               LEFT JOIN ${process.env.HANA_DATABASE}.CRD1 T1 ON
                  T0."CardCode" = T1."CardCode"
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CPROV T2 ON
                  T1."State" = TO_NVARCHAR(T2.CODE_SAP)
            WHERE
               T1."AdresType" = 'B'
               AND T0."CardCode" = '${RUC}'`
}

hanaQOrdrComp.searchSocioDet = ({ RUC = '' }) => {
   return ` SELECT
               T0."CardCode" AS COD_PROV,
               T0."CardName" AS PROVEDOR,
               T0."Phone1" AS PHONE2,
               T2."Name" AS ORIGEN,
               T0."Address" AS DIRECCION,
               T0."CntctPrsn" AS M_CONT,
               T1."FirstName" || ' ' || T1."LastName" AS CONTACT,
               T1."Tel1" AS PHONE1,
               T1."E_MailL" AS EMAIL1
            FROM ${process.env.HANA_DATABASE}.OCRD T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OCPR T1 ON
                  T0."CardCode" = T1."CardCode"
                  AND T1."Name" LIKE 'COMPRAS%'
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRY T2 ON
                  T0."Country" = T2."Code"
            ${RUC !== '' ? `WHERE T0."CardCode" = '${RUC}'` : ''}`
}

hanaQOrdrComp.searchItmOrders = ({ ENTRY = '', NUM = '', TIPO = 30 }) => {
   const isCotizacion = TIPO === 32
   const isPapel = TIPO === 30

   const T0 = isCotizacion
      ? `${process.env.HANA_DATABASE}.OPQT`  // Cabecera cotización compra
      : `${process.env.HANA_DATABASE}.OPOR`  // Cabecera OC

   const T1 = isCotizacion
      ? `${process.env.HANA_DATABASE}.PQT1`  // Líneas cotización compra
      : `${process.env.HANA_DATABASE}.POR1`  // Líneas OC

   return ` SELECT
              T0."DocEntry" AS DOC_ENTRY,
              T0."DocNum" AS DOC_NUM,
              T0."CardCode" AS COD_PROV,
              T0."DocDate" AS FECHA_ARR,
              T1."ItemCode" AS CODE_PT,
              ${isPapel ? 'T2."FrgnName" AS DESCRIPTION,' : 'T2."ItemName" AS DESCRIPTION,'}
              T1."Text" AS DETALLE,
              T1."ShipDate" AS FECHA,
              T1."Quantity" AS CANTIDAD,
              T1."Price" AS PRICE,
              T1."VatGroup" AS IVA,
              T1.U_GC_GRAM AS GRAMAJE,
              T1.U_GC_ANCHO AS ANCHO,
              T1."LineStatus" AS STATUS,
              T0.U_GC_ORIGEN AS APP,
              T3."PymntGroup" AS FORM_PAY,
              T0."VatSum" AS IVA12,
              T0."DocTotal" AS TOTAL,
              T0.U_GC_DESTINO AS MONEY,
              T0."Comments" AS COMMENTS,
              T4.TIPO_DOC AS TIPO_DOC,
              T1.U_GC_SOLICITANTE AS FSC
           FROM
              ${T0} T0
              LEFT JOIN ${T1} T1
                ON T0."DocEntry" = T1."DocEntry"
              LEFT JOIN ${process.env.HANA_DATABASE}.OITM T2
                ON T1."ItemCode" = T2."ItemCode"
              LEFT JOIN ${process.env.HANA_DATABASE}.OCTG T3
                ON T0."GroupNum" = T3."GroupNum"
              LEFT JOIN ${process.env.HANA_DB_COPLAIM}.ORDC T4
                ON T0."DocEntry" = T4."DocEntry"
               AND T0."DocNum" = T4."DocNum"
           WHERE
              ${isPapel ? 'T2."ItmsGrpCod" = 101 AND' : ''}
              T0."CANCELED" = 'N'
              ${ENTRY !== '' ? `AND T0."DocEntry" = ${ENTRY}` : ''}
              ${NUM !== '' ? `AND T0."DocNum" = ${NUM}` : ''}`
}

hanaQOrdrComp.searchWeekPaper = () => {
   return ` SELECT
               T0."CardName" AS PROVEEDOR,
               T1."ItemCode" AS CODE_PT,
               WEEK(T1."ShipDate") AS WEEK,
               YEAR(T1."ShipDate") AS YEAR,
               COALESCE(T1.U_GC_GRAM, 0) AS GRAMAJE,
               COALESCE(T1.U_GC_ANCHO, 0) AS ANCHO,
               CASE
                  T1."VatGroup" WHEN 'IVA' THEN 'LOCAL'
                  ELSE 'IMPORTACION'
               END AS TIPO,
               SUM(T1."OpenQty") / 1000 AS TM
            FROM
               ${process.env.HANA_DATABASE}.OPOR T0
               LEFT JOIN ${process.env.HANA_DATABASE}.POR1 T1 ON
                  T0."DocEntry" = T1."DocEntry"
                  AND T1."LineStatus" = 'O'
               LEFT JOIN ${process.env.HANA_DATABASE}.OITM T2 ON
                  T1."ItemCode" = T2."ItemCode"
            WHERE
               T2."ItmsGrpCod" = 101
               AND T0.CANCELED = 'N'
               AND T0."DocStatus" = 'O'
            GROUP BY
               T0."CardName",
               T1."ItemCode",
               T1.U_GC_GRAM,
               T1.U_GC_ANCHO,
               WEEK(T1."ShipDate"),
               YEAR(T1."ShipDate"),
               T1."VatGroup"
            ORDER BY
               YEAR(T1."ShipDate") ASC,
               WEEK(T1."ShipDate") ASC`
}

module.exports = hanaQOrdrComp
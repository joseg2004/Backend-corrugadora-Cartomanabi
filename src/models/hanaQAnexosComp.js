const queryQAnexComp = {}

queryQAnexComp.searchAnexos = ({ MONTH = '', YEAR = '' }) => {
   return ` SELECT DISTINCT
               T0."DocSAP",
               T0."Factura",
               T0."Ruc",
               T0."CodCliente" AS "CodCliente",
               T0."Cliente",
               T0.AUTORIZACION AS "Autorizacion",
               T0."FechaFactura",
               T1."Factura" AS "NotaCredito",
               (
                  SELECT SUM(T10."Cantidad")
                  FROM ${process.env.HANA_DATABASE}.GCVENTAS0 T10
                  WHERE
                     T10."Factura" = T0."Factura"
               ) AS "CantidadFact",
               (
                  SELECT SUM(T10."Cantidad")
                  FROM ${process.env.HANA_DATABASE}.GCVENTAS0 T10
                  WHERE
                     T0."Factura" = T10."FacturaRel"
                     AND T10."TipoFactura" = 'NotaCredito'
               ) AS "CantidadNotC",
               (
                     SELECT T10.ID_FR21
                     FROM ${process.env.HANA_DB_COPLAIM}.CAFR21 T10
                     WHERE T10."ntfc_no" = T0."Factura"
               ) AS "AnexoGen",
               (
                  SELECT T11.ID_AUTH
                  FROM ${process.env.HANA_DB_COPLAIM}.CAFR21 T10
                     LEFT JOIN ${process.env.HANA_DB_COPLAIM}.FR21 T11 ON
                        T10.ID_FR21 = T11.ID_FR21
                  WHERE T10."ntfc_no" = T0."Factura"
               ) AS "AuthAnexo",
               (
                  SELECT T11.ESTADO
                  FROM ${process.env.HANA_DB_COPLAIM}.CAFR21 T10
                     LEFT JOIN ${process.env.HANA_DB_COPLAIM}.FR21 T11 ON
                        T10.ID_FR21 = T11.ID_FR21
                  WHERE T10."ntfc_no" = T0."Factura"
               ) AS "AuthAnexoStd",
               T3.COD_USER AS "UserVendedor",
               T3.NAME AS "Vendedor",
               T3.PHONE_USER AS "Telefono",
               T3.MAIL_USER AS "Email"
            FROM
               (
                  SELECT
                     G0."DocSAP",
                     G0."Factura",
                     G0."TipoFactura",
                     G0."Ruc",
                     G0."CodCliente",
                     G0."Cliente",
                     G0.AUTORIZACION,
                     G0."FechaFactura"
                  FROM
                     ${process.env.HANA_DATABASE}.GCVENTAS0 G0
                  GROUP BY
                     G0."DocSAP",
                     G0."Factura",
                     G0."TipoFactura",
                     G0."Ruc",
                     G0."CodCliente",
                     G0."Cliente",
                     G0.AUTORIZACION,
                     G0."FechaFactura"
               ) T0
               LEFT JOIN (
                  SELECT
                     G0."DocSAP",
                     G0."Factura",
                     G0."FacturaRel",
                     G0."TipoFactura"
                  FROM
                     ${process.env.HANA_DATABASE}.GCVENTAS0 G0
                  GROUP BY
                     G0."DocSAP",
                     G0."Factura",
                     G0."FacturaRel",
                     G0."TipoFactura"
               ) T1 ON
                  T0."Factura" = T1."FacturaRel"
                  AND T1."TipoFactura" = 'NotaCredito'
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T2 ON
                  T0."CodCliente" = T2."CardCode"
               LEFT JOIN ${process.env.HANA_DB_DATOS}.GCUSERCM T3 ON
                  T2."SlpCode" = T3.ID_USER
            WHERE
               YEAR(T0."FechaFactura") >= 2022
               AND T0."TipoFactura" IN ('Factura', 'Factura Reserva')
               ${YEAR > 0 ? `AND YEAR(T0."FechaFactura") = ${YEAR}` : ''}
               ${MONTH !== '' ? `AND MONTH(T0."FechaFactura") = ${MONTH}` : ''}
            GROUP BY
               T0."DocSAP",
               T0."Factura",
               T0."Ruc",
               T0."CodCliente",
               T0."Cliente",
               T0.AUTORIZACION,
               T0."FechaFactura",
               T1."Factura",
               T3.COD_USER,
               T3.NAME,
               T3.PHONE_USER,
               T3.MAIL_USER
            ORDER BY
               T0."FechaFactura" ASC,
               T0."DocSAP" ASC`
}

queryQAnexComp.searchFactura = ({ FACT = '' }) => {
   return ` SELECT
               T0."DocSAP",
               T0."Factura",
               T0."CodProducto",
               T0."Descripcion",
               T0."Cantidad",
               ${process.env.HANA_DB_COPLAIM}.GC_DECIMAL(T0.KRAFT) AS KRAFT,
               ${process.env.HANA_DB_COPLAIM}.GC_DECIMAL(T0.MEDIUM) AS MEDIUM,
               ${process.env.HANA_DB_COPLAIM}.GC_DECIMAL(T0.WHITE) AS WHITE,
               T0."TipoFactura"
            FROM
               (
                  SELECT
                     G0."DocSAP",
                     G0."Factura",
                     G0."CodProducto",
                     G0."Descripcion",
                     G0."Cantidad",
                     AVG(G0.KRAFT) AS KRAFT,
                     AVG(G0.MEDIUM) AS MEDIUM,
                     AVG(G0.WHITE) AS WHITE,
                     G0."TipoFactura",
                     G0."FacturaRel"
                  FROM
                     ${process.env.HANA_DATABASE}.GCVENTAS0 G0
                  GROUP BY
                     G0."DocSAP",
                     G0."Factura",
                     G0."CodProducto",
                     G0."Descripcion",
                     G0."Cantidad",
                     G0."TipoFactura",
                     G0."FacturaRel"
               ) T0
            WHERE
               T0."Factura" = '${FACT}'
               OR T0."FacturaRel" = '${FACT}'`
}

queryQAnexComp.searchFactOri = ({ DOC = '' }) => {
   return ` SELECT
               T0."DocEntry" AS "DocEntry",
               T0."DocNum" AS "DocSAP",
               T1."ItemCode" AS "CodProducto",
               T1."Dscription" AS "Descripcion",
               T1."Quantity" AS "Cantidad",
               T0."DocDate" AS "FechaFactura"
            FROM
               ${process.env.HANA_DATABASE}.OINV T0
               LEFT JOIN ${process.env.HANA_DATABASE}.INV1 T1 ON
                  T0."DocEntry" = T1."DocEntry"
            WHERE
               T0."DocNum" = '${DOC}'`
}

queryQAnexComp.searchFact21 = ({ ID_FR21 = '', ID_AUTH = '', STD = '', MAX = false }) => {
   return ` SELECT
               ${!MAX ? `DISTINCT T0.*,
                  T4.COD_USER,
                  UPPER(T4.NAME) AS NAME_USER,
                  ${process.env.HANA_DB_DATOS}.CLEANING_PHONE(T4.PHONE_USER) AS PHONE_USER,
                  LOWER(T4.MAIL_USER) AS MAIL_USER,
                  CASE
                     WHEN T3."VatIdUnCmp" IS NULL THEN T3."CardName"
                     ELSE T3."VatIdUnCmp" || ' - ' || T3."CardName"
                  END AS CONTRATO` : 'MAX(T0.ID_FR21) AS CODE'}
            FROM
               ${process.env.HANA_DB_COPLAIM}.FR21 T0
               ${!MAX ? `LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CAFR21 T1 ON
                              T0.ID_FR21 = T1.ID_FR21
                           LEFT JOIN ${process.env.HANA_DATABASE}.OINV T2 ON
                              T1.DOC_SAP = T2."DocNum"
                           LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T3 ON
                              T2."CardCode" = T3."CardCode"
                           LEFT JOIN ${process.env.HANA_DB_DATOS}.GCUSERCM T4 ON
                              T3."SlpCode" = T4.ID_USER` : ''}
            ${ID_FR21 !== '' || ID_AUTH !== '' || STD !== '' ? 'WHERE' : ''}
               ${STD !== '' ? `T0."ESTADO" = '${STD}'` : ''}
               ${STD !== '' && (ID_FR21 !== '' || ID_AUTH !== '') ? 'AND' : ''}
               ${ID_FR21 !== '' ? `T0."ID_FR21" = '${ID_FR21}'` : ''}
               ${ID_FR21 !== '' && ID_AUTH !== '' ? 'AND' : ''}
               ${ID_AUTH !== '' ? `T0."ID_AUTH" = '${ID_AUTH}'` : ''}
            ${!MAX ? 'ORDER BY T0.ID_FR21 DESC' : ''}`
}

queryQAnexComp.saveFact21 = ({
   ID_FR21 = '',
   ID_AUTH = '',
   COMENTARIO = '',
   ESTADO = 'I',
   USER = '',
   FECHA1 = '',
   FECHA2 = '',
   SALDO = ''
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.FR21 (
               ID_FR21,
               ID_AUTH,
               COMENTARIO,
               ESTADO,
               FECHA1,
               FECHA2,
               SALDO,
               USER,
               CREATED_AT,
               UPDATED_AT
            ) VALUES(
               '${ID_FR21}',
               '${ID_AUTH}',
               '${COMENTARIO}',
               '${ESTADO}',
               '${FECHA1}',
               '${FECHA2}',
               '${SALDO}',
               '${USER}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQAnexComp.updateFact21 = ({
   ID_FR21 = '',
   ID_AUTH = '',
   COMENTARIO = '',
   ESTADO = 'I',
   USER = '',
   FECHA1 = '',
   FECHA2 = '',
   SALDO = ''
}) => {
   return ` UPDATE ${process.env.HANA_DB_COPLAIM}.FR21
            SET
               ${COMENTARIO !== '' ? `COMENTARIO = '${COMENTARIO}',` : ''}
               ${FECHA1 !== '' ? `FECHA1 = '${FECHA1}',` : ''}
               ${FECHA2 !== '' ? `FECHA2 = '${FECHA2}',` : ''}
               ${SALDO !== '' ? `SALDO = '${SALDO}',` : ''}
               ${ESTADO !== '' ? `ESTADO = '${ESTADO}',` : ''}
               ${USER !== '' ? `USER = '${USER}',` : ''}
               UPDATED_AT = CURRENT_TIMESTAMP
            WHERE
               ${ID_FR21 !== '' ? `ID_FR21 = '${ID_FR21}'` : ''}
               ${ID_AUTH !== '' ? `ID_AUTH = '${ID_AUTH}'` : ''}`
}

queryQAnexComp.saveCabFact21 = ({
   ID_FR21 = '',
   DOC_SAP = '',
   FACTURA = '',
   FECHA = ''
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.CAFR21 (
               ID_FR21,
               DOC_SAP,
               "ntfc_no",
               "ntfc_de",
               CREATED_AT,
               UPDATED_AT
            ) VALUES(
               '${ID_FR21}',
               '${DOC_SAP}',
               '${FACTURA}',
               '${FECHA}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQAnexComp.searchCabFact21 = ({ ID_FR21 = '' }) => {
   return ` SELECT
               T2."DocEntry" AS ENTRY_FRT,
               T2."FolioNum" AS FACTURA,
               T1.ID_CAFR21,
               T1.DOC_SAP,
               T1."ntfc_no",
               T1."ntfc_de",
               T2.U_NUM_AUTOR AS AUTORIZACION,
               T1.CREATED_AT
            FROM ${process.env.HANA_DB_COPLAIM}.FR21 T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CAFR21 T1 ON
                  T0.ID_FR21 = T1.ID_FR21
               LEFT JOIN ${process.env.HANA_DATABASE}.OINV T2 ON
                  T1.DOC_SAP = T2."DocNum"
            ${ID_FR21 !== '' ? `WHERE T0.ID_FR21 = '${ID_FR21}'` : ''}`
}

queryQAnexComp.searchListProdFact21 = ({ ID_FR21 = '' }) => {
   return ` SELECT
               T0."CodProducto",
               T0."Descripcion",
               CAST(SUM(T0."Cantidad") AS DOUBLE PRECISION) AS "Cantidad",
               COALESCE(T2.ANEXO, T1.SUBPARTIDA) AS SUBPARTIDA,
               ROUND(CAST(SUM(T0.KRAFT) AS DOUBLE PRECISION), 4) AS KRAFT,
               ROUND(CAST(SUM(T0.WHITE) AS DOUBLE PRECISION), 4) AS WHITE,
               ROUND(CAST(SUM(T0.MEDIUM) AS DOUBLE PRECISION), 4) AS MEDIUM,
               ROUND(CAST(SUM(T0."AreaLamina") AS DOUBLE PRECISION), 4) AS TOT_AREA,
               ROUND(CAST(SUM(T0."Cantidad") * 0.00215 AS DOUBLE PRECISION), 4) AS CNS_PVA, -- Const => 0.00215
               (
                  SELECT T10.GRAMOS_ALM
                  FROM ${process.env.HANA_DB_COPLAIM}.CFALM T10
                  WHERE T10.ID_CFALM = (
                        SELECT MAX(T20.ID_CFALM)
                        FROM ${process.env.HANA_DB_COPLAIM}.CFALM T20
                  )
               ) AS GR_ALM,
               T0."Flauta" AS FLAUTA
            FROM
               (
                  SELECT
                     G0."DocSAP",
                     G0."Factura",
                     G0."CodProducto",
                     G0."Descripcion",
                     G0."TipoCaja",
                     G0."Cantidad",
                     AVG(G0.KRAFT) AS KRAFT,
                     AVG(G0.MEDIUM) AS MEDIUM,
                     AVG(G0.WHITE) AS WHITE,
                     G0."TipoFactura",
                     G0."FacturaRel",
                     G0."CodCliente",
                     G0."Flauta",
                     AVG(G0."AreaLamina") AS "AreaLamina"
                  FROM
                     ${process.env.HANA_DATABASE}.GCVENTAS0 G0
                  GROUP BY
                     G0."DocSAP",
                     G0."Factura",
                     G0."CodProducto",
                     G0."Descripcion",
                     G0."TipoCaja",
                     G0."Cantidad",
                     G0."TipoFactura",
                     G0."FacturaRel",
                     G0."CodCliente",
                     G0."Flauta"
               ) T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.SPRTD T1 ON
                  UCASE(T0."TipoCaja") = T1.DESCRIPCION
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CFFR21 T2 ON
                  T0."CodCliente" = T2.COD_CLI
                  AND T2.STATUS = 'Y'
            WHERE
               T0."Factura" = '${ID_FR21}'
               OR T0."FacturaRel" = '${ID_FR21}'
            GROUP BY
               T0."CodProducto",
               T0."Descripcion",
               -- T0."Cantidad",
               COALESCE(T2.ANEXO, T1.SUBPARTIDA),
               T0."Flauta"`
}

queryQAnexComp.saveProdFact21 = ({
   ID_FR21 = '',
   FACTURA = '',
   SUBPARTIDA = '',
   CODE_PT = '',
   DESCRIPCION = '',
   U_MEDIDA = 'U',
   CANTIDAD = 0,
   GR_ALM = 0,
   FLAUTA = '',
   INDICE = 0
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.PDFR21 (
               "ID_FR21",
               "ntfc_no",
               SUBPARTIDA,
               CODE_PT,
               DESCRIPCION,
               U_MEDIDA,
               CANTIDAD,
               GR_ALM,
               FLAUTA,
               INDICE,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               '${ID_FR21}',
               '${FACTURA}',
               '${SUBPARTIDA}',
               '${CODE_PT}',
               '${DESCRIPCION}',
               '${U_MEDIDA}',
               ${CANTIDAD},
               ${GR_ALM},
               '${FLAUTA}',
               ${INDICE},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQAnexComp.searchProdFact21 = ({ ID_FR21 = '' }) => {
   return ` SELECT
               T0."ntfc_no",
               T0.SUBPARTIDA,
               T0.CODE_PT,
               T0.DESCRIPCION,
               T0.U_MEDIDA,
               T0.CANTIDAD,
               T0.INDICE,
               T1."ntfc_de" AS FECHA
            FROM
               ${process.env.HANA_DB_COPLAIM}.PDFR21 T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CAFR21 T1 ON
                  T0."ntfc_no" = T1."ntfc_no"
            ${ID_FR21 !== '' ? `WHERE T0."ID_FR21" = '${ID_FR21}'` : ''}`
}

queryQAnexComp.searchDetailsAnexoCli = ({ RUC = '' }) => {
   return ` SELECT
               G0."CodCliente",
               G0."Cliente",
               G0."RUC",
               G0."AnexosPorAceptar",
               G0."FacturasPorAceptar",
               G0."UnidadesPorAceptar",
               G0."AnexosUrgentesAceptar",
               G0."AnexosPorCompensar",
               G0."FacturasPorCompensar",
               G0."UnidadesPorCompensar",
               G0."AnexosUrgentesCompensar",
               G0."TotalAnexosPendientes",
               G0."TotalFacturasPendientes",
               G0."TotalUnidadesPendientes"
            FROM
               ${process.env.HANA_DB_DATOS}."GC_ANXDETCLI" G0
            ${RUC !== '' ? `WHERE G0."CodCliente" = '${RUC}'` : ''}`
}

queryQAnexComp.saveMatPriFact21 = ({
   ID_FR21 = '',
   FACTURA = '',
   ITEM_FACTURA = 0,
   CODE_PT = '',
   DAI = '',
   COD_ADUANA = '',
   DESCRIPCION = '',
   SUBPARTIDA = '',
   U_MEDIDA = 'KG',
   CANTIDAD = 0,
   DESPERDICIO = 0,
   MERMA = 0,
   TOTAL = 0
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.MPFR21 (
               ID_FR21,
               "ntfc_no",
               ITM_FR21,
               CODE_PT,
               DAI,
               COD_ADUANA,
               DESCRIPCION,
               SUBPARTIDA,
               U_MEDIDA,
               CANTIDAD,
               DESPERDICIO,
               MERMA,
               TOTAL,
               CREATED_AT,
               UPDATED_AT
            ) VALUES(
               '${ID_FR21}',
               '${FACTURA}',
               ${ITEM_FACTURA},
               '${CODE_PT}',
               '${DAI}',
               '${COD_ADUANA}',
               '${DESCRIPCION}',
               '${SUBPARTIDA}',
               '${U_MEDIDA}',
               ${CANTIDAD},
               ${DESPERDICIO},
               ${MERMA},
               ${TOTAL},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQAnexComp.searchMatPriFact21 = ({ ID_FR21 = '' }) => {
   return ` SELECT
               T0.ID_FR21,
               T0."ntfc_no",
               T0.ITM_FR21,
               T0.DAI,
               T0.COD_ADUANA,
               T0.DESCRIPCION,
               T0.SUBPARTIDA AS SUBPARTIDA2,
               T0.U_MEDIDA,
               T0.CANTIDAD,
               T0.DESPERDICIO,
               T0.MERMA,
               T0.TOTAL,
               T1.SUBPARTIDA,
               T1.INDICE
            FROM
               ${process.env.HANA_DB_COPLAIM}.MPFR21 T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.PDFR21 T1 ON
                     T0.CODE_PT = T1.CODE_PT
                     AND T0."ntfc_no" = T1."ntfc_no"
                     AND T0.ID_FR21 = T1.ID_FR21
            ${ID_FR21 !== '' ? `WHERE T0."ID_FR21" = '${ID_FR21}'` : ''}`
}

queryQAnexComp.searchStockAduana = ({ TYPE = '' }) => {
   return ` SELECT
               G0.*,
               ROUND(CAST(G0."Saldo" AS DOUBLE PRECISION), 4) - ROUND(CAST(G0."Consumido" AS DOUBLE PRECISION), 4) AS "Disponible"
            FROM
               (
                  SELECT
                     T0."Anexo",
                     T0."CodInsumo",
                     T1.DESCRIPCION,
                     T0."SubPartida2",
                     T0."Saldo",
                     T0."FechaRegimen",
                     (
                        SELECT COALESCE(SUM(T10.TOTAL), 0)
                        FROM ${process.env.HANA_DB_COPLAIM}.MPFR21 T10
                        WHERE
                           T10.DAI = T0."Anexo"
                           AND T10.COD_ADUANA = T0."CodInsumo"
                           AND T10.SUBPARTIDA = T0."SubPartida2"
                     ) + (
                        SELECT COALESCE(SUM(T10.TOTAL), 0)
                        FROM ${process.env.HANA_DB_COPLAIM}.MPFR21BOB T10
                        WHERE
                           T10.DAI = T0."Anexo"
                           AND T10.COD_ADUANA = T0."CodInsumo"
                           AND T10.SUBPARTIDA = T0."SubPartida2"
                     ) AS "Consumido",
                     T0."Unidad" AS U_MEDIDA,
                     ROUND(CAST(T0."UsoGarantia" / T0."Cantidad" AS DOUBLE PRECISION), 4) AS IMP_TM
                  FROM
                     ${process.env.HANA_DB_COPLAIM}.ECUSTK T0
                     LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CFECSTK T1 ON
                        T0."Tipo" = T1.TIPO_ECUSTK
                        AND T1.STATUS IN ('Y')
                  WHERE
                     T0."Tipo" = '${TYPE}'
                  ORDER BY
                     T0."FechaRegimen" ASC
               ) G0
            WHERE
               (ROUND(CAST(G0."Saldo" AS DOUBLE PRECISION), 4) - ROUND(CAST(G0."Consumido" AS DOUBLE PRECISION), 4)) > 0
            -- ORDER BY
            --    G0."IMP_TM" DESC`
}

queryQAnexComp.updateCabFact21 = ({
   ID_FR21 = '',
   ID_AUTH = '',
   COMENTARIO = '',
   FECHA1 = '',
   FECHA2 = '',
   SALDO = '',
   ESTADO = ''
}) => {
   return ` UPDATE ${process.env.HANA_DB_COPLAIM}.FR21
            SET
               ${ID_AUTH !== '' ? `ID_AUTH = '${ID_AUTH}',` : ''}
               ${COMENTARIO !== '' ? `COMENTARIO = '${COMENTARIO}',` : ''}
               ${FECHA1 !== '' ? `FECHA1 = '${FECHA1}',` : ''}
               ${FECHA2 !== '' ? `FECHA2 = '${FECHA2}',` : ''}
               ${SALDO !== '' ? `SALDO = '${SALDO}',` : ''}
               ${ESTADO !== '' ? `ESTADO = '${ESTADO}',` : ''}
               UPDATED_AT = CURRENT_TIMESTAMP
            WHERE ID_FR21 = '${ID_FR21}'`
}

queryQAnexComp.searchBusinesPartners = ({ RUC = '' }) => {
   return ` SELECT
               T0."CardCode" AS RUC,
               T0."CardName" AS CLIENTE,
               T0."VatIdUnCmp" AS CONTRATO,
               T1."SlpName" AS VENDEDOR
               --T0."LicTradNum" AS "Ruc"
            FROM
               ${process.env.HANA_DATABASE}.OCRD T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OSLP T1 ON
                  T0."SlpCode" = T1."SlpCode"
            ${RUC !== '' ? `WHERE T0."LicTradNum" = '${RUC}'` : ''}`
}

queryQAnexComp.searchStockSenae = ({ TIPO = '' }) => {
   return ` SELECT
               T0."FechaRegimen" AS FECHA,
               T0."CodInsumo" AS COD_ADUANA,
               T0."Anexo" AS DAI,
               T0."Tipo" AS TIPO,
               SUM(T0."Saldo" - CASE WHEN T1.CONSUMO IS NULL THEN 0 ELSE T1.CONSUMO END) AS STOCK
            FROM
               ${process.env.HANA_DB_COPLAIM}.ECUSTK T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.GCCONADN T1 ON -- ( MPFR21 / MPFR21BOB )
                  T0."Anexo" = T1.DAI
                  AND T0."CodInsumo" = T1.COD_ADUANA
            ${TIPO !== '' ? `WHERE T0."Tipo" = '${TIPO}'` : ''}
            GROUP BY
               T0."CodInsumo",
               T0."Anexo",
               T0."Tipo",
               T0."FechaRegimen"
            ORDER BY
               T0."FechaRegimen" ASC,
               T0."CodInsumo" ASC`
}

queryQAnexComp.searchAnexosEmail = ({ RUC = '', ANEXO = '', STD = '' }) => {
   return ` SELECT DISTINCT
               (
                  SELECT COUNT(T10.CODE)
                  FROM ${process.env.HANA_DB_COPLAIM}.LOGS T10
                  WHERE
                     T10.CODE = T0.ID_FR21
               ) AS NOTIF,
               T0.ID_FR21,
               T0.ID_AUTH,
               T0.ESTADO,
               T0.COMENTARIO,
               T0.FECHA2,
               CASE WHEN
                  T0.ESTADO = 'G' THEN T0.FECHA2
                  ELSE T0.FECHA1
               END AS FECHA1,
               T3."VatIdUnCmp" AS CONTRATO,
               T3."CardCode" AS RUC,
               T3."CardName" AS CLIENTE,
               CASE WHEN
                  T4."Name" = 'ANEXOC' THEN T4."E_MailL"
                  ELSE T3."E_Mail"
               END AS EMAIL,
               --(60 - DAYS_BETWEEN(T0.FECHA1, CURRENT_DATE)) AS DAYS
               CASE WHEN
                  T0.ESTADO = 'G' THEN (DAYS_BETWEEN(CURRENT_DATE, T0.FECHA2))
                  ELSE (55 - DAYS_BETWEEN(T0.FECHA1, CURRENT_DATE))
               END AS DAYS,
               T7.MAIL_USER AS MAIL_USER,
               T8.MOTIVO,
               T8.CREATED_AT AS ENVIADO,
               T8.STATUS,
               T9.COD_USER AS VENDEDOR_USER,
               T9.NAME AS VENDEDOR_NAME,
               ${process.env.HANA_DB_DATOS}.CLEANING_PHONE(T9.PHONE_USER) AS VENDEDOR_PHONE,
               LOWER(T9.MAIL_USER) AS VENDEDOR_EMAIL
            FROM
               ${process.env.HANA_DB_COPLAIM}.FR21 T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CAFR21 T1 ON
                  T0.ID_FR21 = T1.ID_FR21
               LEFT JOIN ${process.env.HANA_DATABASE}.OINV T2 ON
                  T1.DOC_SAP = T2."DocNum"
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T3 ON
                  T2."CardCode" = T3."CardCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OCPR T4 ON
                  T2."CardCode" = T4."CardCode" AND T4."Name" = 'ANEXOC'
               LEFT JOIN (
                  SELECT
                     S0.*,
                     S1.COD_USER AS USUARIO
                  FROM
                     ${process.env.HANA_DB_COPLAIM}.GCASGMAIL S0
                     LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CFANXO S1 ON
                        S0.COD_USER = S1.COD_USER
                        AND S1.STATUS = 'Y'
               ) T7 ON
                  T3."SlpCode" = T7.ID_USER
                  AND T7.USUARIO IS NULL
               LEFT JOIN (
                  SELECT
                     S0.*,
                     ROW_NUMBER() OVER (
                        PARTITION BY S0.CODE
                        ORDER BY S0.CREATED_AT DESC
                     ) AS ROWNUM
                  FROM
                     ${process.env.HANA_DB_COPLAIM}.LOGS S0
               ) T8 ON
                  T0.ID_FR21 = T8.CODE
                  AND ROWNUM = 1
               LEFT JOIN ${process.env.HANA_DB_DATOS}.GCUSERCM T9 ON
                  T3."SlpCode" = T9.ID_USER
            WHERE
               (
                  T0.ESTADO = 'C'
                  OR T0.ESTADO = 'G'
               )
               ${RUC !== '' ? `AND T3."CardCode" = '${RUC}'` : ''}
               ${ANEXO !== '' ? `AND T0.ID_AUTH = '${ANEXO}'` : ''}
               ${STD !== '' ? `AND T0.ESTADO = '${STD}'` : ''}
            ORDER BY
               DAYS ASC`
}

queryQAnexComp.searchPapFacturas = ({ MONTH = '', YEAR = '', FACT = '' }) => {
   return ` SELECT
               *
            FROM
               (
                  SELECT
                     T0."DocDate" AS FECHA,
                     T0."DocNum" AS DOCNUM_FT,
                     T0.U_SER_EST || '-' || T0.U_SER_PE || '-' || T0."FolioNum" AS FACTURA,
                     T0."FolioNum" AS FT_SRI,
                     T0."CardCode" AS COD_CLI,
                     T3."LicTradNum" AS RUC,
                     T3."CardName" AS CLIENTE,
                     T3."VATRegNum" AS SENAE ,
                     T5.ITM_CODE AS CODE,
                     T1."ItemCode" AS ITM_CODE,
                     T2."ItemName" AS BOBINA,
                     T1."Quantity" AS KG,
                     T1."VatGroup" AS IVA,
                     T1."VatPrcnt" AS PORC_IVA,
                     T4."FolioNum" AS NC,
                     T4."DocEntry" AS ENTRY_NC,
                     T4."DocNum" AS DOCNUM_NC,
                     T6.ID_FR21BOB AS ID_FR21,
                     T6.ID_AUTH AS AUTORIZACION,
                     T6.ESTADO AS ESTADO,
                     T6.COMENTARIO AS COMENTARIO
                  FROM
                     ${process.env.HANA_DATABASE}.OINV T0
                     LEFT JOIN ${process.env.HANA_DATABASE}.INV1 T1 ON
                        T0."DocEntry" = T1."DocEntry"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T2 ON
                        T1."ItemCode" = T2."ItemCode"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T3 ON
                        T0."CardCode" = T3."CardCode"
                     LEFT JOIN ${process.env.HANA_DATABASE}.ORIN T4 ON
                        T0."FolioNum" = T4.U_NUM_FAC_REL
                     LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CFECBOB T5 ON
                        T5.CODE = T2."ItemCode"
                     LEFT JOIN ${process.env.HANA_DB_COPLAIM}.FR21BOB T6 ON
                        T0."DocNum" = T6.ID_FSAP
                  WHERE
                     T2."ItmsGrpCod" = 101
               ) T10
            WHERE
               T10.PORC_IVA = 0
               ${YEAR > 0 ? `AND YEAR(T10.FECHA) = ${YEAR}` : ''}
               ${MONTH !== '' ? `AND MONTH(T10.FECHA) = ${MONTH}` : ''}
               ${FACT !== '' ? `AND T10.DOCNUM_FT = ${FACT}` : ''}`
}

queryQAnexComp.searchFact21Bob = ({ MAX = false }) => {
   return ` SELECT
               T0.ID_FR21BOB AS CODE,
               T0.ID_FSAP AS FSAP,
               T0.ID_AUTH AS ID_AUTH,
               T0.COMENTARIO AS COMENTARIO,
               T0.FECHA1 AS FECHA1,
               T0.FECHA2 AS FECHA2,
               T0.ESTADO AS ESTADO,
               T0."USER" AS USER,
               T0.CREATED_AT AS CREATED_AT,
               T0.UPDATED_AT AS UPDATED_AT
            FROM
               ${process.env.HANA_DB_COPLAIM}.FR21BOB T0
            ${MAX ? 'ORDER BY T0.ID_FR21BOB DESC' : ''}`
}

queryQAnexComp.saveCabFact21Bob = ({
   ID_FR21 = '',
   ID_FSAP = '',
   ID_AUTH = '',
   COMENTARIO = '',
   FECHA1 = '',
   FECHA2 = '',
   ESTADO = 'A',
   USER = '',
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.FR21BOB (
               ID_FR21BOB,
               ID_FSAP,
               ID_AUTH,
               COMENTARIO,
               FECHA1,
               FECHA2,
               ESTADO,
               "USER",
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               '${ID_FR21}',
               ${ID_FSAP},
               '${ID_AUTH}',
               '${COMENTARIO}',
               '${FECHA1}',
               '${FECHA2}',
               '${ESTADO}',
               '${USER}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQAnexComp.updateCabFact21Bob = ({
   ID_FR21 = '',
   ID_AUTH = '',
   COMENTARIO = '',
   FECHA2 = ''
}) => {
   return ` UPDATE ${process.env.HANA_DB_COPLAIM}.FR21BOB
            SET
               ${ID_AUTH !== '' ? `ID_AUTH = '${ID_AUTH}',` : ''}
               ${COMENTARIO !== '' ? `COMENTARIO = '${COMENTARIO}',` : ''}
               ${FECHA2 !== '' ? `FECHA2 = '${FECHA2}',` : ''}
               UPDATED_AT = CURRENT_TIMESTAMP
            WHERE
               ID_FR21BOB = '${ID_FR21}'`
}

queryQAnexComp.saveMatPriFact21Bob = ({
   ID_FR21 = '',
   CODE = '',
   DAI = '',
   COD_ADUANA = '',
   DESCRIPCION = '',
   SUBPARTIDA = '',
   U_MEDIDA = 'KG',
   TOTAL = '',
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.MPFR21BOB (
               ID_FR21BOB,
               CODE_BOB,
               DAI,
               COD_ADUANA,
               DESCRIPCION,
               SUBPARTIDA,
               U_MEDIDA,
               TOTAL,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               '${ID_FR21}',
               '${CODE}',
               '${DAI}',
               '${COD_ADUANA}',
               '${DESCRIPCION}',
               '${SUBPARTIDA}',
               '${U_MEDIDA}',
               ${TOTAL},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQAnexComp.searchMatPriFact21Bob = ({ ID_FR21 = '' }) => {
   return ` SELECT
               T0.ID_MPFR21BOB,
               T0.ID_FR21BOB,
               T0.CODE_BOB,
               T0.DAI,
               T0.COD_ADUANA,
               T0.SUBPARTIDA,
               T0.DESCRIPCION,
               T0.U_MEDIDA,
               T0.TOTAL,
               T0.CREATED_AT,
               T0.UPDATED_AT
            FROM
               ${process.env.HANA_DB_COPLAIM}.MPFR21BOB T0
            WHERE
               T0.ID_FR21BOB = '${ID_FR21}'`
}

queryQAnexComp.searchItemsStockSenae = ({ DAI = '', CODE = '' }) => {
   return ` SELECT
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
               T1.DESCRIPCION
            FROM
               ${process.env.HANA_DB_COPLAIM}.ECUSTK T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CFECSTK T1 ON
                  T0."Tipo" = T1.TIPO_ECUSTK
                  AND T1.STATUS IN ('Y')
            ${DAI !== '' || CODE !== '' ? 'WHERE' : ''}
               ${DAI !== '' ? `T0."Anexo" = '${DAI}'` : ''}
            ${DAI !== '' && CODE !== '' ? 'AND' : ''}
               ${CODE !== '' ? `T0."CodInsumo" = '${CODE}'` : ''}`
}

/**
 * Obtener facturas del cliente por año y mes con sus productos
 * @param {string} RUC - RUC del cliente
 * @param {number} YEAR - Año
 * @param {number} MONTH - Mes
 */
queryQAnexComp.searchFacturasClienteByMonth = ({ RUC = '', YEAR = '', MONTH = '' }) => {
   return ` SELECT DISTINCT
               T0.ID_FR21,
               T0.ID_AUTH,
               T0.ESTADO,
               T0.FECHA1,
               T0.CREATED_AT AS FECHA_CREACION,
               T1."ntfc_no" AS FACTURA,
               T1."ntfc_de" AS FECHA_FACTURA,
               T2."CardCode" AS COD_CLIENTE,
               T2."CardName" AS CLIENTE,
               T3."LicTradNum" AS RUC
            FROM
               ${process.env.HANA_DB_COPLAIM}.FR21 T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CAFR21 T1 ON
                  T0.ID_FR21 = T1.ID_FR21
               LEFT JOIN ${process.env.HANA_DATABASE}.OINV T2 ON
                  T1.DOC_SAP = T2."DocNum"
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T3 ON
                  T2."CardCode" = T3."CardCode"
            WHERE
               T3."CardCode" = '${RUC}'
               ${YEAR !== '' ? `AND YEAR(T1."ntfc_de") = ${YEAR}` : ''}
               ${MONTH !== '' ? `AND MONTH(T1."ntfc_de") = ${MONTH}` : ''}
            ORDER BY
               T1."ntfc_de" DESC,
               T0.ID_FR21 ASC`
}

/**
 * Obtener productos de una factura específica
 * @param {string} FACTURA - Número de factura (ntfc_no)
 */
queryQAnexComp.searchProductosByFactura = ({ FACTURA = '' }) => {
   return ` SELECT
               T0.CODE_PT,
               T0.DESCRIPCION,
               T0.CANTIDAD,
               T0.U_MEDIDA,
               T0.SUBPARTIDA,
               T0.FLAUTA,
               T0.INDICE
            FROM
               ${process.env.HANA_DB_COPLAIM}.PDFR21 T0
            WHERE
               T0."ntfc_no" = '${FACTURA}'
            ORDER BY
               T0.INDICE ASC`
}

module.exports = queryQAnexComp
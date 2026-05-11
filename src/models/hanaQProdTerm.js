const hanaQProdTerm = {}

hanaQProdTerm.getProdTem = () => {
   return ` SELECT DISTINCT
               T0."DocNum" AS DOC_SAP,
               T0."CloseDate" AS FECH_CLOSE,
               T0."DueDate" AS FECH_VENC,
               T0."ItemCode" AS PT_CODE,
               T3."ItemName" AS PROD_NAME,
               T0."PlannedQty" AS PLANNED_QUA,
               T0."CmpltQty" AS COMPLETED_QUA,
               T1."LineNum" AS LINE_NUM,
               T1."ItemCode" AS IMPRENTA,
               CASE
                  T1."ItemCode"
                  WHEN 'IMP.  MACARBOX 1' THEN 1
                  WHEN 'IMP.  MACARBOX 2' THEN 2
                  WHEN 'IMP.  MACARBOX 3' THEN 3
                  WHEN 'MAQ. DE PADS 1' THEN 4
               END AS NUM_IMP
            FROM ${process.env.HANA_DATABASE}.OWOR T0
               INNER JOIN ${process.env.HANA_DATABASE}.WOR1 T1 ON T0."DocEntry" = T1."DocEntry"
               LEFT JOIN ${process.env.HANA_DATABASE}.OITM T3 ON T3."ItemCode" = T0."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OITM T4 ON T1."ItemCode" = T4."ItemCode"
            WHERE T4."ItmsGrpCod" IS NULL
               AND T0."Status" = 'R'
               AND T3."ItmsGrpCod" = 103
            ORDER BY T0."DueDate" ASC`
}

hanaQProdTerm.getExitProdTerm = ({DOC = '', DATE = ''}) => {
   if (DATE !== '') {
      return ` SELECT
                  ID_PLPT,
                  DOCNUM AS DOC_SAP,
                  MAQUINA,
                  TURNO,
                  DATE_PLAN,
                  INICIO,
                  FIN,
                  STATUS,
                  POSITION,
                  (
                     SELECT
                        MAX(T0."ItemCode")
                     FROM ${process.env.HANA_DATABASE}.OWOR T0
                     INNER JOIN ${process.env.HANA_DATABASE}.WOR1 T1 ON T0."DocEntry" = T1."DocEntry"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T3 ON T3."ItemCode" = T0."ItemCode"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T4 ON T1."ItemCode" = T4."ItemCode"
                     WHERE T4."ItmsGrpCod" IS NULL
                        AND T3."ItmsGrpCod" = 103
                        AND T0."DocNum" = DOCNUM
                  ) AS PT_CODE,
                  (
                     SELECT
                        MAX(T3."ItemName")
                     FROM ${process.env.HANA_DATABASE}.OWOR T0
                     INNER JOIN ${process.env.HANA_DATABASE}.WOR1 T1 ON T0."DocEntry" = T1."DocEntry"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T3 ON T3."ItemCode" = T0."ItemCode"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T4 ON T1."ItemCode" = T4."ItemCode"
                     WHERE T4."ItmsGrpCod" IS NULL
                        AND T3."ItmsGrpCod" = 103
                        AND T0."DocNum" = DOCNUM
                  ) AS PROD_NAME,
                  (
                     SELECT
                        MAX(T0."PlannedQty")
                     FROM ${process.env.HANA_DATABASE}.OWOR T0
                     INNER JOIN ${process.env.HANA_DATABASE}.WOR1 T1 ON T0."DocEntry" = T1."DocEntry"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T3 ON T3."ItemCode" = T0."ItemCode"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T4 ON T1."ItemCode" = T4."ItemCode"
                     WHERE T4."ItmsGrpCod" IS NULL
                        AND T3."ItmsGrpCod" = 103
                        AND T0."DocNum" = DOCNUM
                  ) AS PLANNED_QUA,
                  (
                     SELECT
                        MAX(T0."Status")
                     FROM ${process.env.HANA_DATABASE}.OWOR T0
                     INNER JOIN ${process.env.HANA_DATABASE}.WOR1 T1 ON T0."DocEntry" = T1."DocEntry"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T3 ON T3."ItemCode" = T0."ItemCode"
                     LEFT JOIN ${process.env.HANA_DATABASE}.OITM T4 ON T1."ItemCode" = T4."ItemCode"
                     WHERE T4."ItmsGrpCod" IS NULL
                        AND T3."ItmsGrpCod" = 103
                        AND T0."DocNum" = DOCNUM
                  ) AS STATUS_SAP
               FROM ${process.env.HANA_DB_COPLAIM}.PLPT
               WHERE DATE_PLAN LIKE '${DATE}%'
               ORDER BY POSITION ASC`
   } else {
      return ` SELECT
                  ID_PLPT,
                  DOCNUM,
                  MAQUINA,
                  TURNO,
                  DATE_PLAN,
                  INICIO,
                  FIN,
                  STATUS
               FROM ${process.env.HANA_DB_COPLAIM}.PLPT
               ${DOC !== '' ? `WHERE DOCNUM = ${DOC}` : ''}`
   }
}

hanaQProdTerm.postSaveProdTerm = (DOCNUM, MAQUINA, POSITION) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.PLPT
               (
                  DOCNUM,
                  MAQUINA,
                  POSITION,
                  DATE_PLAN,
                  CREATED_AT,
                  UPDATED_AT
               )
            VALUES
               (
                  ${DOCNUM},
                  '${MAQUINA}',
                  ${POSITION},
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP
               )`
}

hanaQProdTerm.postSaveHisPT = (ACCION, USER) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.HSPL
               (
                  ACCION,
                  USER,
                  CREATED_AT,
                  UPDATED_AT
               )
            VALUES
               (
                  '${ACCION}',
                  '${USER}',
                  CURRENT_TIMESTAMP,
                  CURRENT_TIMESTAMP
               )`
}

hanaQProdTerm.putProdTerm = ({
   ID_PLPT = '',
   MAQUINA = '',
   TURNO = '',
   INICIO = '',
   FIN = '',
   STATUS = '',
   POSITION = '',
}) => {
   return ` UPDATE ${process.env.HANA_DB_COPLAIM}.PLPT
            SET
               ${MAQUINA !== '' ? `MAQUINA = '${MAQUINA}',` : ''}
               ${TURNO !== '' ? `TURNO = '${TURNO}',` : ''}
               ${INICIO !== '' ? `INICIO = '${INICIO}',` : ''}
               ${FIN !== '' ? `FIN = '${FIN}',` : ''}
               ${STATUS !== '' ? `STATUS = '${STATUS}',` : ''}
               ${POSITION !== '' ? `POSITION = ${POSITION},` : ''}
               UPDATED_AT = CURRENT_TIMESTAMP
            WHERE ID_PLPT = ${ID_PLPT}`
}

hanaQProdTerm.getDetailsIns = (DOCNUM) => {
   return ` SELECT DISTINCT
               T0."DocNum" AS DOC_SAP,
               T0."CloseDate" AS FECH_CLOSE,
               T0."DueDate" AS FECH_VENC,
               T0."ItemCode" AS PT_CODE,
               T3."ItemName" AS CAJA,
               T0."PlannedQty" AS PLANNED_PT,
               T0."CmpltQty" AS COMPLETED_PT,
               T1."PlannedQty" AS PLANNED_QUA,
               T1."IssuedQty" AS COMPLETED_QUA,
               T1."LineNum" AS LINE_NUM,
               T1."ItemCode" AS CODE_INS,
               T4."ItemName" AS INSUMO,
               T4."ItmsGrpCod" AS GRUP_ART_INS,
               T6."CardName" AS CLIENTE,
               T7."SlpName" AS VENDEDOR,
               T5."DocNum" AS ORDEN_VSAP,
               T5."NumAtCard" AS ORDEN_CCLI
            FROM ${process.env.HANA_DATABASE}.OWOR T0
               INNER JOIN ${process.env.HANA_DATABASE}.WOR1 T1 ON T0."DocEntry" = T1."DocEntry"
               LEFT JOIN ${process.env.HANA_DATABASE}.OITM T3 ON T3."ItemCode" = T0."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OITM T4 ON T1."ItemCode" = T4."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.ORDR T5 ON T0."OriginNum" = T5."DocNum"
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T6 ON T5."CardCode" = T6."CardCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OSLP T7 ON T6."SlpCode" = T7."SlpCode"
            WHERE
               T4."ItmsGrpCod" IS NOT NULL
               AND T0."DocNum" = ${DOCNUM}`
}

module.exports = hanaQProdTerm
const queryQBodega = {}

queryQBodega.getAllProducts = ({ date = '' }) => {
   return ` SELECT
               T0."ItemCode" AS CODE_PRO,
               T0."ItemName" AS PRODUCTO,
               T0."ItmsGrpCod" AS CODE_UTILIDAD,
               T1."ItmsGrpNam" AS UTILIDAD,
               TO_VARCHAR(TO_DATE(T0."LastPurDat"), 'YYYY/MM/DD') AS END_COMPRA,
               SUM(T2."OnHand") AS STOCK
            FROM
               ${process.env.HANA_DATABASE}.OITW T2
            LEFT JOIN ${process.env.HANA_DATABASE}.OITM T0 ON
               T2."ItemCode" = T0."ItemCode"
            INNER JOIN ${process.env.HANA_DATABASE}.OITB T1 ON
               T0."ItmsGrpCod" = T1."ItmsGrpCod"
            WHERE
               T0."ItmsGrpCod" NOT IN (100, 101, 102, 103, 114, 115, 120, 124)
               AND T2."WhsCode" IN ('15', '04', '05')
               ${date ? `AND TO_VARCHAR(TO_DATE(T0."LastPurDat"), 'YYYY/MM/DD') = '${date.replaceAll('-', '/')}'` : ''}
            GROUP BY
               T0."ItemCode",
               T0."ItemName",
               T0."ItmsGrpCod",
               T1."ItmsGrpNam",
               TO_VARCHAR(TO_DATE(T0."LastPurDat"), 'YYYY/MM/DD')
            ORDER BY
               END_COMPRA DESC`
}

queryQBodega.saveRequisionCab = ({
   ID = '',
   STD = '',
   USER = '',
   COMENTARIO = '',
   DATE = '',
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.REQUI (
                  ID_REQUI,
                  ESTADO,
                  USUARIO,
                  COMENTARIO,
                  FEC_REQUI,
                  CREATED_AT,
                  UPDATED_AT
            ) VALUES (
               '${ID}',
               '${STD}',
               '${USER}',
               '${COMENTARIO}',
               '${DATE}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQBodega.saveRequisionDet = ({
   ID_REQUI = '',
   CODE_PRO = '',
   PRODUCTO = '',
   CODE_UTIL = '',
   UTILIDAD = '',
   END_COMPRA = '',
   CANTIDAD = '',
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.DREQUI (
               ID_REQUI,
               COD_PRO,
               PRODUCTO,
               COD_UTLD,
               UTILIDAD,
               FEC_CMP,
               CANTIDAD,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               '${ID_REQUI}',
               '${CODE_PRO}',
               '${PRODUCTO}',
               '${CODE_UTIL}',
               '${UTILIDAD}',
               '${END_COMPRA}',
               ${CANTIDAD},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

module.exports = queryQBodega
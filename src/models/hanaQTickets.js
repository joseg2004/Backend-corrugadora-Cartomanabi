const hanaQTickets = {}

hanaQTickets.getTicket = () => {
   return ` SELECT
               T1."ItemCode",
               T1."ItemName",
               T0."BatchNum",
               T0."Quantity",
               T0."SuppSerial",
               T0."IntrSerial",
               T0."InDate",
               T0."U_GC_PesoU",
               T0."U_GC_LOTEPROV",
               T2."WhsCode",
               T2."WhsName",
               T3."Name",
               T6."OriginNum" AS Pedido,
               T7."CardName"
            FROM
               ${process.env.HANA_DATABASE}.OIBT T0
            INNER JOIN ${process.env.HANA_DATABASE}.OITM T1 ON
               T0."ItemCode" = T1."ItemCode"
            INNER JOIN ${process.env.HANA_DATABASE}.OWHS T2 ON
               T0."WhsCode" = T2."WhsCode"
            LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T3 ON
               T1."U_GC_TEST" = T3."Code"
            LEFT JOIN ${process.env.HANA_DATABASE}.OIGN T4 ON
               T4."DocEntry" = T0."BaseEntry"
               AND T4."DocNum" = T0."BaseNum"
            LEFT JOIN ${process.env.HANA_DATABASE}.IGN1 T5 ON
               T4."DocEntry" = T5."DocEntry"
               AND T5."BaseType" = '202'
            LEFT JOIN ${process.env.HANA_DATABASE}.OWOR T6 ON
               T5."BaseRef" = T6."DocNum"
               AND T5."BaseType" = '202'
            LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T7 ON
               T6."CardCode" = T7."CardCode"
            WHERE
               T0."Quantity" > 0
               AND T1."ItmsGrpCod" = '103'
               AND T0."WhsCode" IN('03', '16')
            ORDER BY T0."InDate" DESC`
}

hanaQTickets.getOneTicket = (PTCODE, ORPROD) => {
   return ` SELECT
               T1."ItemCode",
               T1."ItemName",
               T0."BatchNum",
               T0."Quantity",
               T0."SuppSerial",
               T0."IntrSerial",
               T0."InDate",
               T0."U_GC_PesoU",
               T0."U_GC_LOTEPROV",
               T2."WhsCode",
               T2."WhsName",
               T3."Name",
               T6."OriginNum" AS Pedido,
               T7."CardName"
            FROM
               ${process.env.HANA_DATABASE}.OIBT T0
            INNER JOIN ${process.env.HANA_DATABASE}.OITM T1 ON
               T0."ItemCode" = T1."ItemCode"
            INNER JOIN ${process.env.HANA_DATABASE}.OWHS T2 ON
               T0."WhsCode" = T2."WhsCode"
            LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T3 ON
               T1."U_GC_TEST" = T3."Code"
            LEFT JOIN ${process.env.HANA_DATABASE}.OIGN T4 ON
               T4."DocEntry" = T0."BaseEntry"
               AND T4."DocNum" = T0."BaseNum"
            LEFT JOIN ${process.env.HANA_DATABASE}.IGN1 T5 ON
               T4."DocEntry" = T5."DocEntry"
               AND T5."BaseType" = '202'
            LEFT JOIN ${process.env.HANA_DATABASE}.OWOR T6 ON
               T5."BaseRef" = T6."DocNum"
               AND T5."BaseType" = '202'
            LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T7 ON
               T6."CardCode" = T7."CardCode"
            WHERE
               T0."Quantity" > 0
               AND T1."ItmsGrpCod" = '103'
               AND T0."WhsCode" IN('03', '16')
               AND T1."ItemCode" = '${PTCODE}'
               AND T0."BatchNum" = '${ORPROD}'`
}

hanaQTickets.allPTCode = () => {
   return ` SELECT
               T0."ItemCode",
               T0."ItemName"
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            WHERE
               T0."ItmsGrpCod" = '103'
               OR T0."ItmsGrpCod" = '124'
            ORDER BY T0."ItemCode" ASC`
}

hanaQTickets.allClients = () => {
   return ` SELECT
               T0."CardName"
            FROM
               ${process.env.HANA_DATABASE}.OCRD T0
            WHERE
               T0."CardType" = 'C'`
}

hanaQTickets.getTestLaminas = () => {
   return ` SELECT
               T1."Name" AS TEST
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T1 ON
               T0.U_GC_TEST = T1."Code"
            WHERE
               T0."ItmsGrpCod" = 124
               AND T1."Name" IS NOT NULL
            GROUP BY T1."Name"
            ORDER BY T1."Name" ASC`
}

module.exports = hanaQTickets
const queryQAccountsAu = {}

queryQAccountsAu.detailsAccountsAu = ({ RUC = '' }) => {
   return ` SELECT
               T0.*,
               LCASE(T1."E_Mail") AS "EmailCli",
               T2.MAIL_USER AS "EmailVend",
               T2.VEND_MAILS AS "EmailAsign",
               T3.NAME AS NAME_VEND,
               T3.PHONE_USER AS PHONE_VEND,
               T3.MAIL_USER AS MAIL_VEND
            FROM
               ${process.env.HANA_DATABASE_AU}.GCCONTACC T0
               LEFT JOIN ${process.env.HANA_DATABASE_AU}.OCRD T1 ON
                  T0."CodCliente" = T1."CardCode"
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.GCASGMAILAU T2 ON
                  T0."CodUser" = T2.COD_USER
               LEFT JOIN ${process.env.HANA_DB_DATOS}.GCUSERAU T3 ON
                  T0."CodUser" = T3.COD_USER
            WHERE
               T0.RUC = '${RUC}'
            ORDER BY
               T0."Vencimiento" DESC`
}

queryQAccountsAu.getTotalAccountsAu = ({ RUC = '' }) => {
   return `SELECT
               T1."CardCode",
               T0."Cliente",
               T2.NAME AS "Vendedor" ,
               T1."E_Mail" AS "EmailCli",
               T2."MAIL_USER" AS "EmailVend",
               T2."VEND_MAILS" AS "EmailAsign",
               -- Valores vencidos en distintos rangos de días
               SUM(CASE WHEN T0."Dias" BETWEEN 0 AND -30 THEN T0."Saldo" ELSE 0 END) AS "Vencido_30",
               SUM(CASE WHEN T0."Dias" BETWEEN -31 AND -60 THEN T0."Saldo" ELSE 0 END) AS "Vencido_31_60",
               SUM(CASE WHEN T0."Dias" BETWEEN -61 AND -90 THEN T0."Saldo" ELSE 0 END) AS "Vencido_61_90",
               SUM(CASE WHEN T0."Dias" < -90 THEN T0."Saldo" ELSE 0 END) AS "MasVencido_90",
               -- Total de valores vencidos
               SUM(CASE WHEN T0."Dias" <= 0 THEN T0."Saldo" ELSE 0 END) AS "Total_Vencido",
               -- Valores por vencer
                  SUM(CASE WHEN T0."Dias" BETWEEN 0 AND 7 THEN T0."Saldo" ELSE 0 END) AS "Por_Vencer_7",
               SUM(CASE WHEN T0."Dias" BETWEEN 8 AND 30 THEN T0."Saldo" ELSE 0 END) AS "Por_Vencer_30",
               SUM(CASE WHEN T0."Dias" > 30 THEN T0."Saldo" ELSE 0 END) AS "Por_Vencer_30_Mas",
               -- Total de valores por vencer
               SUM(CASE WHEN T0."Dias" > 0 THEN T0."Saldo" ELSE 0 END) AS "Total_Por_Vencer",
               CASE
                  WHEN T1."QryGroup1" = 'Y' THEN 'RELACIONADO'
                  ELSE 'NO RELACIONADO'
               END AS "TIPO",
                  (T3."ExtraMonth"*30)+T3."ExtraDays" AS "DiasCredito"
               FROM
               ${process.env.HANA_DATABASE_AU}.GCCONTACC T0
            LEFT JOIN
               ${process.env.HANA_DATABASE_AU}.OCRD T1 ON
               T0."CodCliente" = T1."CardCode"
            LEFT JOIN
               ${process.env.HANA_DB_COPLAIM}.GCASGMAILAU T2 ON
               T0."CodUser" = T2."COD_USER"
            LEFT JOIN ${process.env.HANA_DATABASE_AU}.OCTG T3 ON
               TO_NVARCHAR(T1."GroupNum") = TO_NVARCHAR(T3."GroupNum")
            WHERE T0."RUC" = '${RUC}'
            GROUP BY
               T0."Cliente",
               T2.NAME ,
               T1."E_Mail",
               T2."MAIL_USER",
               T2."VEND_MAILS",
               T1."CardCode",
               T1."QryGroup1",
            (T3."ExtraMonth"*30)+T3."ExtraDays"
            ORDER BY
               MAX(T0."Vencimiento") DESC;
            `
}

module.exports = queryQAccountsAu
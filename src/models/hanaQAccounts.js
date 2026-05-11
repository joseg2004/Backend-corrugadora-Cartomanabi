const queryQAccounts = {}

queryQAccounts.searchVendAssign = ({ ID = '' }) => {
   return ` SELECT
               T10.VEND_ASIGNADOS AS VEND_ASIGNADOS
            FROM
               ${process.env.HANA_DB_COPLAIM}.GCASGVD T10
            WHERE
               T10.COD_USER = '${ID}'`
}

queryQAccounts.searchVendAssignRestc = ({ ID = '' }) => {
   return ` SELECT
               T10.VEND_ASIGNADOS AS VEND_ASIGNADOS
            FROM
               ${process.env.HANA_DB_DATOS}.GCASGVD T10
            WHERE
               T10.COD_USER = '${ID}'`
}

queryQAccounts.listCliAccounts = ({ ID = '' }) => {
   return ` SELECT
               T0."RUC" AS RUC,
               T0."Cliente" AS CLIENTE,
               SUM(T0."Saldo") AS SALDO,
               SUM(
                  CASE
                     WHEN T0."StdFactura" = 'V' THEN T0."Saldo"
                     ELSE 0
                  END
               ) AS VENCIDO,
               SUM(
                  CASE
                     WHEN T0."StdFactura" = 'PV'  THEN T0."Saldo"
                     ELSE 0
                  END
               ) AS POR_VENCER,
               T0."CodUser" AS VENDEDOR,
               LCASE(T1."E_Mail") AS EMAIL
            FROM
               ${process.env.HANA_DATABASE}.GCCONTACC T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T1 ON
                  T0."CodCliente" = T1."CardCode"
            ${ID !== '' ? `WHERE T0."CodUser" IN (${ID})` : ''}
            GROUP BY
               T0."RUC",
               T0."Cliente",
               T0."CodUser",
               T1."E_Mail"
            ORDER BY
               VENCIDO DESC`
}

queryQAccounts.detailsAccounts = ({ RUC = '' }) => {
   return ` SELECT
               T0.*,
               LCASE(T1."E_Mail") AS "EmailCli",
               T2.MAIL_USER AS "EmailVend",
               T2.VEND_MAILS AS "EmailAsign",
               T3.NAME AS NAME_VEND,
               T3.PHONE_USER AS PHONE_VEND,
               T3.MAIL_USER AS MAIL_VEND
            FROM
               --{process.env.HANA_DB_DATOS}.GCCONTACCALL T0
               ${process.env.HANA_DATABASE}.GCCONTACC T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T1 ON
                  T0."CodCliente" = T1."CardCode"
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.GCASGMAIL T2 ON
                  T0."CodUser" = T2.COD_USER
               LEFT JOIN ${process.env.HANA_DB_DATOS}.GCUSERCM T3 ON
                  T0."CodUser" = T3.COD_USER
            WHERE
               T0.RUC = '${RUC}'
            ORDER BY
               T0."Vencimiento" DESC`
}

queryQAccounts.getTotalAccounts = ({ RUC = '' }) => {
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
               ${process.env.HANA_DATABASE}.GCCONTACC T0
            LEFT JOIN
               ${process.env.HANA_DATABASE}.OCRD T1 ON
               T0."CodCliente" = T1."CardCode"
            LEFT JOIN
               ${process.env.HANA_DB_COPLAIM}.GCASGMAIL T2 ON
               T0."CodUser" = T2."COD_USER"
            LEFT JOIN
            ${process.env.HANA_DATABASE}.OCTG T3
            ON TO_NVARCHAR(T1."GroupNum") = TO_NVARCHAR(T3."GroupNum")
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

queryQAccounts.searchPaymentsCli = ({ RUC = '', FECHA = '' }) => {
   return ` SELECT
               CAST(G0."FechaPago" AS DATE) AS "FechaPago",
               G0."CodCliente" AS "CodCliente",
               G0."Cliente" AS "Cliente",
               CAST(G0."TotalPago" AS DOUBLE PRECISION) AS "TotalPago",
               G0."FoliosFactAplicadas" AS "Facturas",
               CASE
                  WHEN G0."TipoPago" LIKE 'Anticipo%' AND G0."Retencion" <= 0 THEN 'ANTICIPO'
                  WHEN G0."TipoPago" LIKE 'Pago%' AND G0."Retencion" <= 0 THEN 'PAGO'
                  WHEN G0."Retencion" > 0 THEN 'RETENCION'
                  ELSE 'OTRO'
               END AS "TipoDoc"
            FROM
               ${process.env.HANA_DB_DATOS}."GC_PAYFACTCLI" G0
            WHERE
               G0."FechaPago" <= CAST('${FECHA}' AS DATE)
               AND G0."FechaPago" >= ADD_DAYS(CAST('${FECHA}' AS DATE), -7) -- Últimos 7 días desde hoy
               AND G0."CodCliente" = '${RUC}'`
}

module.exports = queryQAccounts
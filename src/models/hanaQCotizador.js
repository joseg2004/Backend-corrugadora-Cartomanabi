const queryQCotizador = {}

queryQCotizador.getInformationCarto = ({ user = '' }) => {
   return ` SELECT
               T0."firstName" AS NOMBRE,
               T0."lastName" AS APELLIDO,
               T0."jobTitle" AS CARGO,
               T0."mobile" AS TELEFONO,
               T0."email" AS EMAIL,
               'CartomanabiSA' AS CIA,
               T2."USER_CODE" AS USUARIO
            FROM
               "${process.env.HANA_DATABASE}"."OHEM" T0
            INNER JOIN "${process.env.HANA_DATABASE}"."OSLP" T1 ON
               T0."salesPrson" = T1."SlpCode"
            INNER JOIN "${process.env.HANA_DATABASE}"."OUSR" T2 ON
               T0."userId" = T2."USERID"
            WHERE
               T0."Active" = 'Y'
            ${user ? `AND T2."USER_CODE" = '${user}'` : ''}`
}

queryQCotizador.getInformationAustro = ({ user = '' }) => {
   return ` SELECT
               T0."firstName" AS NOMBRE,
               T0."lastName" AS APELLIDO,
               T0."jobTitle" AS CARGO,
               T0."mobile" AS TELEFONO,
               T0."email" AS EMAIL,
               'AustroboxSA' AS CIA,
               T2."USER_CODE" AS USUARIO
            FROM
               ${process.env.HANA_DATABASE_AU}."OHEM" T0
            INNER JOIN ${process.env.HANA_DATABASE_AU}."OSLP" T1 ON
               T0."salesPrson" = T1."SlpCode"
            INNER JOIN ${process.env.HANA_DATABASE_AU}."OUSR" T2 ON
               T0."userId" = T2."USERID"
            WHERE
               T0."Active" = 'Y'
            ${user ? `AND T2."USER_CODE" = '${user}'` : ''}`
}

// queryQCotizador.getClientCarto = ({ user = '', type = [] }) => {
//    return ` WITH CTE AS (
//                SELECT
//                   T0."CardCode" AS COD_CLIENT,
//                   T0."CardName" AS CLIENTE,
//                   T0."LicTradNum" AS RUC,
//                   T0."Phone1" AS CELULAR,
//                   T0."E_Mail" AS EMAIL,
//                   T1."FirstName" AS TIP_CONTACTO,
//                   T1."Tel1" AS TELEFONO,
//                   T1."E_MailL" AS EMAIL_CONT,
//                   T2."PymntGroup" AS FORMA_PAGO,
//                   'CartomanabiSA' AS CIA,
//                   T5."USER_CODE" AS USUARIO,
//                   (
//                         SELECT COUNT(S0.COD_CLIENT)
//                         FROM ${process.env.HANA_DB_COPLAIM}.COTI S0
//                         WHERE S0.COD_CLIENT = T0."CardCode"
//                   ) AS COUNT_COTI,
//                   T6."City" AS CIUDAD,
//                   T6."Street" AS DIRECCION,
//                   CASE
//                         WHEN UPPER(T1."Name") = 'COMPRA' THEN T1."FirstName"
//                         ELSE ''
//                   END AS ATENCION,
//                   T6."AdresType" AS DIRECCION_TIPO,
//                   ROW_NUMBER() OVER (PARTITION BY T0."CardCode" ORDER BY T0."CardName" ASC) AS RN
//                FROM
//                   "${process.env.HANA_DATABASE}"."OCRD" T0
//                   LEFT JOIN "${process.env.HANA_DATABASE}"."OCPR" T1 ON
//                      T0."CardCode" = T1."CardCode"
//                   FULL JOIN "${process.env.HANA_DATABASE}"."OCTG" T2 ON
//                      T0."GroupNum" = T2."GroupNum"
//                   LEFT JOIN "${process.env.HANA_DATABASE}"."OSLP" T3 ON
//                      T0."SlpCode" = T3."SlpCode"
//                   LEFT JOIN "${process.env.HANA_DATABASE}"."OHEM" T4 ON
//                      T3."SlpCode" = T4."salesPrson"
//                   LEFT JOIN "${process.env.HANA_DATABASE}"."OUSR" T5 ON
//                      T4."userId" = T5."USERID"
//                   LEFT JOIN "${process.env.HANA_DATABASE}".CRD1 T6 ON
//                      T0."CardCode" = T6."CardCode"
//                WHERE
//                   T6."AdresType" = 'B'
//                   --AND (T0."CardType" = 'C' OR T0."CardType" = 'L')
//                   AND T0."CardType" IN (${type.map((s) => `'${s}'`).join(', ')})
//                   ${!type.includes('S') ? 'AND T0."LicTradNum" <> \'9999999999999\'' : ''}
//                   ${!type.includes('S') ? 'AND T0."CardCode" NOT LIKE \'%%P%%\'' : ''}
//                   ${user ? `AND T5."USER_CODE" IN (${user})` : ''}
//             )
//             SELECT
//                *
//             FROM
//                CTE
//             WHERE
//                RN = 1
//             ORDER BY
//                CLIENTE ASC;`
// }
queryQCotizador.getClientCarto = ({ user = '', type = [] }) => {
   return ` WITH CTE AS (
               SELECT
                  T0."CardCode"   AS COD_CLIENT,
                  T0."CardName"   AS CLIENTE,
                  T0."LicTradNum" AS RUC,
                  T0."Phone1"     AS CELULAR,
                  T0."E_Mail"     AS EMAIL,
                  T1."FirstName"  AS TIP_CONTACTO,
                  T1."Tel1"       AS TELEFONO,
                  T1."E_MailL"    AS EMAIL_CONT,
                  T2."PymntGroup" AS FORMA_PAGO,
                  'CartomanabiSA' AS CIA,
                  T5."USER_CODE"  AS USUARIO,

                  (
                     SELECT COUNT(S0.COD_CLIENT)
                     FROM ${process.env.HANA_DB_COPLAIM}.COTI S0
                     WHERE S0.COD_CLIENT = T0."CardCode"
                  ) AS COUNT_COTI,

                  T6."City"   AS CIUDAD,
                  T6."Street" AS DIRECCION,

                  CASE
                     WHEN UPPER(T1."Name") = 'COMPRA' THEN T1."FirstName"
                     ELSE ''
                  END AS ATENCION,

                  T6."AdresType" AS DIRECCION_TIPO,

                  -- 1 fila por cliente en el resultado final
                  ROW_NUMBER() OVER (PARTITION BY T0."CardCode" ORDER BY T0."CardName" ASC) AS RN,

                  /* =========================================================
                     ✅ CATEGORIZACIÓN: Prioriza año anterior; si no existe, usa año actual
                     - T7P = año anterior (RowNumPorCliente=2)
                     - T7A = año actual   (RowNumPorCliente=1)
                     ========================================================= */
                  COALESCE(T7P."Anio", T7A."Anio") AS "AnioCategoria",
                  COALESCE(T7P."Toneladas", T7A."Toneladas", 0) AS "ToneladasCategoria",

                  COALESCE(T7P."CategoriaActual", T7A."CategoriaActual", 'No categorizado') AS "CATEGORIA",
                  COALESCE(T7P."CategoriaSegunTM", T7A."CategoriaSegunTM", 'No categorizado') AS "CATEGORIASUG"

               FROM "${process.env.HANA_DATABASE}"."OCRD" T0

               LEFT JOIN "${process.env.HANA_DATABASE}"."OCPR" T1
                  ON T0."CardCode" = T1."CardCode"

               FULL JOIN "${process.env.HANA_DATABASE}"."OCTG" T2
                  ON T0."GroupNum" = T2."GroupNum"

               LEFT JOIN "${process.env.HANA_DATABASE}"."OSLP" T3
                  ON T0."SlpCode" = T3."SlpCode"

               LEFT JOIN "${process.env.HANA_DATABASE}"."OHEM" T4
                  ON T3."SlpCode" = T4."salesPrson"

               LEFT JOIN "${process.env.HANA_DATABASE}"."OUSR" T5
                  ON T4."userId" = T5."USERID"

               LEFT JOIN "${process.env.HANA_DATABASE}".CRD1 T6
                  ON T0."CardCode" = T6."CardCode"

               /* ============================================================
                  ✅ JOIN AÑO ACTUAL (siempre que exista en la vista)
                  ============================================================ */
               LEFT JOIN ${process.env.HANA_DB_DATOS}.GC_CATCLIENT T7A
                  ON T0."CardCode" = T7A."CodClient"
                  AND T7A."RowNumPorCliente" = 1

               /* ============================================================
                  ✅ JOIN AÑO ANTERIOR (si existe; si no, queda NULL y hace fallback)
                  ============================================================ */
               LEFT JOIN ${process.env.HANA_DB_DATOS}.GC_CATCLIENT T7P
                  ON T0."CardCode" = T7P."CodClient"
                  AND T7P."RowNumPorCliente" = 2

               WHERE
                  T6."AdresType" = 'B'
                  --AND (T0."CardType" = 'C' OR T0."CardType" = 'L')
                  AND T0."CardType" IN (${type.map((s) => `'${s}'`).join(', ')})
                  ${!type.includes('S') ? 'AND T0."LicTradNum" <> \'9999999999999\'' : ''}
                  ${!type.includes('S') ? 'AND T0."CardCode" NOT LIKE \'%%P%%\'' : ''}
                  ${user ? `AND T5."USER_CODE" IN (${user})` : ''}
            )
            SELECT
               *
            FROM
               CTE
            WHERE
               RN = 1
            ORDER BY
               CLIENTE ASC;`
}

queryQCotizador.getClientAustro = ({ user = '', type = [] }) => {
   return ` SELECT
               T0."CardCode" AS COD_CLIENT,
               T0."CardName" AS CLIENTE,
               T0."LicTradNum" AS RUC,
               T0."Phone1" AS CELULAR,
               T0."E_Mail" AS EMAIL,
               T1."FirstName" AS TIP_CONTACTO,
               T1."Tel1" AS TELEFONO,
               T1."E_MailL" AS EMAIL_CONT,
               T2."PymntGroup" AS FORMA_PAGO,
               'AustroboxSA' AS CIA,
               T5."USER_CODE" AS USUARIO,
               (
                  SELECT
                     COUNT(S0.COD_CLIENT)
                  FROM
                     ${process.env.HANA_DB_COPLAIM}.COTI S0
                  WHERE
                     S0.COD_CLIENT = T0."CardCode"
               ) AS COUNT_COTI,
               T6."City" AS CIUDAD,
               T6."Street" AS DIRECCION,
               CASE
                  WHEN UPPER(T1."Name") = 'COMPRA' THEN T1."FirstName"
                  ELSE ''
               END AS ATENCION
            FROM
               ${process.env.HANA_DATABASE_AU}."OCRD" T0
            FULL JOIN ${process.env.HANA_DATABASE_AU}."OCPR" T1 ON
               T0."CardCode" = T1."CardCode"
               AND UCASE(T1."Name") = 'COMPRAS'
            FULL JOIN ${process.env.HANA_DATABASE_AU}."OCTG" T2 ON
               T0."GroupNum" = T2."GroupNum"
            INNER JOIN ${process.env.HANA_DATABASE_AU}."OSLP" T3 ON
               T0."SlpCode" = T3."SlpCode"
            INNER JOIN ${process.env.HANA_DATABASE_AU}."OHEM" T4 ON
               T3."SlpCode" = T4."salesPrson"
            INNER JOIN ${process.env.HANA_DATABASE_AU}."OUSR" T5 ON
               T4."userId" = T5."USERID"
            LEFT JOIN "${process.env.HANA_DATABASE_AU}".CRD1 T6 ON
               T0."CardCode" = T6."CardCode"
               AND T6."Address" = 'PRINCIPAL'
            WHERE
               --T0."CardType" = 'C'
               AND T0."CardType" IN (${type.map((s) => `'${s}'`).join(', ')})
               ${!type.includes('S') ? 'AND T0."LicTradNum" <> \'9999999999999\'' : ''}
               ${!type.includes('S') ? 'AND T0."CardCode" NOT LIKE \'%%P%%\'' : ''}
               ${user ? `AND T5."USER_CODE" IN (${user})` : ''}
            ORDER BY
               T0."CardName" ASC`
}

queryQCotizador.getProductsCliVend = ({ user = '', cli = '' }) => {
   return `WITH PCCL_LAST_A AS (
            SELECT *
            FROM (
               SELECT
                  P."CARDCODE",
                  P."CATEGORIA",
                  P."CRITERIO",
                  P."VALOR_K",
                  P."VALOR_W",
                  P."STATUS",
                  P."FECHA_ASIG",
                  P."COMENTARIO",
                  ROW_NUMBER() OVER (
                     PARTITION BY P."CARDCODE"
                     ORDER BY P."FECHA_ASIG" DESC, P."ID" DESC
                  ) AS RN
               FROM "GC_COPLAIM"."PCCL1" P
               WHERE P."STATUS" = 'A'
            ) X
            WHERE X.RN = 1
         )

         SELECT
            T0."ItemCode" AS CODE_PT,
            T0."ItemName" AS PRODUCTO,
            T0."BHeight1" AS ALTO,
            T0."BWidth1" AS ANCHO,
            T0."BLength1" AS LARGO,
            T0."ItmsGrpCod" AS GRUPO_ART,
            T0."U_EXX_LARGO" AS LARGO_LAM,
            T0."U_EXX_ANCHO" AS ANCHO_LAM,
            T0."U_GC_CABIDA" AS CABIDA,
            T0."U_GC_TIPO_CAJA" AS TIPO,
            T0."U_GC_MERCADO_SEG" AS COD_MERCADO,
            (T7."U_GC_MERCADOTXT" || ' - ' || T7."U_GC_SEG2_TXT") AS MERCADO,
            T7."U_GC_PRECIO_MIN" AS PRE_MINIMO,
            T7."U_GC_PVP_SUGERIDO" AS PRE_SUGERIDO,
            T4."U_GC_TEST" AS TEST,
            T4."U_GC_Factor" AS FACTOR,
            T4."U_GC_ECT" AS ECT,
            T4."U_GC_FLAUTA" AS FLAUTA,
            T4."U_GC_PAPEL1" AS COLOR,
            T0."U_GC_CANT_COLORES" AS CANT_COLOR,
            T0."validFor" AS STATUS,
            T8."T_BOXR" AS TIP_BOX,

            -- ✅ ÚLTIMA CATEGORIZACIÓN APROBADA (A) DEL CLIENTE
            PC."CATEGORIA"  AS CAT_ACT,
            PC."CRITERIO"   AS CRITERIO_CAT,
            PC."FECHA_ASIG" AS FECHA_CAT,
            PC."COMENTARIO" AS COMENTARIO_CAT,
            PC."VALOR_K"    AS VALOR_K,
            PC."VALOR_W"    AS VALOR_W,

            -- ✅ PRECIO ESPECIAL POR CLIENTE + ITEM (OSPP)
            OSPP."Price"      AS PRECIO_ESP,
            OSPP."Discount"   AS DESCUENTO_ESP,
            OSPP."ValidFrom"  AS OSPP_VALIDFROM,
            OSPP."ValidTo"    AS OSPP_VALIDTO,
            OSPP."U_IMPUESTO" AS OSPP_IMPUESTO

         FROM "SBO_CARTOMANABI_PROD"."OITM" T0
         LEFT JOIN "SBO_CARTOMANABI_PROD"."OSCN" T1
            ON T0."ItemCode" = T1."ItemCode"
         LEFT JOIN "SBO_CARTOMANABI_PROD"."OCRD" T2
            ON T1."CardCode" = T2."CardCode"
         LEFT JOIN "SBO_CARTOMANABI_PROD"."OSLP" T3
            ON T2."SlpCode" = T3."SlpCode"
         LEFT JOIN "SBO_CARTOMANABI_PROD"."@GC_CARTON" T4
            ON T0."U_GC_TEST" = T4."Code"
         LEFT JOIN "SBO_CARTOMANABI_PROD"."OHEM" T6
            ON T3."SlpCode" = T6."salesPrson"
         RIGHT JOIN "SBO_CARTOMANABI_PROD"."OUSR" T5
            ON T6."userId" = T5."USERID"
         LEFT JOIN "SBO_CARTOMANABI_PROD"."@GC_PRECIO_TM" T7
            ON T7."Code" = T0."U_GC_MERCADO_SEG"
         LEFT JOIN (
            SELECT
               S0."ID_OEMP",
               S0."ITEMCODE",
               S0."T_BOXR",
               ROW_NUMBER() OVER (
                  PARTITION BY S0."ITEMCODE"
                  ORDER BY S0."ID_OEMP" DESC
               ) AS ROWNUM
            FROM "GC_EMVCLI"."OEMP" S0
         ) T8
            ON T0."ItemCode" = T8."ITEMCODE"
         AND T8.ROWNUM = 1

         -- ✅ JOIN por CARDCODE a la última aprobada
         LEFT JOIN PCCL_LAST_A PC
            ON PC."CARDCODE" = T2."CardCode"

         -- ✅ JOIN DIRECTO A OSPP por (CardCode + ItemCode)
         LEFT JOIN "SBO_CARTOMANABI_PROD"."OSPP" OSPP
            ON OSPP."CardCode" = T2."CardCode"
         AND OSPP."ItemCode" = T0."ItemCode"
         -- (Opcional, recomendado si usas vigencias)
         AND OSPP."Valid" = 'Y'
         AND (OSPP."ValidFrom" IS NULL OR OSPP."ValidFrom" <= CURRENT_DATE)
         AND (OSPP."ValidTo"   IS NULL OR OSPP."ValidTo"   >= CURRENT_DATE)

            WHERE
               ${user ? `T5."USER_CODE" IN (${user}) AND` : ''}
               ${cli ? `T2."CardCode" = '${cli}' AND` : ''}
               (
                  (
                     T0."ItmsGrpCod" = 103
                     AND (T0."BLength1" > 0 OR T0.U_EXX_LARGO > 0)
                     AND (T0."BWidth1" > 0 OR T0.U_EXX_ANCHO > 0)
                  ) OR (
                     T0."ItmsGrpCod" = 124
                     AND T0.U_EXX_LARGO > 0
                     AND T0.U_EXX_ANCHO > 0
                  )
               )
`
}

queryQCotizador.getProductsCliVendAu = ({ user = '', cli = '' }) => {
   return ` SELECT
                  A0."ItemCode" AS CODE_PT_AU,
                  A0."ItemName" AS CAJA_AU,
                  A0."ItmsGrpCod" AS GRUPO_ART_AU,
                  T0."ItemCode" AS CODE_PT,
                  T0."ItemName" AS PRODUCTO,
                  T0."BHeight1" AS ALTO,
                  T0."BWidth1" AS ANCHO,
                  T0."BLength1" AS LARGO,
                  T0.U_EXX_LARGO AS LARGO_LAM,
                  T0.U_EXX_ANCHO AS ANCHO_LAM,
                  T0.U_GC_CABIDA AS CABIDA,
                  T0.U_GC_TIPO_CAJA AS TIPO,
                  T0.U_GC_MERCADO_SEG AS COD_MERCADO,
                  (T7.U_GC_MERCADOTXT || ' - ' || T7.U_GC_SEG2_TXT) AS MERCADO,
                  T7.U_GC_PRECIO_MIN AS PRE_MINIMO,
                  T7.U_GC_PVP_SUGERIDO AS PRE_SUGERIDO,
                  T4."U_GC_TEST" AS TEST,
                  T4."U_GC_Factor" AS FACTOR,
                  T4.U_GC_ECT AS ECT,
                  T4.U_GC_FLAUTA AS FLAUTA,
                  T4.U_GC_PAPEL1 AS COLOR,
                  T0.U_GC_CANT_COLORES AS CANT_COLOR
               FROM
                  ${process.env.HANA_DATABASE_AU}.OITM A0
                  LEFT JOIN ${process.env.HANA_DATABASE_AU}.OSCN A1 ON
                     A0."ItemCode" = A1."ItemCode"
                  LEFT JOIN ${process.env.HANA_DATABASE_AU}.OCRD A2 ON
                     A1."CardCode" = A2."CardCode"
                  LEFT JOIN ${process.env.HANA_DATABASE}.OITM T0 ON
                     A0.SWW = T0."ItemCode"
                  LEFT JOIN ${process.env.HANA_DATABASE}.OSCN T1 ON
                     T0."ItemCode" = T1."ItemCode"
                  LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T2 ON
                     T1."CardCode" = T2."CardCode"
                  LEFT JOIN ${process.env.HANA_DATABASE}.OSLP T3 ON
                     T2."SlpCode" = T3."SlpCode"
                  LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T4 ON
                     T0.U_GC_TEST = T4."Code"
                  LEFT JOIN ${process.env.HANA_DATABASE}."OHEM" T6 ON
                     T3."SlpCode" = T6."salesPrson"
                  RIGHT JOIN ${process.env.HANA_DATABASE}."OUSR" T5 ON
                     T6."userId" = T5."USERID"
                  INNER JOIN ${process.env.HANA_DATABASE}."@GC_PRECIO_TM" T7 ON
                     T7."Code" = T0.U_GC_MERCADO_SEG
               WHERE
                  A0."validFor" = 'Y'
                  AND T0."ItemCode" IS NOT NULL
                  AND A0."ItmsGrpCod" IN ('100')
                  AND (
                     (
                        T0."ItmsGrpCod" = 103
                        AND (T0."BLength1" > 0 OR T0.U_EXX_LARGO > 0)
                        AND (T0."BWidth1" > 0 OR T0.U_EXX_ANCHO > 0)
                     ) OR (
                        T0."ItmsGrpCod" = 124
                        AND T0.U_EXX_LARGO > 0
                        AND T0.U_EXX_ANCHO > 0
                     )
                  )
                  ${user ? `AND T5."USER_CODE" IN (${user})` : ''}
                  ${cli ? `AND A2."CardCode" = '${cli}'` : ''}`
}

queryQCotizador.searchUserDept = ({ user = '' }) => {
   return ` SELECT
               T0."firstName" || ' ' || T0."lastName" AS NAME,
               T1."Name" AS DEPARTAMENT,
               T2.USER_CODE AS USERNAME,
               T0."mobile" AS MOBILE,
               T0."email" AS EMAIL
            FROM
               ${process.env.HANA_DATABASE}.OHEM T0
               LEFT JOIN ${process.env.HANA_DATABASE}.OUDP T1 ON
                  T0."dept" = T1."Code"
               LEFT JOIN ${process.env.HANA_DATABASE}.OUSR T2 ON
                  T0."userId" = T2.USERID
            WHERE T2.USER_CODE = '${user}'`
}

queryQCotizador.postCotizacion = ({
   COD_CLIENT,
   IDENTITY,
   RUC,
   CLIENTE,
   TELEFONO,
   EMAIL,
   CIA,
   CIUDAD,
   DIRECCION,
   PLAZO,
   CHECK_PEDIDO,
   CHECK_CLI_TRO,
   CHECK_TRO_CLI,
   CHECK_NOT_EMAIL,
   CHECK_NOT_WHATS,
   CHECK_DAYS_CRED,
   CHECK_MEDIDAS,
   SUB_CERO,
   SUB_DOCE,
   IVA,
   TOTAL,
   VENDEDOR,
   ESTADO,
   USER
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.COTI (
               IDENTITY,
               COD_CLIENT,
               RUC,
               CLIENTE,
               TELEFONO,
               EMAIL,
               CIA,
               CIUDAD,
               DIRECCION,
               PLAZO,
               PEDIDO,
               CLI_TRO,
               TRO_CLI,
               NOT_EMAIL,
               NOT_WHATS,
               DAYS_CRED,
               MED_INT,
               SUB_CERO,
               SUB_DOCE,
               IVA,
               TOTAL,
               VENDEDOR,
               ESTADO,
               USER,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               '${IDENTITY}',
               '${COD_CLIENT}',
               '${RUC}',
               '${CLIENTE}',
               '${TELEFONO}',
               '${EMAIL}',
               '${CIA}',
               '${CIUDAD}',
               '${DIRECCION}',
               '${PLAZO}',
               ${CHECK_PEDIDO},
               ${CHECK_CLI_TRO},
               ${CHECK_TRO_CLI},
               ${CHECK_NOT_EMAIL},
               ${CHECK_NOT_WHATS},
               ${CHECK_DAYS_CRED},
               ${CHECK_MEDIDAS},
               ${SUB_CERO},
               ${SUB_DOCE},
               ${IVA},
               ${TOTAL},
               '${VENDEDOR}',
               '${ESTADO}',
               '${USER}',
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQCotizador.postCotizacionDetalle = ({
   ID_COTI,
   CODE_PT,
   PRODUCTO,
   CANTIDAD,
   ALTO,
   LARGO,
   ANCHO,
   COD_MERCADO,
   MERCADO,
   TIPO,
   TIP_BOX,
   TEST,
   FLAUTA,
   ECT,
   COLOR_BOX,
   FACTOR,
   PRE_MINIMO,
   PRE_MINIMO_BRD,
   PRE_SUGERIDO,
   PRE_SUGERIDO_BRD,
   PRE_MANUAL,
   PRE_MANUAL_BRD,
   SELECT_PRE,
   PRE_MIN_CALC,
   PRE_SUG_CALC,
   PRE_MAN_CALC,
   PRECIO,
   CHECK_TROQ,
   TROQUEL_CALC,
   TROQUEL_MANL,
   CHECK_CLI,
   COLOR,
   LARGO_IMP,
   ANCHO_IMP,
   CLISE_CALC,
   CLISE_MANL,
   LLEVA_IVA,
   IVA,
   ESTUCADO,
   PESO,
   AREA,
   LT_HOJA,
   AT_HOJA,
   CABIDA,
   INDICE,
   LARGO_LAM,
   ANCHO_LAM
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.DOCOTI (
               ID_COTI,
               CODE_PT,
               PRODUCTO,
               CANTIDAD,
               ALTO,
               LARGO,
               ANCHO,
               COD_MERCADO,
               MERCADO,
               TIPO,
               TIP_BOX,
               TEST,
               FLAUTA,
               ECT,
               COLOR_BOX,
               FACTOR,
               PRE_MINIMO,
               PRE_MINIMO_BRD,
               PRE_SUGERIDO,
               PRE_SUGERIDO_BRD,
               PRE_MANUAL,
               PRE_MANUAL_BRD,
               SELECT_PRE,
               PRE_MIN_CALC,
               PRE_SUG_CALC,
               PRE_MAN_CALC,
               PRECIO,
               CHECK_TROQ,
               TROQUEL_CALC,
               TROQUEL_MANL,
               CHECK_CLI,
               COLOR,
               LARGO_IMP,
               ANCHO_IMP,
               CLISE_CALC,
               CLISE_MANL,
               LLEVA_IVA,
               IVA,
               ESTUCADO,
               PESO,
               AREA,
               LT_HOJA,
               AT_HOJA,
               CABIDA,
               INDICE,
               LARGO_LAM,
               ANCHO_LAM,
               CREATED_AT,
               UPDATED_AT
            ) VALUES (
               ${ID_COTI},
               '${CODE_PT}',
               '${PRODUCTO}',
               ${CANTIDAD},
               ${ALTO},
               ${LARGO},
               ${ANCHO},
               '${COD_MERCADO}',
               '${MERCADO}',
               '${TIPO}',
               '${TIP_BOX}',
               '${TEST}',
               '${FLAUTA}',
               ${ECT},
               '${COLOR_BOX}',
               ${FACTOR},
               ${PRE_MINIMO},
               ${PRE_MINIMO_BRD},
               ${PRE_SUGERIDO},
               ${PRE_SUGERIDO_BRD},
               ${PRE_MANUAL},
               ${PRE_MANUAL_BRD},
               '${SELECT_PRE}',
               ${PRE_MIN_CALC},
               ${PRE_SUG_CALC},
               ${PRE_MAN_CALC},
               ${PRECIO},
               ${CHECK_TROQ},
               ${TROQUEL_CALC},
               ${TROQUEL_MANL},
               ${CHECK_CLI},
               ${COLOR},
               ${LARGO_IMP},
               ${ANCHO_IMP},
               ${CLISE_CALC},
               ${CLISE_MANL},
               ${LLEVA_IVA},
               ${IVA},
               '${ESTUCADO}',
               ${PESO},
               ${AREA},
               ${LT_HOJA},
               ${AT_HOJA},
               ${CABIDA},
               ${INDICE},
               ${LARGO_LAM},
               ${ANCHO_LAM},
               CURRENT_TIMESTAMP,
               CURRENT_TIMESTAMP
            )`
}

queryQCotizador.searchCotizacion = ({ user = '', identity = '' }) => {
   return ` SELECT
               *
            FROM
               ${process.env.HANA_DB_COPLAIM}.COTI T0
            ${user !== '' || identity !== '' ? 'WHERE' : ''}
               ${user !== '' ? `T0.USER = '${user}'` : ''}
               ${user !== '' && identity !== '' ? 'AND' : ''}
               ${identity !== '' ? `T0.IDENTITY = '${identity}'` : ''}`
}

queryQCotizador.searchCotizaciones = ({ user = '', date = '' }) => {
   return ` SELECT
               T0.*,
               T1.NAME AS NAME_VENDEDOR
            FROM
               ${process.env.HANA_DB_COPLAIM}.COTI T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.GCASGMAIL T1 ON
                  T0.USER = T1.COD_USER
            WHERE
               T0.ESTADO <> 'Q'
               ${user ? `AND T0.USER = '${user}'` : ''}
               ${date ? `AND T0.CREATED_AT LIKE '${date}%'` : ''}`
}

queryQCotizador.searchAllInfoCot = ({ user = '', date = '' }) => {
   return ` SELECT
               T0.*,
               T1.CREATED_AT AS CREADO,
               T1.COD_CLIENT AS COD_CLIENT,
               T1.CLIENTE AS CLIENTE,
               T1.TELEFONO AS TELEFONO,
               T1.SUB_CERO AS SUB_CERO,
               T1.SUB_DOCE AS SUB_DOCE,
               T1.IVA AS IVA_T,
               T1.TOTAL AS TOTAL
            FROM
               ${process.env.HANA_DB_COPLAIM}.DOCOTI T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.COTI T1 ON
                  T0.ID_COTI = T1.ID_COTI
            WHERE
               T1.ESTADO <> 'Q'
               ${user ? `AND T1.USER = '${user}'` : ''}
               ${date ? `AND T1.CREATED_AT LIKE '${date}%'` : ''}`
}

queryQCotizador.searchCotizacionesCli = ({ user = '', clients = '' }) => {
   return ` SELECT
               *
            FROM
               ${process.env.HANA_DB_COPLAIM}.COTI T0
            ${user || clients ? 'WHERE' : ''}
               ${user ? `T0.USER = '${user}'` : ''}
               ${user && clients ? 'AND' : ''}
               ${clients ? `T0.COD_CLIENT = '${clients}'` : ''}`
}

queryQCotizador.searchCotizacionDetalle = ({ ID = '' }) => {
   return ` SELECT
               T0.*
            FROM
               ${process.env.HANA_DB_COPLAIM}.DOCOTI T0
            WHERE
               T0.ID_COTI = ${ID}`
}

queryQCotizador.searchProductsAustro = () => {
   return ` SELECT DISTINCT
               /*A0."ItemCode" AS CODE_PT_AU,
               A0."ItemName" AS CAJA_AU,
               A0."ItmsGrpCod" AS GRUPO_ART_AU,*/
               A0."ItemCode" AS CODE_PT,
               A0."ItemName" AS PRODUCTO,
               T0."BHeight1" AS ALTO,
               T0."BWidth1" AS ANCHO,
               T0."BLength1" AS LARGO,
               T0.U_EXX_LARGO AS LARGO_LAM,
               T0.U_EXX_ANCHO AS ANCHO_LAM,
               T0.U_GC_CABIDA AS CABIDA,
               T0.U_GC_TIPO_CAJA AS TIPO,
               T0.U_GC_MERCADO_SEG AS COD_MERCADO,
               (T7.U_GC_MERCADOTXT || ' - ' || T7.U_GC_SEG2_TXT) AS MERCADO,
               T7.U_GC_PRECIO_MIN AS PRE_MINIMO,
               T7.U_GC_PVP_SUGERIDO AS PRE_SUGERIDO,
               T4."U_GC_TEST" AS TEST,
               T4."U_GC_Factor" AS FACTOR,
               T4.U_GC_ECT AS ECT,
               T4.U_GC_FLAUTA AS FLAUTA,
               T4.U_GC_PAPEL1 AS COLOR,
               T0.U_GC_CANT_COLORES AS CANT_COLOR
            FROM
               ${process.env.HANA_DATABASE_AU}.OITM A0
               LEFT JOIN ${process.env.HANA_DATABASE_AU}.OSCN A1 ON
                  A0."ItemCode" = A1."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE_AU}.OCRD A2 ON
                  A1."CardCode" = A2."CardCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OITM T0 ON
                  A0.SWW = T0."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OSCN T1 ON
                  T0."ItemCode" = T1."ItemCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OCRD T2 ON
                  T1."CardCode" = T2."CardCode"
               LEFT JOIN ${process.env.HANA_DATABASE}.OSLP T3 ON
                  T2."SlpCode" = T3."SlpCode"
               LEFT JOIN ${process.env.HANA_DATABASE}."@GC_CARTON" T4 ON
                  T0.U_GC_TEST = T4."Code"
               LEFT JOIN ${process.env.HANA_DATABASE}."OHEM" T6 ON
                  T3."SlpCode" = T6."salesPrson"
               RIGHT JOIN ${process.env.HANA_DATABASE}."OUSR" T5 ON
                  T6."userId" = T5."USERID"
               INNER JOIN ${process.env.HANA_DATABASE}."@GC_PRECIO_TM" T7 ON
                  T7."Code" = T0.U_GC_MERCADO_SEG
            WHERE
               A0."validFor" = 'Y'
               AND T0."ItemCode" IS NOT NULL
               AND A0."ItmsGrpCod" IN ('100')`
}

queryQCotizador.getSearchClientCarto = ({ PT = '', CLIENT = '' }) => {
   return ` SELECT *
            FROM ${process.env.HANA_DATABASE}.OSCN T0
            WHERE
               T0."ItemCode" = '${PT}'
               AND T0."CardCode" = '${CLIENT}'`
}

queryQCotizador.postAsignClientCarto = ({
   PT = '',
   CLIENT = '',
   SUST = '',
   TRANS = 'N',
   DATS = 'N',
   ID = '',
   SCN = 'Y'
}) => {
   return ` INSERT INTO ${process.env.HANA_DATABASE}.OSCN (
               "ItemCode",
               "CardCode",
               "Substitute",
               "Transfered",
               "DataSource",
               "UserSign",
               "UserSign2",
               "ShowSCN"
            ) VALUES (
               '${PT}',
               '${CLIENT}',
               '${SUST}',
               '${TRANS}',
               '${DATS}',
               ${ID},
               ${ID},
               '${SCN}'
            )`
}

queryQCotizador.getSearchClientAustro = ({ PT = '', CLIENT = '' }) => {
   return ` SELECT *
            FROM ${process.env.HANA_DATABASE_AU}.OSCN T0
            WHERE
               T0."ItemCode" = '${PT}'
               AND T0."CardCode" = '${CLIENT}'`
}

queryQCotizador.postAsignClientAustro = ({
   PT = '',
   CLIENT = '',
   SUST = '',
   TRANS = 'N',
   DATS = 'N',
   ID = '',
   SCN = 'Y'
}) => {
   return ` INSERT INTO ${process.env.HANA_DATABASE_AU}.OSCN (
               "ItemCode",
               "CardCode",
               "Substitute",
               "Transfered",
               "DataSource",
               "UserSign",
               "UserSign2",
               "ShowSCN"
            ) VALUES (
               '${PT}',
               '${CLIENT}',
               '${SUST}',
               '${TRANS}',
               '${DATS}',
               ${ID},
               ${ID},
               '${SCN}'
            )`
}

queryQCotizador.searchAllProducts = () => {
   return ` SELECT
               T0."ItemCode" AS CODE_PT,
               T0."ItemName" AS PRODUCTO
            FROM
               ${process.env.HANA_DATABASE}.OITM T0
            WHERE
               T0."ItmsGrpCod" = 103
               OR T0."ItmsGrpCod" = 124
               AND T0."validFor" = 'Y'`
}

module.exports = queryQCotizador
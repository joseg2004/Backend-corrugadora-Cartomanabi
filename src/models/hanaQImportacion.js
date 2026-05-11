const queryQImportacion = {}

queryQImportacion.searhCountries = ({ COD = '', PAIS = '' }) => {
   return ` SELECT
               *
            FROM
               ${process.env.HANA_DB_COPLAIM}.CPAIS T0
            ${COD !== '' || PAIS !== '' ? 'WHERE' : ''}
               ${COD !== '' ? `T0.COD_PAIS = '${COD}'` : ''}
               ${COD !== '' && PAIS !== '' ? 'OR' : ''}
               ${PAIS !== '' ? `T0.PAIS = '${PAIS}'` : ''}
            ORDER BY T0.PAIS ASC`
}

queryQImportacion.searhProvincias = ({ PROV = '' }) => {
   return ` SELECT
               *
            FROM
               ${process.env.HANA_DB_COPLAIM}.CPROV T0
            ${PROV !== '' ? `WHERE T0.PROVINCIA = '${PROV}'` : ''}
            ORDER BY PROVINCIA ASC`
}

queryQImportacion.searhCantones = ({ CANT = '', PROV = '' }) => {
   return ` SELECT
               T0.*,
               T1.PROVINCIA
            FROM
               ${process.env.HANA_DB_COPLAIM}.CCANT T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CPROV T1 ON
                  T0.ID_PROV = T1.ID_PROV
            ${CANT !== '' || PROV !== '' ? 'WHERE' : ''}
               ${CANT !== '' ? `T0.CANTON = '${CANT}'` : ''}
               ${CANT !== '' && PROV !== '' ? 'OR' : ''}
               ${PROV !== '' ? `T1.ID_PROV = '${PROV}'` : ''}
            ORDER BY CANTON ASC`
}

queryQImportacion.getAllImportacion = ({ ID = '', DAI = '' }) => {
   return ` SELECT
               ${ID !== '' && DAI !== '' ? 'T0.ID_IMPT AS ID_IMPPAPEL, T0.DAI AS DAI' : '*'}
            FROM
               ${process.env.HANA_DB_COPLAIM}.IMPT T0
            ${ID !== '' || DAI !== '' ? 'WHERE' : ''}
               ${ID !== '' ? `T0.ID_IMPT = '${ID}'` : ''}
               ${ID !== '' && DAI !== '' ? 'OR' : ''}
               ${DAI !== '' ? `T0.DAI = '${DAI}'` : ''}
            ORDER BY
               T0.DATE_ARRIBO DESC`
}

queryQImportacion.saveImportacion = ({
   ID_IMPT,
   ID_PAIS,
   ID_PRTO,
   ID_TIMPT,
   ORDEN_COMPRA,
   FACTURA,
   DAI,
   MRN,
   BL,
   PROVEEDOR,
   DATE_ARRIBO,
   VENC_ECAS,
   REGIMEN,
   COMENTARIO,
   USER
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.IMPT (
               ID_IMPT,
               ID_PAIS,
               ID_PRTO,
               ID_TIMPT,
               ID_FIMPORTA,
               ORDEN_COMPRA,
               FACTURA,
               DAI,
               MRN,
               BL,
               PROVEEDOR,
               DATE_ARRIBO,
               VENC_ECAS,
               REGIMEN,
               COMENTARIO,
               USER
            ) VALUES (
               '${ID_IMPT}',
               '${ID_PAIS}',
               '${ID_PRTO}',
               '${ID_TIMPT}',
               '${DAI}',
               '${Number(ORDEN_COMPRA)}',
               '${FACTURA}',
               '${DAI}',
               '${MRN}',
               '${BL}',
               '${PROVEEDOR}',
               '${DATE_ARRIBO}',
               '${VENC_ECAS}',
               '${REGIMEN}',
               '${COMENTARIO}',
               '${USER}'
            )`
}

queryQImportacion.searchTipImport = ({ ID = '', IMP = '' }) => {
   return ` SELECT
               T0.ID_TIMPT,
               T0.NUMERO,
               T0.TIPO
            FROM
               ${process.env.HANA_DB_COPLAIM}.TIMPT T0
            ${ID !== '' || IMP !== '' ? 'WHERE' : ''}
               ${ID !== '' ? `T0.ID_TIMPT = '${ID}'` : ''}
               ${ID !== '' && IMP !== '' ? 'OR' : ''}
               ${IMP !== '' ? `T0.TIPO = '${IMP}'` : ''}
            ORDER BY T0.TIPO ASC`
}

queryQImportacion.saveTipImport = ({ ID = '', NUM = '', TIP = '', USER = '' }) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.TIMPT (
               ID_TIMPT,
               NUMERO,
               TIPO,
               USER
            ) VALUES (
               '${ID}',
               '${NUM}',
               '${TIP}',
               '${USER}'
            )`
}

queryQImportacion.searchTermPuerto = ({ ID = '', NOM = '', CANT = '', PROV = '' }) => {
   return ` SELECT
               T0.*,
               T1.CANTON,
               T1.ID_PROV,
               T2.PROVINCIA
            FROM
               ${process.env.HANA_DB_COPLAIM}.PRTO T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CCANT T1 ON
                  T0.ID_CANT = T1.ID_CANT
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.CPROV T2 ON
                  T1.ID_PROV = T2.ID_PROV
            ${ID !== '' || NOM !== '' || CANT !== '' || PROV !== '' ? 'WHERE' : ''}
               ${ID !== '' ? `T0.ID_PRTO = '${ID}'` : ''}
               ${ID !== '' && NOM !== '' ? 'OR' : ''}
               ${NOM !== '' ? `T0.NOMBRE = '${NOM}'` : ''}
               ${ID !== '' && CANT !== '' ? 'OR' : ''}
               ${CANT !== '' ? `T1.CANTON = '${CANT}'` : ''}
               ${ID !== '' && PROV !== '' ? 'OR' : ''}
               ${PROV !== '' ? `T2.PROVINCIA = '${PROV}'` : ''}`
}

queryQImportacion.saveTermPuerto = ({
   idPuerto = '',
   idCanton = '',
   nombre = '',
   direccion = '',
   email = '',
   duenio = '',
   telOne = '',
   telTwo = '',
   USER = ''
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.PRTO (
               ID_PRTO,
               ID_CANT,
               NOMBRE,
               DIRECCION,
               EMAIL,
               DUENIO,
               TELEFONO_ONE,
               TELEFONO_TWO,
               USER
            ) VALUES (
               '${idPuerto}',
               '${idCanton}',
               '${nombre}',
               '${direccion}',
               '${email}',
               '${duenio}',
               '${telOne}',
               '${telTwo}',
               '${USER}'
            )`
}

queryQImportacion.searchTipFact = ({ ID = '', TIPO = '' }) => {
   return ` SELECT
               *
            FROM
               ${process.env.HANA_DB_COPLAIM}.TINVC T0
            ${ID !== '' || TIPO !== '' ? 'WHERE' : ''}
               ${ID !== '' ? `T0.ID_TINVC = '${ID}'` : ''}
               ${ID !== '' && TIPO !== '' ? 'OR' : ''}
               ${TIPO !== '' ? `T0.TIPO = '${TIPO}'` : ''}
            ORDER BY TIPO ASC`
}

queryQImportacion.saveTipFact = ({ ID = '', TIPO = '', USER = '' }) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.TINVC (
               ID_TINVC,
               TIPO,
               USER
            ) VALUES (
               '${ID}',
               '${TIPO}',
               '${USER}'
            )`
}

queryQImportacion.searchAllFactura = ({ ID_FACT = '', ID_IMPT = '' }) => {
   return ` SELECT
               T0.*,
               T1.TIPO
            FROM
               ${process.env.HANA_DB_COPLAIM}.INVC T0
               LEFT JOIN ${process.env.HANA_DB_COPLAIM}.TINVC T1 ON
                  T0.ID_TINVC = T1.ID_TINVC
            ${ID_FACT !== '' || ID_IMPT !== '' ? 'WHERE' : ''}
               ${ID_FACT !== '' ? `T0.ID_INVC = '${ID_FACT}'` : ''}
               ${ID_FACT !== '' && ID_IMPT !== '' ? 'AND' : ''}
               ${ID_IMPT !== '' ? `T0.ID_IMPT = '${ID_IMPT}'` : ''}
            ORDER BY
               T0.ID_INVC ASC`
}

queryQImportacion.saveFactura = ({
   ID_INVC,
   ID_IMPT,
   ID_TINVC,
   COMENTARIO,
   USER
}) => {
   return ` INSERT INTO ${process.env.HANA_DB_COPLAIM}.INVC (
               ID_INVC,
               ID_IMPT,
               ID_TINVC,
               COMENTARIO,
               USER
            ) VALUES (
               '${ID_INVC}',
               '${ID_IMPT}',
               '${ID_TINVC}',
               '${COMENTARIO}',
               '${USER}'
            )`
}

queryQImportacion.searchFactPO = ( docentry ) => {
   return `SELECT DISTINCT
                  H."DocEntry" AS "AP_Invoice_DocEntry",
                  H."DocNum" AS "AP_Invoice_DocNum",
                  H."CardCode",
                  L."BaseEntry" AS "PO_DocEntry",
                  L."BaseLine" AS "PO_LineNum",
                  H."CreateDate" AS "AP_Invoice_Date"
               FROM
                  ${process.env.HANA_DATABASE}."OPCH" H
               LEFT JOIN ${process.env.HANA_DATABASE}."PCH1" L
               ON
                  L."DocEntry" = H."DocEntry"
               WHERE
                  L."BaseType" = 22
                  AND L."BaseEntry" = ${docentry};
   `
}

module.exports = queryQImportacion
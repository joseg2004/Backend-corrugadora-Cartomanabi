const queryQSorteo = {}

queryQSorteo.searchEmployees = () => {
      return ` SELECT
                  T0.ID_EMPL AS DNI,
                  T0.NAMES AS EMPLOYEE,
                  T0.FECHA AS FECHA,
                  T0.CATEGORY AS CATEGORY,
                  T0.ASISTENCIA AS ASISTENCIA,
                  T0.CREATED_AT AS CREADO
               FROM
                  ${process.env.HANA_DB_DATOS}.SRTCM T0`
}

queryQSorteo.updateAsistencia = ({
   DNI = '',
   STATUS = ''
}) => {
   return ` UPDATE ${process.env.HANA_DB_DATOS}.SRTCM
            SET
               ASISTENCIA = '${STATUS}'
            WHERE
               ID_EMPL = '${DNI}'`
}

module.exports = queryQSorteo
const { Pool } = require('pg');

// Configura los datos de conexión
const pool = new Pool({
   user: process.env.PG_USER,
   host: process.env.PG_HOST,
   database: process.env.PG_DATABASE,
   password: process.env.PG_PASS,
   port: process.env.PG_PORT,
   max: 20, // Número máximo de clientes en el pool
   idleTimeoutMillis: 30000, // Tiempo de espera para liberar al cliente
   connectionTimeoutMillis: 2000, // Tiempo de espera para conectar al cliente
   statement_timeout: 10000, // Tiempo de espera para ejecutar una consulta
   query_timeout: 10000, // Tiempo de espera para ejecutar una consulta
   keepAlive: true, // Mantiene la conexión activa
   keepAliveInitialDelayMillis: 30000, // Tiempo de espera para mantener la conexión activa
});

// Probar la conexión al iniciar la aplicación
(async () => {
   try {
      const client = await pool.connect();
      console.log(`CONNECTED exitosa a PostgreSQL - ${(process.env.PG_DATABASE).toUpperCase()} ✅`);
      client.release(); // Libera el cliente al pool
   } catch (err) {
      console.error('Error conectando a PostgreSQL', err.stack);
   }
})();

// Exporta el pool para usarlo en otras partes de la app
module.exports = pool;

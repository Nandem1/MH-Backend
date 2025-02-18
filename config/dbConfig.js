const { Pool } = require('pg');

const dbConfig = {
    user: 'postgres', // Usuario de PostgreSQL
    host: 'localhost',
    database: 'mh_db', // Nombre de la base de datos
    password: '2201', // Contraseña de PostgreSQL
    port: 5432,
};

const pool = new Pool(dbConfig);

module.exports = pool;
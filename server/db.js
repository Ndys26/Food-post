// File: server/db.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = {
    // This is the function for simple, single queries
    query: (text, params) => pool.query(text, params),

    // This is the NEW function for getting a client from the pool to handle complex transactions
    getClient: () => pool.connect(),
};
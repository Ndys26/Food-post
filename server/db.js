// File: server/db.js
const { Pool } = require('pg');
require('dotenv').config();

// This object will hold our connection configuration.
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
};

// When our app is running in the "production" environment on Render,
// we MUST enable SSL. Render provides the DATABASE_URL, and this code
// adds the necessary SSL flag if we are on Render.
if (process.env.NODE_ENV === 'production') {
  connectionConfig.ssl = {
    rejectUnauthorized: false
  };
}

// Create the pool with our final configuration.
const pool = new Pool(connectionConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};
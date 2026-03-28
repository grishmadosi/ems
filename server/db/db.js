const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ems_db',
})

async function connectDB() {
  await pool.query('SELECT 1')
  console.log('PostgreSQL connected')
}

function query(text, params = []) {
  return pool.query(text, params)
}

module.exports = connectDB
module.exports.query = query

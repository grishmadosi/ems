/**
 * Seed script -- inserts a default admin user.
 * Run from project root:  node database/seed.js
 */
const path = require('path');
const serverModules = path.join(__dirname, '..', 'server', 'node_modules');
const { Pool } = require(path.join(serverModules, 'pg'));
const bcrypt = require(path.join(serverModules, 'bcryptjs'));
const dotenv = require(path.join(serverModules, 'dotenv'));

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'ems_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function seed() {
  try {
    const hash = await bcrypt.hash('admin123', 12);

    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@ems.com', hash, 'System Administrator', 'admin']
    );

    console.log('Admin user seeded  ->  admin@ems.com / admin123');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await pool.end();
  }
}

seed();

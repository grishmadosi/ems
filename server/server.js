const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const db = require('./db');

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Database ──────────────────────────────────────────────────────────────────
// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ems_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Initialize the database helper module
db.initializePool(pool);

// Test database connection
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1);
  } else {
    console.log('✅ PostgreSQL connected successfully');
    release();
  }
});

// Export pool for use in routes/controllers
app.locals.db = pool;

// ── Routes ────────────────────────────────────────────────────────────────────
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running',
    database: 'PostgreSQL',
    environment: process.env.NODE_ENV || 'development'
  });
});

// TODO: import and mount your route files here, e.g.:
// const authRoutes = require('./routes/auth');
// const pollRoutes = require('./routes/polls');
// const candidateRoutes = require('./routes/candidates');
// const voteRoutes = require('./routes/votes');
//
// app.use('/api/auth', authRoutes);
// app.use('/api/polls', pollRoutes);
// app.use('/api/candidates', candidateRoutes);
// app.use('/api/votes', voteRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${server.address().port}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'ems_db'} (PostgreSQL)`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallback = Number(PORT) + 1;
    console.warn(`⚠️ Port ${PORT} in use – trying ${fallback}...`);
    server.listen(fallback, () => {
      console.log(`🚀 Server running on http://localhost:${fallback}`);
    });
  } else {
    throw err;
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  pool.end();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

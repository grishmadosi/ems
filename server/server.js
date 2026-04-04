const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const db = require('./db');

dotenv.config();

const app = express();

// -- Middleware ----------------------------------------------------------------
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -- Database -----------------------------------------------------------------
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'ems_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

db.initializePool(pool);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('PostgreSQL connection error:', err.message);
    process.exit(1);
  } else {
    console.log('PostgreSQL connected successfully');
    release();
  }
});

app.locals.db = pool;

// -- Routes -------------------------------------------------------------------
// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    message: 'Server is running',
    database: 'PostgreSQL',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Auth
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Admin
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Elections
const electionRoutes = require('./routes/elections');
app.use('/api/elections', electionRoutes);

// Candidate applications (mounted under /api/elections/:id/...)
const candidateApplyRoutes = require('./routes/candidateApply');
app.use('/api/elections', candidateApplyRoutes);

// Voting
const votingRoutes = require('./routes/voting');
app.use('/api/vote', votingRoutes);

// Legacy nominations (backward compat)
const nominationsRoutes = require('./routes/nominations');
app.use('/api/nominations', nominationsRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// -- Start --------------------------------------------------------------------
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${server.address().port}`);
  console.log(`Database: ${process.env.DB_NAME || 'ems_db'} (PostgreSQL)`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const fallback = Number(PORT) + 1;
    console.warn(`Port ${PORT} in use - trying ${fallback}...`);
    server.listen(fallback, () => {
      console.log(`Server running on http://localhost:${fallback}`);
    });
  } else {
    throw err;
  }
});

process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  pool.end();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

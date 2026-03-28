const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db/db');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS – allow Vite dev server (port 5173) and production build
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

function formatDbError(err) {
  if (!err) return 'Unknown database error';

  if (Array.isArray(err.errors) && err.errors.length) {
    return err.errors.map((item) => item?.message || String(item)).join(' | ');
  }

  return err.message || String(err);
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    message: 'EMS backend is running',
    routes: ['/api/health', '/api/users'],
  });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'EMS API is running',
    routes: ['/api/health', '/api/users'],
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/users', userRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ error: 'Database is unavailable. Please try again shortly.' });
  }

  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 10000);

async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    console.error('PostgreSQL connection error:', formatDbError(err));
    console.warn(`⚠️  Database unavailable. Retrying every ${DB_RETRY_MS}ms...`);
  }

  setInterval(async () => {
    try {
      await connectDB();
    } catch {
      // Keep retrying in the background until PostgreSQL is available.
    }
  }, DB_RETRY_MS);

  const server = app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${server.address().port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing process or set a different PORT.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

startServer();

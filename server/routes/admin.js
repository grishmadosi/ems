/**
 * Admin routes -- voter management and dashboard stats.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { sendCredentialsEmail } = require('../utils/email');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [voterCount, electionCount, activeCount, voteCount] = await Promise.all([
      db.countUsers('voter'),
      db.countElections(),
      db.countActiveElections(),
      db.countTotalVotes(),
    ]);

    res.json({
      voters: voterCount,
      elections: electionCount,
      active_elections: activeCount,
      total_votes: voteCount,
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/admin/voters -- register a new voter and email credentials
router.post('/voters', async (req, res) => {
  try {
    const { full_name, email } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await db.getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    // Generate a random password
    const plainPassword = crypto.randomBytes(4).toString('hex'); // 8-char hex string
    const hash = await bcrypt.hash(plainPassword, 12);

    const user = await db.createUser(normalizedEmail, hash, full_name.trim(), 'voter');

    // Send email with credentials
    let emailPreview = null;
    try {
      emailPreview = await sendCredentialsEmail(normalizedEmail, full_name.trim(), plainPassword);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({
      user,
      password_sent: true,
      email_preview: emailPreview, // Ethereal preview URL (dev only)
    });
  } catch (err) {
    console.error('Create voter error:', err.message);
    res.status(500).json({ error: 'Failed to create voter' });
  }
});

// GET /api/admin/voters
router.get('/voters', async (req, res) => {
  try {
    const voters = await db.getAllVoters();
    res.json(voters);
  } catch (err) {
    console.error('List voters error:', err.message);
    res.status(500).json({ error: 'Failed to list voters' });
  }
});

// DELETE /api/admin/voters/:id
router.delete('/voters/:id', async (req, res) => {
  try {
    const deleted = await db.deleteUser(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Voter not found' });
    res.json({ message: 'Voter deleted', user: deleted });
  } catch (err) {
    console.error('Delete voter error:', err.message);
    res.status(500).json({ error: 'Failed to delete voter' });
  }
});

module.exports = router;

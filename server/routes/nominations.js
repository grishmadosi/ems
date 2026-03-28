const express = require('express');
const router = express.Router();

// ── GET /api/nominations ─────────────────────────────────────────────────────
// Return all nominations, newest first
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.db;
    const result = await pool.query(
      'SELECT * FROM nominations ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/nominations error:', err.message);
    res.status(500).json({ error: 'Failed to fetch nominations' });
  }
});

// ── POST /api/nominations ────────────────────────────────────────────────────
// Create a new nomination
router.post('/', async (req, res) => {
  try {
    const { candidate_name, party_name, position, description, photo_url } = req.body;

    // Basic validation
    if (!candidate_name || !candidate_name.trim()) {
      return res.status(400).json({ error: 'candidate_name is required' });
    }
    if (!party_name || !party_name.trim()) {
      return res.status(400).json({ error: 'party_name is required' });
    }
    if (!position || !position.trim()) {
      return res.status(400).json({ error: 'position is required' });
    }

    const pool = req.app.locals.db;
    const result = await pool.query(
      `INSERT INTO nominations (candidate_name, party_name, position, description, photo_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        candidate_name.trim(),
        party_name.trim(),
        position.trim(),
        description ? description.trim() : null,
        photo_url ? photo_url.trim() : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/nominations error:', err.message);
    res.status(500).json({ error: 'Failed to create nomination' });
  }
});

// ── DELETE /api/nominations/:id ──────────────────────────────────────────────
// Remove a nomination by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = req.app.locals.db;
    const result = await pool.query(
      'DELETE FROM nominations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Nomination not found' });
    }

    res.json({ message: 'Nomination deleted', nomination: result.rows[0] });
  } catch (err) {
    console.error('DELETE /api/nominations error:', err.message);
    res.status(500).json({ error: 'Failed to delete nomination' });
  }
});

module.exports = router;

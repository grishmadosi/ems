/**
 * Candidate application routes -- voters self-nominate for positions.
 */
const express = require('express');
const db = require('../db');
const { authenticate, requireVoter } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// POST /api/elections/:id/apply -- voter applies as candidate
router.post('/:id/apply', requireVoter, async (req, res) => {
  try {
    const electionId = req.params.id;
    const { position_id, party_name, bio } = req.body;

    if (!position_id) {
      return res.status(400).json({ error: 'Position is required' });
    }

    // Verify election exists and is active
    const election = await db.getElectionById(electionId);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.status !== 'active') {
      return res.status(400).json({ error: 'Election is not currently active' });
    }

    // Verify position belongs to this election
    const positions = await db.getPositionsByElectionId(electionId);
    const position = positions.find(p => p.id === parseInt(position_id));
    if (!position) {
      return res.status(400).json({ error: 'Invalid position for this election' });
    }

    // Check if already applied
    const alreadyApplied = await db.hasUserAppliedForPosition(req.user.id, position_id);
    if (alreadyApplied) {
      return res.status(409).json({ error: 'You have already applied for this position' });
    }

    const candidate = await db.createCandidate(
      position_id,
      req.user.id,
      req.user.full_name,
      party_name || null,
      bio || null,
      null, // image_url
      0
    );

    res.status(201).json(candidate);
  } catch (err) {
    console.error('Apply candidate error:', err.message);
    res.status(500).json({ error: 'Failed to apply as candidate' });
  }
});

// GET /api/elections/:id/candidates -- list candidates for an election
router.get('/:id/candidates', async (req, res) => {
  try {
    const candidates = await db.getCandidatesByElectionId(req.params.id);
    res.json(candidates);
  } catch (err) {
    console.error('List candidates error:', err.message);
    res.status(500).json({ error: 'Failed to list candidates' });
  }
});

module.exports = router;

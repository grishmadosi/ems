/**
 * Election routes -- CRUD for elections and positions.
 */
const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All election routes require auth
router.use(authenticate);

// GET /api/elections -- list all elections (any auth user)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let elections;
    if (status) {
      elections = await db.getElectionsByStatus(status);
    } else {
      elections = await db.getAllElections();
    }
    res.json(elections);
  } catch (err) {
    console.error('List elections error:', err.message);
    res.status(500).json({ error: 'Failed to list elections' });
  }
});

// GET /api/elections/:id -- election detail with positions and candidates
router.get('/:id', async (req, res) => {
  try {
    const election = await db.getElectionById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });

    const positions = await db.getPositionsByElectionId(election.id);

    // Fetch candidates for each position
    const positionsWithCandidates = await Promise.all(
      positions.map(async (pos) => {
        const candidates = await db.getCandidatesByPositionId(pos.id);
        return { ...pos, candidates };
      })
    );

    // Check which positions the current voter has already voted for
    let votedPositions = [];
    if (req.user.role === 'voter') {
      const votes = await db.getVoterVotesForElection(req.user.id, election.id);
      votedPositions = votes.map(v => v.position_id);
    }

    res.json({ ...election, positions: positionsWithCandidates, voted_positions: votedPositions });
  } catch (err) {
    console.error('Election detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch election' });
  }
});

// POST /api/elections -- create election with positions (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, start_time, end_time, positions } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!start_time || !end_time) return res.status(400).json({ error: 'Start and end times are required' });
    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ error: 'At least one position is required' });
    }

    const election = await db.createElection(
      title.trim(),
      description ? description.trim() : null,
      req.user.id,
      start_time,
      end_time
    );

    // Create positions
    const createdPositions = [];
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const p = await db.createPosition(
        election.id,
        pos.name.trim(),
        pos.description || null,
        pos.num_to_elect || 1,
        i
      );
      createdPositions.push(p);
    }

    res.status(201).json({ ...election, positions: createdPositions });
  } catch (err) {
    console.error('Create election error:', err.message);
    res.status(500).json({ error: 'Failed to create election' });
  }
});

// PUT /api/elections/:id/publish -- set election to active (admin)
router.put('/:id/publish', requireAdmin, async (req, res) => {
  try {
    const election = await db.getElectionById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft elections can be published' });
    }

    const updated = await db.updateElectionStatus(election.id, 'active');
    res.json(updated);
  } catch (err) {
    console.error('Publish election error:', err.message);
    res.status(500).json({ error: 'Failed to publish election' });
  }
});

// PUT /api/elections/:id/end -- end election (admin)
router.put('/:id/end', requireAdmin, async (req, res) => {
  try {
    const election = await db.getElectionById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.status !== 'active') {
      return res.status(400).json({ error: 'Only active elections can be ended' });
    }

    const updated = await db.updateElectionStatus(election.id, 'completed');
    res.json(updated);
  } catch (err) {
    console.error('End election error:', err.message);
    res.status(500).json({ error: 'Failed to end election' });
  }
});

// GET /api/elections/:id/results -- get results (admin or completed election)
router.get('/:id/results', async (req, res) => {
  try {
    const election = await db.getElectionById(req.params.id);
    if (!election) return res.status(404).json({ error: 'Election not found' });

    // Only admin can see results of active elections; voters can see after completion
    if (req.user.role !== 'admin' && election.status !== 'completed') {
      return res.status(403).json({ error: 'Results are available after the election ends' });
    }

    const results = await db.getResultsByElection(election.id);

    // Group by position
    const grouped = {};
    results.forEach(r => {
      if (!grouped[r.position_id]) {
        grouped[r.position_id] = {
          position_id: r.position_id,
          position_name: r.position_name,
          candidates: [],
        };
      }
      grouped[r.position_id].candidates.push({
        candidate_id: r.candidate_id,
        candidate_name: r.candidate_name,
        party_name: r.party_name,
        vote_count: r.vote_count,
      });
    });

    res.json({ election, results: Object.values(grouped) });
  } catch (err) {
    console.error('Results error:', err.message);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

module.exports = router;

/**
 * Voting routes -- OTP request, vote casting, and receipt.
 */
const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate, requireVoter } = require('../middleware/auth');
const { sendOtpEmail, sendReceiptEmail } = require('../utils/email');

const router = express.Router();

router.use(authenticate);

// POST /api/vote/request-otp -- send OTP to voter's email
router.post('/request-otp', requireVoter, async (req, res) => {
  try {
    const { election_id } = req.body;
    if (!election_id) return res.status(400).json({ error: 'Election ID is required' });

    // Verify election is active and within time window
    const election = await db.getElectionById(election_id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.status !== 'active') {
      return res.status(400).json({ error: 'Election is not currently active' });
    }

    const now = new Date();
    if (now < new Date(election.start_time)) {
      return res.status(400).json({ error: 'Election has not started yet' });
    }
    if (now > new Date(election.end_time)) {
      return res.status(400).json({ error: 'Election has already ended' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.createOtp(req.user.id, election_id, otp, expiresAt);

    // Send OTP email
    let emailPreview = null;
    try {
      emailPreview = await sendOtpEmail(req.user.email, otp);
    } catch (emailErr) {
      console.error('OTP email failed:', emailErr.message);
    }

    res.json({
      message: 'OTP sent to your email',
      email_preview: emailPreview, // dev only
    });
  } catch (err) {
    console.error('Request OTP error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/vote/cast -- cast vote with OTP verification
router.post('/cast', requireVoter, async (req, res) => {
  try {
    const { election_id, position_id, candidate_id, otp } = req.body;

    if (!election_id || !position_id || !candidate_id || !otp) {
      return res.status(400).json({ error: 'All fields are required (election_id, position_id, candidate_id, otp)' });
    }

    // Verify election is active and within time window
    const election = await db.getElectionById(election_id);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.status !== 'active') {
      return res.status(400).json({ error: 'Election is not currently active' });
    }

    const now = new Date();
    if (now < new Date(election.start_time)) {
      return res.status(400).json({ error: 'Election has not started yet' });
    }
    if (now > new Date(election.end_time)) {
      return res.status(400).json({ error: 'Election has already ended' });
    }

    // Verify OTP
    const validOtp = await db.verifyOtp(req.user.id, election_id, otp);
    if (!validOtp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check duplicate vote
    const alreadyVoted = await db.hasVoterVotedForPosition(req.user.id, election_id, position_id);
    if (alreadyVoted) {
      return res.status(409).json({ error: 'You have already voted for this position' });
    }

    // Verify candidate belongs to the position
    const candidate = await db.getCandidateById(candidate_id);
    if (!candidate || candidate.position_id !== parseInt(position_id)) {
      return res.status(400).json({ error: 'Invalid candidate for this position' });
    }

    // Cast vote
    const receiptCode = uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
    const vote = await db.createVote(election_id, position_id, candidate_id, req.user.id, receiptCode);

    // Build receipt data
    const positions = await db.getPositionsByElectionId(election_id);
    const position = positions.find(p => p.id === parseInt(position_id));

    const receipt = {
      receipt_code: receiptCode,
      election_title: election.title,
      position_name: position ? position.position_name : 'Unknown',
      candidate_name: candidate.candidate_name,
      created_at: vote.created_at,
    };

    // Send receipt email
    try {
      await sendReceiptEmail(req.user.email, receipt);
    } catch (emailErr) {
      console.error('Receipt email failed:', emailErr.message);
    }

    res.status(201).json({ message: 'Vote cast successfully', receipt });
  } catch (err) {
    // Handle unique constraint violation (duplicate vote)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You have already voted for this position' });
    }
    console.error('Cast vote error:', err.message);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// GET /api/vote/receipt/:code
router.get('/receipt/:code', async (req, res) => {
  try {
    const receipt = await db.getVoteByReceipt(req.params.code);
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });

    // Only the voter who cast the vote or admin can view
    if (req.user.role !== 'admin' && receipt.voter_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(receipt);
  } catch (err) {
    console.error('Receipt error:', err.message);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

// GET /api/vote/my-votes/:electionId
router.get('/my-votes/:electionId', requireVoter, async (req, res) => {
  try {
    const votes = await db.getVoterVotesForElection(req.user.id, req.params.electionId);
    res.json(votes);
  } catch (err) {
    console.error('My votes error:', err.message);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

module.exports = router;

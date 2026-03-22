/**
 * Database Helper Module
 * Provides utility functions for database operations
 */

const { Pool } = require('pg');

// This will be initialized from server.js
let pool;

const initializePool = (pgPool) => {
  pool = pgPool;
};

// Generic query function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// ============================================================================
// User Queries
// ============================================================================
const getUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const createUser = async (email, passwordHash, fullName, role = 'voter') => {
  const result = await query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
    [email, passwordHash, fullName, role]
  );
  return result.rows[0];
};

// ============================================================================
// Poll Queries
// ============================================================================
const createPoll = async (title, description, createdBy, startTime, endTime) => {
  const result = await query(
    'INSERT INTO poll (title, description, created_by, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, createdBy, startTime, endTime, 'draft']
  );
  return result.rows[0];
};

const getPollById = async (id) => {
  const result = await query('SELECT * FROM poll WHERE id = $1', [id]);
  return result.rows[0];
};

const getAllPolls = async () => {
  const result = await query('SELECT * FROM poll ORDER BY created_at DESC');
  return result.rows;
};

const getPollsByStatus = async (status) => {
  const result = await query('SELECT * FROM poll WHERE status = $1 ORDER BY created_at DESC', [status]);
  return result.rows;
};

const updatePollStatus = async (pollId, status) => {
  const result = await query(
    'UPDATE poll SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, pollId]
  );
  return result.rows[0];
};

// ============================================================================
// Position Queries
// ============================================================================
const createPosition = async (pollId, positionName, description, numToElect = 1, sequence = 0) => {
  const result = await query(
    'INSERT INTO position (poll_id, position_name, description, num_to_elect, sequence) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [pollId, positionName, description, numToElect, sequence]
  );
  return result.rows[0];
};

const getPositionsByPollId = async (pollId) => {
  const result = await query(
    'SELECT * FROM position WHERE poll_id = $1 ORDER BY sequence ASC',
    [pollId]
  );
  return result.rows;
};

// ============================================================================
// Candidate Queries
// ============================================================================
const createCandidate = async (positionId, candidateName, partyName = null, bio = null, imageUrl = null, sequence = 0) => {
  const result = await query(
    'INSERT INTO candidate (position_id, candidate_name, party_name, bio, image_url, sequence) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [positionId, candidateName, partyName, bio, imageUrl, sequence]
  );
  return result.rows[0];
};

const getCandidatesByPositionId = async (positionId) => {
  const result = await query(
    'SELECT * FROM candidate WHERE position_id = $1 ORDER BY sequence ASC',
    [positionId]
  );
  return result.rows;
};

// ============================================================================
// Vote Queries
// ============================================================================
const createVote = async (pollId, positionId, candidateId, voterId, preference = 1) => {
  const result = await query(
    'INSERT INTO vote (poll_id, position_id, candidate_id, voter_id, preference) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [pollId, positionId, candidateId, voterId, preference]
  );
  return result.rows[0];
};

const hasVoterVotedForPosition = async (voterId, pollId, positionId) => {
  const result = await query(
    'SELECT * FROM vote WHERE voter_id = $1 AND poll_id = $2 AND position_id = $3 LIMIT 1',
    [voterId, pollId, positionId]
  );
  return result.rows.length > 0;
};

const getVotesByPollId = async (pollId) => {
  const result = await query(
    'SELECT * FROM vote WHERE poll_id = $1 ORDER BY created_at DESC',
    [pollId]
  );
  return result.rows;
};

const getVoteCountByCandidate = async (positionId) => {
  const result = await query(
    `SELECT candidate_id, COUNT(*) as vote_count 
     FROM vote 
     WHERE position_id = $1 
     GROUP BY candidate_id 
     ORDER BY vote_count DESC`,
    [positionId]
  );
  return result.rows;
};

// ============================================================================
// Exports
// ============================================================================
module.exports = {
  initializePool,
  query,
  // User
  getUserByEmail,
  getUserById,
  createUser,
  // Poll
  createPoll,
  getPollById,
  getAllPolls,
  getPollsByStatus,
  updatePollStatus,
  // Position
  createPosition,
  getPositionsByPollId,
  // Candidate
  createCandidate,
  getCandidatesByPositionId,
  // Vote
  createVote,
  hasVoterVotedForPosition,
  getVotesByPollId,
  getVoteCountByCandidate,
};

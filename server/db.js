/**
 * Database Helper Module
 * Provides utility functions for all database operations.
 */

let pool;

const initializePool = (pgPool) => {
  pool = pgPool;
};

// Generic query with timing
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // only log in dev to avoid noise
    if (process.env.NODE_ENV !== 'production') {
      console.log('Query', { text: text.substring(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error.message);
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
    'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
    [email, passwordHash, fullName, role]
  );
  return result.rows[0];
};

const getAllVoters = async () => {
  const result = await query(
    "SELECT id, email, full_name, created_at FROM users WHERE role = 'voter' ORDER BY created_at DESC"
  );
  return result.rows;
};

const deleteUser = async (id) => {
  const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

const countUsers = async (role) => {
  const result = await query('SELECT COUNT(*)::int as count FROM users WHERE role = $1', [role]);
  return result.rows[0].count;
};

// ============================================================================
// Election Queries
// ============================================================================
const createElection = async (title, description, createdBy, startTime, endTime) => {
  const result = await query(
    'INSERT INTO election (title, description, created_by, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, createdBy, startTime, endTime, 'draft']
  );
  return result.rows[0];
};

const getElectionById = async (id) => {
  const result = await query('SELECT * FROM election WHERE id = $1', [id]);
  return result.rows[0];
};

const getAllElections = async () => {
  const result = await query('SELECT * FROM election ORDER BY created_at DESC');
  return result.rows;
};

const getElectionsByStatus = async (status) => {
  const result = await query('SELECT * FROM election WHERE status = $1 ORDER BY start_time ASC', [status]);
  return result.rows;
};

const updateElectionStatus = async (id, status) => {
  const result = await query(
    'UPDATE election SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

const countElections = async () => {
  const result = await query('SELECT COUNT(*)::int as count FROM election');
  return result.rows[0].count;
};

const countActiveElections = async () => {
  const result = await query("SELECT COUNT(*)::int as count FROM election WHERE status = 'active'");
  return result.rows[0].count;
};

// ============================================================================
// Position Queries
// ============================================================================
const createPosition = async (electionId, positionName, description, numToElect = 1, sequence = 0) => {
  const result = await query(
    'INSERT INTO position (election_id, position_name, description, num_to_elect, sequence) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [electionId, positionName, description, numToElect, sequence]
  );
  return result.rows[0];
};

const getPositionsByElectionId = async (electionId) => {
  const result = await query(
    'SELECT * FROM position WHERE election_id = $1 ORDER BY sequence ASC',
    [electionId]
  );
  return result.rows;
};

// ============================================================================
// Candidate Queries
// ============================================================================
const createCandidate = async (positionId, userId, candidateName, partyName = null, bio = null, imageUrl = null, sequence = 0) => {
  const result = await query(
    'INSERT INTO candidate (position_id, user_id, candidate_name, party_name, bio, image_url, sequence) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [positionId, userId, candidateName, partyName, bio, imageUrl, sequence]
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

const getCandidatesByElectionId = async (electionId) => {
  const result = await query(
    `SELECT c.*, p.position_name, p.election_id
     FROM candidate c
     JOIN position p ON c.position_id = p.id
     WHERE p.election_id = $1
     ORDER BY p.sequence ASC, c.sequence ASC`,
    [electionId]
  );
  return result.rows;
};

const getCandidateById = async (id) => {
  const result = await query('SELECT * FROM candidate WHERE id = $1', [id]);
  return result.rows[0];
};

const hasUserAppliedForPosition = async (userId, positionId) => {
  const result = await query(
    'SELECT id FROM candidate WHERE user_id = $1 AND position_id = $2 LIMIT 1',
    [userId, positionId]
  );
  return result.rows.length > 0;
};

// ============================================================================
// OTP Queries
// ============================================================================
const createOtp = async (userId, electionId, otpCode, expiresAt) => {
  // Invalidate old OTPs first
  await query(
    'UPDATE otp_tokens SET used = TRUE WHERE user_id = $1 AND election_id = $2 AND used = FALSE',
    [userId, electionId]
  );
  const result = await query(
    'INSERT INTO otp_tokens (user_id, election_id, otp_code, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, electionId, otpCode, expiresAt]
  );
  return result.rows[0];
};

const verifyOtp = async (userId, electionId, otpCode) => {
  const result = await query(
    `SELECT * FROM otp_tokens
     WHERE user_id = $1 AND election_id = $2 AND otp_code = $3
       AND used = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId, electionId, otpCode]
  );
  if (result.rows.length === 0) return null;

  // Mark as used
  await query('UPDATE otp_tokens SET used = TRUE WHERE id = $1', [result.rows[0].id]);
  return result.rows[0];
};

// ============================================================================
// Vote Queries
// ============================================================================
const createVote = async (electionId, positionId, candidateId, voterId, receiptCode) => {
  const result = await query(
    'INSERT INTO vote (election_id, position_id, candidate_id, voter_id, receipt_code) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [electionId, positionId, candidateId, voterId, receiptCode]
  );
  return result.rows[0];
};

const hasVoterVotedForPosition = async (voterId, electionId, positionId) => {
  const result = await query(
    'SELECT id FROM vote WHERE voter_id = $1 AND election_id = $2 AND position_id = $3 LIMIT 1',
    [voterId, electionId, positionId]
  );
  return result.rows.length > 0;
};

const getVoteByReceipt = async (receiptCode) => {
  const result = await query(
    `SELECT v.*, e.title as election_title, p.position_name, c.candidate_name
     FROM vote v
     JOIN election e ON v.election_id = e.id
     JOIN position p ON v.position_id = p.id
     JOIN candidate c ON v.candidate_id = c.id
     WHERE v.receipt_code = $1`,
    [receiptCode]
  );
  return result.rows[0];
};

const getVoterVotesForElection = async (voterId, electionId) => {
  const result = await query(
    `SELECT v.*, p.position_name, c.candidate_name
     FROM vote v
     JOIN position p ON v.position_id = p.id
     JOIN candidate c ON v.candidate_id = c.id
     WHERE v.voter_id = $1 AND v.election_id = $2`,
    [voterId, electionId]
  );
  return result.rows;
};

const getResultsByElection = async (electionId) => {
  const result = await query(
    `SELECT p.id as position_id, p.position_name,
            c.id as candidate_id, c.candidate_name, c.party_name,
            COUNT(v.id)::int as vote_count
     FROM position p
     JOIN candidate c ON c.position_id = p.id
     LEFT JOIN vote v ON v.candidate_id = c.id
     WHERE p.election_id = $1
     GROUP BY p.id, p.position_name, p.sequence, c.id, c.candidate_name, c.party_name
     ORDER BY p.sequence ASC, vote_count DESC`,
    [electionId]
  );
  return result.rows;
};

const countTotalVotes = async () => {
  const result = await query('SELECT COUNT(*)::int as count FROM vote');
  return result.rows[0].count;
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
  getAllVoters,
  deleteUser,
  countUsers,
  // Election
  createElection,
  getElectionById,
  getAllElections,
  getElectionsByStatus,
  updateElectionStatus,
  countElections,
  countActiveElections,
  // Position
  createPosition,
  getPositionsByElectionId,
  // Candidate
  createCandidate,
  getCandidatesByPositionId,
  getCandidatesByElectionId,
  getCandidateById,
  hasUserAppliedForPosition,
  // OTP
  createOtp,
  verifyOtp,
  // Vote
  createVote,
  hasVoterVotedForPosition,
  getVoteByReceipt,
  getVoterVotesForElection,
  getResultsByElection,
  countTotalVotes,
};

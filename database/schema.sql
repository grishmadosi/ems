-- EMS (Election Management System) Database Schema
-- PostgreSQL Schema

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'voter', -- 'admin' or 'voter'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- POLL TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS poll (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_poll_status ON poll(status);
CREATE INDEX idx_poll_created_by ON poll(created_by);

-- ============================================================================
-- POSITION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS position (
    id SERIAL PRIMARY KEY,
    poll_id INT NOT NULL REFERENCES poll(id) ON DELETE CASCADE,
    position_name VARCHAR(255) NOT NULL, -- e.g., 'President', 'Secretary'
    description TEXT,
    num_to_elect INT DEFAULT 1, -- Number of candidates to elect for this position
    sequence INT DEFAULT 0, -- Order of positions in the election
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_position_poll_id ON position(poll_id);
CREATE UNIQUE INDEX idx_position_poll_name ON position(poll_id, position_name);

-- ============================================================================
-- CANDIDATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS candidate (
    id SERIAL PRIMARY KEY,
    position_id INT NOT NULL REFERENCES position(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255) NOT NULL,
    party_name VARCHAR(255),
    bio TEXT,
    image_url VARCHAR(500),
    sequence INT DEFAULT 0, -- Order of candidates in UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidate_position_id ON candidate(position_id);

-- ============================================================================
-- VOTE TABLE (with duplicate voting prevention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vote (
    id SERIAL PRIMARY KEY,
    poll_id INT NOT NULL REFERENCES poll(id) ON DELETE CASCADE,
    position_id INT NOT NULL REFERENCES position(id) ON DELETE CASCADE,
    candidate_id INT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
    voter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference INT DEFAULT 1, -- For preference voting (1 = first choice, 2 = second, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prevent duplicate voting: One voter can vote only once per position
CREATE UNIQUE INDEX idx_vote_voter_position ON vote(voter_id, poll_id, position_id);
CREATE INDEX idx_vote_poll_id ON vote(poll_id);
CREATE INDEX idx_vote_position_id ON vote(position_id);
CREATE INDEX idx_vote_voter_id ON vote(voter_id);

-- ============================================================================
-- Audit Log (Optional: for transparency)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    changes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);

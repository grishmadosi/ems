-- EMS (Election Management System) Database Schema
-- PostgreSQL -- full prototype schema

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS otp_tokens CASCADE;
DROP TABLE IF EXISTS vote CASCADE;
DROP TABLE IF EXISTS candidate CASCADE;
DROP TABLE IF EXISTS position CASCADE;
DROP TABLE IF EXISTS election CASCADE;
DROP TABLE IF EXISTS nominations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id           SERIAL PRIMARY KEY,
    email        VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name    VARCHAR(255) NOT NULL,
    role         VARCHAR(50) NOT NULL DEFAULT 'voter',  -- 'admin' or 'voter'
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================================
-- ELECTION TABLE
-- ============================================================================
CREATE TABLE election (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    created_by   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time   TIMESTAMP NOT NULL,
    end_time     TIMESTAMP NOT NULL,
    status       VARCHAR(50) DEFAULT 'draft',  -- 'draft', 'active', 'completed'
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_election_status     ON election(status);
CREATE INDEX idx_election_created_by ON election(created_by);

-- ============================================================================
-- POSITION TABLE
-- ============================================================================
CREATE TABLE position (
    id            SERIAL PRIMARY KEY,
    election_id   INT NOT NULL REFERENCES election(id) ON DELETE CASCADE,
    position_name VARCHAR(255) NOT NULL,
    description   TEXT,
    num_to_elect  INT DEFAULT 1,
    sequence      INT DEFAULT 0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX  idx_position_election_id   ON position(election_id);
CREATE UNIQUE INDEX idx_position_election_name ON position(election_id, position_name);

-- ============================================================================
-- CANDIDATE TABLE  (a voter applies for a position)
-- ============================================================================
CREATE TABLE candidate (
    id             SERIAL PRIMARY KEY,
    position_id    INT NOT NULL REFERENCES position(id) ON DELETE CASCADE,
    user_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255) NOT NULL,
    party_name     VARCHAR(255),
    bio            TEXT,
    image_url      VARCHAR(500),
    sequence       INT DEFAULT 0,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(position_id, user_id)  -- one user per position
);

CREATE INDEX idx_candidate_position_id ON candidate(position_id);
CREATE INDEX idx_candidate_user_id     ON candidate(user_id);

-- ============================================================================
-- VOTE TABLE (with duplicate voting prevention + receipt)
-- ============================================================================
CREATE TABLE vote (
    id            SERIAL PRIMARY KEY,
    election_id   INT NOT NULL REFERENCES election(id) ON DELETE CASCADE,
    position_id   INT NOT NULL REFERENCES position(id) ON DELETE CASCADE,
    candidate_id  INT NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
    voter_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receipt_code  VARCHAR(64) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- One voter can vote only once per position
CREATE UNIQUE INDEX idx_vote_voter_position ON vote(voter_id, election_id, position_id);
CREATE INDEX idx_vote_election_id ON vote(election_id);
CREATE INDEX idx_vote_position_id ON vote(position_id);
CREATE INDEX idx_vote_voter_id    ON vote(voter_id);

-- ============================================================================
-- OTP TOKENS TABLE (one-time voting verification)
-- ============================================================================
CREATE TABLE otp_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    election_id INT NOT NULL REFERENCES election(id) ON DELETE CASCADE,
    otp_code    VARCHAR(6) NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_user_election ON otp_tokens(user_id, election_id);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================
CREATE TABLE audit_log (
    id          SERIAL PRIMARY KEY,
    action      VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   INT,
    user_id     INT REFERENCES users(id) ON DELETE SET NULL,
    changes     JSONB,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_user_id    ON audit_log(user_id);

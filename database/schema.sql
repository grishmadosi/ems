-- USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(10) CHECK (role IN ('ADMIN', 'VOTER')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- POLL TABLE
CREATE TABLE poll (
    poll_id SERIAL PRIMARY KEY,
    poll_name VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'UPCOMING',
    created_by INT REFERENCES users(user_id)
);

-- POSITION TABLE
CREATE TABLE position (
    position_id SERIAL PRIMARY KEY,
    poll_id INT REFERENCES poll(poll_id) ON DELETE CASCADE,
    position_name VARCHAR(100) NOT NULL,
    max_selectable INT DEFAULT 1
);

-- CANDIDATE TABLE
CREATE TABLE candidate (
    candidate_id SERIAL PRIMARY KEY,
    position_id INT REFERENCES position(position_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    party VARCHAR(100),
    description TEXT,
    photo_url TEXT
);

-- VOTE TABLE
CREATE TABLE vote (
    vote_id SERIAL PRIMARY KEY,
    voter_id INT REFERENCES users(user_id),
    poll_id INT REFERENCES poll(poll_id),
    position_id INT REFERENCES position(position_id),
    candidate_id INT REFERENCES candidate(candidate_id),
    timestamp TIMESTAMP DEFAULT NOW(),
    UNIQUE (voter_id, position_id)
);
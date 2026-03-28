-- PostgreSQL schema for EMS

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password TEXT,
    role VARCHAR(10) CHECK (role IN ('ADMIN', 'VOTER')) NOT NULL DEFAULT 'VOTER',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll (
    poll_id SERIAL PRIMARY KEY,
    poll_name VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'UPCOMING',
    created_by INT REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS position (
    position_id SERIAL PRIMARY KEY,
    poll_id INT NOT NULL REFERENCES poll(poll_id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    max_votes INT DEFAULT 1,
    UNIQUE (poll_id, title)
);

CREATE TABLE IF NOT EXISTS candidate (
    candidate_id SERIAL PRIMARY KEY,
    poll_id INT NOT NULL REFERENCES poll(poll_id) ON DELETE CASCADE,
    position_id INT NOT NULL REFERENCES position(position_id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    manifesto TEXT
);

CREATE TABLE IF NOT EXISTS vote (
    vote_id SERIAL PRIMARY KEY,
    poll_id INT NOT NULL REFERENCES poll(poll_id) ON DELETE CASCADE,
    position_id INT NOT NULL REFERENCES position(position_id) ON DELETE CASCADE,
    candidate_id INT NOT NULL REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (poll_id, position_id, user_id)
);

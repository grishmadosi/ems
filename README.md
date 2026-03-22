# EMS — Election Management System

A full-stack **Election Management System** built with **React**, **Node.js + Express**, and **PostgreSQL**.
Admins can create polls, manage candidates, and monitor results. Voters can securely authenticate and cast their votes.

---

## Tech Stack

### Frontend
- React.js
- HTML5 / CSS3
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### Authentication & Security
- JWT (JSON Web Token)
- bcrypt password hashing
- Role-based access control

### Development Tools
- Git & GitHub
- Postman (API testing)
- pgAdmin (PostgreSQL GUI)

---

## Features

### Admin Features
- Create and manage election polls
- Add positions (President, Secretary, etc.)
- Add candidates for each position
- Configure voting rules
- Schedule election start and end time
- Monitor voting progress
- View election results

### Voter Features
- Secure login and authentication
- View active elections
- Cast votes with preference voting support
- Prevent duplicate voting
- Vote confirmation

### Security Features
- One voter can vote **only once per position** (enforced at DB level)
- Password hashing with **bcrypt**
- Token-based authentication using **JWT**
- Database constraints to prevent duplicate votes
- Audit logging for transparency

---

## System Architecture

```
Frontend (React)
        |
Backend API (Node.js + Express)
        |
Database (PostgreSQL)
```

---

## Project Structure

```
ems/
|
+-- client/                 # React Frontend
|   +-- src/
|       +-- components/
|       +-- pages/
|       +-- services/
|       +-- App.js
|
+-- server/                 # Node.js Backend
|   +-- controllers/
|   +-- routes/
|   +-- models/
|   +-- middleware/
|   +-- server.js
|   +-- .env
|
+-- database/
|   +-- schema.sql          # PostgreSQL schema
|
+-- README.md
```

---

## Prerequisites

Make sure the following are installed on your machine:

| Tool | Version | Install |
|---|---|---|
| Node.js | >= 18 | https://nodejs.org |
| PostgreSQL | >= 14 | https://www.postgresql.org/download |
| Git | any | https://git-scm.com |

On macOS you can install via Homebrew:

```bash
brew install node
brew install postgresql@16
brew services start postgresql@16
```

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ems
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ems_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> Never commit `.env` to version control. It is already listed in `.gitignore`.

### 3. Set up the PostgreSQL database

#### Create the database

Open `psql` (the PostgreSQL shell):

```bash
psql -U postgres
```

Then run:

```sql
CREATE DATABASE ems_db;
\q
```

#### Run the schema

Apply the SQL schema to create all tables:

```bash
psql -U postgres -d ems_db -f database/schema.sql
```

You can verify the tables were created:

```bash
psql -U postgres -d ems_db -c "\dt"
```

Expected output:

```
 Schema |    Name    | Type  |  Owner
--------+------------+-------+----------
 public | candidate  | table | postgres
 public | poll       | table | postgres
 public | position   | table | postgres
 public | users      | table | postgres
 public | vote       | table | postgres
```

#### (Optional) Using pgAdmin

If you prefer a GUI:

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click Databases -> Create -> Database -> name it `ems_db`
4. Open the Query Tool (Tools -> Query Tool)
5. Paste the contents of `database/schema.sql` and execute

### 4. Install dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

Or all at once:

```bash
npm install && npm run install:all
```

### 5. Run the application

```bash
# From the root /ems directory
npm run dev
```

This starts both the backend and the frontend:

| Service | URL |
|---|---|
| React Frontend | http://localhost:5173 |
| Express API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |

---

## Database Schema

### users

Stores voter and admin accounts.

```sql
CREATE TABLE users (
    user_id   SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    email     VARCHAR(150) UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    role      VARCHAR(10) CHECK (role IN ('ADMIN', 'VOTER')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### poll

Stores election information.

```sql
CREATE TABLE poll (
    poll_id     SERIAL PRIMARY KEY,
    poll_name   VARCHAR(200) NOT NULL,
    description TEXT,
    start_time  TIMESTAMP NOT NULL,
    end_time    TIMESTAMP NOT NULL,
    status      VARCHAR(20) DEFAULT 'UPCOMING',
    created_by  INT REFERENCES users(user_id)
);
```

### position

Represents positions within a poll.

```sql
CREATE TABLE position (
    position_id     SERIAL PRIMARY KEY,
    poll_id         INT REFERENCES poll(poll_id) ON DELETE CASCADE,
    position_name   VARCHAR(100) NOT NULL,
    max_selectable  INT DEFAULT 1
);
```

### candidate

Candidates running for a position.

```sql
CREATE TABLE candidate (
    candidate_id  SERIAL PRIMARY KEY,
    position_id   INT REFERENCES position(position_id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL,
    party         VARCHAR(100),
    description   TEXT,
    photo_url     TEXT
);
```

### vote

Stores vote records. The `UNIQUE` constraint prevents duplicate votes.

```sql
CREATE TABLE vote (
    vote_id      SERIAL PRIMARY KEY,
    voter_id     INT REFERENCES users(user_id),
    poll_id      INT REFERENCES poll(poll_id),
    position_id  INT REFERENCES position(position_id),
    candidate_id INT REFERENCES candidate(candidate_id),
    timestamp    TIMESTAMP DEFAULT NOW(),
    UNIQUE (voter_id, position_id)
);
```

---

## Security Measures

- **Duplicate vote prevention** — enforced at the database level with `UNIQUE (voter_id, position_id)`
- **Password hashing** — bcrypt with salt rounds
- **JWT authentication** — stateless token-based sessions
- **Transaction-based vote recording** — votes are committed atomically
- **Role-based access control** — admin and voter routes are separated

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `psql: command not found` | Add PostgreSQL bin to PATH: `export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"` |
| `FATAL: role "postgres" does not exist` | Run `createuser -s postgres` |
| `database "ems_db" does not exist` | Run `psql -U postgres -c "CREATE DATABASE ems_db;"` |
| `Connection refused` on port 5432 | Start PostgreSQL: `brew services start postgresql@16` |
| JWT errors | Make sure `JWT_SECRET` is set in `server/.env` |
| CORS errors | Check `CLIENT_URL` in `server/.env` matches your frontend port |

---

## Available Scripts

Run from the root `/ems` directory:

| Command | Description |
|---|---|
| `npm run dev` | Start both server and client |
| `npm run server` | Start Express server only |
| `npm run client` | Start React dev server only |
| `npm run build` | Build React for production |

---

## Future Improvements

- Blockchain-based vote verification
- Real-time vote analytics dashboard
- Email verification for voters
- Mobile responsive UI
- Two-factor authentication (2FA)
- Fraud detection system

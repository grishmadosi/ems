# 🗳️ Online Election Polling System

A secure web-based election management platform that allows administrators to create polls and voters to cast votes digitally. The system focuses on **transparency, fairness, and vote integrity**, ensuring that each voter can vote only once and that all votes are recorded securely.

This project is built using the **MERN stack with PostgreSQL** for reliable relational data management.

---

## 📌 Project Overview

The **Online Election Polling System** enables organizations, universities, or communities to conduct elections online.

The platform provides:
- Poll creation and management
- Candidate and position management
- Secure voter authentication
- Digital vote casting
- Duplicate vote prevention
- Transparent result generation

The system prioritizes **data integrity, scalability, and security**.

---

## 🛠 Tech Stack

### Frontend
- React.js
- HTML5
- CSS3
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
- Git
- GitHub
- Postman
- pgAdmin 

---

## ✨ Features

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
- Cast votes
- Preference voting support
- Prevent duplicate voting
- Vote confirmation

### Security Features
- One voter can vote **only once per position**
- Password hashing with **bcrypt**
- Token-based authentication using **JWT**
- Database constraints to prevent duplicate votes
- Audit logging for transparency

---

## 🏗 System Architecture

```
Frontend (React)
        ↓
Backend API (Node.js + Express)
        ↓
Database (PostgreSQL)
```

---

## 📁 Project Structure

```
election-system/
│
├── client/                 # React Frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── App.js
│
├── server/                 # Node.js Backend
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middleware
│   └── server.js
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

## 🗄 Database Schema

### Users

Stores voter and admin accounts.

```
user_id
name
email
password
role (ADMIN / VOTER)
created_at
```

### Poll

Stores election information.

```
poll_id
poll_name
description
start_time
end_time
status
created_by
```

### Position

Represents positions within a poll.

```
position_id
poll_id
position_name
max_selectable
```

### Candidate

Candidates running for a position.

```
candidate_id
position_id
name
party
description
photo_url
```

### Vote

Stores vote records.

```
vote_id
voter_id
poll_id
position_id
candidate_id
timestamp
```

---

## 🔐 Security Measures

Prevent duplicate voting using database constraints:

```sql
UNIQUE (voter_id, position_id)
```

Additional protections:
- Password hashing with bcrypt
- JWT authentication
- Transaction-based vote recording
- Role-based access control

---
## 📊 Future Improvements

- Blockchain-based vote verification
- Real-time vote analytics
- Email verification for voters
- Mobile responsive UI
- Two-factor authentication
- Fraud detection system

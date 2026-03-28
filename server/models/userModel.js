const db = require('../db/db')

async function findAll() {
  const { rows } = await db.query(
    `SELECT
      user_id AS id,
      name,
      email,
      role,
      created_at AS "createdAt"
     FROM users
     ORDER BY created_at DESC`
  )

  return rows
}

async function create(payload) {
  const name = String(payload?.name || '').trim()
  const email = String(payload?.email || '')
    .trim()
    .toLowerCase()
  const role = String(payload?.role || 'VOTER').toUpperCase()

  if (!name || !email) {
    const error = new Error('Name and email are required.')
    error.status = 400
    throw error
  }

  if (!['ADMIN', 'VOTER'].includes(role)) {
    const error = new Error('Role must be ADMIN or VOTER.')
    error.status = 400
    throw error
  }

  const { rows } = await db.query(
    `INSERT INTO users (name, email, role)
     VALUES ($1, $2, $3)
     RETURNING
      user_id AS id,
      name,
      email,
      role,
      created_at AS "createdAt"`,
    [name, email, role]
  )

  return rows[0]
}

async function findByIdAndDelete(id) {
  const { rows } = await db.query(
    `DELETE FROM users
     WHERE user_id = $1
     RETURNING user_id AS id`,
    [id]
  )

  return rows[0] || null
}

module.exports = {
  findAll,
  create,
  findByIdAndDelete,
}

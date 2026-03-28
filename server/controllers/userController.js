const User = require('../models/userModel')

exports.getUsers = async (_req, res, next) => {
  try {
    const users = await User.findAll()
    res.json(users)
  } catch (error) {
    next(error)
  }
}

exports.createUser = async (req, res, next) => {
  try {
    const actorRole = String(req.header('x-user-role') || '').toUpperCase()
    if (actorRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can add users.' })
    }

    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists.' })
    }

    next(error)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const deleted = await User.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

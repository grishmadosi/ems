const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Poll = require('../models/Poll');

const router = express.Router();

/**
 * GET /api/admin/users
 * Get all users (protected by adminAuth)
 */
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('id name email role createdAt');
    res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * POST /api/admin/users
 * Create a new user (protected by adminAuth)
 * Body: { name, email, password, role }
 */
router.post('/users', adminAuth, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role: role || 'VOTER',
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser.toJSON(),
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user (protected by adminAuth)
 */
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /api/admin/stats
 * Get admin statistics (protected by adminAuth)
 * Returns: { totalUsers, activeElections, totalVotesCast }
 */
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeElections = await Poll.countDocuments({ status: 'ACTIVE' });
    const totalVotesCast = await Poll.aggregate([
      { $group: { _id: null, total: { $sum: '$votes' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeElections,
        totalVotesCast: totalVotesCast[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;

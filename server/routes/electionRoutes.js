const express = require('express');
const router = express.Router();
const Election = require('../models/Election');

// 1. Get ALL elections (ordered newest first)
router.get('/', async (req, res) => {
  try {
    const elections = await Election.findAll({ order: [['createdAt', 'DESC']] });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2. Create a new election with positions
router.post('/', async (req, res) => {
  try {
    const { title, startTime, endTime, positions } = req.body;
    
    // Validate time constraints
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'endTime must be after startTime' });
    }

    // Validate positions
    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ message: 'At least one position is required' });
    }

    const savedElection = await Election.create({
      title,
      startTime,
      endTime,
      positions,
      status: 'Upcoming'
    });

    res.status(201).json(savedElection);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. Update election status with Time Constraints
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const election = await Election.findByPk(id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const now = new Date();

    // Check time constraints before updating status
    if (status === 'Active') {
      if (now < election.startTime) {
        return res.status(400).json({ 
          message: 'Time constraint failed: Cannot activate election before its start time.',
          currentTime: now,
          startTime: election.startTime
        });
      }
      if (now > election.endTime) {
        return res.status(400).json({ 
          message: 'Time constraint failed: Cannot activate election after its end time.',
          currentTime: now,
          endTime: election.endTime
        });
      }
    }

    if (status === 'Closed') {
      // Optional: Prevent closing before election has ended, or allow manual override
      // if (now < election.endTime) {
      //   return res.status(400).json({ message: 'Warning: Closing election before its official end time.' });
      // }
    }

    election.status = status;
    const updatedElection = await election.save();

    res.json({
      message: `Election status updated to ${status}`,
      election: updatedElection
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
  {
    poll_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'ENDED'],
      default: 'UPCOMING',
    },
    positions: {
      type: Number,
      default: 0,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Poll', pollSchema);

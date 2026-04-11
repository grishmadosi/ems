const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Election = sequelize.define('Election', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General Election'
  },
  status: {
    type: DataTypes.ENUM('Upcoming', 'Active', 'Closed'),
    defaultValue: 'Upcoming'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  positions: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Election;

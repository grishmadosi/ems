const { Sequelize } = require('sequelize');

const POSTGRES_URI = process.env.POSTGRES_URI || 'postgres://localhost:5432/ems';

const sequelize = new Sequelize(POSTGRES_URI, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
});

module.exports = sequelize;

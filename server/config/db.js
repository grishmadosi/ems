const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ems_db",
  password: "2442",
  port: 5432,
});

module.exports = pool;
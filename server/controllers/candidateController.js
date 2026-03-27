const pool = require("../config/db");

exports.createCandidate = async (req, res) => {
  const { position_id, name, party, description } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO candidate (position_id, name, party, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [position_id, name, party, description]
    );

    res.status(201).json({
      message: "Candidate created",
      candidate: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create candidate" });
  }
};
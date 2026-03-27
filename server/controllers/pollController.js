const pool = require("../config/db");

exports.createPoll = async (req, res) => {
  const { poll_name, description, start_time, end_time } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO poll (poll_name, description, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [poll_name, description, start_time, end_time]
    );

    res.status(201).json({
      message: "Poll created successfully",
      poll: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create poll" });
  }
};
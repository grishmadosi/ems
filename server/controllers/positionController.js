const pool = require("../config/db");

exports.createPosition = async (req, res) => {
  const { poll_id, position_name, max_selectable } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO position (poll_id, position_name, max_selectable)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [poll_id, position_name, max_selectable]
    );

    res.status(201).json({
      message: "Position created",
      position: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create position" });
  }
};
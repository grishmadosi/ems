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
exports.createFullPoll = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      poll_name,
      description,
      start_time,
      end_time,
      positions
    } = req.body;

    if (!poll_name || !start_time || !end_time) {
      return res.status(400).json({
        error: "Poll name, start time and end time are required"
      });
    }

    await client.query("BEGIN");

    const pollResult = await client.query(
      `INSERT INTO poll (poll_name, description, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [poll_name, description, start_time, end_time]
    );

    const poll_id = pollResult.rows[0].poll_id;

    for (const pos of positions) {
      const positionResult = await client.query(
        `INSERT INTO position (poll_id, position_name, max_selectable)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [poll_id, pos.position_name, pos.max_selectable]
      );

      const position_id = positionResult.rows[0].position_id;

      for (const cand of pos.candidates) {
        await client.query(
          `INSERT INTO candidate (position_id, name)
           VALUES ($1, $2)`,
          [position_id, cand.name]
        );
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Full poll created successfully",
      poll_id
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);

    res.status(500).json({
      error: "Failed to create full poll"
    });

  } finally {
    client.release();
  }
};
const express = require("express");
const router = express.Router();
const { createPoll } = require("../controllers/pollController");

router.post("/create", createPoll);

module.exports = router;
const express = require("express");
const router = express.Router();
const { createPoll, createFullPoll } = require("../controllers/pollController");

router.post("/create", createPoll);
router.post("/full", createFullPoll);

module.exports = router;
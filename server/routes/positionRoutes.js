const express = require("express");
const router = express.Router();
const { createPosition } = require("../controllers/positionController");

router.post("/create", createPosition);

module.exports = router;
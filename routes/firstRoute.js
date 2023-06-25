const express = require("express");
const firstController = require("../controllers/firstController");
const router = express.Router();

router.get("/", firstController.firstFunction);
module.exports = router;

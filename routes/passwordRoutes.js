// routes/passwordRoutes.js
const express = require('express');
const router = express.Router();
const { protectRoute } = require('../middleware/protectRoute');
const { changePassword } = require('../controllers/passwordController');

// POST /api/password/change - Change user password
router.post('/change', protectRoute, changePassword);

module.exports = router;
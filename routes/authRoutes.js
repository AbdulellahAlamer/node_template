const express = require("express");
const { signup, login, logout, getMe } = require("../controllers/authController");
const { protectRoute } = require('../middleware/protectRoute');
const { changePassword } = require('../controllers/changePasswordController');//
const router = express.Router();
router.post("/me", protectRoute ,getMe);
router.post("/signup", signup);
router.post("/login" , login);
router.post("/logout" , logout);
router.post('/change-password', protectRoute, changePassword);// mohannad

module.exports = router;
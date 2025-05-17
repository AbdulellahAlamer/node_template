// controllers/changePasswordController.js
const User = require('../models/userSchema');
const bcrypt = require('bcryptjs'); // Note: using bcryptjs to match your signup controller

// Password validation regexes (same as in signup)
const PASS_REGEXES = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  digit: /\d/,
  special: /[!@#$%^&*(),.?":{}|<>]/
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Check if all fields are provided
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }
    
    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'New password and confirm password do not match'
      });
    }
    
    // Validate password strength (same rules as signup)
    const validPw =
      newPassword.length >= 8 &&
      PASS_REGEXES.lower.test(newPassword) &&
      PASS_REGEXES.upper.test(newPassword) &&
      PASS_REGEXES.digit.test(newPassword) &&
      PASS_REGEXES.special.test(newPassword);

    if (!validPw) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be ≥ 8 chars and include lowercase, uppercase, number and special character'
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if current password is correct
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password (using bcryptjs with salt 10 to match signup)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
const User = require("../models/userSchema.js");
const bcrypt  = require('bcryptjs');
const generateTokenAndSetCookie = require("../lib/utils/generateToken.js");
const { trackAdminLogin } = require('./adminController.js');

/*  regexes that mirror the checks in your React sign‑up form  */
const EMAIL_REGEX= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASS_REGEXES = {
  lower: /[a-z]/,
  upper: /[A-Z]/,
  digit: /\d/,
  special: /[!@#$%^&*(),.?":{}|<>]/
};

// Sing up
async function signup (req, res) {
  try {
    const { username, email, password } = req.body;

    if (!EMAIL_REGEX.test(email))
      return res.status(400).json({ error: 'Invalid email format' });

    // Checking valid password
    const validPw =
      password.length >= 8 &&
      PASS_REGEXES.lower.test(password) &&
      PASS_REGEXES.upper.test(password) &&
      PASS_REGEXES.digit.test(password) &&
      PASS_REGEXES.special.test(password);

    if (!validPw)
      return res.status(400).json({
        error:
          'Password must be ≥ 8 chars and include lower / upper case, number and special character'
      });

    const [userTaken, emailTaken] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email })
    ]);

    if (userTaken)
      return res.status(400).json({ error: 'Username is already taken' });
    if (emailTaken)
      return res.status(400).json({ error: 'Email is already taken' });

    const hashed = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      username,
      email,
      password: hashed
    });

    if (createdUser) {
      generateTokenAndSetCookie(createdUser._id, res);
      await createdUser.save(); // Send it to Database
      res.status(201).json({
        data: createdUser
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1) Ensure both fields are present
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide both email and password.' });
    }

    // 2) Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // (we don't reveal whether it was email or password that was wrong)
      return res
        .status(401)
        .json({ error: 'Invalid credentials.' });
    }

    // 3) Compare password hashes
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ error: 'Invalid credentials.' });
    }

    // 4) Generate JWT and set it as an HTTP-only cookie
    generateTokenAndSetCookie(user._id, res);

    // 5) If the user is an admin, track this login
    if (user.role === 'admin') {
      // Get IP and user-agent info if available
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const device = req.headers['user-agent'] || 'unknown';
      
      // Track the login asynchronously (don't await)
      trackAdminLogin(user._id, ip, device)
        .catch(err => console.error('Error tracking admin login:', err));
    }

    // 6) Return the same user payload (match your signup response)
    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      // And more...
    });

  } catch (err) {
    console.error('Error in login controller:', err);
    return res
      .status(500)
      .json({ error: 'Internal Server Error' });
  }
}

async function logout(req, res) { 
  try {
    // Clear the JWT cookie with all possible configurations
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict"
    });
    
    // Clear any non-httpOnly cookies that might be used
    res.cookie("authToken", "", { maxAge: 0, path: "/" });
    return res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Error in logout controller:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in getMe controller →', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
 

module.exports = { signup, login, logout , getMe};
const jwt = require('jsonwebtoken');

function generateTokenAndSetCookie (userId, res) {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15d' }
  );

  const fifteenDaysMs = 15 * 24 * 60 * 60 * 1000;

  res.cookie('jwt', token, {
    maxAge: fifteenDaysMs, // expires in 15 days
    httpOnly: true, // JS on the client can't read it
    sameSite: 'strict', // CSRF protection
    secure: process.env.NODE_ENV !== 'development' // only https in prod
  });
}

module.exports = generateTokenAndSetCookie;
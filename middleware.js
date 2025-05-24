// middleware.js
require('dotenv').config();

function authMiddleware(req, res, next) {
  const clientSecret = req.headers['x-api-secret'];
  if (clientSecret !== process.env.API_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Secret' });
  }
  next();
}

module.exports = authMiddleware;

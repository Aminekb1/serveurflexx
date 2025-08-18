const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Adjust path

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Expect "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret
    req.user = await User.findById(decoded.id); // Attach user to request
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Utilisateur non authentifié' });
  }
};
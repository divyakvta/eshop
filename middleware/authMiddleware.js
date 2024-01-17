const { User } = require("../models/userSchema");

const jwt = require('jsonwebtoken');
function verifyToken(req, res, next) {

  const token = req.cookies.jwt;
  console.log(token);
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
  
 };




module.exports = verifyToken;

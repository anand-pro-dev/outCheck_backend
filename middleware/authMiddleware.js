const jwt = require('jsonwebtoken');
const  User  = require('../models/userModel');
const Admin = require('../models/adminModel');


// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. Token missing.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// Middleware to verify vendor role
const authenticateVendor = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. Token missing.' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ message: 'Access denied. Only vendors allowed.' });
    }
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. Token missing.' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(403).json({ message: 'Access denied. Invalid admin.' });

    req.user = { id: admin._id };
    next();
  });
};


// Export both middleware functions
module.exports = {
  authenticateAdmin,
    authenticateToken,
    authenticateVendor,
  };
  




 

// userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken, authenticateVendor } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
 
const userController = require('../controllers/userController');
 
// 🟢 Register User and Send OTP
router.post(
  '/signUp',
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'selfIdentificationPic', maxCount: 1 }
  ]),
  userController.registerUser
);

// 🟢 Verify OTP and Issue Token
router.post('/verifyOtp', userController.verifyOTP);
router.post('/logIn', userController.userLogin);


// 🟢 Get User Profile
router.get('/getProfile', authenticateToken, userController.getProfile);

// 🟢 Update User Profile
router.post(
  '/updateProfile',
  authenticateToken,
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'selfIdentificationPic', maxCount: 1 },
  ]),
  userController.updateProfile
);

 
 

module.exports = router;
const User = require('../models/userModel');
const sendResponse = require('../utils/Helper').sendResponse;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');

// OTP storage (in-memory for demo purposes)
const otpStore = new Map();

// Generate 4-digit OTP function
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Send OTP (mock function)
const sendOTP = (contactNumber, otp) => {
  console.log(`Sending OTP ${otp} to ${contactNumber}`);
};

// 🟢 Register User and Send OTP
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, nameprefix, countryCode, contactNumber, email, role } = req.body;

    // Check if email or contact number already exists
    const existingUser = await User.findOne({ $or: [{ email }, { countryCode, contactNumber }] });
    if (existingUser) {
      return sendResponse(res, false, 'Email or contact number already exists.');
    }
// Handle file uploads
const profilePicUrl = req.files?.profilePic
  ? `${req.protocol}://${req.get('host')}/uploads/profiles/${req.files.profilePic[0].filename}`
  : null;

const selfIdentificationPicUrl = req.files?.selfIdentificationPic
  ? `${req.protocol}://${req.get('host')}/uploads/profiles/${req.files.selfIdentificationPic[0].filename}`
  : null;


    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      nameprefix,
      countryCode,
      contactNumber,
      email,
      role,
      profilePic: profilePicUrl,
      selfIdentificationPic: selfIdentificationPicUrl,
    });

    await newUser.save();

    // Generate OTP
    const otp = generateOTP();
    otpStore.set(`${countryCode}${contactNumber}`, otp);
    sendOTP(`${countryCode}${contactNumber}`, otp);

    sendResponse(res, true, 'User registered successfully. OTP sent for verification.', {
      user_id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      nameprefix: newUser.nameprefix,
      email: newUser.email,
      role: newUser.role,
      countryCode: newUser.countryCode,
      contactNumber: newUser.contactNumber,
      profilePic: newUser.profilePic,
      selfIdentificationPic: newUser.selfIdentificationPic,
      otpSent: otp,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, false, 'Error registering user', null, error.message);
  }
};



 
// Verify OTP and issue JWT token with user details
const verifyOTP = async (req, res) => {
    try {
      const { countryCode, contactNumber, otp } = req.body;
      if (!countryCode || !contactNumber || !otp) {
        return sendResponse(res, false, 'Country code, contact number, and OTP are required.');
      }
  
      const otpKey = `${countryCode}${contactNumber}`;
      const validOtp = otpStore.get(otpKey);
      if (!validOtp || validOtp !== otp) {
        return sendResponse(res, false, 'Invalid OTP.');
      }
  
      const user = await User.findOne({ countryCode, contactNumber });
      if (!user) {
        return sendResponse(res, false, 'User not found.');
      }
  
      const payload = { id: user._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5y' });
  
      // Remove OTP after successful verification
      otpStore.delete(otpKey);
  
      // Construct response object
      const userData = {
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        nameprefix: user.nameprefix,
        email: user.email,
        role: user.role,
        countryCode: user.countryCode,
        contactNumber: user.contactNumber,
        profilePic: user.profilePic,
      };
  
      // If the user is a vendor, include selfIdentificationPic
      if (user.role === 'vendor') {
        userData.selfIdentificationPic = user.selfIdentificationPic;
      }
  
      sendResponse(res, true, `Welcome ${user.firstName}`, { token, user: userData });

    } catch (error) {
      console.error(error);
      sendResponse(res, false, 'Server error.', null, error.message);
    }
  };
  


  

// Login with mobile number (send OTP)
const userLogin = async (req, res) => {
    try {
      const { countryCode, contactNumber } = req.body;
  
      if (!countryCode || !contactNumber) {
        return sendResponse(res, false, 'Country code and contact number are required.');
      }
  
      // Find user with matching countryCode and contactNumber
      const user = await User.findOne({ countryCode, contactNumber });
      if (!user) return sendResponse(res, false, 'User not found.');
  
      // Generate and store OTP
      const otp = generateOTP();
      otpStore.set(`${countryCode}${contactNumber}`, otp);
      sendOTP(`${countryCode}${contactNumber}`, otp);
  
      sendResponse(res, true, 'OTP sent successfully.', { otp });
    } catch (error) {
      console.error(error);
      sendResponse(res, false, 'Server error.', null, error.message);
    }
  };
  


// 🟢 Get User Profile
 const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return sendResponse(res, false, 'User not found.');
  
      sendResponse(res, true, 'Profile fetched successfully.', {
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        nameprefix: user.nameprefix,
        email: user.email,
        countryCode: user.countryCode,
        contactNumber: user.contactNumber,
        profilePic: user.profilePic,
        selfIdentificationPic: user.selfIdentificationPic,
        role: user.role,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, false, 'Failed to fetch profile.', null, error.message);
    }
  };
  
  // 🟢 Update User Profile
 const updateProfile = async (req, res) => {
    try {
      const { firstName, lastName, nameprefix, countryCode, contactNumber, email } = req.body;
  
      // Find existing user
      let user = await User.findById(req.user.id);
      if (!user) return sendResponse(res, false, 'User not found.');
  
      // Ensure contact number or email is not already taken by another user
      const existingUser = await User.findOne({
        $or: [{ email }, { contactNumber }],
        _id: { $ne: req.user.id }, // Exclude current user
      });
  
      if (existingUser) {
        return sendResponse(res, false, 'Email or Contact Number already in use.');
      }
  
      // Prepare update data
      const updateData = {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        nameprefix: nameprefix || user.nameprefix,
        countryCode: countryCode || user.countryCode,
        contactNumber: contactNumber || user.contactNumber,
        email: email || user.email,
      };
  
      // Handle file uploads
      if (req.files?.profilePic) {
        updateData.profilePic = `${req.protocol}://${req.get('host')}/uploads/images/${req.files.profilePic[0].filename}`;
      }
      if (req.files?.selfIdentificationPic) {
        updateData.selfIdentificationPic = `${req.protocol}://${req.get('host')}/uploads/images/${req.files.selfIdentificationPic[0].filename}`;
      }
      
  
      // Update user in DB
      user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
  
      sendResponse(res, true, 'Profile updated successfully.', {
        user_id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        nameprefix: user.nameprefix,
        email: user.email,
        countryCode: user.countryCode,
        contactNumber: user.contactNumber,
        profilePic: user.profilePic,
        selfIdentificationPic: user.selfIdentificationPic,
        role: user.role,
      });
    } catch (error) {
      console.error(error);
      sendResponse(res, false, 'Failed to update profile.', null, error.message);
    }
  };
 

module.exports = {
    registerUser,
    verifyOTP, userLogin, getProfile,  updateProfile
    };
// adminRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Property = require('../models/propertyModel');
const { authenticateAdmin } = require('../middleware/authMiddleware');


const sendResponse = require('../utils/Helper').sendResponse;
 

// 3.1 - Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return sendResponse(res, false, 'Admin not found.');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return sendResponse(res, false, 'Invalid credentials.');

    const payload = { id: admin._id };
    // Sign token (5 years expiry for demo)
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5y' });

    // Convert admin to a plain object and remove the password field
    const adminData = admin.toObject();
    delete adminData.password;

    sendResponse(res, true, 'Login successful.', { token, admin: adminData });
  } catch (error) {
    sendResponse(res, false, 'Server error.', null, error.message);
  }
});


// 3.2 - Get Admin Data (without password)
router.get('/profile', authenticateAdmin, async (req, res) => {
  try {
    // req.user.id is set in authenticateAdmin if token is valid
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) return sendResponse(res, false, 'Admin not found.');

    sendResponse(res, true, 'Admin data retrieved successfully.', { admin });
  } catch (error) {
    sendResponse(res, false, 'Failed to retrieve admin data.', null, error.message);
  }
});

// 3.3 - Update Admin Password (only if logged in)
router.post('/update-password', authenticateAdmin, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return sendResponse(res, false, 'Admin not found.');

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return sendResponse(res, false, 'Old password is incorrect.');

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    sendResponse(res, true, 'Password updated successfully.');
  } catch (error) {
    sendResponse(res, false, 'Failed to update password.', null, error.message);
  }
});

// Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    sendResponse(res, true, 'Users fetched successfully.', users);
  } catch (error) {
    sendResponse(res, false, 'Failed to fetch users.', null, error.message);
  }
});

// Get all sellers
router.get('/sellers', authenticateAdmin, async (req, res) => {
  try {
    const sellers = await User.find({ role: 'vendor' });
    sendResponse(res, true, 'Sellers fetched successfully.', sellers);
  } catch (error) {
    sendResponse(res, false, 'Failed to fetch sellers.', null, error.message);
  }
});

// Activate/Deactivate user or seller
router.post('/update-status/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) return sendResponse(res, false, 'User not found.');

    sendResponse(res, true, `Account ${status} successfully.`, user);
  } catch (error) {
    sendResponse(res, false, 'Failed to update account status.', null, error.message);
  }
});

// Delete user or seller
router.delete('/delete-account/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return sendResponse(res, false, 'User not found.');

    sendResponse(res, true, 'Account deleted successfully.', deletedUser);
  } catch (error) {
    sendResponse(res, false, 'Failed to delete account.', null, error.message);
  }
});

// Update user or seller account
router.put('/update-account/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) return sendResponse(res, false, 'User not found.');

    sendResponse(res, true, 'Account updated successfully.', updatedUser);
  } catch (error) {
    sendResponse(res, false, 'Failed to update account.', null, error.message);
  }
});

// Get all properties using aggregation with lookup
router.get('/properties', authenticateAdmin, async (req, res) => {
  try {
    const properties = await Property.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendorDetails'
        }
      },
      { $unwind: '$vendorDetails' },
      {
        $project: {
          title: 1,
          description: 1,
          price: 1,
          location: 1,
          images: 1,
          status: 1,
          'vendorDetails.name': 1,
          'vendorDetails.email': 1
        }
      }
    ]);
    sendResponse(res, true, 'Properties fetched successfully.', properties);
  } catch (error) {
    sendResponse(res, false, 'Failed to fetch properties.', null, error.message);
  }
});

module.exports = router;

const mongoose = require('mongoose');

const Admin = new mongoose.Schema({

  
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nameprefix: { type: String, required: true },
  profilePic: { type: String }, // Profile picture URL
  contactNumber: { type: String, required: true, unique: true }, // Unique contact number
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // Timestamp for user creation
 
});

module.exports = mongoose.model('Admin', Admin);
 
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nameprefix: { type: String, required: true },
  countryCode: { type: String, required: true },
  contactNumber: { type: String, required: true, unique: true }, // Unique contact number
  email: { type: String, required: true, unique: true },

  role: {
    type: String,
    enum: ['user', 'vendor'], // Only 'user' or 'vendor' allowed
    default: 'user',
  },

  profilePic: { type: String }, // Profile picture URL
  selfIdentificationPic: { type: String }, // Self-identification picture URL

  createdAt: { type: Date, default: Date.now }, // Timestamp for user creation
});

module.exports = mongoose.model('User', UserSchema);

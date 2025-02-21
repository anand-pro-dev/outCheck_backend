const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  amenities: [{ type: String }],
  propetyCategory: [{ type: String }],
  categoryColor: { type: String },
  discount: { type: String },
  keyFeatures: [{ type: String }],
  workingHors: { type: String },
  services: { type: String },
  workerName: { type: String },
  workingHours: { type: String },
  dateNTime: { type: String },
  alternateNumber: { type: String },
  serviceCharge: { type: String },
  likes: [{ type: String }],
  reviewsId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  reviewsProfiels: [{ type: String }],
  location: { type: String, required: true },
  images: [{ type: String }], // URLs of uploaded images
  video: [{ type: String }], // URLs of uploaded videos
  virtualView: [{ type: String }], // URLs of virtual view images
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  rating: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);

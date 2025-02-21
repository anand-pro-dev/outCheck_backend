const express = require('express');
const router = express.Router();
const Property = require('../models/propertyModel');
const upload = require('../middleware/upload');
const { authenticateVendor } = require('../middleware/authMiddleware');
const sendResponse = require('../utils/Helper').sendResponse;

 
// Create Property Route
router.post(
  '/create-property',
 
  authenticateVendor,
  upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 3 }]),
  async (req, res) => {
    try {
    
   
      const imageUrls = req.files?.images?.map(file =>
        `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`      
      ) || [];
      const videoUrls = req.files?.videos?.map(file =>
        `${req.protocol}://${req.get('host')}/uploads/videos/${file.filename}`
      ) || [];
      
      const newProperty = new Property({
        ...req.body,
        vendorId: req.user._id,
        images: imageUrls,
        video: videoUrls,
      });

      await newProperty.save();
      sendResponse(
        res,
        true,
        'Property created successfully.',
        { property: newProperty, propertyId: newProperty._id }
      );
    } catch (error) {
      sendResponse(res, false, 'Failed to create property.', null, error.message);
    }
  }
);

// ✅ Update Property (POST)
router.post(
  '/update-property/:id',
  authenticateVendor,
  upload.fields([{ name: 'images', maxCount: 5 }, { name: 'videos', maxCount: 3 }]),
  async (req, res) => {
    try {
      const { id: propertyId } = req.params;
 
      const imageUrls = req.files?.images?.map(file =>
        `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`      
      ) || [];
      const videoUrls = req.files?.videos?.map(file =>
        `${req.protocol}://${req.get('host')}/uploads/videos/${file.filename}`
      ) || [];
      const updateData = { ...req.body };
      if (imageUrls.length) updateData.images = imageUrls;
      if (videoUrls.length) updateData.video = videoUrls;

      const updatedProperty = await Property.findOneAndUpdate(
        { _id: propertyId, vendorId: req.user._id },
        updateData,
        { new: true }
      );

      if (!updatedProperty) return sendResponse(res, false, 'Property not found or unauthorized.');

      sendResponse(res, true, 'Property updated successfully.', { property: updatedProperty, propertyId: updatedProperty._id });

    } catch (error) {
      sendResponse(res, false, 'Failed to update property.', null, error.message);
    }
  }
);

// ✅ Delete Property (POST)
router.post('/delete-property/:id', authenticateVendor, async (req, res) => {
  try {
    const { id: propertyId } = req.params;

    const deletedProperty = await Property.findOneAndDelete({ _id: propertyId, vendorId: req.user._id });

    if (!deletedProperty) return sendResponse(res, false, 'Property not found or unauthorized.');

    sendResponse(res, true, 'Property deleted successfully.', { propertyId: deletedProperty._id });

  } catch (error) {
    sendResponse(res, false, 'Failed to delete property.', null, error.message);
  }
});

// ✅ Get All My Properties (POST)
router.get('/my-properties', authenticateVendor, async (req, res) => {
  try {
    const properties = await Property.find({ vendorId: req.user._id });
    sendResponse(
      res,
      true,
      'Properties retrieved successfully.',
      { properties, propertyIds: properties.map(p => p._id) }
    );
  } catch (error) {
    sendResponse(res, false, 'Failed to retrieve properties.', null, error.message);
  }
});


// ✅ Get Single Property (POST)
router.post('/property/:id', authenticateVendor, async (req, res) => {
  try {
    const { id: propertyId } = req.params;

    const property = await Property.findOne({ _id: propertyId, vendorId: req.user._id });

    if (!property) return sendResponse(res, false, 'Property not found or unauthorized.');

    sendResponse(res, true, 'Property retrieved successfully.', { property, propertyId: property._id });

  } catch (error) {
    sendResponse(res, false, 'Failed to retrieve property.', null, error.message);
  }
});

module.exports = router;

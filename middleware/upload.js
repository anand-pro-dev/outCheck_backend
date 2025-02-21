const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Ensure directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration: images go to 'images' folder and videos go to 'videos' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine folder based on file mimetype
    const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
    const uploadPath = `uploads/${folder}`;
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const cleanFileName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${cleanFileName}`);
  },
});

// File filter: allow images (jpeg, jpg, png) and videos (mp4, mov, avi, mkv, webm)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png/;
  const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidImage = allowedImageTypes.test(ext);
  const isValidVideo = allowedVideoTypes.test(ext);

  if (isValidImage || isValidVideo) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG images and MP4, MOV, AVI, MKV, WEBM videos are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

module.exports = upload;

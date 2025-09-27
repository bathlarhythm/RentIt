// utils/cloudinaryStorage.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require("multer");


cloudinary.config({
  cloud_name: 'dtzhgkngd',
  api_key: '655193593557158',
  api_secret: 'efwWSFOOr2SHiDK6bTtbRFp4UzE',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rentkro_items',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

module.exports = { cloudinary, storage };

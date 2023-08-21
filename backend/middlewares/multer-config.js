/* eslint-disable */

const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images"); // Set the destination directory for uploaded files
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_"); // Replace spaces in the filename with underscores
    const extension = MIME_TYPES[file.mimetype]; // Get the file extension from the mime types
    callback(null, name + "_" + Date.now() + "." + extension); // Construct the final filename
  },
});

module.exports = multer({ storage }).single("image");

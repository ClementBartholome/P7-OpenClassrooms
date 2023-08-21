/* eslint-disable */

const sharp = require("sharp");
const fs = require("fs");

const sharpConfig = async (req, res, next) => {
  if (!req.file) {
    return next(); // If no file is uploaded, continue to the next middleware
  }

  // Get the original filename without extension
  const fileName = req.file.filename.split(".")[0];

  // Define the new path for the optimized image in WebP format
  const newPath = `${req.file.destination}/${fileName}.webp`;

  try {
    await sharp(req.file.path)
      .resize({ width: 400, height: 500, fit: sharp.fit.inside }) // Resize the image while maintaining aspect ratio
      .webp() // Convert the image to WebP format
      .toFile(newPath); // Save the optimized image to the new path

    // Delete the original image file
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting the original image:", err);
      }
    });

    // Update the request file path and filename to the optimized image
    req.file.path = newPath;
    req.file.filename = `${fileName}.webp`;

    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to optimize the image" });
  }
};

module.exports = sharpConfig;

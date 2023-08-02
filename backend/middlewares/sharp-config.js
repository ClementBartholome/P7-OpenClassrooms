/* eslint-disable */

const sharp = require("sharp");
const fs = require("fs");

const sharpConfig = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const fileName = req.file.filename.split(".")[0];
  const newPath = `${req.file.destination}/${fileName}.webp`;

  try {
    await sharp(req.file.path)
      .resize({ width: 400, height: 500, fit: sharp.fit.inside })
      .webp()
      .toFile(newPath);

  
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting the original image:", err);
      }
    });

   
    req.file.path = newPath;
    req.file.filename = `${fileName}.webp`;

    next();
  } catch (error) {
    res.status(500).json({ error: "Failed to optimize the image" });
  }
};

module.exports = sharpConfig;


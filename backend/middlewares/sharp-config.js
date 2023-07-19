/* eslint-disable */

const sharp = require("sharp");
const fs = require("fs");

const sharpConfig = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  const fileName = req.file.filename.split(".")[0];
  try {
    await sharp(req.file.path)
      .resize({ width: 400, height: 500, fit: sharp.fit.inside })
      .webp()
      .toFormat("webp")
      .toFile(`${req.file.destination}/${fileName}.webp`);

    // Delete the original image
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(
          "Erreur lors de la suppression de l'image d'origine :",
          err
        );
      }
    });

    next();
  } catch (error) {
    res.status(500).json({ error: "Impossible d'optimiser l'image" });
  }
};

module.exports = sharpConfig;

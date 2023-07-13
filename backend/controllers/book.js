/* eslint-disable */

const Book = require("../models/book");
const fs = require("fs");

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getSingleBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(401).json({ error }));
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename.split(".")[0]
    }.webp`,
    averageRating: bookObject.ratings[0].grade,
  });
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré!" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.updateBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        // If a file is uploaded, construct the book object with the new image URL
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename.split(".")[0]
        }.webp`,
      }
    : { ...req.body }; // Otherwise, use the existing book object from the request body
  delete bookObject._userId; // Remove the _userId property from the book object

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: unauthorized request" });
      } else if (req.file) {
        // If a new file is uploaded, delete the old image file
        const filename = book.imageUrl.split("/images")[1];
        fs.unlink(`images/${filename}`, () => {});
      }
      Book.updateOne(
        { _id: req.params.id }, // Update the book matching the ID
        { ...bookObject, _id: req.params.id } // Update with the new book object
      )
        .then(res.status(200).json({ message: "Livre modifié! " }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1]; // Extract the filename from the book's image URL
        fs.unlink(`images/${filename}`, () => {
          // Delete the corresponding image file from the filesystem
          Book.deleteOne({ _id: req.params.id }) // Delete the book from the database
            .then(() => {
              res.status(200).json({ message: "Livre supprimé!" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const user = req.body.userId;
  if (user !== req.auth.userId) {
    res.status(401).json({ message: "Non autorisé" });
  } else {
    Book.findOne({ _id: req.params.id }) // Find the book by ID
      .then((book) => {
        if (book.ratings.find((rating) => rating.userId === user)) {
          // Check if the user has already rated the book
          res.status(401).json({ message: "Livre déjà noté" });
        } else {
          const newRating = {
            // Create a newRating object
            userId: user,
            grade: req.body.rating,
            _id: req.body._id,
          };
          const updatedRatings = [...book.ratings, newRating];
          // Add the newRating to the existing ratings array

          function calcAverageRating(ratings) {
            // Calculate the average rating
            const sumRatings = ratings.reduce(
              (total, rate) => total + rate.grade,
              0
            );
            const average = sumRatings / ratings.length;
            return parseFloat(average.toFixed(2)); // Round the average to 2 decimal places
          }

          // Update the book document
          Book.findOneAndUpdate(
            { _id: req.params.id, "ratings.userId": { $ne: user } }, // Find the book with the given ID and ensure that the user has not already rated it
            // $ne = not equal
            {
              $push: { ratings: newRating }, // Add the new rating to the ratings array
              averageRating: calcAverageRating(updatedRatings), // Update the averageRating field
            },
            { new: true } // Return the updated book document
          )
            .then((updatedBook) => res.status(201).json(updatedBook))
            .catch((error) => res.status(401).json({ error }));
        }
      })
      .catch((error) => res.status(401).json({ error }));
  }
};

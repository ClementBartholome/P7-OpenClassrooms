/* eslint-disable */

const Book = require("../models/book");
const fs = require("fs");

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books)) // Respond with a JSON array of books
    .catch((error) => res.status(400).json({ error }));
};

exports.getSingleBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book)) // Respond with a JSON object representing the book
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Sort books by averageRating in descending order
    .limit(3) // Limit the response to 3 books
    .then((books) => res.status(200).json(books)) // Respond with a JSON array of best books
    .catch((error) => res.status(401).json({ error }));
};

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book); // Parse the book data from the request body
  // Remove unnecessary properties from the bookObject
  delete bookObject._id;
  delete bookObject._userId;

  // Create a new Book instance
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // Set the userId from authentication
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename.split(".")[0]
    }.webp`, // Construct the image URL
    averageRating: bookObject.ratings[0].grade, // Set initial averageRating
  });

  // Save the book to the database
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.updateBook = (req, res, next) => {
  // Construct the book object for update based on file upload status
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename.split(".")[0]
        }.webp`,
      }
    : { ...req.body };

  // Remove the _userId property from the book object
  delete bookObject._userId;

  // Find the book by ID and handle authorization
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "403: Unauthorized request" });
      } else if (req.file) {
        // If a new file is uploaded, delete the old image file
        const filename = book.imageUrl.split("/images")[1];
        fs.unlink(`images/${filename}`, () => {});
      }
      // Update the book
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      )
        .then(res.status(200).json({ message: "Livre modifié !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  // Find the book by ID and handle authorization
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Unauthorized" });
      } else {
        // Extract the filename from the book's image URL
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          // Delete the corresponding image file from the filesystem
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const user = req.body.userId;

  // Check user authorization
  if (user !== req.auth.userId) {
    res.status(401).json({ message: "Unauthorized" });
  } else {
    // Find the book by ID
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (book.ratings.find((rating) => rating.userId === user)) {
          // Check if the user has already rated the book
          res.status(401).json({ message: "Book already rated" });
        } else {
          // Create a new rating object
          const newRating = {
            userId: user,
            grade: req.body.rating,
            _id: req.body._id,
          };
          const updatedRatings = [...book.ratings, newRating]; // Add newRating to ratings array

          // Calculate the average rating
          function calcAverageRating(ratings) {
            const sumRatings = ratings.reduce(
              (total, rate) => total + rate.grade,
              0
            );
            const average = sumRatings / ratings.length;
            return parseFloat(average.toFixed(2)); // Round average to 2 decimal places
          }

          // Update the book document
          Book.findOneAndUpdate(
            {
              _id: req.params.id,
              "ratings.userId": { $ne: user },
            },
            {
              $push: { ratings: newRating },
              averageRating: calcAverageRating(updatedRatings),
            },
            { new: true }
          )
            .then((updatedBook) => res.status(201).json(updatedBook))
            .catch((error) => res.status(401).json({ error }));
        }
      })
      .catch((error) => res.status(401).json({ error }));
  }
};

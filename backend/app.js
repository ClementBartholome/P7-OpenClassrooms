/* eslint-disable */

const express = require("express");
const mongoose = require("mongoose");

const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");

const app = express();
mongoose
  .connect(
    "mongodb+srv://clementoss:T6yeefjbw!@cluster0.7mhz3ve.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// app.use("/api/books", (req, res, next) => {
//   const books = [
//     {
//       userId: "oeihfzeoi",
//       title: "La Lumière des Jedi",
//       author: "Charles Soule",
//       imageUrl:
//         "https://cdn1.booknode.com/book_cover/1444/star_wars_la_haute_republique_la_lumiere_des_jedi_tome_1-1444430-264-432.jpg",
//       year: 2020,
//       genre: "Science-fiction",
//       ratings: [
//         {
//           userId: "qsomihvqios",
//           grade: 5,
//         },
//       ],
//       averageRating: 5,
//     },
//     {
//       userId: "oeihfzeoi",
//       title: "En pleine ténèbres",
//       author: "Claudia Grey",
//       imageUrl:
//         "https://cdn1.booknode.com/book_cover/1457/star_wars_la_haute_republique_en_pleines_tenebres_tome_1-1456671-264-432.jpg",
//       year: 2021,
//       genre: "Science-fiction",
//       ratings: [
//         {
//           userId: "qsomihvqios",
//           grade: 4,
//         },
//       ],
//       averageRating: 4,
//     },
//   ];
//   res.status(200).json(books);
// });

app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;

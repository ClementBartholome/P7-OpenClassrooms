/* eslint-disable */

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const helmet = require("helmet");

const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");

require("dotenv").config(); // Load environment variables from .env file

const app = express(); // Create an express app

// Apply content security policies using helmet middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      imgSrc: ["'self'"], // Allow loading images from 'self'
    },
  })
);

app.use(express.json()); // Parse JSON request bodies

mongoose
  .connect(
    // Connect to MongoDB using environment variables
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use((req, res, next) => {
  // Set CORS headers to allow cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
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

app.use("/api/books", bookRoutes); // Use book routes for /api/books endpoint
app.use("/api/auth", userRoutes); // Use user routes for /api/auth endpoint

// Serve images statically from the /images route
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;

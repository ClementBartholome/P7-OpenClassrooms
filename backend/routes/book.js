/* eslint-disable*/
const express = require("express");

const router = express.Router();

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBooks);
router.get("/:id", bookCtrl.getSingleBook);

module.exports = router;

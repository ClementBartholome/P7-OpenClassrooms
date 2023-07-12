/* eslint-disable*/
const express = require("express");

const router = express.Router();

const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBooks);
router.get("/:id", bookCtrl.getSingleBook);
router.post("/", auth, multer, bookCtrl.createBook);
router.put("/:id", auth, multer, bookCtrl.updateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;

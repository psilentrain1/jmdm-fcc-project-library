/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const mongoose = require("mongoose");

mongoose.connect(process.env.DB);

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  commentcount: { type: Number, default: 0 },
  comments: [String],
});

const Book = mongoose.model("Book", bookSchema);

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      const books = await Book.find({}, "_id title commentcount");
      if (books.length === 0) return res.status(204).send("No books found");
      res.json(books);
    })

    .post(async function (req, res) {
      const title = req.body.title;
      if (!title || title === "") return res.status(200).send("missing required field title");
      const newBook = new Book({ title: title });
      try {
        const savedBook = await newBook.save();
        res.status(201).json({ _id: savedBook._id, title: savedBook.title });
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .delete(async function (req, res) {
      try {
        const deletedBooks = await Book.deleteMany({});
        if (deletedBooks.deletedCount === 0) return res.status(200).send("no books exist");
        res.status(200).send("complete delete successful");
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });

  app
    .route("/api/books/:id")
    .get(async function (req, res) {
      const bookid = req.params.id;
      const book = await Book.findById(bookid, "_id title comments");
      if (!book) return res.status(200).send("no book exists");
      res.json(book);
    })

    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      const book = await Book.findById(bookid);
      if (!book) return res.status(200).send("no book exists");
      if (!comment || comment === "") return res.status(200).send("missing required field comment");
      book.comments.push(comment);
      book.commentcount = book.comments.length;
      try {
        const savedBook = await book.save();
        res.status(200).json({ _id: savedBook._id, title: savedBook.title, comments: savedBook.comments });
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .delete(async function (req, res) {
      const bookid = req.params.id;
      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) return res.status(200).send("no book exists");
        res.status(200).send("delete successful");
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });
};

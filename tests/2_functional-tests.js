/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(res.body[0], "commentcount", "Books in array should contain commentcount");
        assert.property(res.body[0], "title", "Books in array should contain title");
        assert.property(res.body[0], "_id", "Books in array should contain _id");
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function () {
    let bookId;
    const invalidId = "123456789012345678901234";

    suite("POST /api/books with title => create book object/expect book object", function () {
      test("Test POST /api/books with title", function (done) {
        chai
          .request(server)
          .keepOpen()
          .post("/api/books")
          .send({ title: "Mocha Chai for Dummies" })
          .end(function (err, res) {
            assert.equal(res.status, 201);
            assert.property(res.body, "_id", "Book should contain _id");
            assert.property(res.body, "title", "Book should contain title");
            assert.equal(res.body.title, "Mocha Chai for Dummies", "Book title should match");
            bookId = res.body._id;
            done();
          });
      });

      test("Test POST /api/books with no title given", function (done) {
        chai
          .request(server)
          .keepOpen()
          .post("/api/books")
          .send({ title: "" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "missing required field title");
            done();
          });
      });
    });

    suite("GET /api/books => array of books", function () {
      test("Test GET /api/books", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get("/api/books")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, "response should be an array");
            assert.property(res.body[0], "_id", "Books should contain _id");
            assert.property(res.body[0], "title", "Books should contain title");
            assert.property(res.body[0], "commentcount", "Books should contain commentcount");
            done();
          });
      });
    });

    suite("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get(`/api/books/${invalidId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .get(`/api/books/${bookId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, bookId, "Book id should match");
            assert.property(res.body, "title", "Book should contain title");
            assert.property(res.body, "comments", "Book should contain comments");
            assert.isArray(res.body.comments, "Comments should be an array");
            done();
          });
      });
    });

    suite("POST /api/books/[id] => add comment/expect book object with id", function () {
      test("Test POST /api/books/[id] with comment", function (done) {
        chai
          .request(server)
          .keepOpen()
          .post(`/api/books/${bookId}`)
          .send({ comment: "I feel dumber after reading this." })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, "_id", "Book should contain _id");
            assert.property(res.body, "title", "Book should contain title");
            assert.property(res.body, "comments", "Book should contian comments");
            assert.isArray(res.body.comments, "Comments should be an array");
            assert.equal(res.body.comments[0], "I feel dumber after reading this.", "Comment should match");
            assert.equal(res.body._id, bookId, "Book id should match");
            done();
          });
      });

      test("Test POST /api/books/[id] without comment field", function (done) {
        chai
          .request(server)
          .keepOpen()
          .post(`/api/books/${bookId}`)
          .send({ comment: "" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "missing required field comment");
            done();
          });
      });

      test("Test POST /api/books/[id] with comment, id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .post(`/api/books/${invalidId}`)
          .send({ comment: "This isn't the Mocha Chai I was thinking of." })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });

    suite("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .delete(`/api/books/${bookId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "delete successful");
            done();
          });
      });

      test("Test DELETE /api/books/[id] with id not in db", function (done) {
        chai
          .request(server)
          .keepOpen()
          .delete(`/api/books/${invalidId}`)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "no book exists");
            done();
          });
      });
    });
  });
});

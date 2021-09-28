require("dotenv").config();

//Frame work
const express = require("express");
const mongoose = require("mongoose");

//Database
const database = require("./databases/index");

//Models
const BookModel = require("./databases/book");
const AuthorModel = require("./databases/author");
const PublicationModel = require("./databases/publication");

//Initializing  express
const shapeAI = express();

//configurations
shapeAI.use(express.json());

// Establish Database connection
mongoose.connect(process.env.MONGO_URL,)
.then(() => console.log("connection establish!!!!!"));

/*
Route           /
Description    get all books
Access         PUBLIC
Parameters     NONE
Method         GET
*/
shapeAI.get("/", async (req, res) => {
   const getAllBooks = await BookModel.find();
   return res.json(getAllBooks);
});

/*
Route           /is
Description    get specific book based on ISBN
Access         PUBLIC
Parameters     isbn
Method         GET
*/

shapeAI.get("/is/:isbn", async (req, res) => {
   const getSpecificBook = await BookModel.findOne({ ISBN: req.params.isbn});

   if (!getSpecificBook) {
      return res.json({
         error: `No book found for the ISBN of ${req.params.isbn}`,
      });
   }

   return res.json({ book: getSpecificBook });
});

/*
Route           /c
Description    get specific book based on category
Access         PUBLIC
Parameters     category
Method         GET
*/

shapeAI.get("/c/:category", async (req, res) => {
   const getSpecificBooks = await BookModel.findOne({category: req.params.category})

   if (!getSpecificBooks) {
      return res.json({
         error: `No book found for the category of ${req.params.category}`,
      });
   }

   return res.json({ books: getSpecificBooks });
});

/*
Route           /a
Description    get specific book based on author
Access         PUBLIC
Parameters     author
Method         GET
*/
shapeAI.get("/a/:authors", (req, res) => {
   const getSpecificBooks = database.books.filter((book) =>
      book.authors.includes(req.params.authors)
   );

   if (getSpecificBooks.length === 0) {
      return res.json({
         error: `No book found for the author of ${req.params.authors}`,
      });
   }

   return res.json({ books: getSpecificBooks });
});

/*
Route           /author
Description    get all authors
Access         PUBLIC
Parameters     author
Method         GET
*/

shapeAI.get("/author", async (req, res) => {
   const getAllAuthors = await AuthorModel.find();
   return res.json({ authors: getAllAuthors });
});

/*
Route           /author
Description    get specific author
Access         PUBLIC
Parameters     id
Method         GET
*/

shapeAI.get("/author/is/:id", (req, res) => {
   const getSpecificAuthor = database.authors.filter((author) =>
      author.id == req.params.id
   );

   if (getSpecificAuthor.length === 0) {
      return res.json({
         error: `No author found for id ${req.params.id}`,
      });
   }

   return res.json({ authors: getSpecificAuthor });

})


/*
Route           /author
Description    get a list of all authors based on a book's isbn
Access         PUBLIC
Parameters     isbn
Method         GET
*/
shapeAI.get("/author/:isbn", (req, res) => {
   const getSpecificAuthors = database.authors.filter((authors) =>
      authors.books.includes(req.params.isbn)
   );

   if (getSpecificAuthors.length === 0) {
      return res.json({
         error: `No author found for the book ${req.params.isbn}`,
      });
   }

   return res.json({ authors: getSpecificAuthors });
});

/*
Route           /publications
Description    get all publications
Access         PUBLIC
Parameters     NONE
Method         GET
*/

shapeAI.get("/publications", (req, res) => {
   return res.json({ publications: database.publications });
});

/*
Route           /publications
Description    get specific publication
Access         PUBLIC
Parameters     id
Method         GET
*/
shapeAI.get("/publications/is/:id", (req, res) => {
   const getSpecificPublication = database.publications.filter((publications) =>
      publications.id == req.params.id
   );

   if (getSpecificPublication.length === 0) {
      return res.json({
         error: `No publication found for id ${req.params.id}`,
      });
   }

   return res.json({ publications: getSpecificPublication });

});

/*
Route           /publications
Description    get a list of all publications based on a book's isbn
Access         PUBLIC
Parameters     isbn
Method         GET
*/
shapeAI.get("/publications/:isbn", (req, res) => {
   const getSpecificPublications = database.publications.filter((publication) =>
      publication.books.includes(req.params.isbn)
   );

   if (getSpecificPublications.length === 0) {
      return res.json({
         error: `No publication found for the book ${req.params.isbn}`,
      });
   }

   return res.json({ publications: getSpecificPublications });
});

/*
Route           /book/new
Description    add new book
Access         PUBLIC
Parameters     NONE
Method         POST
*/
shapeAI.post("/book/new", async (req, res) => {
   const { newBook } = req.body;
   const addNewBook = BookModel.create(newBook);

   return res.json({ books: addNewBook, message: "book was added!" });
});

/*
Route           /author/new
Description    add new author
Access         PUBLIC
Parameters     NONE
Method         POST
*/
shapeAI.post("/author/new", (req, res) => {
   const { newAuthor } = req.body;
   
   AuthorModel.create(newAuthor);
   return res.json({ message: "author was added" });
})

/*
Route           /publication/new
Description    add new publication
Access         PUBLIC
Parameters     NONE
Method         POST
*/
shapeAI.post("/publication/new", (req, res) => {
   const { newPublication } = req.body;
   PublicationModel.create(newPublication);

   return res.json({ message: "publication was added" });
})

/*
Route           /book/update
Description    update title of a book
Access         PUBLIC
Parameters     isbn
Method         PUT
*/
shapeAI.put("/book/update/:isbn", async (req, res) => {
   
   const updateBook = await BookModel.findOneAndUpdate(
      {
         ISBN: req.params.isbn,
      },
      {
         title: req.body.bookTitle,
      },
      {
         new: true,
      }
   );
   return res.json({ books: updateBook });
});

/*
Route           /book/author/update
Description    update/add new author
Access         PUBLIC
Parameters     isbn
Method         PUT
*/
shapeAI.put(" /book/author/update/:isbn", (req, res) => {
   // update the book database
   database.books.forEach((book) => {
      if (book.ISBN === req.params.isbn) {
         return book.authors.push(req.body.newAuthor);
      }
   });

   //update the author database
   database.authors.forEach((author) => {
      if (author.id === req.body.newAuthor) {
         return author.books.push(req.params.isbn);
      }
   });

   return res.json({
      books: database.books,
      authors: database.authors,
      message: "author was added",
   });
});

/*
Route           /publication/update/book
Description    update/add new book to a publication
Access         PUBLIC
Parameters     isbn
Method         PUT
*/
shapeAI.put("/publication/update/book/:isbn", (req, res) => {
   // update the publication database
   database.publications.forEach((publication) => {
      if (publication.id === req.body.pubId) {
         return publication.books.push(req.params.isbn);
      }
   });

   // update the book database
   database.books.forEach((book) => {
      if (book.ISBN === req.params.isbn) {
         book.publication = req.body.pubId;
         return;
      }
   });

   return res.json({
      books: database.books,
      publications: database.publications,
      message: "Successfully updated publication",
   });
});

/*
Route           /book/delete
Description    delete a book
Access         PUBLIC
Parameters     isbn
Method         DELETE
*/
shapeAI.delete("/book/delete/:isbn", (req, res) => {
   const updatedBookDatabase = database.books.filter((book) =>
      book.ISBN !== req.params.isbn
   );

   database.books = updatedBookDatabase;
   return res.json({ books: database.books });
});

/*
Route           /book/delete/author
Description    delete a author from the book
Access         PUBLIC
Parameters     isbn, author id
Method         DELETE
*/
shapeAI.delete("/book/delete/author/:isbn/:authorId", (req, res) => {

   //update the book database
   database.books.forEach((book) => {
      if (book.ISBN === req.params.isbn) {
         const newAuthorList = book.authors.filter(
            (author) => author !== parseInt(req.params.authorId)
         );
         book.authors = newAuthorList;
         return;
      }
   });

   //update the author database
   database.authors.forEach((author) => {
      if (author.id === parseInt(req.params.authorId)) {
         const newBookList = author.books.filter(
            (book) => book !== req.params.isbn
         );

         author.books = newBookList;
         return;
      }
   });

   return res.json({
      book: database.books,
      author: database.authors,
   });
});

/*
Route           /author/delete
Description    delete an author
Access         PUBLIC
Parameters     id
Method         DELETE
*/
shapeAI.delete("/author/delete/:id", (req, res) => {
   const updatedAuthorDatabase = database.authors.filter((author) =>
      author.id !== parseInt(req.params.id)
   );

   database.authors = updatedAuthorDatabase;
   return res.json({ authors: database.authors });
});

/*
Route           /publication/delete
Description    delete a publication
Access         PUBLIC
Parameters     id
Method         DELETE
*/
shapeAI.delete("/publication/delete/:id", (req, res) => {
   const updatedPublicationDatabase = database.publications.filter((publication) =>
      publication.id !== parseInt(req.params.id)
   );

   database.publications = updatedPublicationDatabase;
   return res.json({ publications: database.publications });
});

/*
Route           /book/delete/publication
Description    delete a publication from the book
Access         PUBLIC
Parameters     isbn, publication id
Method         DELETE
*/
shapeAI.delete("/publication/delete/book/:isbn/:pubId", (req, res) => {
   // update publication database
   database.publications.forEach((publication) => {
      if (publication.id === parseInt(req.params.pubId)) {
         const newBooksList = publication.books.filter(
            (book) => book !== req.params.isbn
         );

         publication.books = newBooksList;
         return;
      }
   });

   // update book databse
   database.books.forEach((book) => {
      if (book.ISBN === req.params.isbn) {
         book.publication = 0;
         return;
      }
   });

   return res.json({
      books: database.books,
      publications: database.publications,
   })
});

shapeAI.listen(3000, () => console.log("Server is running!!"));
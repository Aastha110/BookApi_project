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
shapeAI.get("/a/:id", async (req, res) => {
   const getSpecificBooks = await BookModel.findOne({author: parseInt(req.params.authors)})

   if (!getSpecificBooks) {
      return res.json({
         error: `No book found for the author of ${parseInt(req.params.authors)}`,
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

shapeAI.get("/author/is/:id", async (req, res) => {
   const getSpecificAuthor = await AuthorModel.findOne({id : req.params.id})

   if (!getSpecificAuthor) {
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
shapeAI.get("/author/:isbn", async (req, res) => {
   const getSpecificAuthor = await AuthorModel.findOne({ books: req.params.isbn });
   if (!getSpecificAuthor) {
      return res.json({
         error: `No author found for the book ${req.params.isbn}`,
      });
   }

   return res.json({ authors: getSpecificAuthor });
});

/*
Route           /publications
Description    get all publications
Access         PUBLIC
Parameters     NONE
Method         GET
*/

shapeAI.get("/publications", async (req, res) => {
   const getAllPublications = await PublicationModel.find();
   return res.json({ authors: getAllPublications });
});

/*
Route           /publications
Description    get specific publication
Access         PUBLIC
Parameters     id
Method         GET
*/
shapeAI.get("/publications/is/:id", async (req, res) => {
   const getSpecificPublication = await PublicationModel.findOne({ id: req.params.id})

   if ( !getSpecificPublication ) {
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
shapeAI.get("/publications/:isbn",async (req, res) => {
   const getSpecificPublications = await PublicationModel.findOne({ books : req.params.isbn })

   if (!getSpecificPublications) {
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
shapeAI.post("/author/new", async(req, res) => {
   const { newAuthor } = req.body;
   
   AuthorModel.create(newAuthor);
   return res.json({ message: "author was added !" });
});

/*
Route           /publication/new
Description    add new publication
Access         PUBLIC
Parameters     NONE
Method         POST
*/
shapeAI.post("/publication/new", async (req, res) => {
   const { newPublication } = req.body;
   PublicationModel.create(newPublication);
    return res.json({ message: "new publication is added!" });
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
shapeAI.put("/book/author/update/:isbn", async (req, res) => {
   // update the book database
   const updatedBook = await BookModel.findOneAndUpdate(
      {
         ISBN: req.params.isbn,
      },
      {
         $addToSet:{
            authors: req.body.newAuthor,
         },
      },
      {
         new: true,
      }
   )
   //update the author database
   const updatedAuthor = await AuthorModel.findOneAndUpdate(
      {
         id: req.body.newAuthor,
      },
      {
         $addToSet: {
            books: req.params.isbn,
         },
      },
      {
         new: true,
      }
   )

   return res.json({
      books: updatedBook,
      authors: updatedAuthor,
      message: "New author was added",
   });
});

/*
Route         /author/update/name/
Description   Update author name
Access        Public
Parameter     id
Methods       PUT
*/
Router.put("/update/name/:id", async (req, res) => {

   const updatedAuthor = await AuthorModel.findOneAndUpdate(
     {
       id: req.params.id,
     },
     {
       name: req.body.newAuthorName,
     },
     {
       new: true,
     }
   );
   return res.json({ author: updatedAuthor });
});

/*
Route         /publication/update/name/
Description   Update the publication name
Access        Public
Parameter     id
Methods       PUT
*/

shapeAI.put("/publication/update/:name", async (req, res) => {
   const updatedPublication = await PublicationModel.findOneAndUpdate(
      {
        id: req.params.id,
      },
      {
        name: req.body.newPublicationName,
      },
      {
        new: true,
      }
    );
  
    return res.json({ publication: updatedPublication });
})

/*
Route           /publication/update/book
Description    update/add new book to a publication
Access         PUBLIC
Parameters     isbn
Method         PUT
*/
shapeAI.put("/publication/update/book/:isbn", async (req, res) => {
   // update the publication database
   const updatedPublication = await PublicationModel.findOneAndUpdate(
      {
        id: req.body.pubId,
      },
      {
        $addToSet: {
          books: req.params.isbn,
        }
      },
      {
        new: true,
      }
    );

   // update the book database
   const updatedBook = await BookModel.findOneAndUpdate(
      {
        ISBN: req.params.isbn,
      },
      {
        $addToSet: {
          publication: req.body.pubId,
        }
      },
      {
        new: true,
      },
    );

   return res.json({
      books: updatedBook,
      publications: updatedPublication,
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
shapeAI.delete("/book/delete/:isbn", async (req, res) => {
   
   const updatedBookDatabase = await BookModel.findOneAndDelete({
      ISBN: req.params.isbn,
   });
   return res.json({ books: updatedBookDatabase });
});

/*
Route           /book/delete/author
Description    delete a author from the book
Access         PUBLIC
Parameters     isbn, author id
Method         DELETE
*/
shapeAI.delete("/book/delete/author/:isbn/:authorId", async (req, res) => {

   //update the book database
   const updateBook = await BookModel.findOneAndUpdate({
      ISBN: req.params.isbn,
   },
   {
      $pull: {
         authors: parseInt(req.params.authorId),
      },
   },
   {
      new: true,
   });

   //update the author database
   const updatedAuthor = await AuthorModel.findOneAndUpdate({
      id: parseInt(req.params.authorId),
   },
   {
      $pull: {
         books: req.params.isbn,
      },
   },
   {
      new: true
   }) 

   return res.json({
      book: updateBook,
      author: updatedAuthor,
   });
});

/*
Route           /author/delete
Description    delete an author
Access         PUBLIC
Parameters     id
Method         DELETE
*/
shapeAI.delete("/author/delete/:id", async(req, res) => {
   const updatedAuthorDatabase = await AuthorModel.findOneAndDelete({
         id: req.params.id
   })
   return res.json({ authors: updatedAuthorDatabase });
});

/*
Route           /publication/delete
Description    delete a publication
Access         PUBLIC
Parameters     id
Method         DELETE
*/
shapeAI.delete("/publication/delete/:id", async (req, res) => {
   const updatedPublicationDatabase = await PublicationModel.findOneAndDelete({
      id: req.params.id
   })
   return res.json({ publications: updatedPublicationDatabase });
});

/*
Route           /book/delete/publication
Description    delete a publication from the book
Access         PUBLIC
Parameters     isbn, publication id
Method         DELETE
*/
shapeAI.delete("/publication/delete/book/:isbn/:pubId", async (req, res) => {
   // update publication database
   const updatedPublication = await PublicationModel.findOneAndUpdate(
      {
        id: parseInt(req.params.pubId),
      },
      {
        $pull: {
          books: req.params.isbn,
        }
      },
      {
        new: true,
      }
    );

   // update book databse
   const updatedBook = await BookModel.findOneAndUpdate(
      {
        ISBN: req.params.isbn,
      },
      {
          publication: parseInt(req.params.pubId),
      },
      {
        new: true,
      },
    );

   return res.json({
      books: updatedBook,
      publications: updatedPublication,
   })
});

shapeAI.listen(3000, () => console.log("Server is running!!"));
/**
 * Sub-router for Books
 */

const express = require("express");
const router = express.Router();
const con = require("../dbCon");
const bodyParser = require("body-parser");

// Make sure that each router is using a middleware.
// The middleware enable the usage of json define.

router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// Regex for validating that price must be
// 1. a valid number
// 2. With at most 2 decimal places.
const regex_1 = /^\d+\.\d{2}$/;

// Regex for validating that quantity should not have decimal.
const regex_2 = /^\d+$/;

/**
 * Retrieve Book endpoint:
 *
 * Description: return a book given its ISBN.
 * Both endpoints shall produce the same response.
 */

router.get(["/isbn/:isbn", "/:isbn"], async function (req, res) {
  const isbn = req.params.isbn || req.params.ISBN;
  console.log(`GET /api/books/isbn - ${isbn}`);

    // Generate SQL and run the script
    var sql = `SELECT * FROM Book WHERE ISBN = '${isbn}'`;
    con.query(sql, function (err, result) {
      if (err) {
        throw err;
      }

      // Accessing the length of the result.
      // Check isbn exist in the database
      let existNum = Object.keys(result).length;

      // Book Found
      if (result && existNum > 0) {
        // Stringify the result value -> string
        console.log(`Book found: ${JSON.stringify(result, null, 4)}`);

        // Return 200, string -> json response
        res.status(200).send(result[0]);
        return;
      } else {
        res.status(404).send({ message : "No such ISBN" });
        return;
      }
    });
});

/**
 * Retrieve ALL OF THE BOOKS endpoint:
 *
 * Description: return all the books in the database
 */
// router.get("/", async function (req, res) {
//   console.log("GET /api/books/ - Retrieve all books");

//   try {
//     // Generate SQL and run the script
//     var sql = "SELECT * FROM Book";
//     con.query(sql, function (err, result) {
//       if (err) {
//         throw err;
//       }
//       // Stringify the result value -> string (convert by JSON.stringify)
//       console.log(`All books" + ${JSON.stringify(result, null, 4)}`);
//       // Return 200, string -> json response
//       res.status(200).json(result);
//     });
//   } catch (e) {
//     res.sendStatus(404);
//   }
// });

/**
 * Add Book end point:
 *
 * Description: Add a book to the system.
 * The ISBN will be the unique identifier for the book.
 * The book is added to the Book data table on MySql (the ISBN is the primary key).
 */

router.post("/", async function (req, res) {
  console.log("POST /api/books/ - Adding a new book");

  // const bookInfo = JSON.stringify(req.body);
  console.log(req.body); // testing

  const { ISBN, title, Author, description, genre, price, quantity } = req.body;
    // All fields in the request body are mandatory
    // Check number validation
    if (
      !ISBN ||
      !title ||
      !Author ||
      !description ||
      !genre ||
      !price ||
      !quantity
    ) {
      res.status(400);
      res.send({"message" : "Fields lost!"});

      // Recommend to place a return statement after the res.send call
      // to make your function stop executing further.
      return;
    } else if (!regex_1.test(req.body.price)) {
      res.status(400);
      res.send({message : "price need a number with 2 decimals!"});
      return;
    } else if (!regex_2.test(req.body.quantity)) {
      res.status(400);
      res.send({message : "quantity must be integer!"});
      return;
    } else {
      // Check whether this book already exist
    var sql_1 = `SELECT * FROM Book WHERE ISBN = '${req.body.ISBN}'`;
    con.query(sql_1, function (err, result) {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          res.status(422).send({ message: "This ISBN already exists in the system." });
        } else {
          throw err;
        }
      }
      // accessing the Result = [RawDataPacket]
      // Using result[0], result[1]...
      // https://stackoverflow.com/questions/38133084/how-to-access-rowdatapacket-mysql-node-js

      // Accessing the length of the result.
      // Check ISBN already exist in the database
      let existNum = Object.keys(result).length;

      // If ISBN already exist
      if (existNum > 0) {
        res
          .status(422)
          .json({ message: "This ISBN already exists in the system." });
        return;
      } else {
        // Insert into Database
        var sql_2 = `INSERT INTO Book
        (ISBN, title, author, description, genre, price, quantity)
        VALUES
        ('${ISBN}', '${title}', '${Author}',
        '${description}', '${genre}', ${price}, ${quantity});
        `;
        con.query(sql_2, function (err) {
          if (err) {
            console.log("Error: " + err.message);
          }
        });

        // Successfully created.
        res.status(201).send({
                  ISBN,
                  title,
                  Author,
                  description,
                  genre,
                  price: parseFloat(price),
                  quantity
        });
      }
    });

    }
});

/**
 * Update Book endpoint:
 *
 * Description: Update a book’s information in the system.
 * The ISBN will be the unique identifier for the book.
 */

router.put("/:isbn", async function (req, res) {
  console.log("PUT /api/books/isbn - Updating a book");

  // const bookInfo = JSON.stringify(req.body);
  console.log(req.body); // testing

  const { ISBN, title, Author, description, genre, price, quantity } = req.body;

  try {
    // All fields in the request body are mandatory
    // Check number validation
    if (
      !ISBN ||
      !title ||
      !Author ||
      !description ||
      !genre ||
      !price ||
      !quantity
    ) {
      res.status(400);
      res.send({message : "Bad Request! Attribute lost or format unmatched!"});

      // Recommend to place a return statement after the res.send call
      // to make your function stop executing further.
      return;
    }  else if (!regex_1.test(req.body.price)) {
      res.status(400);
      res.send({message : "price need a number with 2 decimals!"});
      return;
    } else if (!regex_2.test(req.body.quantity)) {
      res.status(400);
      res.send({message : "quantity must be integer!"});
      return;
    } else {
      // Check whether this book already exist
    var sql_1 = `SELECT * FROM Book WHERE ISBN = '${ISBN}'`;
    con.query(sql_1, function (err, result) {
      if (err) {
        console.log("Error: " + err.message);
      }

      // Accessing the length of the result.
      // Check if ISBN already exist in the database
      let existNum = Object.keys(result).length;

      // If ISBN exist
      if (existNum > 0) {
        // Update Specific Row
        var sql_2 = `UPDATE Book
            SET title = '${title}',
            Author = '${Author}',
            description = '${description}',
            genre = '${genre}',
            price = ${price},
            quantity = ${quantity}
            WHERE ISBN = '${ISBN}';
          `;
        con.query(sql_2, function (err) {
          if (err) {
            console.log("Error: " + err.message);
            res.status(404).json({ message: err.message });
          }
        });

        // Successfully created.
        res.status(200).json(req.body);
        return;
      } else {
        // No such book, fail to update
        res.status(404).json({ message: "ISBN not found." });
        return;
      }
    });
    }
  } catch (e) {
    res.status(400);
    res.json("Request Failed!");
  }
});

module.exports = router;

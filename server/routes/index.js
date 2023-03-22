// Index Page router
const express = require("express");
const router = express.Router();

// Import database
const con = require("../dbCon");

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("GET /api/index - Welcome to index page! ");
  res.render("index", { title: "Server" });
});

module.exports = router;
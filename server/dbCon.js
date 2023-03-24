// Database import
const mysql = require("mysql");

// Database Connection
let con = mysql.createConnection({
  host: "mydatabase-instance-1.cym2r8bxxstg.us-east-1.rds.amazonaws.com",
  user: "ljx02263",
  port: 3306,
  password: "qq1298508511",
  database: "db_app",
});

// Connect
con.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to the MySQL server: " + con.config.host);
});

module.exports = con;

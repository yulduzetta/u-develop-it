const express = require("express");
const { reset } = require("yargs");
const PORT = process.env.PORT || 5006;
const app = express();
const sqlite3 = require("sqlite3").verbose();

// Expess middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to DB needs
// Callback function informs us if there is an error in the connection.
const db = new sqlite3.Database("./db/election.db", (err) => {
  if (err) {
    return console.log(err.msg);
  }
  console.log("Connected to the election database.");
});

// 'all' method runs the SQL queryn and executes the callback
// with all the resulting rows, that match the query;
// once executed, the callback function captures the response from 2 variables:
// the err -- which is the error response, and the rows -- the db query response.
// if no errors, the err value is null.
// This method is a key component that allows sql commands to be written in a Node.js application.
// Query below returns an array of objects, with eachh object representing a row of the candidates table.
// GET all candidates
app.get("/api/candidates", (req, res) => {
  const sql = "SELECT * FROM candidates";
  const params = [];
  // 'all' retrieves all the rows
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// GET a single candidate
// If record not found, then undefined will be returned.
// If no errors, then err returns as null.
// Altho the request was outside the bounds of the candidates table, this was not considered an error.
app.get("/api/candidate/:id", (req, res) => {
  const sql = "SELECT * FROM candidates WHERE id = ?";
  const params = [req.params.id];

  // We're using the Database method get() to return a single row from the database call.
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "sucess",
      data: row,
    });
  });
});

// Delete a candidate
// 'run' -- executes the SQL but won't retrieve any result data, which will result into result being returned as undefined.
// '?' -- denotes a placeholder, making this a prepared statement which can be filled in dynamically with real values at runtime.
// additional param, '1', in this case provides values for prepared statement placeholders. For multiple values, you can pass array into it.
// ES5 function is used for the callback, which allows to take advantage of the db object that's returned in the callback function.
// 'this' will return Statement with the 3 properties:
// 1. SQL statment executed,
// 2. Primary key id thaat was inserted
// 3. Number of rows changes
app.delete("/api/candidate/:id", (req, res) => {
  const sql = "DELETE FROM candidates WHERE id = ?";
  params = [req.params.id];
  // The database call uses the ES5 function callback, to use the Statement object's changes property.
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.json({
      message: "sucessfully deleted",
      // this will verify whether any rows were changed.
      changes: this.changes,
    });
  });
});

// // CREATE a candidate
// const sql =
//   "INSERT INTO candidates (id, first_name, last_name, industry_connected) VALUES (?,?,?,?)";
// const params = [1, "Ronald", "Firbank", 1];
// //ES5 function, not arror function, to user 'this'
// db.run(sql, params, function (err, result) {
//   if (err) {
//     console.log(err);
//   }
//   console.log(result, this.lastID); // lastID displays the 'id' of the added
// });

// Default response for any other request (Not Found) Catch all
app.use((req, res) => {
  res.status(404).end();
});

// Ensure Express.js server does not start before the connnectio
db.on("open", () => {
  app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
  });
});

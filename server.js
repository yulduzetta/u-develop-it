const { resolveSoa } = require("dns");
const express = require("express");
const { reset } = require("yargs");
const PORT = process.env.PORT || 5006;
const app = express();
const sqlite3 = require("sqlite3").verbose();
const inputCheck = require("./utils/inputCheck");

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

/*CANDIDATES ROUTS START*/

// 'all' method runs the SQL queryn and executes the callback
// with all the resulting rows, that match the query;
// once executed, the callback function captures the response from 2 variables:
// the err -- which is the error response, and the rows -- the db query response.
// if no errors, the err value is null.
// This method is a key component that allows sql commands to be written in a Node.js application.
// Query below returns an array of objects, with eachh object representing a row of the candidates table.
// GET all candidates
app.get("/api/candidates", (req, res) => {
  const sql = `SELECT candidates.*, parties.name
  AS party_name
  FROM candidates
  LEFT JOIN parties
  ON candidates.party_id = parties.id;
  `;
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
  const sql = `SELECT candidates.*, parties.name
  AS party_name 
  FROM candidates 
  LEFT JOIN parties
  ON candidates.party_id = parties.id
  WHERE candidates.id = ?`;
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

// CREATE a candidate
// we're using object destructuring to pull the body property out of the request object.
app.post("/api/candidate", ({ body }, res) => {
  const errors = inputCheck(
    body,
    "first_name",
    "last_name",
    "industry_connected"
  );
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }

  const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
  VALUES (?,?,?)`;
  const params = [body.first_name, body.last_name, body.industry_connected];
  // ES5 function, not arrow function, to use 'this'
  // 'run' will execute the prepared SQL statement
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.msg });
      return;
    }

    res.json({
      message: "success",
      data: body,
      // 'this.lastID' returns the id of the inserted row
      id: this.lastID,
    });
  });
});

// This route might feel a little strange because we're using a parameter for the candidate's id (req.params.id),
// but the request body contains the party's id (req.body.party_id). Why mix the two?
// Again, we want to follow best practices for consistency and clarity.
// The affected row's id should always be part of the route (e.g., /api/candidate/2)
// while the actual fields we're updating should be part of the body.
app.put("/api/candidate/:id", (req, res) => {
  const errors = inputCheck(req.body, "party_id");

  // ensures party_id is defined in the request body
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  const sql = `UPDATE candidates SET party_id = ? WHERE id = ?`;
  const params = [req.body.party_id, req.params.id];

  // 'run' will execute the prepared SQL statement
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({
        error: err.message,
      });
      return;
    }

    res.json({
      message: "success",
      data: req.body,
      changes: this.changes,
    });
  });
});

/*CANDIDATES ROUTS END*/

/*PARTIES ROUTS START*/

app.get("/api/parties", (req, res) => {
  const sql = "SELECT * FROM parties";
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

app.get("/api/party/:id", (req, res) => {
  const sql = `SELECT * 
  FROM parties WHERE id = ?`;
  const params = [req.params.id];

  // We're using the Database method get() to return a single row from the database call.
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({
        error: err.msg,
      });
      return;
    }
    res.json({
      message: "succeess",
      data: row,
    });
  });
});

app.delete("/api/party/:id", (req, res) => {
  const sql = `DELETE FROM parties WHERE id = ?`;
  const params = [req.params.id];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "successfully deleted", changes: this.changes });
  });
});

/*PARTIES ROUTS END*/

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

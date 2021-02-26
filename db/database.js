const sqlite3 = require("sqlite3").verbose();

// Connect to DB needs
// Callback function informs us if there is an error in the connection.
const db = new sqlite3.Database("./db/election.db", (err) => {
  if (err) {
    return console.log(err.msg);
  }
  console.log("Connected to the election database.");
});

module.exports = db;
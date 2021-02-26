const express = require("express");
const router = express.Router();
const db = require("../../db/database");
const inputCheck = require("../../utils/inputCheck");
const { route } = require("./candidateRoutes");

/*PARTIES ROUTES START*/

router.get("/parties", (req, res) => {
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

router.get("/party/:id", (req, res) => {
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

router.delete("/party/:id", (req, res) => {
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

/*PARTIES ROUTES END*/

module.exports = router;
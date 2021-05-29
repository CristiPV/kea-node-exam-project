// Package: https://www.npmjs.com/package/mysql/*
const mysql = require("mysql");
require("dotenv").config();

console.log("\x1b[31m%s\x1b[0m", "mysql:\n", "* Setting up mysql...");

/**
 * A mysql connection pool with up to 10 connections.
 * 
 */
const pool = mysql.createPool({
  // AWS gives us 15 connections so we use 10 and leave 5 for debugging
  connectionLimit: 10,
  host: process.env.DB_HOST,
  database: process.env.DB_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

/**
 *
 * @param {Object} data
 */
function saveDrawingEntry(data) {
  pool.query(
    "INSERT INTO drawing VALUES(default, ?, ?, ?, ?, ?)",
    [data.artist, data.winner, data.time, data.drawing, data.draw_option_id],
    (error, result) => {
      if (error) throw error;
      console.log("* Affected rows: ", result.affectedRows);
    }
  );
}

module.exports = {
  pool,
  saveDrawingEntry,
};

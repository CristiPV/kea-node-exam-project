// https://www.npmjs.com/package/mysql/*
const mysql = require("mysql");
require('dotenv').config();

/*
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});
*/
console.log("Setting up mysql..");

const pool = mysql.createPool({
  // AWS gives us 15 connections so lets use 10 and leave 5 for debugging
  connectionLimit: 10,
  //insecureAuth: true,
  host      : process.env.DB_HOST,
  database  : process.env.DB_DB,
  user      : process.env.DB_USER,
  password  : process.env.DB_PASS,
});

pool.getConnection((error, connection) => {
  if (error) {
    console.error("Connection failed");
    throw error;
  }
  connection.query("SELECT * FROM draw_option", (error, result, fields) => {
    if (error) {
      console.error("Query failed.");
      throw error;
    }
    console.log(result);
    console.log(fields);
  });
  connection.release();
});
// Ping to test connection - only works on a live DB:
/*
pool.getConnection((error, connection) => {
if (error) {
  throw error;
}
connection.ping((error) => {
  if (error) {
    throw error;
  }
  console.log("Server responded to the ping!");
  pingPassed = true;
});
connection.release();
});
*/
// Only execute queries if ping succeeds
// pool.query does this behind the scenes:
// pool.getConnection->pool.connection.query->connection.release
/*
pool.query("SELECT * FROM draw_option", (error, result, fields) => {
  if (error) {
    console.log("query failed.");
    throw error;
  }

  console.log("result:", result);
  drawOptions = result;
  console.log("fields:", fields);
});
*/

// The other way to query: (it uses connection.escape() on the [] values)
// pool.query("SELECT * FROM draw_option WHERE id = ?", ["1"], (error, result, fields) => {
//   if (error) {
//     throw error;
//   }

//   console.log("result:", result);
//   console.log("fields", fields);
// });

// When you are done with the connections
// This sends the QUIT packet on all connections
/*
pool.end((error) => {
  if (error) {
    throw error;
  }
  // All connections are closed
  console.log("Connections closed.");
});
*/

module.exports = {
  pool,
};

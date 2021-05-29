// Package: https://www.npmjs.com/package/mysql/*
const mysql = require("mysql");
require("dotenv").config();

console.log(
  "\x1b[31m%s\x1b[0m",
  "mysql:\n",
  "* Setting up mysql..."
);

const pool = mysql.createPool({
  // AWS gives us 15 connections so we use 10 and leave 5 for debugging
  connectionLimit: 10,
  host: process.env.DB_HOST,
  database: process.env.DB_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

module.exports = {
  pool,
};

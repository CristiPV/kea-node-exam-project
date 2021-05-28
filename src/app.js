const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const http = require("http");
const { pool } = require("./mysql/mysql.js");
const dotenvConfig = dotenv.config();
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Files
const navbar = fs.readFileSync(
  __dirname + "/public/navbar/navbar.html"
);
const home = fs.readFileSync(__dirname + "/public/home/home.html");
const footer = fs.readFileSync(
  __dirname + "/public/footer/footer.html"
);

// DB query

/* Ideally i only return an array of items from the DB instead of querying it here
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
// Sockets
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // when someone submits chat
  socket.on("submitChat", (data) => {
    // Update everyone's chat
    io.emit("updateChat", data);
  });
});

// Routes
app.get("/", (req, res) => {
  res.send(navbar + home + footer);
});

// App server setup
const PORT = process.env.PORT || 3000;

const appServer = server.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  }

  if (dotenvConfig.error) {
    console.log(".env error:", dotenvConfig.error);
  }

  console.log("Server started on port:", appServer.address().port);
});

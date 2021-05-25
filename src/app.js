const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const http = require("http");
const dotenvConfig = dotenv.config();
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server);
app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Files
const navbar = fs.readFileSync(__dirname + "/public/navbar/navbar.html");
const home = fs.readFileSync(__dirname + "/public/home/home.html");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html");

let gameCanvas = null;

// Sockets
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.emit("updateCanvas", { canvas: gameCanvas });

  // when someone submits chat
  socket.on("submitChat", (data) => {
    // Update everyone's chat
    io.emit("updateChat", data);
  });

  // when someone starts painting
  socket.on("mouseDown", (data) => {
    // update everyone's context to match the painter's
    socket.broadcast.emit("updateContext", data);
  });

  // when someone moves the mouse
  socket.on("mouseMove", (data) => {
    // draw on everyone's canvas
    socket.broadcast.emit("emitDraw", data);
  });

  // when someone stops painting
  socket.on("mouseUp", (data) => {
    // update the server's drawing
    gameCanvas = data.canvas;
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

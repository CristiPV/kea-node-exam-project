const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const http = require("http");

const dotenvConfig = dotenv.config();
const app = express();
const server = http.createServer(app);

const socketService = require("./services/socket.js");
const io = socketService.start(server);
const gameService = require("./services/game.js");

app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Files
const navbar = fs.readFileSync(__dirname + "/public/navbar/navbar.html");
const home = fs.readFileSync(__dirname + "/public/home/home.html");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html");

// Sockets
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  console.log("artist:", gameService.artist.exists);
  if (!gameService.artist.exists && io.of("/").sockets.size >= 2) {
    gameService.artist.exists = true;
    io.of("/")
      .fetchSockets()
      .then((sockets) => gameService.selectArtist(sockets));
  }

  socket.on("disconnect", (reason) => {
    console.log("socket disconnected", socket.id);
    if(socket.id === gameService.artist.socket.id) {
      console.log("artist disconnected");
      gameService.artist.exists = false;
      if (!gameService.artist.exists && io.of("/").sockets.size >= 2) {
        gameService.artist.exists = true;
        io.of("/")
          .fetchSockets()
          .then((sockets) => gameService.selectArtist(sockets));
      }
    }
  });

  // update the canvas
  socket.emit("updateCanvas", { canvas: gameService.canvas });

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
    gameService.canvas = data.canvas;
  });

  // when someone resets the canvas
  socket.on("triggerClear", () => {
    socket.broadcast.emit("canvasClear");
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

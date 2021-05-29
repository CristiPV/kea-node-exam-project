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

// DB functions
gameService.loadTopics();

// Sockets
io.on("connection", (socket) => {
  console.log("Artist exists:", gameService.getArtist().exists);
  console.log("Socket connected", socket.id);
  // If there is no artist and we have at least 2 players, then select an artist and start the game
  if (!gameService.getArtist().exists && io.of("/").sockets.size >= 2) {
    io.of("/")
      .fetchSockets()
      .then((sockets) => gameService.getRandomArtist(sockets))
      .then(gameService.startGame);
  }

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected", socket.id);

    if (io.of("/").sockets.size <= 1) {
      console.log("Game will reset due to not enough players");
      gameService.stopGame();
      io.emit("showToast", {
        title: "Game will reset.",
        message: "Not enough players.",
        type: "info",
      });
    } else if (
      gameService.getArtist().exists &&
      socket.id === gameService.getArtist().socket.id
    ) {
      console.log("Artist disconnected");
      gameService.stopGame();
      io.emit("showToast", {
        title: "Game will reset",
        message: "Artist disconnected",
        type: "info",
      });
    }
  });

  socket.on("requestRestart", () => {
    if (!gameService.getArtist().exists && io.of("/").sockets.size >= 2) {
      io.of("/")
        .fetchSockets()
        .then((sockets) => gameService.getRandomArtist(sockets))
        .then(gameService.startGame);
    }
  });

  // update the canvas
  socket.emit("updateCanvas", { canvas: gameService.getCanvas() });

  // when someone submits chat
  socket.on("submitChat", (data) => {
    // Update everyone's chat
    if (
      gameService.getTopic() &&
      data.chatText === gameService.getTopic().name
    ) {
      if (
        gameService.getArtist().exists &&
        socket != gameService.getArtist().socket
      ) {
        console.log("Topic guessed by:", socket.id);
        gameService.resetOnWin(socket);
      }
    }
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
    gameService.setCanvas(data.canvas);
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

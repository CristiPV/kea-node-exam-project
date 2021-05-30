const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const http = require("http");
const dotenvConfig = dotenv.config();
const app = express();
const server = http.createServer(app);
const drawingRouter = require("./routes/drawing");

const socketService = require("./services/socket.js");
const io = socketService.start(server);
const gameService = require("./services/game.js");

app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(drawingRouter.router);

// Files
const navbar = fs.readFileSync(__dirname + "/public/navbar/navbar.html");
const home = fs.readFileSync(__dirname + "/public/home/home.html");
const history = fs.readFileSync(__dirname + "/public/history/history.html");
const footer = fs.readFileSync(__dirname + "/public/footer/footer.html");

// DB functions
gameService.loadTopics();

// Sockets
io.on("connection", (socket) => {
  console.log(
    "\x1b[31m%s\x1b[0m",
    "App:\n",
    "* Socket connected:",
    socket.id,
    "\n * Artist exists:",
    gameService.getArtist().exists
  );
  // Assign username
  socket.username = "PlaceholderName";
  // Sends the current canvas
  socket.emit("updateCanvas", { canvas: gameService.getCanvas() });

  // If there is no artist and we have at least 2 players, then select an artist and start the game
  if (!gameService.getArtist().exists && io.of("/").sockets.size >= 2) {
    io.of("/")
      .fetchSockets()
      .then((sockets) => gameService.getRandomArtist(sockets))
      .then(gameService.startGame);
  }

  socket.on("disconnect", (reason) => {
    console.log(
      "\x1b[31m%s\x1b[0m",
      "App:\n",
      "* Socket disconnected:",
      socket.id
    );

    if (io.of("/").sockets.size <= 1) {
      // If there is only one player left
      console.log(
        "\x1b[31m%s\x1b[0m",
        "App:\n",
        "* Game will end - not enough players"
      );

      gameService.stopGame();
      socketService.emitShowToast(
        io,
        "Game will end.",
        "Not enough players.",
        "info"
      );
    } else if (
      gameService.getArtist().exists &&
      socket.id === gameService.getArtist().socket.id
    ) {
      // If the artist player disconnects
      console.log(
        "\x1b[31m%s\x1b[0m",
        "App:\n",
        "* Game will end - artist disconnected"
      );

      gameService.stopGame();
      socketService.emitShowToast(
        io,
        "Game will end.",
        "Artist disconnected.",
        "info"
      );
    }
  });

  socket.on("sendUsername", (data) => {
    socket.username = data.username;
  });

  // Restarts the game if the start conditions are met
  socket.on("requestRestart", () => {
    if (!gameService.getArtist().exists && io.of("/").sockets.size >= 2) {
      io.of("/")
        .fetchSockets()
        .then((sockets) => gameService.getRandomArtist(sockets))
        .then(gameService.startGame);
    }
  });

  // When someone submits chat
  socket.on("submitChat", (data) => {
    // Check if a player that is not the artist has guessed the topic ( if there is a topic )
    if (
      gameService.getTopic() &&
      data.chatText === gameService.getTopic().name
    ) {
      if (
        gameService.getArtist().exists &&
        socket != gameService.getArtist().socket
      ) {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "App:\n",
          "* Topic guessed by:",
          socket.id
        );
        gameService.resetOnWin(socket);
      }
    }
    // Update everyone's chat
    io.emit("updateChat", data);
  });

  // When someone starts drawing
  socket.on("mouseDown", (data) => {
    // Update everyone's context to match the artist's
    socket.broadcast.emit("updateContext", data);
  });

  // When the artist moves the mouse
  socket.on("mouseMove", (data) => {
    // Draw on everyone's canvas
    socket.broadcast.emit("updateDrawing", data);
  });

  // When the artist stops painting
  socket.on("mouseUp", (data) => {
    // Update the server's canvas
    gameService.setCanvas(data.canvas);
  });

  // When the artist resets the canvas
  socket.on("requestCanvasClear", () => {
    // Clears the canvas for everyone else
    socket.broadcast.emit("canvasClear");
  });
});

// Routes
app.get("/", (req, res) => {
  res.send(navbar + home + footer);
});

app.get("/history", (req, res) => {
  res.send(navbar + history + footer);
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

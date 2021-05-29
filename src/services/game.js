const socketService = require("./socket.js");
const pool = require("./mysql.js").pool;
const historyService = require("./history");

const io = socketService.get();

// Timers - milliseconds
const gameDuration = 120000;
const endGameTimeout = 5000;
const startGameTimeout = 5000;

// Variables
let running = false;
let gameTimer = null;
let canvas = null;
let topics = [];
let currentTopic = null;
let artist = { exists: false, socket: null };

// Getters
const getCanvas = () => {
  return canvas;
};
const getTopic = () => {
  return currentTopic;
};
const getArtist = () => {
  return artist;
};

// Setters
const setCanvas = (newCanvas) => {
  canvas = newCanvas;
};

/**
 * loadTopics - Loads the topics list with the entries from the database.
 */
function loadTopics() {
  pool.query("SELECT * FROM draw_option", (error, result) => {
    if (error) throw error;

    result = JSON.parse(JSON.stringify(result));
    topics = result;
    console.log("\x1b[31m%s\x1b[0m", "loadTopics:\n", "* Topics list:", topics);
  });
}

/**
 * getRandomArtist - assigns the artist a random available socket and emits the appropriate toastr events.
 * @param {Array} players - the sockets of all connected players.
 */
function getRandomArtist(players) {
  if (players && players.length > 0) {
    // Assign the artist
    artist.socket = getRandomItem(players);
    artist.exists = true;
    console.log(
      "\x1b[31m%s\x1b[0m",
      "getRandomArtist:\n",
      "* Artist socket:",
      artist.socket.id
    );

    // Emit toastr events
    socketService.emitShowToast(
      artist.socket,
      "Artist !",
      "You are the artist ! Do as best as you can to draw the word you will be given.",
      "success"
    );
    socketService.emitShowToast(
      artist.socket.broadcast,
      "Guesser !",
      "Try to guess what the artist is drawing.",
      "success"
    );
  } else {
    console.warn(
      "\x1b[31m%s\x1b[0m",
      "getRandomArtist:\n",
      "* No players available."
    );
  }
}

/**
 * setupGame - assigns currentTopic from the topics list, clears the canvas, enables the drawing controls
 * for the artist and emits the relevant toastr events.
 */
function setupGame() {
  console.log(
    "\x1b[31m%s\x1b[0m\x1b[33m%s\x1b[0m",
    "setupGame:\n",
    "-- Started --"
  );
  running = true;

  // Assign the current topic
  currentTopic = getRandomItem(topics);
  console.log(
    "\x1b[31m%s\x1b[0m",
    "setupGame:\n",
    "* Current topic:",
    currentTopic
  );

  // Clears everyone's canvas
  io.emit("canvasClear");

  // Sets up the artist socket
  artist.socket.emit("updateTopic", { topic: currentTopic.name });
  artist.socket.emit("enableControls");
  socketService.emitShowToast(
    artist.socket,
    currentTopic.name,
    "Draw the " + currentTopic.name,
    "info"
  );
  console.log(
    "\x1b[31m%s\x1b[0m\x1b[33m%s\x1b[0m",
    "setupGame:\n",
    "-- Completed --"
  );
}

/**
 * resetGame - disables the artist controls, clears the canvas, resets all the variables and emits
 * a gameEnd event to all connected sockets.
 */
function resetGame() {
  console.log(
    "\x1b[31m%s\x1b[0m\x1b[33m%s\x1b[0m",
    "resetGame:\n",
    "-- Started --"
  );
  running = false;
  // Clears everyone's canvas
  io.emit("canvasClear");

  // Disables artist controls
  artist.socket.emit("disableControls");

  // Reset variables
  artist.socket = null;
  artist.exists = false;
  currentTopic = null;
  gameTimer = null;
  console.log(
    "\x1b[31m%s\x1b[0m",
    "resetGame:\n",
    "* Reset variables:",
    artist,
    currentTopic
  );

  // Emits the gameEnd event to all connected sockets after a short timeout
  const timeout = sleep(endGameTimeout);
  timeout.promise.then(() => {
    io.emit("gameEnd");
    console.log(
      "\x1b[31m%s\x1b[0m\x1b[33m%s\x1b[0m",
      "resetGame:\n",
      "-- Completed --"
    );
  });
}

/**
 * resetOnWin - emits toastr events players, letting them know that somebody won the game and
 * stops the game.
 * @param {Socket} socket - the socket of the player that won the game.
 */
function resetOnWin(socket) {
  // Upload game to DB
  historyService.saveGameInfo(
    canvas,
    currentTopic,
    socket.username,
    artist.socket.username
  );

  // Emit toastr events
  socketService.emitShowToast(
    socket,
    "Congratulations !",
    "You won the game",
    "success"
  );
  socketService.emitShowToast(
    socket.broadcast,
    "Game ended",
    "Somebody won the game",
    "success"
  );

  if (running) {
    console.log(
      "\x1b[31m%s\x1b[0m",
      "resetOnWin:\n",
      "* Game has been won - stopping the game."
    );
    stopGame();
  }
}

/**
 * startGame - Starts the game process.
 * Sets up the game a short preparation timeout, then starts a gameTimer that will run
 * for the duration of the game and will reset the game when it ends. The gameTimer will be
 * cancelled if the game is won before it finishes.
 */
async function startGame() {
  console.log("\x1b[31m%s\x1b[0m", "startGame:\n", "* Starting a new game...");

  // Starting the game
  socketService.emitShowToast(
    io,
    "Starting",
    "Game will start in 5 seconds !",
    "success"
  );
  const startTimer = sleep(startGameTimeout);
  startTimer.promise.then(() => {
    if (!running) {
      setupGame();
    }
  });

  // Set up the gameTimer
  gameTimer = sleep(gameDuration);
  gameTimer.promise.then(() => {
    if (running) {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "startGame:\n",
        "* gameTimer reached:",
        gameDuration
      );

      socketService.emitShowToast(
        io,
        "Game ended",
        "Nobody guessed in time",
        "success"
      );
      resetGame();
    }
  });
}

/**
 * stopGame - Stops the game timer and resets the game.
 */
function stopGame() {
  // Stop the gameTimer
  if (gameTimer) {
    gameTimer.cancelSleep();
    console.log(
      "\x1b[31m%s\x1b[0m",
      "stopGame:\n",
      "* Game Timer has been cancelled."
    );
  }

  // Resetting the game
  if (running) {
    console.log(
      "\x1b[31m%s\x1b[0m",
      "stopGame:\n",
      "* Game ended - calling resetGame."
    );
    resetGame();
  }
}

/**
 * getRandomItem - selects a random item from the list that is provided.
 * @param {Array} list
 * @returns Randomly selected list item.
 */
function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * sleep - creates a Promise that sets a timeout for the amount of milliseconds that are provided.
 * @param {Number} ms - amount of milliseconds to sleep for.
 * @returns Object containing the promise and a function to cancel the timeout.
 */
function sleep(ms) {
  let cancelSleep;
  const promise = new Promise((resolve) => {
    const timeout = setTimeout(resolve, ms);
    cancelSleep = () => {
      clearTimeout(timeout);
    };
  });
  return { promise, cancelSleep };
}

module.exports = {
  setCanvas,
  getCanvas,
  getTopic,
  getArtist,
  getRandomArtist,
  loadTopics,
  resetOnWin,
  startGame,
  stopGame,
};

const io = require("./socket.js").get();
const pool = require("./mysql.js").pool;

let canvas = null;
const getCanvas = () => {
  return canvas;
};
let artist = { exists: false, socket: null };
let currentTopic = "";
const getTopic = () => {
  return currentTopic;
};
let running = false;
let endTimer = null;
let topics;

function loadTopics() {
  pool.query("SELECT * FROM draw_option", (error, result) => {
    if (error) throw error;

    result = JSON.parse(JSON.stringify(result));
    topics = result;
  });
}

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

function selectRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function selectArtist(players) {
  if (players) {
    artist.exists = true;
    artist.socket = selectRandomItem(players);
    console.log("Artist socket:", artist.socket.id);
    artist.socket.emit("showToast", {
      title: "Artist !",
      message:
        "You are the artist ! Do as best as you can to draw the word you will be given.",
      type: "success",
    });
    artist.socket.broadcast.emit("showToast", {
      title: "Guesser !",
      message: "Try to guess what the artist is drawing.",
      type: "success",
    });
  } else {
    console.log("No players available");
  }
}

function beginGame() {
  running = true;
  console.log("A new game has begun");
  io.emit("canvasClear");
  artist.socket.emit("showToast", {
    title: currentTopic.name,
    message: "Draw the " + currentTopic.name,
    type: "info",
  });
  artist.socket.emit("sendTopic", { topic: currentTopic.name });
  artist.socket.emit("enableControls");
}

function resetGame() {
  running = false;
  console.log("The game has ended...");
  if (artist.socket) {
    artist.socket.emit("disableControls");
  }
  artist.socket = null;
  artist.exists = false;
  currentTopic = null;
  io.emit("canvasClear");
  const timeout = sleep(10000);
  timeout.promise.then(() => {
    io.emit("gameEnd");
  });
}

function guessTopic(socket) {
  socket.emit("showToast", {
    title: "Congratulations !",
    message: "You won the game",
    type: "success",
  });
  socket.broadcast.emit("showToast", {
    title: "Game ended",
    message: "Somebody won the game",
    type: "success",
  });
  if (endTimer) {
    console.log("Topic has been guessed - cancelling the timer");
    endTimer.cancelSleep();
  }
  if (running) {
    console.log("Topic has been guessed - restarting game");
    resetGame();
  }
}

async function start() {
  currentTopic = selectRandomItem(topics);
  console.log(currentTopic);
  io.emit("showToast", {
    title: "Starting",
    message: "Game will start in 5 seconds !",
    type: "success",
  });
  const startTimer = sleep(5000);
  startTimer.promise.then(() => {
    if (!running) {
      beginGame();
    }
  });
  endTimer = sleep(120000);
  endTimer.promise.then(() => {
    if (running) {
      console.log("Artist ran out of time - restarting game");
      io.emit("showToast", {
        title: "Game ended",
        message: "Nobody guessed in time",
        type: "success",
      });
      resetGame();
    }
  });
}

module.exports = {
  artist,
  selectArtist,
  start,
  guessTopic,
  running,
  resetGame,
  getTopic,
  getCanvas,
  loadTopics,
};

const io = require("./socket.js").get();

let canvas = null;
const getCanvas = () => {
  return canvas;
}
let artist = { exists: false, socket: null };
let currentTopic = "";
const getTopic = () => {
  return currentTopic;
};
let running = false;
const topics = ["house", "tomato", "car", "human"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    title: currentTopic,
    message: "Draw the " + currentTopic,
    type: "info",
  });
  artist.socket.emit("sendTopic", { topic: currentTopic });
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
  currentTopic = "";
  io.emit("canvasClear");
  sleep(10000).then(() => {
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
  if (running) {
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
  sleep(5000).then(() => {
    if (!running) {
      beginGame();
    }
  });
  // sleep(60000).then(() => {
  //   if (running) {
  //     resetGame();
  //   }
  // });
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
};

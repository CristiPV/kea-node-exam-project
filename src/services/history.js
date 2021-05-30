const saveDrawingEntry = require("./mysql").saveDrawingEntry;

function saveGameInfo(canvas, topic, winner, artist) {
  const gameInfo = {
    drawing: "",
    artist: "",
    winner: "",
    time: new Date(), // "format: 2021-01-01 23:59:59";
    draw_option_id: 1,
  };

  if (canvas) {
    gameInfo.drawing = canvas;
  }
  gameInfo.artist = artist;
  gameInfo.winner = winner;
  if (topic) {
    gameInfo.draw_option_id = topic.id;
  }

  console.log("Game INFO:", gameInfo);

  // Send to DB
  saveDrawingEntry(gameInfo);
}

module.exports = {
  saveGameInfo,
};

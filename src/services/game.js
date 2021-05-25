let canvas = null;
let artist = { exists: false, socket: null };

function selectArtist(players) {
  artist.socket = players[Math.floor(Math.random() * players.length)];
  console.log(artist.socket.id);
  artist.socket.emit("enableControls");
}

module.exports = {
  canvas,
  artist,
  selectArtist,
};

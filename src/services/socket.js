let io;

function start(server) {
  io = require("socket.io")(server);
  return io;
}

function get() {
  if (!io) {
    throw new Error("There is no io to get. ( Hint: call start first )");
  } else {
    return io;
  }
}

function emitShowToast( source, title, message, type ) {
  source.emit("showToast", {
    title: title,
    message: message,
    type: type,
  });
}

module.exports = {
  start,
  get,
  emitShowToast
};

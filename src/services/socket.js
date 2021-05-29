let io;

/**
 * start - starts socket.io on the provided server.
 * @param {Server} server 
 * @returns the server instance.
 */
function start(server) {
  io = require("socket.io")(server);
  console.log(
    "\x1b[31m%s\x1b[0m",
    "socket.io:\n",
    "* Socket.io started..."
  );
  return io;
}

/**
 * get - retrieves the server instance and throws an error in case it has not been started.
 * @returns the server instance, if it has been started.
 */
function get() {
  if (!io) {
    throw new Error("There is no io to get. ( Hint: call start first )");
  } else {
    return io;
  }
}

/**
 * emitShowToast - emits a 'showToast' event and provides the data necessary for displaying a
 * Toastr notification.
 * @param {Socket} source - who will emit the event.
 * @param {String} title - the title of the Toastr.
 * @param {String} message - the message of the Toastr.
 * @param {String} type - the type of the Toastr.
 */
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

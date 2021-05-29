// Variables
let canvas = document.getElementById("canvas");
canvas.width = 1000;
canvas.height = 1000;

const ctx = canvas.getContext("2d");
let currentColor = document.getElementById("draw-color-picker").value;
let currentSize = document.getElementById("draw-size-input").value;
let currentPosition = { x: 0, y: 0 };

let isMouseDown = false;
let usingEraser = false;

// Sidebar event handlers
document
  .getElementById("draw-color-picker")
  .addEventListener("change", function () {
    currentColor = this.value;
  });

document
  .getElementById("draw-size-input")
  .addEventListener("change", function () {
    currentSize = this.value;
    document.getElementById("draw-size-text").innerHTML =
      "Size (" + this.value + ")";
  });

document.getElementById("draw-eraser").addEventListener("click", function () {
  usingEraser = !usingEraser;
});

document.getElementById("draw-pencil").addEventListener("click", function () {
  usingEraser = false;
});

document.getElementById("draw-clear").addEventListener("click", function () {
  socket.emit("requestCanvasClear");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

/**
 * canvasClear - clears the canvas.
 */
socket.on("canvasClear", () => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

/**
 * enableControls - enables the sidebar menu for the artist player and adds the event
 * listeners on the canvas.
 */
socket.on("enableControls", () => {
  // Enables the sidebar menu
  document.getElementsByClassName("draw-sidebar")[0].style.display = "flex";

  // Adds the canvas event handlers
  canvas.addEventListener("mousedown", mouseDownHandler);
  canvas.addEventListener("mousemove", mouseMoveHandler);
  canvas.addEventListener("mouseup", mouseUp);

  canvas.style.cursor = "crosshair";
});

/**
 * disableControls - disables the sidebar for the player and removes the event listeners on the canvas.
 */
socket.on("disableControls", () => {
  // Disables the sidebar menu
  document.getElementsByClassName("draw-sidebar")[0].style.display = "none";

  // Ends the current stroke, in case the player was drawing
  ctx.closePath();
  isMouseDown = false;

  // Removes the event handlers
  canvas.removeEventListener("mousedown", mouseDownHandler);
  canvas.removeEventListener("mousemove", mouseMoveHandler);
  canvas.removeEventListener("mouseup", mouseUp);
  canvas.style.cursor = "default";
});

// Mouse Down

function mouseDownHandler() {
  mouseDown(canvas, event);
}

/**
 * mouseDown - sets the properties of the context, sends these properties to the server
 * and starts the path.
 * @param {Canvas} canvas
 * @param {Event} evt
 */
function mouseDown(canvas, evt) {
  isMouseDown = true;

  // Set the context properties
  if (usingEraser) {
    ctx.lineWidth = 50;
    ctx.strokeStyle = "white";
  } else {
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
  }
  ctx.lineCap = "round";
  currentPosition = getMousePos(canvas, evt);

  // Emit the context and position to the server
  socket.emit("mouseDown", {
    contextData: {
      lineWidth: ctx.lineWidth,
      strokeStyle: ctx.strokeStyle,
      lineCap: ctx.lineCap,
    },
    currentPosition,
  });

  ctx.moveTo(currentPosition.x, currentPosition.y);
  ctx.beginPath();
}

/**
 * updateContext - updates the context properties and current position with the ones
 * received from the server and starts the path.
 */
socket.on("updateContext", (data) => {
  ctx.lineWidth = data.contextData.lineWidth;
  ctx.strokeStyle = data.contextData.strokeStyle;
  ctx.lineCap = data.contextData.lineCap;
  currentPosition = data.currentPosition;

  ctx.moveTo(currentPosition.x, currentPosition.y);
  ctx.beginPath();
});

// Mouse Move

function mouseMoveHandler() {
  mouseMove(canvas, event);
}

/**
 * mouseMove - tracks down the location of the mouse on the canvas, sends
 * it to the server and draws a line behind it.
 * @param {Canvas} canvas
 * @param {Event} evt
 */
function mouseMove(canvas, evt) {
  if (isMouseDown) {
    currentPosition = getMousePos(canvas, evt);

    // Emit the current position to the server
    socket.emit("mouseMove", {
      currentPosition,
    });

    ctx.lineTo(currentPosition.x, currentPosition.y);
    ctx.stroke();
  }
}

/**
 * updateDrawing - updates the canvas drawing with the lines it receives from the server.
 */
socket.on("updateDrawing", (data) => {
  currentPosition = data.currentPosition;
  ctx.lineTo(currentPosition.x, currentPosition.y);
  ctx.stroke();
});

// Mouse Up

/**
 * mouseUp - triggers the isMouseDown flag and sends the whole canvas data to the server.
 */
function mouseUp() {
  isMouseDown = false;

  socket.emit("mouseUp", {
    canvas: canvas.toDataURL(),
  });
}

/**
 * updateCanvas - updates the player canvas with the one received from the server.
 */
socket.on("updateCanvas", (data) => {
  const canvasData = data.canvas;
  if (canvasData) {
    let img = new Image();
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
    };
    img.src = canvasData;
  }
});

/**
 * getMousePos - translates the coordinates of the client's mouse to a pair of coordinates
 * relative to the canvas.
 * @param {Canvas} canvas 
 * @param {Event} evt 
 * @returns Object containing the x and y coordinates of the cursor relative to the canvas.
 */
function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const offsetX = Number(rect.left);
  const offsetY = Number(rect.top);
  const offsetHeight = Number(rect.height);
  const offsetWidth = Number(rect.width);

  const position = {
    x: ((evt.clientX - offsetX) / offsetWidth) * canvas.width,
    y: ((evt.clientY - offsetY) / offsetHeight) * canvas.height,
  };

  return position;
}

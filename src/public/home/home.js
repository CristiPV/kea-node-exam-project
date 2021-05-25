// Global variables
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
  socket.emit("triggerClear");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

socket.on("canvasClear", () => {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Drawing event handlers
canvas.addEventListener("mousedown", function () {
  mouseDown(canvas, event);
});
canvas.addEventListener("mousemove", function () {
  mouseMove(canvas, event);
});
canvas.addEventListener("mouseup", mouseUp);

function mouseDown(canvas, evt) {
  isMouseDown = true;
  if (usingEraser) {
    ctx.lineWidth = 50;
    ctx.strokeStyle = "white";
  } else {
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
  }
  ctx.lineCap = "round";
  currentPosition = getMousePos(canvas, evt);

  // emit the context and position to everyone else
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

socket.on("updateContext", (data) => {
  ctx.lineWidth = data.contextData.lineWidth;
  ctx.strokeStyle = data.contextData.strokeStyle;
  ctx.lineCap = data.contextData.lineCap;
  currentPosition = data.currentPosition;
  ctx.moveTo(currentPosition.x, currentPosition.y);
  ctx.beginPath();
});

function mouseMove(canvas, evt) {
  if (isMouseDown) {
    currentPosition = getMousePos(canvas, evt);
    // emit the current position
    socket.emit("mouseMove", {
      currentPosition,
    });
    ctx.lineTo(currentPosition.x, currentPosition.y);
    ctx.stroke();
  }
}

socket.on("emitDraw", (data) => {
  currentPosition = data.currentPosition;
  console.log("EmitDraw:", currentPosition);
  ctx.lineTo(currentPosition.x, currentPosition.y);
  ctx.stroke();
});

function mouseUp() {
  isMouseDown = false;
  socket.emit("mouseUp", {
    canvas: canvas.toDataURL(),
  });
}

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

  console.log("GetMousePos", position);

  return position;
}

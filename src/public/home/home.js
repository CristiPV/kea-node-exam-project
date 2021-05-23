// Global variables
const canvas = document.getElementById("canvas");
canvas.width = canvas.parentNode.clientWidth;
canvas.height = canvas.parentNode.clientHeight;
const ctx = canvas.getContext("2d");

let currentColor = document.getElementById("draw-color-picker").value;
let currentSize = document.getElementById("draw-size-input").value;

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

function mouseDown(canvas, event) {
  isMouseDown = true;
  if (usingEraser) {
    ctx.lineWidth = 50;
    ctx.strokeStyle = "white";
  } else {
    ctx.lineWidth = currentSize;
    ctx.strokeStyle = currentColor;
  }
  ctx.lineCap = "round";
  const currentPosition = getMousePos(canvas, event);
  ctx.moveTo(currentPosition.x, currentPosition.y);
  ctx.beginPath();
}

function mouseMove(canvas, evt) {
  if (isMouseDown) {
    const currentPosition = getMousePos(canvas, evt);
    ctx.lineTo(currentPosition.x, currentPosition.y);
    ctx.stroke();
  }
}

function mouseUp() {
  isMouseDown = false;
}

function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  let offsetX = Number(rect.left);
  let offsetY = Number(rect.top);

  return {
    x: evt.clientX - offsetX,
    y: evt.clientY - offsetY,
  };
}

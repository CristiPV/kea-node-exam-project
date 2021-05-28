const socket = io();

let chatUser = "PlaceholderName";

function empowerChat() {
  const chatButtonToEmpower = document.getElementById("chat-button");
  const chatToEmpower = document.getElementById("chat-input");

  chatUser = document.getElementById("username-input").value;

  chatButtonToEmpower.removeAttribute("disabled");
  chatToEmpower.removeAttribute("disabled");
}

function submitChat() {
  // Retrieve the text from the page
  const chatText = document.getElementById("chat-input").value;
  // Broadcast the text to be displayed
  socket.emit("submitChat", { chatText, chatUser });

  // Clear the input field for next chat
  document.getElementById("chat-input").value = "";
}

socket.on("updateChat", (data) => {
  const containerDiv = document.getElementsByClassName(
    "chat-text-container"
  )[0];

  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat-text");

  const userSpan = document.createElement("span");
  userSpan.classList.add("chat-user");
  userSpan.innerText = data.chatUser;

  const textSpan = document.createElement("span");
  textSpan.classList.add("chat-message");
  textSpan.innerText = data.chatText;

  chatDiv.appendChild(userSpan);
  chatDiv.appendChild(textSpan);

  containerDiv.appendChild(chatDiv);
  containerDiv.scrollTop = containerDiv.scrollHeight;
});

socket.on("sendTopic", (data) => {
  document.getElementsByClassName("draw-topic-text")[0].innerText =
    data.topic + '"';
});

socket.on("showToast", (data) => {
  showToast(data.title, data.message, data.type);
});

socket.on("gameEnd", () => {
  socket.emit("requestRestart");
});

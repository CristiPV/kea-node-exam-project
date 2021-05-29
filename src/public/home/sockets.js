const socket = io();

let chatUser = "PlaceholderName";

/**
 * empowerChat - enables the usage of the chat for the player.
 */
function empowerChat() {
  const chatButtonToEmpower = document.getElementById("chat-button");
  const chatToEmpower = document.getElementById("chat-input");

  chatUser = document.getElementById("username-input").value;

  chatButtonToEmpower.removeAttribute("disabled");
  chatToEmpower.removeAttribute("disabled");
}

/**
 * submitChat - sends a chat message, along with the name of the player who sent it
 * to the server.
 */
function submitChat() {
  // Retrieve the chat text from the input
  const chatText = document.getElementById("chat-input").value;

  // Clear the input field for the next message
  document.getElementById("chat-input").value = "";

  // Emit the text and user to the server
  socket.emit("submitChat", { chatText, chatUser });
}

/**
 * updateChat - updates the chat with the message received from the server.
 */
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

/**
 * updateTopic - updates the topic that the artist is supposed to draw with the one 
 * received from the server.
 */
socket.on("updateTopic", (data) => {
  document.getElementsByClassName("draw-topic-text")[0].innerText =
    '"' + data.topic + '"';
});

/**
 * showToast - displays a Toastr notification with the data received from the server.
 */
socket.on("showToast", (data) => {
  showToast(data.title, data.message, data.type);
});

/**
 * gameEnd - requests the start of a new game once the current one has ended. 
 */
socket.on("gameEnd", () => {
  socket.emit("requestRestart");
});

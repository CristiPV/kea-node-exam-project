const socket = io();

function submitChat() {
  // Retrieve the text from the page
  const chatText = document.getElementById("chat-input").value;
  const chatUser = "peter piper";
  if (chatText !== "") {
    console.log("text to send:", chatText);
    console.log("user to send:", chatUser);

    // Broadcast the text to be displayed
    socket.emit("submitChat", { chatText, chatUser });

    // Clear the input field for next chat
    document.getElementById("chat-input").value = "";
  } else {
    console.log("No text detected");
  }
}

socket.on("updateChat", (data) => {
  console.log("data received to update:", data);
  const containerDiv = document.getElementsByClassName("chat-text-container")[0];

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

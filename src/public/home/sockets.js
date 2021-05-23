const socket = io();

function submitChat() {
  // Retrieve the text from the page
  const chatText = document.getElementById("chat-input").value;
  if (chatText !== "") {
    console.log("text to send:", chatText);

    // Broadcast the text to be displayed
    socket.emit("submitChat", chatText);

    // Clear the input field for next chat
    document.getElementById("chat-input").value = "";
  } else {
    console.log("No text detected");
  }

  socket.on("updateChat", (data) => {
    document.getElementsByClassName("chat-message")[0].innerText += data;
  })
}

/**
 * setUsername - sets the username of the player by disabling the input field
 * and removing the 'Set Username' button.
 * If no username is written, the player will be given a random one.
 */
function setUsername() {
  // Disabling the input field and centering the text inside it
  const input = document.getElementById("username-input");
  input.setAttribute("disabled", "true");
  input.style.textAlign = "center";

  // Removing the username input button
  const button = document.getElementById("username-input-button");
  button.remove();

  // If the user did not input a name, they will be generated a random one
  if (input.value === "") {
    const number = Math.random() * 1000;
    const userName = "User-" + parseInt(number);
    input.value = userName;
  }
}

function setUsername() {
  const input = document.getElementById("username-input");
  input.setAttribute("disabled", "true");
  input.style.textAlign = "center";
  const button = document.getElementById("username-input-button");
  button.remove();
  console.log(input.value);
  // If the user has failed to input a name we generate a radom number
  if (input.value === "")
  {
    const number = Math.random() * 1000;
    const userName = "User-" + parseInt(number);
    input.value = userName;
  }
}

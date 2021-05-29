//dateformat(drawingData.time, 'dddd, mmmm, dS, yyyy, h:MM:ss TT')

function formatDate(date) {
  let unformattedDate = new Date(date);
  let formattedDate =
    unformattedDate.getDate() +
    "-" +
    (unformattedDate.getMonth() + 1) +
    "-" +
    unformattedDate.getFullYear() +
    " " +
    unformattedDate.getHours() +
    ":" +
    unformattedDate.getMinutes();
  return formattedDate;
}

async function getHistory() {
  let data;
  const fetchValues = await fetch("/api/drawings");
  data = await fetchValues.json();

  // Div of the history.html page
  const imageHistory = document.getElementById("image-history");

  data.drawings.map((drawingData) => {
    // Formatting date
    formattedDate = formatDate(drawingData.time);

    // Div to contain text and image
    const imageTextCombo = document.createElement("div");
    imageTextCombo.classList.add("image-text-combo");

    // Child div to contain image
    const imageInformation = document.createElement("div");
    imageInformation.classList.add("image-information");

    const image = document.createElement("img");
    image.classList.add("raw-image");
    image.src = drawingData.image;
    // Add image element to parent div
    imageInformation.appendChild(image);

    // Add child div to contain text
    const textInformation = document.createElement("div");
    textInformation.classList.add("text-information");

    const artistName = document.createElement("span");
    artistName.classList.add("game-information");
    artistName.innerText = "Artist name \t: " + drawingData.artist;

    const winnerName = document.createElement("span");
    winnerName.classList.add("game-information");
    winnerName.innerText = "Winner name : " + drawingData.winner;

    const timeWon = document.createElement("span");
    timeWon.classList.add("game-information");
    timeWon.innerText = "Time of win: " + formattedDate;

    const drawingId = document.createElement("span");
    drawingId.classList.add("game-information");
    drawingId.innerText = "Drawing name: " + drawingData.name;

    // Add text to parent div
    textInformation.appendChild(artistName);
    textInformation.appendChild(winnerName);
    textInformation.appendChild(timeWon);
    textInformation.appendChild(drawingId);

    // Add both div children to parent div
    imageTextCombo.appendChild(imageInformation);
    imageTextCombo.appendChild(textInformation);

    // Add combo div to parent in html
    imageHistory.appendChild(imageTextCombo);
  });
}
getHistory();

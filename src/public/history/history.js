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

    // Div to contain both text and image
    const imageTextCombo = document.createElement("div");
    imageTextCombo.classList.add("image-text-combo");

    // ---- Image ---
    // Child div to contain image
    const imageInformation = document.createElement("div");
    imageInformation.classList.add("image-information");
    // Image
    const image = document.createElement("img");
    image.classList.add("raw-image");
    image.src = drawingData.image;
    // Add image element to parent div
    imageInformation.appendChild(image);

    // ---- Text ----
    // Add child div to contain text
    const textInformation = document.createElement("div");
    textInformation.classList.add("text-information");

    // Container for artist
    const artistDiv = document.createElement("div");
    artistDiv.classList.add("artist-container");
    // Artist presentation
    const artistPresentation = document.createElement("span");
    artistPresentation.classList.add("game-presentation");
    artistPresentation.innerText = "Artist : ";
    // Artist presentation
    const artistName = document.createElement("span");
    artistName.classList.add("game-information");
    artistName.innerText = drawingData.artist;
    // Add presentation + information to the container
    artistDiv.appendChild(artistPresentation);
    artistDiv.appendChild(artistName)
    
    // Container for winner
    const winnerDiv = document.createElement("span");
    winnerDiv.classList.add("winner-container")
    // Winner presentation
    const winnerPresentation = document.createElement("span");
    winnerPresentation.classList.add("game-presentation");
    winnerPresentation.innerText = "Winner : ";
    // Winner information
    const winnerName = document.createElement("span");
    winnerName.classList.add("game-information");
    winnerName.innerText = drawingData.winner;
     // Add presentation + information to the container
    winnerDiv.appendChild(winnerPresentation);
    winnerDiv.appendChild(winnerName);

    // Container for time
    const timeDiv = document.createElement("div");
    timeDiv.classList.add("time-container");
    // Time presentation
    const timePresentation = document.createElement("span");
    timePresentation.classList.add("game-presentation");
    timePresentation.innerText = "Time won : ";
    // Time information
    const timeWon = document.createElement("span");
    timeWon.classList.add("game-information");
    timeWon.innerText = formattedDate;
    // Add presentation + information to the container
    timeDiv.appendChild(timePresentation);
    timeDiv.appendChild(timeWon);

    // Container for drawing
    const drawingIdDiv = document.createElement("div");
    drawingIdDiv.classList.add("drawing-id-div");
    // Drawing presentation
    const drawingPresentation = document.createElement("span");
    drawingPresentation.classList.add("game-presentation");
    drawingPresentation.innerText = "Drawing name : ";
    // Drawing information
    const drawingId = document.createElement("span");
    drawingId.classList.add("game-information");
    drawingId.innerText = drawingData.name;
    // Add presentation + information to the container
    drawingIdDiv.appendChild(drawingPresentation);
    drawingIdDiv.appendChild(drawingId);


    textInformation.appendChild(artistDiv)
    textInformation.appendChild(winnerDiv)
    textInformation.appendChild(timeDiv);
    textInformation.appendChild(drawingIdDiv);


    // Add both div children to parent div
    imageTextCombo.appendChild(imageInformation);
    imageTextCombo.appendChild(textInformation);

    // Add combo div to parent in html
    imageHistory.appendChild(imageTextCombo);
  });
}
getHistory();

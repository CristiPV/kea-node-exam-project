


/*
id	1
artist	"yo"
winner	"listen"
time	"2021-01-01T22:59:59.000Z"
image	
type	"Buffer"
    data	
    0	117
    1	112
draw_option_id	2
*/
async function getHistory() {
  let data;
  const fetchValues = await fetch("/api/drawings");
  data = await fetchValues.json();

  // Div of the history.html page
  const informationDiv = document.getElementById("information");
  const imageDiv = document.getElementById("image");

  // Text Information
  data.drawings.map((drawingData) => {
    const informationText = document.createElement("div");

    const artistName = document.createElement("p");
    artistName.classList.add("drawingInformation");
    artistName.innerText = "artist : " +drawingData.artist;

    const winnerName = document.createElement("p");
    winnerName.classList.add("drawingInformation");
    winnerName.innerText = "winner: " + drawingData.winner;

    const timeWon = document.createElement("p");
    timeWon.classList.add("drawingInformation");
    timeWon.innerText = "Time of win: " + drawingData.time;

    const drawingId = document.createElement("p");
    drawingId.classList.add("drawingInformation");
    drawingId.innerText = "Drawing chosen: " + drawingData.name;

    informationText.appendChild(artistName);
    informationText.appendChild(winnerName);
    informationText.appendChild(timeWon);
    informationText.appendChild(drawingId);

    informationDiv.appendChild(informationText);
  });
  
  // Image Data WIP
  data.drawings.map((x) => {
    const imageInformation = document.createElement("div");

    const image = document.createElement("img");

    imageDiv.appendChild(imageInformation);
  })
}
getHistory();

const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const http = require("htpp");
const dotenvConfig = dotenv.config();
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Files
const navbar = fs.readFileSync(
  __dirname + "/public/components/navbar/navbar.html"
);

const home = fs.readFileSync(__dirname + "/public/screens/home/home.html");

const footer = fs.readFileSync(
  __dirname + "/public/components/footer/footer.html"
);

// Sockets


// Routes
app.get("/", (req, res) => {
  res.send(navbar + home + footer);
});

// App server setup
const PORT = process.env.PORT || 3000;

const appServer = app.listen(PORT, (error) => {
  if (error) {
    console.log(error);
  }

  if (dotenvConfig.error) {
    console.log(".env error:", dotenvConfig.error);
  }

  console.log("Server started on port:", appServer.address().port);
});

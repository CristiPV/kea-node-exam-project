const dotenv = require("dotenv");
const dotenvConfig = dotenv.config();
const express = require("express");
const app = express();
const fs = require("fs");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Components
const header = fs.readFileSync(__dirname + "/public/components/header.html");
const footer = fs.readFileSync(__dirname + "/public/components/footer.html");
// Screens
const home = fs.readFileSync(__dirname + "/public/screens/home.html");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
   res.send(header + home + footer);
});

const server = app.listen(PORT, (error) => {
   if (error) {
      console.log(error);
   }

   if (dotenvConfig.error) {
      console.log(".env error:", dotenvConfig.error);
   }

   console.log("Server started on port:", server.address().port);
});

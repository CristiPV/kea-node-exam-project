const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");

const dotenvConfig = dotenv.config();
const app = express();

app.use(express.static("src/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Components
const navbar = fs.readFileSync(
   __dirname + "/public/components/navbar/navbar.html"
);
const footer = fs.readFileSync(
   __dirname + "/public/components/footer/footer.html"
);
// Screens
const home = fs.readFileSync(__dirname + "/public/screens/home/home.html");

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
   res.send(navbar + home + footer);
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

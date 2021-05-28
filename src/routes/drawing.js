const router = require("express").Router();
const pool = require("../mysql/mysql").pool;

router.get("/api/drawings", (req, res) => {
  pool.query(
    "SELECT drawing.artist, drawing.winner, drawing.time, drawing.image, draw_option.name FROM drawing LEFT JOIN draw_option ON drawing.draw_option_id = draw_option.id",
    (error, result) => {
      if (error) throw error;
      result = JSON.parse(JSON.stringify(result));

      res.send({ drawings: result });
    }
  );
});
/*
router.post("/api/drawings", (req, res) => {
  const artist = "yo";
  const winner = "listen";
  const time = "2021-01-01 23:59:59";
  const image = "up";
  const draw_option = 2;

  pool.query(
    "INSERT INTO drawing VALUES(default, ?, ?, ?, ?, ?)",
    [artist, winner, time, image, draw_option],
    (error, result) => {
      if (error) throw error;

      console.log(result.affectedRows);

      res.status(200).send({ affectedRows: result.affectedRows });
    }
  );
});
*/
module.exports = {
  router,
};

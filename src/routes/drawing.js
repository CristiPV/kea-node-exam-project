const router = require("express").Router();
const pool = require("../services/mysql").pool;

/**
 * Retrieve the history from DB
 */
router.get("/api/drawings", (req, res) => {
  let finalResult;
  // Get a connection from the pool
  pool.getConnection((error, connection) => {
    if (error) throw error;

    // Query 1: get all text based values and add them to the array
    connection.query(
      "SELECT drawing.artist, drawing.winner, drawing.time, draw_option.name FROM drawing LEFT JOIN draw_option ON drawing.draw_option_id = draw_option.id;",
      (error, result) => {
        if (error) throw error;

        finalResult = JSON.parse(JSON.stringify(result));
      }
    );
    // Query 2: get all the image blobs, as utf8 strings, and add them to the array
    connection.query(
      "SELECT CONVERT (image USING utf8) AS image FROM drawing;",
      (error, result) => {
        if (error) throw error;

        finalResult.forEach((element, index) => {
          element.image = JSON.parse(JSON.stringify(result[index].image));
        });

        res.send({ drawings: finalResult });
      }
    );
    // Release connection
    connection.release();
  });
});

module.exports = {
  router,
};

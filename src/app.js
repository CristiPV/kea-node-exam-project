const dotenv = require("dotenv");
const express = require("express");

const dotenvConfig = dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

app.get( "/", ( req, res ) => {
    res.send( { message: "Hello World" } );
} );

const server = app.listen( PORT, ( error ) => {
    if ( error ) {
        console.log( error );
    }

    if ( dotenvConfig.error ) {
        console.log( ".env error:", dotenvConfig.error );
    }

    console.log( "Server started on port:", server.address().port );
} );

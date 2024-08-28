const mongoose = require("mongoose ");
require("dotenv").config();

mongoose
  .connect(URL)
  .then(() => {
    console.log("Successfully connected to Database...");
  })
  .catch((err) => {
    console.log("Error while connecting to Database ", err);
  });

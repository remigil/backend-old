// import mongoose from "mongoose";
require("dotenv").config();
const mongoose = require("mongoose");

const dbCon = `mongodb://k3iadminmongo:k3imongo@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/?retryWrites=true&w=majority`;

const mongo = mongoose
  .connect(dbCon, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("mongodb connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err.message);
  });
module.exports = mongo;
